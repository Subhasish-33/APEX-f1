"use client";

import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { Race, PaginatedResponse } from "@apex/types";
import { RaceCard } from "../../components/Calendar/RaceCard";
import { SeasonSelector } from "../../components/SeasonSelector";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, Loader2, Calendar as CalendarIcon, Info } from "lucide-react";

export default function CalendarPage() {
  const [year, setYear] = useState(2025); // Default to 2025 as it's the current "focus"
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const response = await api.getSeasonRaces(year);
        setRaces(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load races");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [year]);

  return (
    <main className="min-h-screen bg-f1-dark text-white pt-24 pb-20 px-4 md:px-8">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-f1-red/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-900/20 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-f1-red"
            >
              <CalendarIcon size={20} />
              <span className="text-sm font-black tracking-[0.3em] uppercase">Temporal Operating System</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-black tracking-tighter"
            >
              RACE <span className="text-f1-red">WEEKENDS</span>
            </motion.h1>
            <p className="text-white/40 max-w-xl text-lg font-medium leading-relaxed">
              Real-time synchronization with the F1 global circuit. Every session, 
              every sector, every moment orchestrated in high-fidelity.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-end gap-2"
          >
            <span className="text-[10px] font-black text-white/30 tracking-widest">SELECT SEASON</span>
            <SeasonSelector currentYear={year} onYearChange={setYear} />
          </motion.div>
        </header>

        {/* Live Status Banner (if any race is live) */}
        {races.some(r => isRaceLive(r)) && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-f1-red rounded-xl flex items-center justify-between shadow-[0_0_30px_rgba(225,6,0,0.3)]"
          >
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 bg-white rounded-full animate-ping" />
              <span className="font-black tracking-tight text-lg">LIVE RACE WEEKEND DETECTED</span>
            </div>
            <div className="text-sm font-bold bg-white/20 px-3 py-1 rounded-lg">
              UI INTENSIFICATION ACTIVE
            </div>
          </motion.div>
        )}

        {/* Vertical Timeline */}
        <div className="relative">
          {/* Central Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-f1-red/50 via-white/10 to-transparent -translate-x-1/2 hidden md:block" />

          <div className="space-y-12">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <div key="loading" className="flex flex-col items-center justify-center py-40 gap-4">
                  <Loader2 className="w-12 h-12 text-f1-red animate-spin" />
                  <span className="text-white/40 font-black tracking-widest">INITIALIZING TEMPORAL DATA...</span>
                </div>
              ) : error ? (
                <div key="error" className="py-20 text-center text-f1-red font-bold">
                  {error}
                </div>
              ) : (
                races.map((race, idx) => (
                  <div key={race.race_id} className="relative">
                    {/* Month Header (Visual grouping) */}
                    {shouldShowMonth(races, idx) && (
                      <div className="mb-8 flex justify-center sticky top-24 z-30">
                        <span className="px-6 py-2 bg-f1-dark border border-white/10 rounded-full text-xs font-black tracking-[0.5em] text-white/50 backdrop-blur-xl">
                          {getMonthName(race.date)}
                        </span>
                      </div>
                    )}
                    
                    <RaceCard race={race} index={idx} />
                  </div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Info */}
        {!loading && races.length > 0 && (
          <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-white/20 text-xs font-bold tracking-widest">
            <div className="flex items-center gap-2">
              <Info size={14} />
              <span>ALL TIMES IN YOUR LOCAL TIMEZONE</span>
            </div>
            <div className="flex items-center gap-4">
              <span>SYSTEM STATUS: OPERATIONAL</span>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
          </footer>
        )}
      </div>
    </main>
  );
}

function isRaceLive(race: Race) {
  // Simple heuristic for initial check
  const now = new Date().getTime();
  const raceTime = new Date(race.date).getTime();
  return Math.abs(now - raceTime) < (24 * 60 * 60 * 1000);
}

function shouldShowMonth(races: Race[], index: number) {
  if (index === 0) return true;
  const currentMonth = new Date(races[index].date).getMonth();
  const prevMonth = new Date(races[index - 1].date).getMonth();
  return currentMonth !== prevMonth;
}

function getMonthName(dateStr: string) {
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'long' }).toUpperCase();
}

"use client";

import { useState, useEffect, use } from "react";
import { api } from "../../lib/api";
import { Race } from "@apex/types";
import { RaceCard } from "../../components/Calendar/RaceCard";
import { SeasonSelector } from "../../components/SeasonSelector";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const year = Number(searchParams.get("year")) || 2025;
  
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
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
    <main className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[var(--color-f1-red)]">
              <CalendarIcon size={20} />
              <span className="text-sm font-black tracking-[0.3em] uppercase italic">Season Schedule</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase italic leading-none">
              RACE <span className="text-[var(--color-f1-red)]">WEEKENDS</span>
            </h1>
            <p className="text-[var(--color-text-secondary)] max-w-xl text-lg font-medium leading-relaxed">
              The complete Formula 1 world championship schedule. Real-time session data and results.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <SeasonSelector currentYear={year} />
          </div>
        </header>

        {/* Vertical Timeline */}
        <div className="relative">
          {/* Central Vertical Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-[var(--color-f1-red)]/50 via-white/10 to-transparent -translate-x-1/2 hidden md:block" />

          <div className="space-y-12">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-4">
                <Loader2 className="w-12 h-12 text-[var(--color-f1-red)] animate-spin" />
                <span className="text-[var(--color-text-muted)] font-black tracking-widest uppercase">Synchronizing...</span>
              </div>
            ) : error ? (
              <div className="py-20 text-center text-[var(--color-danger)] font-black uppercase italic">
                {error}
              </div>
            ) : races.length === 0 ? (
              <div className="py-20 text-center text-[var(--color-text-muted)] font-black uppercase italic">
                No races found for this season.
              </div>
            ) : (
              races.map((race, idx) => (
                <div key={race.race_id} className="relative transition-reveal opacity-100">
                  {/* Month Header (Visual grouping) */}
                  {shouldShowMonth(races, idx) && (
                    <div className="mb-8 flex justify-center sticky top-24 z-30">
                      <span className="px-6 py-2 bg-[var(--color-bg-secondary)] border border-white/10 rounded-full text-[10px] font-black tracking-[0.5em] text-[var(--color-text-muted)] backdrop-blur-xl">
                        {getMonthName(race.date)}
                      </span>
                    </div>
                  )}
                  
                  <RaceCard race={race} index={idx} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Info */}
        {!loading && races.length > 0 && (
          <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[var(--color-text-muted)] text-[8px] font-black tracking-widest uppercase italic">
            <div className="flex items-center gap-2">
              <span>All times in your local timezone</span>
            </div>
            <div className="flex items-center gap-4">
              <span>System Status: Optimal</span>
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            </div>
          </footer>
        )}
      </div>
    </main>
  );
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

"use client";

import { Race } from "@apex/types";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar as CalendarIcon, Clock, ChevronRight, Zap, Info } from "lucide-react";
import { useWeekendState } from "../../hooks/useWeekendState";
import { useCountdown } from "../../hooks/useCountdown";
import { SessionTimeline } from "./SessionTimeline";
import Link from "next/link";

interface RaceCardProps {
  race: Race;
  index: number;
}

export function RaceCard({ race, index }: RaceCardProps) {
  const state = useWeekendState(race);
  const nextSession = getNextSession(race, state);
  const { days, hours, minutes, seconds, isExpired } = useCountdown(nextSession?.date || race.date);

  const isLive = state.endsWith("_LIVE");
  const isCompleted = state === "ARCHIVED_WEEKEND" || state === "CHEQUERED_FLAG";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group relative"
    >
      <div className={`relative overflow-hidden rounded-2xl border transition-all duration-500 ${
        isLive 
          ? "border-f1-red/50 bg-f1-red/5 shadow-[0_0_30px_rgba(225,6,0,0.1)]" 
          : "border-white/10 bg-white/5 hover:border-white/20"
      }`}>
        {/* Background Atmosphere Reveal */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-f1-red blur-[100px] rounded-full" />
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Left: Round & Identity */}
            <div className="flex gap-6 items-start">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-white/30 tracking-[0.2em] mb-1">ROUND</span>
                <span className="text-4xl font-black text-white/80 tabular-nums leading-none">
                  {race.round.toString().padStart(2, "0")}
                </span>
              </div>
              
              <div className="h-12 w-[1px] bg-white/10 self-center" />

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isLive ? "bg-f1-red text-white" : "bg-white/10 text-white/60"
                  }`}>
                    {state.replace("_", " ")}
                  </span>
                  {race.circuit?.atmosphere_description && (
                    <span className="text-[10px] font-medium text-f1-gold/60 italic">
                      “{race.circuit.atmosphere_description.split(".")[0]}”
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight group-hover:text-f1-red transition-colors">
                  {race.name.toUpperCase()}
                </h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-white/50">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-f1-red" />
                    <span>{race.circuit?.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon size={14} />
                    <span>{new Date(race.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Temporal Orchestration */}
            <div className="flex flex-col items-end justify-center min-w-[200px]">
              <AnimatePresence mode="wait">
                {!isCompleted ? (
                  <motion.div 
                    key="countdown"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-right"
                  >
                    <div className="text-[10px] font-bold text-white/40 tracking-widest mb-1">
                      {nextSession?.label || "RACE"} STARTS IN
                    </div>
                    <div className="flex gap-3 text-2xl font-black text-white tabular-nums">
                      <div className="flex flex-col items-center">
                        <span>{days.toString().padStart(2, "0")}</span>
                        <span className="text-[8px] text-white/20">D</span>
                      </div>
                      <span className="text-white/20">:</span>
                      <div className="flex flex-col items-center">
                        <span>{hours.toString().padStart(2, "0")}</span>
                        <span className="text-[8px] text-white/20">H</span>
                      </div>
                      <span className="text-white/20">:</span>
                      <div className="flex flex-col items-center">
                        <span>{minutes.toString().padStart(2, "0")}</span>
                        <span className="text-[8px] text-white/20">M</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="results-cta"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-end"
                  >
                    <Link 
                      href={`/races/${race.race_id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-bold text-white transition-all group/btn"
                    >
                      VIEW RESULTS
                      <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Temporal Timeline Integration */}
          <SessionTimeline race={race} state={state} />

          {/* Circuit Personality Quick Stats (Revealed on hover) */}
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            whileHover={{ height: "auto", opacity: 1 }}
            className="overflow-hidden mt-8 pt-4 border-t border-white/5"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatItem label="OVERTAKING" value={race.circuit?.overtaking_difficulty ? `${race.circuit.overtaking_difficulty}/10` : "MED"} />
              <StatItem label="DOWNFORCE" value={race.circuit?.downforce_level || "MED"} />
              <StatItem label="TIRE DEGRADATION" value={race.circuit?.tire_degradation || "MED"} />
              <StatItem label="WEATHER VOLATILITY" value={race.circuit?.weather_volatility ? `${Math.round(race.circuit.weather_volatility * 100)}%` : "30%"} />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Interaction Layer */}
      {!isCompleted && (
        <Link 
          href={`/circuits/${race.circuit_id}`}
          className="absolute inset-0 z-20 cursor-pointer"
          aria-label="View Circuit Details"
        />
      )}
    </motion.div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[8px] font-black text-white/30 tracking-wider mb-1">{label}</span>
      <span className="text-xs font-bold text-f1-gold/80">{value}</span>
    </div>
  );
}

function getNextSession(race: Race, state: string) {
  const now = new Date().getTime();
  const sessions = [
    { label: "FP1", date: race.fp1_date },
    { label: "FP2", date: race.fp2_date },
    { label: "FP3", date: race.fp3_date },
    { label: "QUALIFYING", date: race.qualifying_date },
    { label: "SPRINT", date: race.sprint_date },
    { label: "GRAND PRIX", date: race.date },
  ].filter(s => s.date && new Date(s.date).getTime() > now);

  return sessions[0] || null;
}

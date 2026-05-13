"use client";

import { useMemo } from "react";
import { Race } from "@apex/types";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Zap, Flag } from "lucide-react";
import { WeekendState } from "../../hooks/useWeekendState";

interface SessionTimelineProps {
  race: Race;
  state: WeekendState;
}

export function SessionTimeline({ race, state }: SessionTimelineProps) {
  const sessions = useMemo(() => [
    { id: "fp1", label: "FP1", date: race.fp1_date, type: "FP1_LIVE" },
    { id: "fp2", label: "FP2", date: race.fp2_date, type: "FP2_LIVE" },
    { id: "fp3", label: "FP3", date: race.fp3_date, type: "FP3_LIVE" },
    { id: "qual", label: "QUALIFYING", date: race.qualifying_date, type: "QUALIFYING_LIVE" },
    { id: "sprint", label: "SPRINT", date: race.sprint_date, type: "SPRINT_LIVE" },
    { id: "race", label: "GRAND PRIX", date: race.date, type: "RACE_LIVE" },
  ].filter(s => s.date), [race]);

  const getSessionStatus = (sessionType: string) => {
    if (state === "ARCHIVED_WEEKEND") return "COMPLETED";
    if (state === sessionType) return "LIVE";
    
    // Simple logic for past sessions
    const sessionIdx = sessions.findIndex(s => s.type === sessionType);
    const currentIdx = sessions.findIndex(s => s.type === state);
    
    if (currentIdx === -1) {
      // If we are before the weekend
      return "UPCOMING";
    }
    
    if (sessionIdx < currentIdx) return "COMPLETED";
    return "UPCOMING";
  };

  return (
    <div className="relative flex items-center justify-between w-full mt-6 px-2">
      {/* Background Line */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2" />
      
      {sessions.map((session, index) => {
        const status = getSessionStatus(session.type);
        const isActive = status === "LIVE";
        const isCompleted = status === "COMPLETED";

        return (
          <div key={session.id} className="relative flex flex-col items-center group">
            {/* Dot */}
            <motion.div
              initial={false}
              animate={{
                scale: isActive ? 1.2 : 1,
                backgroundColor: isActive ? "var(--color-f1-red)" : isCompleted ? "var(--color-gold)" : "rgba(255,255,255,0.2)"
              }}
              className={`w-3 h-3 rounded-full z-10 border-2 ${
                isActive ? "border-white shadow-[0_0_15px_rgba(225,6,0,0.8)]" : "border-transparent"
              }`}
            />
            
            {/* Label */}
            <div className="absolute top-6 flex flex-col items-center whitespace-nowrap">
              <span className={`text-[10px] font-bold tracking-tighter transition-colors ${
                isActive ? "text-f1-red" : isCompleted ? "text-f1-gold/70" : "text-white/40"
              }`}>
                {session.label}
              </span>
              {isActive && (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-[8px] text-f1-red font-black"
                >
                  LIVE
                </motion.span>
              )}
            </div>
            
            {/* Pulsing effect for active */}
            {isActive && (
              <motion.div
                layoutId="active-pulse"
                className="absolute w-6 h-6 rounded-full bg-f1-red/20 -z-0"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { RaceMoment, Driver } from "@apex/types";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Timer, AlertTriangle, TrendingUp, User } from "lucide-react";
import Image from "next/image";

interface RaceMomentFeedProps {
  moments: RaceMoment[];
  currentLap: number;
}

export function RaceMomentFeed({ moments, currentLap }: RaceMomentFeedProps) {
  // Filter moments for the current lap or just before it
  const visibleMoments = moments
    .filter(m => m.lap <= currentLap && m.lap > currentLap - 3)
    .sort((a, b) => b.lap - a.lap);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-f1-red uppercase tracking-[0.3em] italic flex items-center gap-2">
          <Zap size={16} />
          Intelligence Feed
        </h3>
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Moment Sync: Active</span>
      </div>

      <div className="relative min-h-[400px]">
        <AnimatePresence mode="popLayout">
          {visibleMoments.length === 0 ? (
             <motion.div 
               key="empty"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="flex flex-col items-center justify-center py-20 text-center space-y-4"
             >
                <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center text-white/10">
                   <Timer size={24} />
                </div>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Awaiting Narrative Events...</p>
             </motion.div>
          ) : (
            visibleMoments.map((moment) => (
              <MomentCard key={moment.id} moment={moment} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MomentCard({ moment }: { moment: RaceMoment }) {
  const isOvertake = moment.moment_type === "OVERTAKE";
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group hover:border-f1-red/30 transition-all"
    >
      {/* Type Badge */}
      <div className="absolute top-0 right-0 px-3 py-1 bg-f1-red/20 rounded-bl-xl border-l border-b border-white/10">
         <span className="text-[8px] font-black text-f1-red uppercase tracking-widest">{moment.moment_type}</span>
      </div>

      <div className="flex items-start gap-4">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white/5 border border-white/10">
           <Image 
              src={`/assets/headshots/${moment.driver?.driver_ref}.png`}
              alt={moment.driver?.surname || ""}
              fill
              className="object-cover"
              onError={(e) => {
                (e.target as any).style.opacity = '0';
              }}
           />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-white/40 uppercase">Lap {moment.lap}</span>
            <div className="w-1 h-1 bg-white/10 rounded-full" />
            <span className="text-xs font-black text-white uppercase italic">{moment.driver?.surname}</span>
          </div>
          <p className="text-sm font-bold text-white/90 leading-tight">
            {moment.description}
          </p>
          
          {isOvertake && (
            <div className="mt-3 flex items-center gap-4 text-[10px] font-black text-f1-red">
               <div className="flex items-center gap-1">
                  <TrendingUp size={12} />
                  <span>+{moment.metadata_json?.gained} POSITIONS</span>
               </div>
               <span className="text-white/20">P{moment.metadata_json?.from} → P{moment.metadata_json?.to}</span>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Scanline */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-f1-red/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}

"use client";

import { Result } from "@apex/types";
import { motion } from "framer-motion";
import Image from "next/image";
import { Trophy, Medal } from "lucide-react";

interface PodiumDisplayProps {
  results: Result[];
}

export function PodiumDisplay({ results }: PodiumDisplayProps) {
  const top3 = results.slice(0, 3);
  if (top3.length < 3) return null;

  const [p1, p2, p3] = top3;

  return (
    <div className="relative flex flex-col items-center justify-end h-[450px] w-full pt-20">
      <div className="flex items-end gap-2 md:gap-8 w-full max-w-4xl px-4">
        {/* P2 - SECOND */}
        <PodiumBlock 
          driver={p2} 
          position={2} 
          height="h-[220px]" 
          delay={0.2}
          color="bg-slate-400"
          gap={`+${((p2.milliseconds || 0) - (p1.milliseconds || 0)) / 1000}s`}
        />

        {/* P1 - WINNER */}
        <PodiumBlock 
          driver={p1} 
          position={1} 
          height="h-[300px]" 
          delay={0}
          color="bg-f1-gold"
          gap="WINNER"
          isWinner
        />

        {/* P3 - THIRD */}
        <PodiumBlock 
          driver={p3} 
          position={3} 
          height="h-[180px]" 
          delay={0.4}
          color="bg-amber-700"
          gap={`+${((p3.milliseconds || 0) - (p1.milliseconds || 0)) / 1000}s`}
        />
      </div>

      {/* Ground Reflection */}
      <div className="absolute bottom-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent shadow-[0_0_50px_rgba(255,255,255,0.1)]" />
    </div>
  );
}

function PodiumBlock({ driver, position, height, delay, color, gap, isWinner }: any) {
  return (
    <div className="flex-1 flex flex-col items-center">
      {/* Driver Identity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.5, duration: 0.8 }}
        className="mb-4 text-center"
      >
        <div className="relative w-20 h-20 md:w-28 md:h-28 mx-auto mb-2">
           <div className={`absolute inset-0 rounded-full blur-xl opacity-30 ${color}`} />
           <div className="relative w-full h-full rounded-full border-2 border-white/10 overflow-hidden bg-white/5">
              <Image 
                src={`/assets/headshots/${driver.driver?.driver_ref}.png`}
                alt={driver.driver?.surname || ""}
                fill
                className="object-cover"
                onError={(e) => {
                  (e.target as any).style.opacity = '0';
                }}
              />
           </div>
           {isWinner && (
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
               className="absolute -top-2 -right-2 text-f1-gold"
             >
               <Trophy size={24} />
             </motion.div>
           )}
        </div>
        <div className="text-[10px] font-black text-white/40 tracking-widest uppercase">{driver.driver?.forename}</div>
        <div className="text-xl font-black text-white tracking-tighter uppercase italic">{driver.driver?.surname}</div>
        <div className="text-[10px] font-bold text-f1-gold mt-1">{gap}</div>
      </motion.div>

      {/* The Block */}
      <motion.div
        initial={{ height: 0 }}
        animate={{ height }}
        transition={{ delay, duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className={`w-full relative flex flex-col items-center justify-start pt-6 rounded-t-xl border-t border-x border-white/10 overflow-hidden ${color}/10 backdrop-blur-md`}
      >
        <div className={`absolute inset-0 opacity-10 ${color}`} />
        
        {/* Position Number */}
        <span className="text-6xl md:text-8xl font-black text-white/10 italic select-none">
          {position}
        </span>
        
        <div className="absolute top-4 right-4 text-white/20">
          <Medal size={20} />
        </div>

        {/* Shine Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </motion.div>
    </div>
  );
}

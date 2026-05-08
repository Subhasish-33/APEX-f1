"use client";

import { motion } from "framer-motion";
import { Rivalry, Driver } from "@apex/types";
import { Swords, Activity, Zap, TrendingUp } from "lucide-react";
import Image from "next/image";

interface RivalryIntensityMatrixProps {
  rivalries: Rivalry[];
  drivers: Driver[];
}

export function RivalryIntensityMatrix({ rivalries, drivers }: RivalryIntensityMatrixProps) {
  if (rivalries.length === 0) return null;

  return (
    <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl relative">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2 italic uppercase">
            <Swords className="text-f1-red" />
            Rivalry Intensity Matrix
          </h3>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Aggregated Combat Proximity Analysis</p>
        </div>
      </div>

      <div className="space-y-8">
        {rivalries.slice(0, 5).map((rivalry, idx) => {
          const d1 = drivers.find(d => d.driver_id === rivalry.driver_ids[0]);
          const d2 = drivers.find(d => d.driver_id === rivalry.driver_ids[1]);
          if (!d1 || !d2) return null;

          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative flex items-center gap-8 p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:border-f1-red/30 transition-all cursor-pointer"
            >
              {/* Rival 1 */}
              <div className="flex flex-col items-center gap-2 w-20">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-f1-red/50 transition-all">
                  <Image src={`/assets/headshots/${d1.driver_ref}.png`} fill alt={d1.surname} className="object-cover" />
                </div>
                <span className="text-[10px] font-black text-white italic">{d1.surname.toUpperCase()}</span>
              </div>

              {/* Intensity Connector */}
              <div className="flex-1 flex flex-col items-center justify-center space-y-3">
                 <div className="flex items-center gap-4 text-f1-red">
                    <Zap size={16} className="animate-pulse" />
                    <span className="text-2xl font-black italic tracking-tighter">{rivalry.intensity}%</span>
                    <Zap size={16} className="animate-pulse" />
                 </div>
                 <div className="relative w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${rivalry.intensity}%` }}
                      className="absolute inset-y-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-f1-red via-f1-gold to-f1-red"
                    />
                 </div>
                 <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">{rivalry.encounters} CRITICAL ENCOUNTERS</span>
              </div>

              {/* Rival 2 */}
              <div className="flex flex-col items-center gap-2 w-20">
                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-f1-red/50 transition-all">
                  <Image src={`/assets/headshots/${d2.driver_ref}.png`} fill alt={d2.surname} className="object-cover" />
                </div>
                <span className="text-[10px] font-black text-white italic">{d2.surname.toUpperCase()}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10 p-4 border-t border-white/5 flex items-center gap-4">
         <Activity className="text-f1-red/40" size={16} />
         <p className="text-[10px] text-white/20 font-medium leading-relaxed italic">
           Intensity score calculated based on recurring sub-2s finish proximity and qualifying delta history.
         </p>
      </div>
    </div>
  );
}

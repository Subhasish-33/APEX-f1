"use client";

import { motion } from "framer-motion";
import { Driver } from "@apex/types";
import { AlertCircle, TrendingDown, Target } from "lucide-react";

interface PressureHeatmapProps {
  pressureMap: Record<number, number>;
  drivers: Driver[];
}

export function PressureHeatmap({ pressureMap, drivers }: PressureHeatmapProps) {
  // Sort drivers by pressure
  const sortedByPressure = drivers
    .map(d => ({ ...d, pressure: pressureMap[d.driver_id] || 0 }))
    .sort((a, b) => b.pressure - a.pressure);

  return (
    <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl relative group">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2 italic uppercase">
            <Target className="text-f1-red" />
            Grid Pressure Matrix
          </h3>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Psychological Stability Heatmap</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sortedByPressure.map((driver, idx) => (
          <PressureCard key={driver.driver_id} driver={driver} index={idx} />
        ))}
      </div>

      {/* Heatmap Legend */}
      <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
         <div className="flex gap-4">
            <LegendItem color="bg-f1-red" label="CRITICAL" />
            <LegendItem color="bg-f1-gold" label="ELEVATED" />
            <LegendItem color="bg-white/20" label="STABLE" />
         </div>
         <span className="text-[10px] font-black text-white/20 uppercase">Elimination Prob Logic Active</span>
      </div>
    </div>
  );
}

function PressureCard({ driver, index }: any) {
  const pressure = driver.pressure;
  const isCritical = pressure > 80;
  const isElevated = pressure > 50;
  
  const bgColor = isCritical ? "bg-f1-red/20 border-f1-red/40" : isElevated ? "bg-f1-gold/10 border-f1-gold/30" : "bg-white/5 border-white/10";
  const textColor = isCritical ? "text-f1-red" : isElevated ? "text-f1-gold" : "text-white/40";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className={`relative p-4 rounded-2xl border transition-all hover:scale-105 cursor-pointer ${bgColor}`}
    >
      <div className="flex flex-col">
        <span className="text-[8px] font-black uppercase mb-1 opacity-40">{driver.code || driver.surname.slice(0, 3)}</span>
        <div className="flex items-end justify-between">
           <span className="text-lg font-black italic text-white uppercase tracking-tighter">{driver.surname}</span>
           <span className={`text-xs font-black ${textColor}`}>{Math.round(pressure)}%</span>
        </div>
      </div>

      {/* Probability Bar */}
      <div className="mt-3 h-1 w-full bg-white/5 rounded-full overflow-hidden">
         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${pressure}%` }}
           className={`h-full ${isCritical ? 'bg-f1-red' : isElevated ? 'bg-f1-gold' : 'bg-white/40'}`} 
         />
      </div>

      {isCritical && (
        <div className="absolute -top-1 -right-1">
           <AlertCircle size={14} className="text-f1-red fill-black" />
        </div>
      )}
    </motion.div>
  );
}

function LegendItem({ color, label }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-[10px] font-black text-white/40 tracking-widest">{label}</span>
    </div>
  );
}

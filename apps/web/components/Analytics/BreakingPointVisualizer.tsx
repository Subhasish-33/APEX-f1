"use client";

import { motion } from "framer-motion";
import { AlertCircle, Zap, ShieldAlert, Activity } from "lucide-react";

interface BreakingPointVisualizerProps {
  bp1: any;
  bp2: any;
  d1Name: string;
  d2Name: string;
}

export function BreakingPointVisualizer({ bp1, bp2, d1Name, d2Name }: BreakingPointVisualizerProps) {
  return (
    <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl relative">
      <div className="mb-8">
        <h3 className="text-xl font-black flex items-center gap-2 italic uppercase">
          <ShieldAlert className="text-f1-red" />
          Stability Threshold Analysis
        </h3>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Predicted Psychological Breaking Points</p>
      </div>

      <div className="space-y-12">
        <DriverBreakingPoint name={d1Name} data={bp1} color="bg-f1-red" />
        <DriverBreakingPoint name={d2Name} data={bp2} color="bg-white/40" />
      </div>

      <div className="mt-10 p-4 bg-f1-red/10 border border-f1-red/20 rounded-xl flex items-center gap-4">
         <AlertCircle size={16} className="text-f1-red" />
         <p className="text-[9px] text-f1-red font-black uppercase italic tracking-widest">
           Warning: Consistency degradation peaks detected in final stint high-pressure zones.
         </p>
      </div>
    </div>
  );
}

function DriverBreakingPoint({ name, data, color }: any) {
  const lap = data.lap;
  const percentage = (lap / 70) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black italic text-white/60 uppercase tracking-widest">{name} Threshold</span>
        <span className="text-sm font-black text-white uppercase italic">Lap {lap} <span className="text-white/20 text-[10px] ml-1">/ 70</span></span>
      </div>

      <div className="relative h-6 w-full bg-white/5 rounded-full border border-white/5 overflow-hidden p-1">
         {/* Grid Markers */}
         <div className="absolute inset-0 flex justify-between px-8 opacity-10">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="w-px h-full bg-white" />)}
         </div>

         <motion.div 
           initial={{ width: 0 }}
           animate={{ width: `${percentage}%` }}
           className={`h-full rounded-full ${color} relative flex items-center justify-end px-3`}
         >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            
            {/* Breaking Point Marker */}
            <div className="absolute -right-1 top-0 h-full w-4 bg-white/20 blur-sm" />
         </motion.div>
      </div>

      <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-[0.3em] text-white/20">
         <span>STABLE PERFORMANCE ZONE</span>
         <span className="text-f1-red">COLLAPSE THRESHOLD</span>
      </div>
    </div>
  );
}

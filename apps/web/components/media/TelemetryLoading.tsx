"use client";

import { motion } from "framer-motion";
import SectorOverlay from "./SectorOverlay";
import ScanBar from "./ScanBar";

export default function TelemetryLoading() {
  return (
    <div className="relative min-h-[600px] w-full bg-black/20 border border-white/5 rounded-sm overflow-hidden flex flex-col items-center justify-center telemetry-grid">
      <SectorOverlay className="opacity-10" />
      <ScanBar className="top-0 left-0 w-full h-full opacity-5" speed={4} />
      
      <div className="relative z-10 flex flex-col items-center">
        <motion.div 
          className="w-16 h-16 border-2 border-white/10 rounded-full border-t-[var(--color-f1-red)] mb-8"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        <div className="text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-[var(--color-f1-red)] italic mb-4 block">
            Synchronizing Link
          </span>
          <h2 className="text-white font-display font-black text-3xl uppercase italic tracking-widest animate-pulse">
            Initializing <span className="text-outline">Telemetry</span>
          </h2>
          <div className="mt-8 flex gap-2">
            {[...Array(3)].map((_, i) => (
              <motion.div 
                key={i}
                className="w-1 h-1 bg-[var(--color-f1-red)]"
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Decorative Technical Markers */}
      <div className="absolute top-8 left-8 text-[8px] font-mono text-white/20 uppercase tracking-widest">
        SRX_SYNC_77.01
      </div>
      <div className="absolute bottom-8 right-8 text-[8px] font-mono text-white/20 uppercase tracking-widest">
        APEX_CO_4422
      </div>
    </div>
  );
}

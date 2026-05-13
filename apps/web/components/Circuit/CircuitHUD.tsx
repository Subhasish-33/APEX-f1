"use client";

import { motion } from "framer-motion";
import { Zap, Activity, Info, Map as MapIcon, Navigation } from "lucide-react";

interface CircuitHUDProps {
  name: string;
  stats: {
    length: string;
    turns: number;
    drsZones: number;
    lapRecord: {
      time: string;
      driver: string;
      year: number;
    };
  };
}

export function CircuitHUD({ name, stats }: CircuitHUDProps) {
  return (
    <div className="relative w-full aspect-square md:aspect-video bg-black/40 rounded-3xl overflow-hidden border border-white/5 backdrop-blur-sm group">
      {/* HUD Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      {/* Animated Scanline */}
      <motion.div 
        animate={{ y: ["0%", "100%", "0%"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 w-full h-[2px] bg-f1-red/20 z-10 blur-sm pointer-events-none"
      />

      {/* Main Map Visualization Area */}
      <div className="absolute inset-0 flex items-center justify-center p-12">
        {/* Placeholder for SVG Path Animation */}
        <div className="relative w-full h-full max-w-2xl">
          <svg viewBox="0 0 800 600" className="w-full h-full drop-shadow-[0_0_20px_rgba(225,6,0,0.3)]">
            <motion.path
              d="M100,300 Q200,100 400,300 T700,300 Q600,500 400,500 T100,300"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="1000"
              initial={{ strokeDashoffset: 1000, opacity: 0 }}
              animate={{ strokeDashoffset: 0, opacity: 0.8 }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
            {/* Animated Racing Line */}
            <motion.path
              d="M100,300 Q200,100 400,300 T700,300 Q600,500 400,500 T100,300"
              fill="none"
              stroke="var(--color-f1-red)"
              strokeWidth="4"
              strokeDasharray="20, 980"
              animate={{ strokeDashoffset: -1000 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
            
            {/* DRS Zone Highlight */}
            <motion.path
              d="M400,300 T700,300"
              fill="none"
              stroke="var(--color-team-mercedes)"
              strokeWidth="6"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.2, 0.8, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Sector Markers */}
            <circle cx="250" cy="200" r="4" fill="var(--color-f1-red)" />
            <circle cx="550" cy="300" r="4" fill="var(--color-f1-red)" />
          </svg>

          {/* Floating Data Nodes */}
          <HUDNode x="20%" y="20%" label="SECTOR 1" value="FAST" />
          <HUDNode x="70%" y="30%" label="DRS ZONE" value="ACTIVE" color="text-teal-400" />
          <HUDNode x="50%" y="80%" label="SECTOR 3" value="TECHNICAL" />
        </div>
      </div>

      {/* Engineering Stats Overlays */}
      <div className="absolute top-8 left-8 flex flex-col gap-4">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2 text-f1-red">
            <Activity size={16} />
            <span className="text-[10px] font-black tracking-widest">LIVE TRACK METRICS</span>
          </div>
          <div className="space-y-3">
            <MetricItem label="LAP RECORD" value={stats.lapRecord.time} sub={stats.lapRecord.driver} />
            <MetricItem label="CIRCUIT LENGTH" value={stats.length} />
            <MetricItem label="TOTAL TURNS" value={stats.turns.toString()} />
          </div>
        </div>
      </div>

      {/* Right HUD: Personality & Atmosphere */}
      <div className="absolute top-8 right-8 text-right">
        <h3 className="text-4xl font-black italic tracking-tighter text-white/90 mb-1">{name.toUpperCase()}</h3>
        <p className="text-f1-gold font-bold text-xs tracking-widest uppercase opacity-70">TEMPLE OF SPEED</p>
      </div>

      {/* Bottom HUD: Telemetry Ticker */}
      <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
        <div className="flex gap-8">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/30 mb-1">ASPHALT TEMP</span>
            <span className="text-xl font-mono font-bold text-white">38.4°C</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-white/30 mb-1">HUMIDITY</span>
            <span className="text-xl font-mono font-bold text-white">42%</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-f1-red/10 border border-f1-red/30 rounded-lg">
          <motion.div 
            animate={{ opacity: [1, 0.4, 1] }} 
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 bg-f1-red rounded-full shadow-[0_0_8px_rgba(225,6,0,1)]" 
          />
          <span className="text-[10px] font-black tracking-widest text-f1-red">TELEMETRY LINK STABLE</span>
        </div>
      </div>
    </div>
  );
}

function HUDNode({ x, y, label, value, color = "text-f1-red" }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute flex flex-col items-center pointer-events-none"
      style={{ top: y, left: x }}
    >
      <div className={`text-[8px] font-black ${color} tracking-[0.2em] mb-1 bg-black/50 px-2 py-0.5 rounded`}>{label}</div>
      <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
      <div className="text-[10px] font-bold text-white bg-black/80 px-2 py-1 rounded border border-white/10">{value}</div>
    </motion.div>
  );
}

function MetricItem({ label, value, sub }: any) {
  return (
    <div>
      <div className="text-[8px] font-bold text-white/40 tracking-wider uppercase mb-0.5">{label}</div>
      <div className="text-lg font-black text-white tracking-tight">{value}</div>
      {sub && <div className="text-[9px] font-bold text-f1-gold/60">{sub.toUpperCase()}</div>}
    </div>
  );
}

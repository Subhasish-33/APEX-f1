"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import { useState, useEffect } from "react";

interface RaceReplayHUDProps {
  totalLaps: number;
  currentLap: number;
  onLapChange: (lap: number) => void;
  isLive?: boolean;
}

export function RaceReplayHUD({ totalLaps, currentLap, onLapChange, isLive }: RaceReplayHUDProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isPlaying && currentLap < totalLaps) {
      interval = setInterval(() => {
        onLapChange(currentLap + 1);
      }, 2000); // 2 seconds per lap for cinematic replay
    } else {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentLap, totalLaps]);

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-5xl">
      <div className="bg-black/60 border border-white/10 backdrop-blur-3xl rounded-[2rem] p-6 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Animated Background Pulse */}
        <div className="absolute inset-0 bg-gradient-to-r from-f1-red/5 via-transparent to-f1-red/5 animate-pulse pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          {/* Controls */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 bg-f1-red rounded-full flex items-center justify-center text-white hover:scale-105 transition-transform shadow-[0_0_30px_rgba(225,6,0,0.5)]"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </button>
            
            <div className="flex items-center gap-2">
               <ControlBtn onClick={() => onLapChange(Math.max(1, currentLap - 1))} icon={<ChevronLeft size={20} />} />
               <ControlBtn onClick={() => onLapChange(Math.min(totalLaps, currentLap + 1))} icon={<ChevronRight size={20} />} />
               <ControlBtn onClick={() => { setIsPlaying(false); onLapChange(1); }} icon={<RotateCcw size={18} />} />
            </div>
          </div>

          {/* Timeline Scrubber */}
          <div className="flex-1 w-full space-y-3">
            <div className="flex justify-between items-end">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-black italic tracking-tighter text-white">LAP {currentLap}</span>
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">OF {totalLaps}</span>
              </div>
              <div className="flex items-center gap-2 text-f1-red">
                <Zap size={14} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Temporal Intelligence Active</span>
              </div>
            </div>

            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden group cursor-pointer">
               <motion.div 
                 className="absolute inset-y-0 left-0 bg-f1-red"
                 animate={{ width: `${(currentLap / totalLaps) * 100}%` }}
                 transition={{ duration: 0.5, ease: "easeOut" }}
               />
               <input 
                 type="range" 
                 min="1" 
                 max={totalLaps} 
                 value={currentLap} 
                 onChange={(e) => onLapChange(parseInt(e.target.value))}
                 className="absolute inset-0 opacity-0 cursor-pointer"
               />
            </div>
          </div>

          {/* Replay Indicators */}
          <div className="flex items-center gap-6 px-6 py-3 border-l border-white/10 hidden md:flex">
             <div className="flex flex-col">
               <span className="text-[8px] font-black text-white/30 uppercase mb-1">Status</span>
               <span className="text-xs font-black text-f1-red uppercase italic animate-pulse">Replay Active</span>
             </div>
             <div className="flex flex-col">
               <span className="text-[8px] font-black text-white/30 uppercase mb-1">Engine</span>
               <span className="text-xs font-black text-white uppercase italic">Cinematic_OS</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ControlBtn({ icon, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white transition-all"
    >
      {icon}
    </button>
  );
}

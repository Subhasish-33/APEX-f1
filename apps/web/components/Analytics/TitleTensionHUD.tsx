"use client";

import { motion } from "framer-motion";
import { Zap, Activity, Info, AlertCircle, ShieldAlert } from "lucide-react";

interface TitleTensionHUDProps {
  score: number;
  dna: string;
  storylines: string[];
}

export function TitleTensionHUD({ score, dna, storylines }: TitleTensionHUDProps) {
  // Determine color based on tension
  const tensionColor = score > 80 ? "text-f1-red" : score > 50 ? "text-f1-gold" : "text-green-500";
  const glowColor = score > 80 ? "shadow-[0_0_30px_rgba(225,6,0,0.5)]" : score > 50 ? "shadow-[0_0_30px_rgba(255,215,0,0.3)]" : "";

  return (
    <div className="bg-black/60 border border-white/10 backdrop-blur-3xl rounded-[2.5rem] p-8 relative overflow-hidden">
      {/* Animated Scanline Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-20" />
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-f1-red/10 border border-f1-red/30 rounded-2xl">
                <Zap size={24} className="text-f1-red animate-pulse" />
             </div>
             <div>
                <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] mb-1">Psychological Era Classification</h4>
                <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter">{dna}</h3>
             </div>
          </div>

          <div className="flex flex-wrap gap-4">
             {storylines.map((story, i) => (
               <div key={i} className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/5 rounded-full">
                  <Activity size={12} className="text-white/40" />
                  <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{story}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Tension Meter */}
        <div className="flex flex-col items-center text-center">
           <div className={`relative w-40 h-40 flex items-center justify-center rounded-full border-4 border-white/5 ${glowColor} transition-shadow duration-1000`}>
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                 <circle
                   cx="80" cy="80" r="76"
                   fill="transparent"
                   stroke="currentColor"
                   strokeWidth="8"
                   strokeDasharray="478"
                   strokeDashoffset={478 - (478 * score / 100)}
                   className={`${tensionColor} transition-all duration-1000 ease-out`}
                 />
              </svg>
              <div className="flex flex-col items-center">
                 <span className={`text-6xl font-black italic tracking-tighter ${tensionColor}`}>{Math.round(score)}</span>
                 <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Tension Index</span>
              </div>
              
              {score > 80 && (
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute -top-2 -right-2 text-f1-red"
                >
                   <ShieldAlert size={28} />
                </motion.div>
              )}
           </div>
           <p className="mt-4 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Title Volatility Warning</p>
        </div>
      </div>
    </div>
  );
}

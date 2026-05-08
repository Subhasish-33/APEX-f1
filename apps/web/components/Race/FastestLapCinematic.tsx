"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Timer, Zap, Activity } from "lucide-react";

interface FastestLapCinematicProps {
  show: boolean;
  driver: string;
  time: string;
  onComplete: () => void;
}

export function FastestLapCinematic({ show, driver, time, onComplete }: FastestLapCinematicProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-3xl overflow-hidden"
          onClick={onComplete}
        >
          {/* Animated Background Rays */}
          <div className="absolute inset-0 overflow-hidden">
             {[...Array(20)].map((_, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, scale: 0 }}
                 animate={{ opacity: [0, 0.2, 0], scale: [0, 2, 3], rotate: i * 18 }}
                 transition={{ duration: 3, repeat: Infinity, delay: i * 0.1 }}
                 className="absolute top-1/2 left-1/2 w-full h-[2px] bg-purple-500 origin-left"
               />
             ))}
          </div>

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-3 px-6 py-2 bg-purple-600 rounded-full border border-purple-400 shadow-[0_0_50px_rgba(168,85,247,0.5)]">
                 <Timer size={20} className="text-white" />
                 <span className="text-xs font-black text-white tracking-[0.4em] uppercase italic">Fastest Lap Protocol</span>
              </div>
            </motion.div>

            <motion.h2
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-8xl md:text-[12rem] font-black italic tracking-tighter text-white uppercase leading-none"
            >
              {time}
            </motion.h2>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 flex flex-col items-center"
            >
               <span className="text-2xl font-black text-purple-400 italic tracking-tighter uppercase">{driver}</span>
               <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent mt-4" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-12 flex items-center justify-center gap-8"
            >
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/30 uppercase mb-1">Sector 1</span>
                  <span className="text-xl font-mono font-bold text-purple-400">28.421</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/30 uppercase mb-1">Sector 2</span>
                  <span className="text-xl font-mono font-bold text-purple-400">32.109</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-white/30 uppercase mb-1">Sector 3</span>
                  <span className="text-xl font-mono font-bold text-purple-400">23.856</span>
               </div>
            </motion.div>
          </div>

          {/* Flash Effect */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="absolute inset-0 bg-white pointer-events-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

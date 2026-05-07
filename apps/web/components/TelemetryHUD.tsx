"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Zap, ZapOff, Activity } from "lucide-react";
import { useOrchestration } from "@/context/OrchestrationContext";

export function TelemetryHUD() {
  const { audioEnabled, reducedMotion, toggleAudio, toggleMotion, step } = useOrchestration();

  return (
    <div className="fixed bottom-8 left-8 z-50 flex items-center gap-4">
      {/* SYSTEM STATUS */}
      <div className="bg-black/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-sm flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${step !== "IDLE" ? 'bg-cyan-400 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-[8px] font-black uppercase tracking-widest text-white/60">
            {step === "IDLE" ? "System Nominal" : `Phase: ${step}`}
          </span>
        </div>
        
        <div className="w-px h-4 bg-white/10" />

        {/* CONTROLLERS */}
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleAudio}
            className="text-white/40 hover:text-white transition-colors"
            title={audioEnabled ? "Mute Audio" : "Unmute Audio"}
          >
            {audioEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
          </button>
          
          <button 
            onClick={toggleMotion}
            className="text-white/40 hover:text-white transition-colors"
            title={reducedMotion ? "Enable Motion" : "Reduce Motion"}
          >
            {reducedMotion ? <ZapOff size={12} /> : <Zap size={12} />}
          </button>
        </div>
      </div>

      {/* RE-RENDER TELEMETRY (Mock) */}
      <AnimatePresence>
        {step !== "IDLE" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="hidden md:flex items-center gap-2 bg-cyan-400/10 border border-cyan-400/20 px-3 py-1.5 rounded-sm"
          >
            <Activity size={10} className="text-cyan-400" />
            <span className="text-[8px] font-black uppercase tracking-tighter text-cyan-400">
              Uplink Active: Sequential Syncing...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

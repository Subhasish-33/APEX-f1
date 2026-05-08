"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Zap, ZapOff, Activity, AlertTriangle, Clock } from "lucide-react";
import { useOrchestration } from "@/context/OrchestrationContext";

export function TelemetryHUD() {
  const { audioEnabled, reducedMotion, toggleAudio, toggleMotion, step } = useOrchestration();
  const [isHovered, setIsHovered] = useState(false);

  const isError = step === "ERROR";
  const isSuspense = step === "SUSPENSE";

  const getStatusColor = () => {
    if (isError) return "bg-f1-red";
    if (isSuspense) return "bg-f1-gold animate-pulse";
    if (step !== "IDLE") return "bg-cyan-400 animate-pulse";
    return "bg-green-500 opacity-50";
  };

  const getStatusText = () => {
    if (isError) return "Uplink Failed";
    if (isSuspense) return "Awaiting Telemetry";
    if (step === "IDLE") return "System Nominal";
    return `Phase: ${step}`;
  };

  return (
    <div 
      className="fixed bottom-4 md:bottom-8 left-4 md:left-8 z-50 flex flex-col md:flex-row items-start md:items-center gap-4 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* SYSTEM STATUS */}
      <div className={`backdrop-blur-xl border px-4 py-2 rounded-lg flex items-center gap-3 transition-cinematic ${
        isError ? "bg-f1-red/10 border-f1-red/30 shadow-[0_0_30px_rgba(225,6,0,0.15)]" : 
        isSuspense ? "bg-f1-gold/5 border-f1-gold/20" : 
        "bg-black/60 border-white/5 hover:border-white/20 hover:bg-black/80"
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full transition-cinematic ${getStatusColor()}`} />
          <span className={`text-[8px] font-black uppercase tracking-widest transition-cinematic ${
            isError ? "text-f1-red" : isSuspense ? "text-f1-gold" : "text-white/40 group-hover:text-white/80"
          }`}>
            {getStatusText()}
          </span>
        </div>
        
        <div className="w-px h-4 bg-white/10 transition-cinematic group-hover:bg-white/20" />

        {/* CONTROLLERS - Progressive Disclosure */}
        <div className={`flex items-center gap-4 overflow-hidden transition-cinematic ${isHovered || isError ? 'w-16 opacity-100' : 'w-0 opacity-0 md:w-16 md:opacity-40'}`}>
          <button 
            onClick={toggleAudio}
            className="text-white/40 hover:text-white transition-cinematic flex-shrink-0"
            title={audioEnabled ? "Mute Audio" : "Unmute Audio"}
          >
            {audioEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
          </button>
          
          <button 
            onClick={toggleMotion}
            className="text-white/40 hover:text-white transition-cinematic flex-shrink-0"
            title={reducedMotion ? "Enable Motion" : "Reduce Motion"}
          >
            {reducedMotion ? <ZapOff size={12} /> : <Zap size={12} />}
          </button>
        </div>
      </div>

      {/* RE-RENDER TELEMETRY */}
      <AnimatePresence mode="wait">
        {step !== "IDLE" && (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -10, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md transition-cinematic ${
              isError ? "bg-f1-red/10 border-f1-red/20 text-f1-red" :
              isSuspense ? "bg-f1-gold/10 border-f1-gold/20 text-f1-gold" :
              "bg-cyan-400/5 border-cyan-400/10 text-cyan-400"
            }`}
          >
            {isError ? <AlertTriangle size={10} /> : isSuspense ? <Clock size={10} /> : <Activity size={10} />}
            <span className="text-[8px] font-black uppercase tracking-tighter">
              {isError ? "Connection Lost: Retrying..." : 
               isSuspense ? "Analyzing Telemetry..." : 
               "Uplink Active: Syncing..."}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

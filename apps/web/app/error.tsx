"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { useOrchestration } from "@/context/OrchestrationContext";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { triggerError } = useOrchestration();

  useEffect(() => {
    console.error(error);
    triggerError();
  }, [error, triggerError]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-f1-red/5 blur-[100px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg"
      >
        <div className="w-16 h-16 bg-f1-red/10 border border-f1-red/20 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(225,6,0,0.2)]">
          <AlertTriangle size={32} className="text-f1-red" />
        </div>
        
        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-f1-red mb-4">
          Telemetry Uplink Failed
        </div>
        
        <h2 className="text-4xl font-black italic tracking-tighter mb-4 text-white">
          CRITICAL SYSTEM ERROR
        </h2>
        
        <p className="text-sm text-white/50 mb-10 leading-relaxed font-medium">
          The intelligence cortex encountered an unexpected anomaly during sector transit. Diagnostics indicate data corruption or severe network latency.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-f1-red text-white rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-black transition-cinematic shadow-[0_0_20px_rgba(225,6,0,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            <RefreshCcw size={14} />
            Re-Establish Uplink
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 border border-white/10 text-white rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-white/5 hover:border-white/30 transition-cinematic"
          >
            <Home size={14} />
            Return to Cortex
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

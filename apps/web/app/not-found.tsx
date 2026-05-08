"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Map, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-white/5 blur-[100px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg"
      >
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <Map size={32} className="text-white/20" />
          </div>
          <div className="text-f1-red font-black text-9xl opacity-10 tracking-tighter mix-blend-screen">404</div>
        </div>
        
        <div className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 mb-4">
          Route Unreachable
        </div>
        
        <h2 className="text-4xl font-black italic tracking-tighter mb-4 text-white">
          SECTOR NOT FOUND
        </h2>
        
        <p className="text-sm text-white/50 mb-10 leading-relaxed font-medium">
          The requested trajectory does not exist in the current championship timeline. The coordinates may have been altered or the data has been archived.
        </p>
        
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white text-black rounded-lg font-black uppercase tracking-widest text-[10px] hover:bg-f1-red hover:text-white transition-cinematic shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(225,6,0,0.4)]"
        >
          <Home size={14} />
          Return to Hub
        </Link>
      </motion.div>
    </div>
  );
}

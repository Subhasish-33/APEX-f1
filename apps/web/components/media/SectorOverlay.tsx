"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectorOverlayProps {
  className?: string;
  color?: string;
  opacity?: number;
}

export default function SectorOverlay({
  className,
  color = "rgba(255,255,255,0.05)",
  opacity = 1
}: SectorOverlayProps) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)} style={{ opacity }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0">
        <motion.path
          d="M 0 0 L 30 0 L 15 100 L 0 100 Z"
          fill={color}
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 1.5, ease: [0.8, 0, 0.2, 1] }}
        />
        <motion.path
          d="M 100 0 L 70 0 L 85 100 L 100 100 Z"
          fill={color}
          initial={{ x: "100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 1.5, ease: [0.8, 0, 0.2, 1], delay: 0.2 }}
        />
      </svg>
      
      {/* Precision Lines */}
      <div className="absolute top-0 left-[30%] w-[1px] h-full bg-white/5" />
      <div className="absolute top-0 right-[30%] w-[1px] h-full bg-white/5" />
      
      {/* Timing Intersections */}
      <div className="absolute top-1/4 left-[30%] w-2 h-2 border border-white/20 -translate-x-1/2" />
      <div className="absolute bottom-1/4 right-[30%] w-2 h-2 border border-white/20 translate-x-1/2" />
    </div>
  );
}

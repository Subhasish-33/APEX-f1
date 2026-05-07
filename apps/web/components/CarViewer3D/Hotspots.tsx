"use client";

import React from "react";
import { Html } from "@react-three/drei";
import { motion } from "framer-motion";

export interface HotspotData {
  id: string;
  label: string;
  position: [number, number, number];
  section: string;
  partType: "aero" | "mechanical" | "power" | "ers";
}

interface HotspotsProps {
  hotspots: HotspotData[];
  teamColor: string;
  onHotspotClick: (id: string) => void;
}

export function Hotspots({ hotspots, teamColor, onHotspotClick }: HotspotsProps) {
  return (
    <>
      {hotspots.map((h) => (
        <Html key={h.id} position={h.position}>
          <div className="relative flex items-center justify-center">
            {/* Pulse Animation */}
            <div 
              className="absolute w-6 h-6 rounded-full animate-ping opacity-75"
              style={{ backgroundColor: teamColor }}
            />
            
            {/* Core Dot */}
            <motion.button
              onClick={() => onHotspotClick(h.id)}
              className="w-3 h-3 rounded-full border-2 border-white shadow-lg cursor-pointer group relative"
              style={{ backgroundColor: teamColor }}
              whileHover={{ scale: 1.5 }}
            >
              {/* Label Card */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="bg-black/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-sm whitespace-nowrap shadow-2xl">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">
                    {h.label}
                  </span>
                </div>
                {/* Arrow */}
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/90 mx-auto" />
              </div>
            </motion.button>
          </div>
        </Html>
      ))}
    </>
  );
}

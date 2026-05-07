"use client";

import React from "react";
import { Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";

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
  activeId?: string | null;
}

export function Hotspots({ hotspots, teamColor, onHotspotClick, activeId }: HotspotsProps) {
  return (
    <>
      {hotspots.map((h) => {
        const isFocused = activeId === h.id;
        const otherFocused = activeId && activeId !== h.id;

        return (
          <Html key={h.id} position={h.position} center distanceFactor={10}>
            <AnimatePresence>
              {!otherFocused && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="relative flex items-center justify-center"
                >
                  {/* Pulse Animation - Hidden if focused */}
                  {!isFocused && (
                    <div 
                      className="absolute w-6 h-6 rounded-full animate-ping opacity-75"
                      style={{ backgroundColor: teamColor }}
                    />
                  )}
                  
                  {/* Core Dot */}
                  <motion.button
                    onClick={() => onHotspotClick(h.id)}
                    className={`rounded-full border-2 border-white shadow-lg cursor-pointer group relative transition-all duration-500 ${
                      isFocused ? 'w-6 h-6' : 'w-3 h-3'
                    }`}
                    style={{ backgroundColor: teamColor }}
                    whileHover={{ scale: 1.5 }}
                  >
                    {/* Label Card - Always visible if focused */}
                    <div className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-3 transition-opacity duration-500 ${
                      isFocused ? 'opacity-100 scale-110' : 'opacity-0 group-hover:opacity-100 pointer-events-none'
                    }`}>
                      <div className="bg-black/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-sm whitespace-nowrap shadow-2xl">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white">
                            {h.label}
                          </span>
                          {isFocused && (
                            <span className="text-[8px] font-bold text-white/40 uppercase tracking-tighter mt-1">
                              Sector Isolated
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Arrow */}
                      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/90 mx-auto" />
                    </div>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </Html>
        );
      })}
    </>
  );
}

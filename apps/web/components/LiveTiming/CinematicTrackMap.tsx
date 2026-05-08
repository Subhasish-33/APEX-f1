"use client";
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { monzaTrackConfig } from '../../lib/tracks/monza';
import { f1Teams2025 } from '@/data/f1Teams2025';

interface DriverPosition {
  driver_ref: string;
  code: string;
  position: number;
}

interface CinematicTrackMapProps {
  currentLapData: DriverPosition[];
}

export default function CinematicTrackMap({ currentLapData }: CinematicTrackMapProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  // Map drivers slightly apart along the path based on their rank
  const getDriverCoordinates = (rank: number) => {
    if (!pathRef.current || pathLength === 0) return { x: 0, y: 0 };
    // Spread drivers out over the first 30% of the track relative to the leader
    // For MVP, we assume rank 1 is at 99%, rank 20 is at 70%
    const progress = Math.max(0, 0.99 - (rank * 0.015)); 
    const point = pathRef.current.getPointAtLength(progress * pathLength);
    return { x: point.x, y: point.y };
  };

  const getTeamColor = (code: string) => {
    // Basic mapping, we'll fallback to white
    if (["VER", "PER"].includes(code)) return f1Teams2025.redbull.primaryColor;
    if (["NOR", "PIA"].includes(code)) return f1Teams2025.mclaren.primaryColor;
    if (["LEC", "SAI"].includes(code)) return f1Teams2025.ferrari.primaryColor;
    if (["HAM", "RUS"].includes(code)) return f1Teams2025.mercedes.primaryColor;
    if (["ALO", "STR"].includes(code)) return f1Teams2025.astonmartin.primaryColor;
    return "#ffffff";
  };

  return (
    <div className="relative w-full h-[600px] flex items-center justify-center bg-black overflow-hidden rounded-xl border border-white/10 shadow-[0_0_100px_rgba(0,240,255,0.05)]">
      {/* Dynamic Background Glow */}
      <div 
        className="absolute inset-0 opacity-20 transition-all duration-1000" 
        style={{
          background: `radial-gradient(circle at 50% 50%, ${monzaTrackConfig.personality.primaryGlow}40, transparent 70%)`
        }}
      />
      
      {/* SVG Carbon Fiber Grid Pattern (Optional immersive element) */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <svg 
        viewBox="0 0 1100 650" 
        className="w-full h-full transform scale-90"
        style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.8))' }}
      >
        <defs>
          <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Base Layer - Depth/Shadow */}
        <path
          d={monzaTrackConfig.svgPath}
          fill="none"
          stroke="#050510"
          strokeWidth="30"
          className="translate-y-6"
        />

        {/* Middle Layer - Pseudo 3D Extrusion */}
        <path
          d={monzaTrackConfig.svgPath}
          fill="none"
          stroke={monzaTrackConfig.personality.secondaryGlow}
          strokeWidth="20"
          opacity="0.3"
          className="translate-y-3"
          filter="url(#neon-glow)"
        />

        {/* Top Layer - Main Track Line */}
        <path
          ref={pathRef}
          d={monzaTrackConfig.svgPath}
          fill="none"
          stroke="#ffffff"
          strokeWidth="6"
          opacity="0.9"
        />

        {/* Dynamic Glow Trail from Leader */}
        <path
          d={monzaTrackConfig.svgPath}
          fill="none"
          stroke={monzaTrackConfig.personality.primaryGlow}
          strokeWidth="4"
          strokeDasharray="200 4000"
          className="animate-[dash_8s_linear_infinite]"
          filter="url(#neon-glow)"
        />

        {/* Key Corners Markers */}
        {pathLength > 0 && monzaTrackConfig.keyCorners.map((corner, idx) => {
           const pt = pathRef.current!.getPointAtLength(corner.percentage * pathLength);
           return (
             <g key={idx} transform={`translate(${pt.x}, ${pt.y})`}>
                <circle r="4" fill="#ffffff" opacity="0.5" />
                <text x="10" y="5" fill="#ffffff" fontSize="12" opacity="0.4" className="font-mono tracking-widest">{corner.label}</text>
             </g>
           );
        })}

        {/* Driver Markers */}
        {pathLength > 0 && currentLapData.map((driver) => {
          const coords = getDriverCoordinates(driver.position);
          const color = getTeamColor(driver.code);
          return (
            <motion.g 
              key={driver.driver_ref}
              animate={{ x: coords.x, y: coords.y }}
              transition={{ type: "tween", ease: "linear", duration: 1 }}
            >
              {/* Driver Pulse Glow */}
              <circle r="15" fill={color} opacity="0.2" filter="url(#neon-glow)" />
              <circle r="8" fill={color} />
              <circle r="4" fill="#ffffff" />
              
              {/* Telemetry Tag */}
              <g className="translate-y-[-20px] translate-x-[-15px]">
                 <rect width="30" height="14" rx="2" fill="#000" stroke={color} strokeWidth="1" />
                 <text x="15" y="10" fill="#fff" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-mono">
                    {driver.code}
                 </text>
              </g>
            </motion.g>
          );
        })}
      </svg>
      
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -4000; }
        }
      `}</style>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";

interface TimingFrameProps {
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
  showMarkers?: boolean;
}

export default function TimingFrame({
  children,
  className,
  borderColor = "rgba(255,255,255,0.05)",
  showMarkers = true
}: TimingFrameProps) {
  return (
    <div className={cn("relative group", className)}>
      {/* Corner Markers */}
      {showMarkers && (
        <>
          <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-white/20 z-20 transition-all duration-500 group-hover:scale-150" />
          <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r border-white/20 z-20 transition-all duration-500 group-hover:scale-150" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l border-white/20 z-20 transition-all duration-500 group-hover:scale-150" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-white/20 z-20 transition-all duration-500 group-hover:scale-150" />
        </>
      )}

      {/* Main Border */}
      <div 
        className="absolute inset-0 border rounded-sm pointer-events-none transition-colors duration-500 group-hover:border-white/10" 
        style={{ borderColor }} 
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Telemetry Accent */}
      <div className="absolute top-0 right-10 w-8 h-[1px] bg-white/10" />
      <div className="absolute bottom-0 left-10 w-8 h-[1px] bg-white/10" />
    </div>
  );
}

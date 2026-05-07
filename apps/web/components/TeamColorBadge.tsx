"use client";

import React from "react";

interface TeamColorBadgeProps {
  color: string;
  label?: string;
  className?: string;
}

export function TeamColorBadge({ color, label, className = "" }: TeamColorBadgeProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="w-1.5 h-6 rounded-full" 
        style={{ backgroundColor: color }} 
      />
      {label && (
        <span className="text-[10px] font-black uppercase tracking-widest text-white/80">
          {label}
        </span>
      )}
    </div>
  );
}

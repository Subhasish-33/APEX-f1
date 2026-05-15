import React from 'react';

type FreshnessState = "LIVE" | "STALE" | "HISTORICAL";

interface FreshnessBadgeProps {
  state: FreshnessState;
  degraded?: boolean;
  className?: string;
}

export function FreshnessBadge({ state, degraded, className = "" }: FreshnessBadgeProps) {
  let bgColor = "bg-neutral-600";
  let label = "LIVE";

  if (state === "STALE") {
    bgColor = "bg-yellow-600/80";
    label = "PROVISIONAL";
  } else if (state === "HISTORICAL" || degraded) {
    bgColor = "bg-neutral-600/50";
    label = "ARCHIVED";
  } else {
    bgColor = "bg-emerald-500/80";
  }

  // Removed continuous `animate-ping` to prevent 2-hour motion fatigue.
  // The badge now relies on subtle, static confidence colors.

  return (
    <div className={`flex items-center space-x-2 opacity-80 transition-opacity hover:opacity-100 ${className}`}>
      <span className={`inline-flex h-1.5 w-1.5 rounded-full ${bgColor} shadow-sm`} />
      <span className="text-[10px] font-medium tracking-[0.2em] text-neutral-400 uppercase">
        {label}
      </span>
    </div>
  );
}

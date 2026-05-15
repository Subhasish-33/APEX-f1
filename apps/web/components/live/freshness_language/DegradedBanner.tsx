import React from 'react';

interface DegradedBannerProps {
  reason?: string;
  latencySec?: number;
}

export function DegradedBanner({ reason, latencySec }: DegradedBannerProps) {
  if (!reason) return null;

  return (
    <div className="flex w-full items-center justify-between rounded-md border border-neutral-800/60 bg-neutral-900/40 px-4 py-2.5 transition-all duration-1000 ease-in-out">
      <div className="flex items-center space-x-3">
        <svg className="h-3.5 w-3.5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-xs font-medium tracking-wide text-neutral-400">
          Telemetry Paused
        </span>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-neutral-500">
        {reason === "PROVIDER_LAG" 
          ? `Awaiting Sync • ${latencySec}s`
          : "Historical Fallback Active"}
      </span>
    </div>
  );
}

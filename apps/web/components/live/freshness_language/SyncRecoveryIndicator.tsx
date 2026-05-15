import React from 'react';

export function SyncRecoveryIndicator() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded pointer-events-none">
      <div className="h-full w-[20%] animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg]" />
    </div>
  );
}

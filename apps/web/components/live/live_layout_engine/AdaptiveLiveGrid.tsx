import React from 'react';
import { SessionFocusManager, LifecycleState, FocusRegion } from '../../../lib/live/timing_hierarchy/session_focus_manager';

interface AdaptiveLiveGridProps {
  sessionState: LifecycleState;
  isDegraded: boolean;
  LeaderboardSlot: React.ReactNode;
  TelemetrySlot: React.ReactNode;
  RaceControlSlot: React.ReactNode;
  EditorialSlot: React.ReactNode;
}

export function AdaptiveLiveGrid({
  sessionState,
  isDegraded,
  LeaderboardSlot,
  TelemetrySlot,
  RaceControlSlot,
  EditorialSlot,
}: AdaptiveLiveGridProps) {
  const primaryFocus = SessionFocusManager.getPrimaryFocusRegion(sessionState);

  // Base layout is a CSS Grid
  return (
    <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 transition-all duration-700 ease-in-out ${isDegraded ? 'opacity-80 grayscale-[20%]' : ''}`}>
      
      {/* Dynamic Column 1: Leaderboard */}
      <div className={`
        ${primaryFocus === 'LEADERBOARD' ? 'md:col-span-8 order-1' : 'md:col-span-4 order-2'}
        transition-all duration-700
      `}>
        {LeaderboardSlot}
      </div>

      {/* Dynamic Column 2: Context (Telemetry / Race Control / Editorial) */}
      <div className={`
        ${primaryFocus === 'LEADERBOARD' ? 'md:col-span-4 order-2' : 'md:col-span-8 order-1'}
        flex flex-col gap-6 transition-all duration-700
      `}>
        {primaryFocus === 'RACE_CONTROL' && RaceControlSlot}
        {primaryFocus === 'TELEMETRY' && TelemetrySlot}
        {(primaryFocus === 'EDITORIAL' || sessionState === 'ARCHIVED') && EditorialSlot}
        
        {/* Secondary fallbacks for the context column */}
        {primaryFocus !== 'RACE_CONTROL' && sessionState === 'RED_FLAG' && RaceControlSlot}
        {primaryFocus !== 'TELEMETRY' && (sessionState === 'GREEN_FLAG' || sessionState === 'SAFETY_CAR') && TelemetrySlot}
      </div>
      
    </div>
  );
}

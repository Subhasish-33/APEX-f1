import React from 'react';
import { LifecycleState } from '../../../lib/live/timing_hierarchy/session_focus_manager';

interface LiveStorylineRouterProps {
  sessionState: LifecycleState;
  lapsCompleted: number;
  totalLaps: number | null;
  degraded: boolean;
}

export function LiveStorylineRouter({ sessionState, lapsCompleted, totalLaps, degraded }: LiveStorylineRouterProps) {
  if (degraded) {
    return (
      <div className="rounded-md border border-neutral-800 bg-neutral-900/50 p-6 text-center">
        <p className="text-sm text-neutral-400">Strategic insight paused during telemetry degradation.</p>
      </div>
    );
  }

  // Calculate race phase
  let phase = "UNKNOWN";
  if (totalLaps) {
    const pct = lapsCompleted / totalLaps;
    if (pct < 0.1) phase = "OPENING_LAPS";
    else if (pct < 0.4) phase = "FIRST_STINT";
    else if (pct < 0.7) phase = "MID_RACE_PIT_WINDOW";
    else if (pct < 0.9) phase = "SECOND_STINT";
    else phase = "FINAL_LAPS";
  }

  const renderContext = () => {
    switch(sessionState) {
      case "RED_FLAG":
        return (
          <div className="space-y-2 border-l-2 border-red-500 pl-4">
            <h3 className="text-lg font-bold text-red-500 uppercase tracking-widest">Session Suspended</h3>
            <p className="text-sm text-neutral-300">Cars returning to pit lane. Time gaps are neutralized. Awaiting race control restart procedures.</p>
          </div>
        );
      case "SAFETY_CAR":
        return (
          <div className="space-y-2 border-l-2 border-yellow-500 pl-4">
            <h3 className="text-lg font-bold text-yellow-500 uppercase tracking-widest">Safety Car Deployed</h3>
            <p className="text-sm text-neutral-300">Pace neutralized. Deltas to car ahead are compressed. Cheap pit stop window open.</p>
          </div>
        );
      case "GREEN_FLAG":
        if (phase === "OPENING_LAPS") {
           return (
            <div className="space-y-2 border-l-2 border-green-500 pl-4">
              <h3 className="text-lg font-bold text-neutral-100 uppercase tracking-widest">Opening Phase</h3>
              <p className="text-sm text-neutral-400">Position stabilization and early tire preservation. DRS enabled.</p>
            </div>
           );
        } else if (phase === "MID_RACE_PIT_WINDOW") {
           return (
            <div className="space-y-2 border-l-2 border-green-500 pl-4">
              <h3 className="text-lg font-bold text-neutral-100 uppercase tracking-widest">Pit Window Active</h3>
              <p className="text-sm text-neutral-400">Strategic divergence. Watch for undercuts in the top 10 intervals.</p>
            </div>
           );
        } else {
           return (
            <div className="space-y-2 border-l-2 border-green-500 pl-4">
              <h3 className="text-lg font-bold text-neutral-100 uppercase tracking-widest">Race Pace</h3>
              <p className="text-sm text-neutral-400">Monitoring interval degradation and tire life.</p>
            </div>
           );
        }
      default:
        return null;
    }
  };

  return (
    <div className="rounded-md bg-neutral-900 p-6">
      <h2 className="mb-4 text-xs font-semibold tracking-widest text-neutral-500 uppercase">Operational Context</h2>
      {renderContext()}
    </div>
  );
}

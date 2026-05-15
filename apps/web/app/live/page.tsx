"use client";

import React, { useState, useEffect } from 'react';
import { AdaptiveLiveGrid } from '../../components/live/live_layout_engine/AdaptiveLiveGrid';
import { FreshnessBadge } from '../../components/live/freshness_language/FreshnessBadge';
import { DegradedBanner } from '../../components/live/freshness_language/DegradedBanner';
import { LiveStorylineRouter } from '../../components/live/editorial_live_fusion/LiveStorylineRouter';
import { LifecycleState } from '../../lib/live/timing_hierarchy/session_focus_manager';
import { api, LiveLeaderboardRow } from '../../lib/api';

export default function LiveRaceCenter() {
  const [sessionState] = useState<LifecycleState>("ARCHIVED");
  const [isDegraded, setIsDegraded] = useState(true);
  const [freshness, setFreshness] = useState<"LIVE" | "STALE" | "HISTORICAL">("HISTORICAL");
  const [leaderboard, setLeaderboard] = useState<LiveLeaderboardRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    api.getLiveLeaderboard()
      .then((response) => {
        if (cancelled) return;
        setLeaderboard(response.data);
        setFreshness(response.state.freshness);
        setIsDegraded(response.state.degraded || response.data.length === 0);
      })
      .catch(() => {
        if (cancelled) return;
        setLeaderboard([]);
        setFreshness("HISTORICAL");
        setIsDegraded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const LeaderboardSlot = (
    <div className="rounded-md bg-neutral-900 p-6 min-h-[420px] border border-neutral-800">
      <h2 className="text-xl font-bold text-white mb-4">Live Leaderboard</h2>
      {leaderboard.length > 0 ? (
        <div className="space-y-3">
          {leaderboard.map((row) => (
            <div key={`${row.position}-${row.driver_ref ?? row.driver_id}`} className="flex justify-between items-center bg-neutral-800/50 p-3 rounded-sm">
              <span className="text-white font-mono">
                {row.position ? `${row.position}. ` : ""}
                {row.driver_ref ?? row.driver_id ?? "CERTIFIED"}
              </span>
              <span className="text-neutral-400 font-mono tabular-nums">
                {row.gap ?? row.status ?? "NO DELTA"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-72 flex flex-col items-center justify-center text-center border border-dashed border-neutral-800 rounded-sm">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 mb-3">
            No Certified Live Timing
          </span>
          <p className="text-sm text-neutral-500 max-w-sm">
            The live race center is waiting for canonical telemetry. No simulated leaderboard is displayed.
          </p>
        </div>
      )}
    </div>
  );

  const TelemetrySlot = (
    <div className="rounded-md bg-neutral-900 p-6 border border-neutral-800">
      <h2 className="text-xl font-bold text-white mb-4">Telemetry Context</h2>
      <p className="text-sm text-neutral-500">
        Tire, sector, and interval intelligence will activate only when provider telemetry is certified.
      </p>
    </div>
  );

  const RaceControlSlot = (
    <div className="rounded-md bg-red-950/20 p-6 border border-red-900/50">
      <h2 className="text-xl font-bold text-red-500 mb-4 uppercase tracking-widest">Race Control</h2>
      <p className="text-sm text-red-400 font-mono">NO ACTIVE CERTIFIED RACE CONTROL FEED</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-black p-8 font-sans">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">APEX-F1 LIVE</h1>
          <p className="text-neutral-500 text-sm mt-1">Operational Race Center</p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <FreshnessBadge 
            state={freshness}
            degraded={isDegraded} 
          />
        </div>
      </header>

      {isDegraded && (
        <div className="mb-6">
          <DegradedBanner reason="PROVIDER_LAG" latencySec={0} />
        </div>
      )}

      <AdaptiveLiveGrid
        sessionState={sessionState}
        isDegraded={isDegraded}
        LeaderboardSlot={LeaderboardSlot}
        TelemetrySlot={TelemetrySlot}
        RaceControlSlot={RaceControlSlot}
        EditorialSlot={
          <LiveStorylineRouter 
            sessionState={sessionState} 
            lapsCompleted={0}
            totalLaps={null}
            degraded={isDegraded} 
          />
        }
      />
    </div>
  );
}

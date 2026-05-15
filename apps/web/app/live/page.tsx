"use client";

import React, { useState, useEffect } from 'react';
import { AdaptiveLiveGrid } from '../../components/live/live_layout_engine/AdaptiveLiveGrid';
import { FreshnessBadge } from '../../components/live/freshness_language/FreshnessBadge';
import { DegradedBanner } from '../../components/live/freshness_language/DegradedBanner';
import { LiveStorylineRouter } from '../../components/live/editorial_live_fusion/LiveStorylineRouter';
import { LifecycleState } from '../../lib/live/timing_hierarchy/session_focus_manager';

export default function LiveRaceCenter() {
  // In a real implementation, this state comes from the SWR/React Query polling
  const [sessionState, setSessionState] = useState<LifecycleState>("GREEN_FLAG");
  const [isDegraded, setIsDegraded] = useState(false);
  const [latency, setLatency] = useState(2);

  // Example placeholder slots
  const LeaderboardSlot = (
    <div className="rounded-xl bg-neutral-900 p-6 h-[600px] border border-neutral-800">
      <h2 className="text-xl font-bold text-white mb-4">Live Leaderboard</h2>
      <div className="space-y-3">
        {/* Example rows adhering to motion rules (no blinking, tabular nums) */}
        <div className="flex justify-between items-center bg-neutral-800/50 p-3 rounded">
          <span className="text-white font-mono">1. VER</span>
          <span className="text-neutral-400 font-mono tabular-nums">LEADER</span>
        </div>
        <div className="flex justify-between items-center bg-neutral-800/50 p-3 rounded border-l-2 border-red-500">
          <span className="text-white font-mono">2. LEC</span>
          <span className="text-neutral-300 font-mono tabular-nums">+1.234s</span>
        </div>
        <div className="flex justify-between items-center bg-neutral-800/50 p-3 rounded">
          <span className="text-white font-mono">3. NOR</span>
          <span className="text-neutral-400 font-mono tabular-nums">+4.567s</span>
        </div>
      </div>
    </div>
  );

  const TelemetrySlot = (
    <div className="rounded-xl bg-neutral-900 p-6 border border-neutral-800">
      <h2 className="text-xl font-bold text-white mb-4">Tire Context</h2>
      <div className="space-y-2">
        <p className="text-sm text-neutral-400">VER: Medium (L12)</p>
        <p className="text-sm text-neutral-400">LEC: Hard (L15)</p>
      </div>
    </div>
  );

  const RaceControlSlot = (
    <div className="rounded-xl bg-red-950/20 p-6 border border-red-900/50">
      <h2 className="text-xl font-bold text-red-500 mb-4 uppercase tracking-widest">Race Control</h2>
      <p className="text-sm text-red-400 font-mono">14:32:04 - YELLOW FLAG SECTOR 2</p>
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
            state={isDegraded ? "STALE" : "LIVE"} 
            degraded={isDegraded} 
          />
        </div>
      </header>

      {isDegraded && (
        <div className="mb-6">
          <DegradedBanner reason="PROVIDER_LAG" latencySec={latency} />
        </div>
      )}

      {/* The Core Live Layout Engine */}
      <AdaptiveLiveGrid
        sessionState={sessionState}
        isDegraded={isDegraded}
        LeaderboardSlot={LeaderboardSlot}
        TelemetrySlot={TelemetrySlot}
        RaceControlSlot={RaceControlSlot}
        EditorialSlot={
          <LiveStorylineRouter 
            sessionState={sessionState} 
            lapsCompleted={12} 
            totalLaps={57} 
            degraded={isDegraded} 
          />
        }
      />
      
      {/* Dev Controls to simulate race states for testing the UX logic */}
      <div className="mt-12 p-4 bg-neutral-950 border border-neutral-800 rounded-lg">
        <p className="text-xs text-neutral-500 mb-3 uppercase tracking-widest">Simulator Controls</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setSessionState("GREEN_FLAG"); setIsDegraded(false); }} className="px-3 py-1 bg-green-900/30 text-green-500 rounded text-xs">Green Flag</button>
          <button onClick={() => { setSessionState("SAFETY_CAR"); setIsDegraded(false); }} className="px-3 py-1 bg-yellow-900/30 text-yellow-500 rounded text-xs">Safety Car</button>
          <button onClick={() => { setSessionState("RED_FLAG"); setIsDegraded(false); }} className="px-3 py-1 bg-red-900/30 text-red-500 rounded text-xs">Red Flag</button>
          <button onClick={() => { setSessionState("ARCHIVED"); setIsDegraded(true); }} className="px-3 py-1 bg-neutral-800 text-neutral-400 rounded text-xs">Archived</button>
          <button onClick={() => { setIsDegraded(true); setLatency(18); }} className="px-3 py-1 border border-neutral-700 text-neutral-400 rounded text-xs ml-4">Simulate Degradation</button>
        </div>
      </div>
    </div>
  );
}

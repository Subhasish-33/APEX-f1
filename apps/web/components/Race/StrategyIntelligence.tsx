"use client";

import { PitStop, Result } from "@apex/types";
import { Timer, Activity } from "lucide-react";

interface StrategyIntelligenceProps {
  pitStops: PitStop[];
  results: Result[];
  totalLaps: number;
}

export function StrategyIntelligence({ pitStops, results, totalLaps }: StrategyIntelligenceProps) {
  // Sort drivers by finishing position
  const sortedDrivers = [...results].sort((a, b) => (a.position || 99) - (b.position || 99)).slice(0, 10);

  return (
    <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
         <Activity size={120} className="text-white" />
      </div>

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2 italic uppercase">
            <Timer className="text-f1-red" />
            Strategy Intelligence Matrix
          </h3>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Stint Efficiency & Compound Lifecycle</p>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {sortedDrivers.map((res, idx) => {
          const driverStops = pitStops.filter(p => p.driver_id === res.driver_id).sort((a, b) => a.lap - b.lap);
          
          return (
            <div key={res.driver_id} className="group">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-white/40 italic">P{res.position}</span>
                  <span className="text-xs font-black text-white uppercase tracking-tighter">{res.driver?.surname}</span>
                </div>
                <div className="flex gap-4 text-[8px] font-black text-white/20 uppercase tracking-widest">
                  <span>{driverStops.length} STOPS</span>
                  <span>AVG 2.4s</span>
                </div>
              </div>

              {/* Stint Bar */}
              <div className="h-4 w-full bg-white/5 rounded-full flex overflow-hidden border border-white/5 relative">
                {/* Visualizing Stints */}
                {renderStints(driverStops, totalLaps)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-12 pt-6 border-t border-white/5 flex gap-8">
         <LegendItem color="bg-red-500" label="SOFT" />
         <LegendItem color="bg-f1-gold" label="MEDIUM" />
         <LegendItem color="bg-white" label="HARD" />
         <LegendItem color="bg-green-500" label="INTER" />
         <LegendItem color="bg-blue-500" label="WET" />
      </div>
    </div>
  );
}

function renderStints(stops: PitStop[], totalLaps: number) {
  const stints = [];
  let currentLap = 1;

  // Stint colors (mocked compounds for demo)
  const compounds = ["bg-red-500", "bg-f1-gold", "bg-white"];
  
  stops.forEach((stop, idx) => {
    const stintLength = stop.lap - currentLap;
    stints.push(
    <div
        key={`stint-${idx}`}
        style={{ width: `${(stintLength / totalLaps) * 100}%`, backgroundColor: undefined }}
        className={`h-full ${compounds[idx % 3]} opacity-80 hover:opacity-100 transition-ui border-r border-black/20 relative group/stint`}
      >
        <div className="absolute inset-0 bg-black/10 group-hover/stint:bg-transparent transition-colors" />
        <div className="hidden group-hover/stint:block absolute -top-8 left-1/2 -translate-x-1/2 bg-black px-2 py-1 rounded text-[8px] font-black text-white whitespace-nowrap z-50">
          STINT {idx + 1}: {stintLength} LAPS
        </div>
      </div>
    );
    currentLap = stop.lap;
  });

  // Final Stint
  const finalStintLength = totalLaps - currentLap;
  stints.push(
    <div
      key="final-stint"
      style={{ width: `${(finalStintLength / totalLaps) * 100}%` }}
      className={`h-full ${compounds[stops.length % 3]} opacity-80 hover:opacity-100 border-r border-black/20 relative group/stint`}
    >
      <div className="absolute inset-0 bg-black/10 group-hover/stint:bg-transparent transition-colors" />
      <div className="hidden group-hover/stint:block absolute -top-8 left-1/2 -translate-x-1/2 bg-black px-2 py-1 rounded text-[8px] font-black text-white whitespace-nowrap z-50">
        FINAL: {finalStintLength} LAPS
      </div>
    </div>
  );

  return stints;
}

function LegendItem({ color, label }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-[10px] font-black text-white/40 tracking-widest">{label}</span>
    </div>
  );
}

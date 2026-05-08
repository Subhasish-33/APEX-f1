"use client";

import { PitStop } from "@apex/types";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, Cell, ReferenceLine } from "recharts";
import { motion } from "framer-motion";
import { Timer, Fuel } from "lucide-react";

interface PitStopTimelineProps {
  pitStops: PitStop[];
  totalLaps: number;
}

export function PitStopTimeline({ pitStops, totalLaps }: PitStopTimelineProps) {
  // Transform data for Recharts
  // We want Driver on Y-axis and Lap on X-axis
  const drivers = Array.from(new Set(pitStops.map(p => p.driver?.surname || "Unknown")));
  const data = pitStops.map(p => ({
    driver: p.driver?.surname || "Unknown",
    lap: p.lap,
    duration: parseFloat(p.duration || "0"),
    stop: p.stop,
    time: p.time
  }));

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 h-[600px] flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <Timer className="text-f1-red" />
            PIT STOP TIMELINE
          </h3>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">Strategy Orchestration Index</p>
        </div>
        <div className="flex gap-4">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-f1-red" />
              <span className="text-[10px] font-black text-white/40 uppercase">Stop 1</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-f1-gold" />
              <span className="text-[10px] font-black text-white/40 uppercase">Stop 2+</span>
           </div>
        </div>
      </div>

      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 40 }}>
            <XAxis 
              type="number" 
              dataKey="lap" 
              name="Lap" 
              unit="" 
              domain={[0, totalLaps || 70]} 
              stroke="#ffffff40" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="driver" 
              name="Driver" 
              stroke="#ffffff40" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <ZAxis type="number" dataKey="duration" range={[100, 500]} name="Duration" />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ strokeDasharray: '3 3', stroke: '#ffffff20' }}
            />
            <Scatter name="Pit Stops" data={data}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.stop === 1 ? '#E10600' : '#FFD700'} 
                  stroke="white" 
                  strokeWidth={1}
                  className="drop-shadow-[0_0_8px_rgba(225,6,0,0.5)]"
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 p-4 border-t border-white/5 flex items-center gap-4">
        <Fuel className="text-white/20" size={16} />
        <p className="text-[10px] text-white/40 font-medium leading-relaxed italic">
          Data synchronized with official F1 timing system. Circle size represents pit stop duration. 
          Technical fluctuations in duration reflect pneumatic wheel-gun efficiency and traffic.
        </p>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-f1-dark border border-white/20 p-3 rounded-lg shadow-2xl backdrop-blur-xl">
        <div className="text-[10px] font-black text-f1-red uppercase mb-1">STOP {data.stop}</div>
        <div className="text-sm font-black text-white mb-2">{data.driver.toUpperCase()}</div>
        <div className="space-y-1">
          <div className="flex justify-between gap-8">
            <span className="text-[9px] font-bold text-white/40 uppercase">Lap</span>
            <span className="text-[9px] font-black text-white">{data.lap}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-[9px] font-bold text-white/40 uppercase">Duration</span>
            <span className="text-[9px] font-black text-white">{data.duration}s</span>
          </div>
          <div className="flex justify-between gap-8">
            <span className="text-[9px] font-bold text-white/40 uppercase">Time</span>
            <span className="text-[9px] font-black text-white">{data.time}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HistoryData {
  year: number;
  points: number;
  position: number;
  wins: number;
}

interface HistoryChartProps {
  data: HistoryData[];
  teamColor: string;
}

export function HistoryChart({ data, teamColor }: HistoryChartProps) {
  // Invert position for better visualization (Lower position is better)
  const chartData = data.map(d => ({
    ...d,
    invertedPosition: 11 - d.position, // Assuming max 10 teams, lower position is higher on Y axis
  }));

  return (
    <div className="w-full h-[300px] bg-white/5 rounded-sm p-6 border border-white/5">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] block mb-1">Performance Index</span>
          <h4 className="text-sm font-black text-white uppercase italic tracking-wider">Historical Standing Trend</h4>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: teamColor }} />
            <span className="text-[8px] font-bold text-white/60 uppercase">Constructor Rank</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={teamColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={teamColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="year" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900 }} 
            dy={10}
          />
          <YAxis 
            hide
            domain={[1, 10]} 
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="bg-black/90 backdrop-blur-md border border-white/10 p-3 rounded-sm shadow-2xl">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">{d.year} Season</p>
                    <p className="text-sm font-black text-white italic mb-1">P{d.position} Finish</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-cyan-400 uppercase">
                       <span>{d.wins} Wins</span>
                       <span className="text-white/20">|</span>
                       <span>{d.points} Points</span>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="invertedPosition"
            stroke={teamColor}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorPos)"
            animationDuration={2000}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

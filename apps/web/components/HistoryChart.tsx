"use client";

import React from "react";
import dynamic from "next/dynamic";

// ── Recharts loaded only on client, never SSR ─────────────────────────────
// Bundle impact: ~300KB — must not be in the initial JS bundle.
const AreaChart = dynamic(() => import("recharts").then((m) => m.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then((m) => m.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });

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
  const chartData = data.map((d) => ({
    ...d,
    // Invert position: lower position number = better = higher on chart
    invertedPosition: 11 - d.position,
  }));

  return (
    <div className="w-full h-[300px] bg-[var(--color-bg-secondary)] rounded-sm p-6 border border-white/5">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-[10px] text-[var(--color-text-muted)] font-black uppercase tracking-[0.2em] block mb-1">
            Performance Index
          </span>
          <h4 className="text-sm font-black text-[var(--color-text-primary)] uppercase italic tracking-wider">
            Historical Standing Trend
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: teamColor }} />
          <span className="text-[8px] font-bold text-[var(--color-text-secondary)] uppercase">
            Constructor Rank
          </span>
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
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 900 }}
            dy={10}
          />
          <YAxis hide domain={[1, 10]} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload;
                return (
                  <div className="bg-[var(--color-bg-primary)] border border-white/10 p-3 rounded-sm shadow-2xl">
                    <p className="text-[10px] font-black text-[var(--color-text-muted)] uppercase tracking-widest mb-1">
                      {d.year} Season
                    </p>
                    <p className="text-sm font-black text-[var(--color-text-primary)] italic mb-1">
                      P{d.position} Finish
                    </p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--color-text-secondary)] uppercase">
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
            animationDuration={300}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

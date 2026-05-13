"use client";

import dynamic from "next/dynamic";

const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });

interface CareerStat {
  year: number;
  position: number;
  team?: string;
  points: number;
}

export default function CareerPerformanceChart({ data }: { data: CareerStat[] }) {
  if (!data || data.length === 0) return (
    <div className="h-full w-full flex flex-col items-center justify-center opacity-20">
      <div className="w-12 h-12 border border-dashed border-white/40 rounded-full animate-spin-slow mb-4" />
      <span className="text-[10px] font-black uppercase tracking-[0.4em]">Historical Sync Required</span>
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-f1-red)" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="var(--color-f1-red)" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
        <XAxis
          dataKey="year"
          stroke="rgba(255,255,255,0.1)"
          fontSize={8}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "rgba(255,255,255,0.3)", fontWeight: "900", fontFamily: "var(--font-mono)" }}
        />
        <YAxis
          reversed
          domain={[1, 'dataMax']}
          stroke="rgba(255,255,255,0.1)"
          fontSize={8}
          tickLine={false}
          axisLine={false}
          tick={{ fill: "rgba(255,255,255,0.3)", fontWeight: "900", fontFamily: "var(--font-mono)" }}
        />
        <Tooltip
          cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const d = payload[0].payload;
              return (
                <div className="bg-black/90 border border-white/10 p-5 shadow-glass backdrop-blur-xl relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-f1-red)]" />
                  <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[var(--color-text-muted)] mb-3 italic">
                    // REF: {d.year}.SEASON
                  </p>
                  <p className="text-2xl font-display font-black text-white mb-1 italic uppercase tracking-tighter">
                    P{d.position} <span className="text-[10px] not-italic font-medium text-[var(--color-text-secondary)] ml-2">Standing</span>
                  </p>
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                     <div className="flex flex-col">
                        <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase">Points</span>
                        <span className="text-xs font-data font-black text-[var(--color-f1-red)]">{d.points}</span>
                     </div>
                  </div>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="position"
          stroke="var(--color-f1-red)"
          strokeWidth={1.5}
          animationDuration={1500}
          animationEasing="ease-in-out"
          dot={{ fill: "var(--color-f1-red)", stroke: "var(--color-bg-primary)", strokeWidth: 1, r: 3 }}
          activeDot={{ r: 5, stroke: "white", strokeWidth: 1.5, fill: "var(--color-f1-red)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

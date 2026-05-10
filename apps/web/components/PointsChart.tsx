"use client";

import dynamic from "next/dynamic";

// ── Recharts loaded only on client, never SSR ─────────────────────────────
const BarChart = dynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => m.ResponsiveContainer), { ssr: false });
const Cell = dynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });

interface DataPoint {
  year: number;
  points: number;
}

export default function PointsChart({ data }: { data: DataPoint[] }) {
  const maxPoints = Math.max(...data.map((d) => d.points));

  return (
    <div className="h-[300px] w-full mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="year"
            stroke="rgba(255,255,255,0.2)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgba(255,255,255,0.4)", fontWeight: "bold" }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.2)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "rgba(255,255,255,0.4)", fontWeight: "bold" }}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            contentStyle={{
              backgroundColor: "var(--color-bg-secondary)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "2px",
              fontSize: "12px",
              color: "var(--color-text-primary)",
            }}
            itemStyle={{ color: "var(--color-f1-red)", fontWeight: "bold" }}
          />
          <Bar dataKey="points" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.points === maxPoints ? "var(--color-f1-red)" : "rgba(255,255,255,0.1)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

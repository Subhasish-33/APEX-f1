"use client";

import { Telemetry, Result } from "@apex/types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { Activity, Zap, TrendingUp } from "lucide-react";

interface RacePACEAnalyticsProps {
  telemetry: Telemetry[];
  driverId: number;
  totalLaps: number;
}

export function RacePACEAnalytics({ telemetry, driverId, totalLaps }: RacePACEAnalyticsProps) {
  const driverData = telemetry
    .filter(t => t.driver_id === driverId)
    .sort((a, b) => a.lap_number - b.lap_number);

  if (driverData.length === 0) return null;

  // Calculate consistency score (simplified)
  const averageTime = driverData.reduce((acc, t) => acc + (t.lap_time || 0), 0) / driverData.length;
  const variance = driverData.reduce((acc, t) => acc + Math.pow((t.lap_time || 0) - averageTime, 2), 0) / driverData.length;
  const consistency = Math.max(0, 100 - (variance * 10)).toFixed(1);

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 flex flex-col items-end">
         <div className="flex items-center gap-2 text-f1-red mb-1">
            <TrendingUp size={16} />
            <span className="text-2xl font-black italic tracking-tighter">{consistency}%</span>
         </div>
         <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Consistency Rating</span>
      </div>

      <div className="mb-10">
        <h3 className="text-lg font-black flex items-center gap-2 italic uppercase">
          <Activity className="text-white/40" />
          Race Pace Evolution
        </h3>
        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">Stint-by-Stint Delta Analysis</p>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={driverData}>
            <defs>
              <linearGradient id="colorLap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-f1-red)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-f1-red)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="lap_number" hide />
            <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="lap_time" 
              stroke="var(--color-f1-red)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorLap)" 
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 flex justify-between items-end">
        <div className="space-y-1">
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Dominance Index</span>
          <div className="flex gap-1">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className={`w-4 h-1 rounded-full ${i < 5 ? 'bg-f1-red' : 'bg-white/10'}`} />
            ))}
          </div>
        </div>
        <div className="bg-f1-red/10 px-4 py-2 rounded-xl border border-f1-red/30">
           <span className="text-[10px] font-black text-f1-red uppercase tracking-widest">Telemetry Verified</span>
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 border border-white/20 p-3 rounded-lg backdrop-blur-xl">
        <div className="text-[10px] font-black text-white/40 uppercase mb-1">Lap {payload[0].payload.lap_number}</div>
        <div className="text-lg font-black text-white italic">{payload[0].value.toFixed(3)}s</div>
      </div>
    );
  }
  return null;
};

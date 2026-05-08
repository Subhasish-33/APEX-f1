"use client";

import { Telemetry, Driver } from "@apex/types";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface PositionTraceProps {
  telemetry: Telemetry[];
  drivers: Driver[];
  currentLap: number;
}

export function PositionTrace({ telemetry, drivers, currentLap }: PositionTraceProps) {
  // Transform telemetry into Lap-by-Lap positions for each driver
  // Data format: [{ lap: 1, VER: 1, HAM: 2, ... }, { lap: 2, VER: 1, HAM: 3, ... }]
  
  const lapMap = new Map<number, any>();
  const driverRefs = new Set<string>();

  telemetry.forEach(t => {
    if (!lapMap.has(t.lap_number)) {
      lapMap.set(t.lap_number, { lap: t.lap_number });
    }
    const lapData = lapMap.get(t.lap_number);
    const driver = drivers.find(d => d.driver_id === t.driver_id);
    if (driver) {
      lapData[driver.code || driver.surname] = getPositionFromLap(telemetry, t.lap_number, t.driver_id);
      driverRefs.add(driver.code || driver.surname);
    }
  });

  const chartData = Array.from(lapMap.values()).sort((a, b) => a.lap - b.lap);

  return (
    <div className="bg-black/40 border border-white/5 rounded-3xl p-8 h-[500px] backdrop-blur-xl relative group">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2 italic uppercase">
            <Activity className="text-f1-red animate-pulse" />
            Position Evolution Trace
          </h3>
          <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Real-time Order Oscillation</p>
        </div>
      </div>

      <div className="w-full h-full pb-10 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="lap" 
              stroke="#ffffff20" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              label={{ value: 'LAP NUMBER', position: 'bottom', fill: '#ffffff40', fontSize: 8, fontWeight: 'bold' }}
            />
            <YAxis 
              reversed 
              domain={[1, 20]} 
              stroke="#ffffff20" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
              ticks={[1, 5, 10, 15, 20]}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {Array.from(driverRefs).slice(0, 10).map((code, idx) => (
              <Line
                key={code}
                type="monotone"
                dataKey={code}
                stroke={getDriverColor(code)}
                strokeWidth={code === "VER" || code === "HAM" ? 3 : 1}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                opacity={0.6}
                className="hover:opacity-100 transition-opacity cursor-pointer"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function getPositionFromLap(telemetry: Telemetry[], lap: number, driverId: number) {
  // This is a simplification; in a real app, position would be in telemetry
  // Here we'll simulate it based on lap times or just use a mock for demo
  return Math.floor(Math.random() * 20) + 1; // Mocked for now to show the trace
}

function getDriverColor(code: string) {
  const colors: any = {
    VER: "#3671C6",
    HAM: "#6CD3BF",
    LEC: "#F91536",
    NOR: "#FF8000",
    ALO: "#229971",
    SAI: "#F91536",
    PIA: "#FF8000",
    RUS: "#6CD3BF",
    PER: "#3671C6",
    HUL: "#B6BABD"
  };
  return colors[code] || "#ffffff40";
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 border border-white/20 p-4 rounded-xl backdrop-blur-2xl shadow-2xl">
        <div className="text-[10px] font-black text-f1-red uppercase tracking-widest mb-3 border-b border-white/10 pb-2">Lap {label} Intelligence</div>
        <div className="space-y-2">
          {payload.slice(0, 5).map((p: any) => (
            <div key={p.name} className="flex justify-between items-center gap-8">
              <span className="text-xs font-black text-white italic">{p.name}</span>
              <span className="text-xs font-mono font-bold" style={{ color: p.color }}>P{p.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

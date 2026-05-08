"use client";

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis } from "recharts";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface PsychometricRadarProps {
  d1Stats: any;
  d2Stats: any;
  d1Name: string;
  d2Name: string;
}

export function PsychometricRadar({ d1Stats, d2Stats, d1Name, d2Name }: PsychometricRadarProps) {
  const data = [
    { subject: 'Qualifying Speed', A: d1Stats.qualifying_speed, B: d2Stats.qualifying_speed, fullMark: 100 },
    { subject: 'Race Pace', A: d1Stats.race_pace, B: d2Stats.race_pace, fullMark: 100 },
    { subject: 'Consistency', A: d1Stats.consistency, B: d2Stats.consistency, fullMark: 100 },
    { subject: 'Pressure Stability', A: d1Stats.pressure_stability, B: d2Stats.pressure_stability, fullMark: 100 },
    { subject: 'Strategy Retention', A: d1Stats.strategy_retention, B: d2Stats.strategy_retention, fullMark: 100 },
  ];

  return (
    <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl relative h-[500px] flex flex-col">
      <div className="mb-6">
        <h3 className="text-xl font-black flex items-center gap-2 italic uppercase">
          <Zap className="text-f1-gold" />
          Psychometric Combat Profile
        </h3>
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mt-1">Behavioral Dominance Comparison</p>
      </div>

      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid stroke="#ffffff10" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#ffffff40', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }} 
            />
            <Radar
              name={d1Name}
              dataKey="A"
              stroke="#e10600"
              fill="#e10600"
              fillOpacity={0.3}
              animationDuration={2000}
            />
            <Radar
              name={d2Name}
              dataKey="B"
              stroke="#ffffff"
              fill="#ffffff"
              fillOpacity={0.1}
              animationDuration={2000}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-6 flex justify-center gap-8 border-t border-white/5 pt-6">
         <LegendItem color="bg-f1-red" label={d1Name} />
         <LegendItem color="bg-white/20" label={d2Name} />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{label}</span>
    </div>
  );
}

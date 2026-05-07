"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { ConstructorHistoryEntry } from '@apex/types';

export default function HistoryChart({ data, color }: { data: ConstructorHistoryEntry[]; color: string }) {
  return (
    <div className="h-[400px] w-full mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" vertical={false} />
          <XAxis 
            dataKey="year" 
            stroke="#666" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#666', fontWeight: 'bold' }}
          />
          <YAxis 
            stroke="#666" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tick={{ fill: '#666', fontWeight: 'bold' }}
          />
          <Tooltip 
            cursor={{ stroke: color, strokeWidth: 2 }}
            contentStyle={{ 
              backgroundColor: '#1A1A2E', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '2px',
              fontSize: '12px',
              color: '#fff'
            }}
            itemStyle={{ color: color, fontWeight: 'black' }}
          />
          <Area 
            type="monotone" 
            dataKey="points" 
            stroke={color} 
            fillOpacity={1} 
            fill="url(#colorPoints)" 
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

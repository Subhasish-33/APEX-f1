"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface DataPoint {
  year: number;
  points: number;
}

export default function PointsChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="h-[300px] w-full mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
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
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            contentStyle={{ 
              backgroundColor: '#1A1A2E', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '2px',
              fontSize: '12px',
              color: '#fff'
            }}
            itemStyle={{ color: '#E10600', fontWeight: 'black' }}
          />
          <Bar dataKey="points" radius={[2, 2, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.points === Math.max(...data.map(d => d.points)) ? '#E10600' : '#444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

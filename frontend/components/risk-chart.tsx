'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const data = [
  { name: 'Week 1', High: 18, Medium: 31, Low: 51 },
  { name: 'Week 2', High: 22, Medium: 29, Low: 49 },
  { name: 'Week 3', High: 20, Medium: 34, Low: 46 },
  { name: 'Week 4', High: 16, Medium: 36, Low: 48 }
];

export function RiskChart() {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="highColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1f2937" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: 16, border: '1px solid #334155' }} itemStyle={{ color: '#fff' }} />
          <Area type="monotone" dataKey="High" stroke="#38bdf8" strokeWidth={3} fill="url(#highColor)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const stats = [
  { label: 'High risk', value: '18%' },
  { label: 'Medium risk', value: '36%' },
  { label: 'Low risk', value: '46%' }
];

export function DashboardStats() {
  return (
    <>
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-soft">
          <p className="text-sm uppercase tracking-[0.28em] text-slate-400">{stat.label}</p>
          <p className="mt-5 text-4xl font-semibold text-white">{stat.value}</p>
          <p className="mt-3 text-sm text-slate-500">Model confidence estimate</p>
        </div>
      ))}
    </>
  );
}

import { Activity, Users, TrendingUp, Shield } from 'lucide-react';

const panels = [
  { icon: Activity, title: 'Real-time alerts', value: '214', detail: 'Students flagged this week' },
  { icon: Users, title: 'Active users', value: '3.8k', detail: 'Logged in last 24h' },
  { icon: TrendingUp, title: 'Prediction accuracy', value: '91%', detail: 'AI model confidence' },
  { icon: Shield, title: 'Secure access', value: '100%', detail: 'Protected by cookie auth' }
];

export function DashboardPanel() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {panels.map((panel) => (
        <div key={panel.title} className="rounded-3xl border border-slate-800/80 bg-slate-950/80 p-6 shadow-soft">
          <div className="flex items-center gap-4 text-sky-300">
            <panel.icon className="h-6 w-6" />
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-400">{panel.title}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{panel.value}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">{panel.detail}</p>
        </div>
      ))}
    </div>
  );
}

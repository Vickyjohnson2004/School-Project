'use client';

import { motion } from 'framer-motion';

interface PreviewProps {
  selected: number;
  role: string;
  headline: string;
  summary: string;
  stats: { label: string; value: string }[];
}

export function DashboardPreview({ selected, role, headline, summary, stats }: PreviewProps) {
  return (
    <motion.div
      key={role}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800/90 dark:bg-slate-950/80 dark:shadow-glow"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.32em] text-sky-600 dark:text-sky-300">{role} dashboard</p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{headline}</h3>
        </div>
        <div className="rounded-3xl bg-slate-100 px-4 py-2 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-200">Live preview</div>
      </div>
      <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-400">{summary}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800/80 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

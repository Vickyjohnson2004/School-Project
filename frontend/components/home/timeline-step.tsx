'use client';

import { motion } from 'framer-motion';

interface TimelineStepProps {
  step: number;
  label: string;
  delay?: number;
}

export function TimelineStep({ step, label, delay = 0 }: TimelineStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay }}
      className="flex items-start gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800/90 dark:bg-slate-950/80"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-sky-600 text-lg font-semibold dark:bg-slate-900 dark:text-sky-300">
        {step}
      </div>
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Step {step}</p>
        <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">{label}</p>
      </div>
    </motion.div>
  );
}

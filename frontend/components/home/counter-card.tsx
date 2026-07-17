'use client';

import { motion } from 'framer-motion';

interface CounterCardProps {
  value: string;
  label: string;
  delay?: number;
}

export function CounterCard({ value, label, delay = 0 }: CounterCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay }}
      className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-soft backdrop-blur-xl"
    >
      <p className="text-4xl font-semibold text-white">{value}</p>
      <p className="mt-3 text-sm uppercase tracking-[0.28em] text-slate-400">{label}</p>
    </motion.div>
  );
}

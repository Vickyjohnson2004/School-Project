'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Check, ShieldCheck, Sparkles } from 'lucide-react';
import { CounterCard } from '../components/home/counter-card';
import { FeatureCard } from '../components/home/feature-card';
import { TimelineStep } from '../components/home/timeline-step';
import { DashboardPreview } from '../components/home/dashboard-preview';
import { FAQItem } from '../components/home/faq-item';
import { ThemeToggle } from '../components/theme-toggle';
import {
  navItems,
  heroHighlights,
  trustStats,
  featureCards,
  workflowSteps,
  mlHighlights,
  dashboardPreviews,
  whyCards,
  analyticsMetrics,
  explainabilityData,
  testimonials,
  faqItems,
  demoFeatures
} from '../lib/home-data';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="border-b border-slate-200 px-6 py-6 dark:border-white/5 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <Link href="/" className="inline-flex items-center gap-3 rounded-full bg-slate-900/90 px-4 py-3 text-sm font-semibold text-white shadow-soft">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
            UAEWSS
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-slate-600 dark:text-slate-300 lg:flex">
            {navItems.map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-slate-900 dark:hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-3 lg:flex">
            <ThemeToggle />
            <Link href="/login" className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 dark:border-slate-800/90 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-800">
              Sign in
            </Link>
            <Link href="/register" className="rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
              Request demo
            </Link>
          </div>
          <div className="ml-auto lg:hidden">
            <ThemeToggle />
          </div>
        </div>
      </section>

      <section id="home" className="relative overflow-hidden px-6 py-20 sm:px-10 lg:px-16">
        <div className="pointer-events-none absolute -left-20 top-0 h-60 w-60 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-slate-300/5 blur-3xl" />
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
              <p className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-sm font-medium text-sky-600 dark:text-sky-300">
                Enterprise AI for university retention
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.1 }}>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
                Early warning intelligence for at-risk students at UniPort.
              </h1>
            </motion.div>

            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.2 }} className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              UAEWSS combines predictive student risk scoring, explainable AI, and advisor workflows so your institution can identify students earlier, act faster, and improve academic success.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, delay: 0.3 }} className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-base font-semibold text-slate-950 shadow-soft transition hover:bg-sky-400">
                Request demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-slate-700">
                Explore platform
              </Link>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-3">
              {heroHighlights.map((item) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.65, delay: 0.35 }}
                  className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800/90 dark:bg-slate-950/80 dark:shadow-none"
                >
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-slate-500">{item.accent}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/80 dark:shadow-glow">
            <div className="space-y-6">
              <div className="rounded-[1.75rem] bg-slate-50 p-6 shadow-soft dark:bg-slate-950">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.28em] text-sky-600 dark:text-sky-300">Risk monitoring</p>
                    <h2 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">AI-enabled risk profiling</h2>
                  </div>
                  <div className="rounded-3xl bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-300">Live</div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {trustStats.slice(0, 4).map((item) => (
                    <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-4 dark:border-slate-800/90 dark:bg-slate-950/90">
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                      <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {trustStats.slice(4).map((item) => (
                  <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-950/80">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="features" className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">Capabilities</p>
            <h2 className="mt-4 text-4xl font-semibold text-slate-900 dark:text-white">Complete student risk and success orchestration.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-400">
              Designed for campuses that need proactive student support, transparent AI, and measurable academic impact.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featureCards.map((feature, index) => (
              <FeatureCard key={feature.title} title={feature.title} description={feature.description} icon={feature.icon} delay={index * 0.08} />
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-slate-50 px-6 py-20 dark:bg-slate-900/80 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">How it works</p>
              <h2 className="text-4xl font-semibold text-slate-900 dark:text-white">From data collection to academic intervention.</h2>
              <p className="max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                UAEWSS turns attendance, grades, behavior and engagement data into early warning signals and action plans for advisors, lecturers, and university leaders.
              </p>
              <div className="grid gap-4">
                {workflowSteps.map((step, index) => (
                  <TimelineStep key={step} step={index + 1} label={step} delay={index * 0.06} />
                ))}
              </div>
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800/90 dark:bg-slate-950/80 dark:shadow-glow">
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800/90 dark:bg-slate-900">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">Model highlight</p>
                      <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Explainable predictions with strong performance</h3>
                    </div>
                    <div className="rounded-3xl bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-300">AI inside</div>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {mlHighlights.map((item) => (
                    <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800/90 dark:bg-slate-950/90">
                      <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
                      <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="analytics" className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">Analytics</p>
            <h2 className="mt-4 text-4xl font-semibold text-slate-900 dark:text-white">University insights that drive faster decisions.</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-400">
              Cross-campus analytics and student-level explainability help you spot trends, allocate resources, and support students when it matters most.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="grid gap-6 sm:grid-cols-2">
              {analyticsMetrics.map((metric) => (
                <div key={metric.label} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft dark:border-slate-800/90 dark:bg-slate-950/80">
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">{metric.label}</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-900 dark:text-white">{metric.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800/90 dark:bg-slate-950/80">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Explainability</p>
                  <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">Feature importance for risk predictions</h3>
                </div>
                <div className="rounded-3xl bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-600 dark:text-sky-300">SHAP-ready</div>
              </div>
              <div className="mt-8 space-y-4">
                {explainabilityData.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-sky-500" style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-6 py-20 dark:bg-slate-900/80 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">Platform preview</p>
              <h2 className="text-4xl font-semibold text-slate-900 dark:text-white">Role-based console previews for every academic user.</h2>
              <p className="max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                Students, lecturers, advisors, and administrators each get dashboards tailored to their priorities and workflows.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {whyCards.map((card) => (
                  <div key={card.title} className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800/90 dark:bg-slate-950/90">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-500/10 text-sky-600 dark:text-sky-300">
                      <card.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-slate-900 dark:text-white">{card.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{card.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6">
              {dashboardPreviews.map((preview, index) => (
                <DashboardPreview key={preview.role} selected={index} role={preview.role} headline={preview.headline} summary={preview.summary} stats={preview.stats} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft dark:border-slate-800/90 dark:bg-slate-950/80">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">Student success score</p>
                <h2 className="text-4xl font-semibold text-slate-900 dark:text-white">See every student’s progress in a single view.</h2>
                <p className="text-lg leading-8 text-slate-600 dark:text-slate-400">
                  UAEWSS gives advisors a unified scorecard for risk, attendance, grades, and course engagement so support can be precise and timely.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {demoFeatures.map((feature) => (
                  <div key={feature.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800/90 dark:bg-slate-900">
                    <p className="text-sm text-slate-500 dark:text-slate-400">{feature.label}</p>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div className="h-full rounded-full bg-sky-500" style={{ width: `${(feature.max / 100) * 100}%` }} />
                    </div>
                    <p className="mt-3 text-sm text-slate-500">Metrics, alerts and GPA status in one place.</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="bg-slate-50 px-6 py-20 dark:bg-slate-900/80 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">FAQ</p>
            <h2 className="mt-4 text-4xl font-semibold text-slate-900 dark:text-white">Questions from university decision makers.</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {faqItems.map((item) => (
              <FAQItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-soft dark:border-slate-800/90 dark:bg-slate-950/80 dark:shadow-glow">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">Ready to transform student outcomes?</p>
            <h2 className="mt-4 text-4xl font-semibold text-slate-900 dark:text-white">Bring predictive student support to UniPort today.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              Book a demo, integrate your data, and start delivering earlier, evidence-based interventions for every learner.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-sky-500 px-7 py-4 text-base font-semibold text-slate-950 transition hover:bg-sky-400">
                Schedule a demo
              </Link>
              <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-7 py-4 text-base font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-100 dark:hover:border-slate-700">
                Contact sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 px-6 py-10 dark:border-slate-800/80 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">UAEWSS</p>
            <p className="mt-2 max-w-md text-sm text-slate-500">Enterprise AI for student retention, academic support, and advisor workflows.</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
            <Link href="#about" className="transition hover:text-slate-900 dark:hover:text-white">About</Link>
            <Link href="#faq" className="transition hover:text-slate-900 dark:hover:text-white">FAQ</Link>
            <Link href="#contact" className="transition hover:text-slate-900 dark:hover:text-white">Contact</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

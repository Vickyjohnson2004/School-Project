import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
      <div className="rounded-[2rem] border border-slate-800/80 bg-slate-900/80 p-10 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Page not found</p>
        <h1 className="mt-4 text-6xl font-semibold">404</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-400">The page you are looking for does not exist. Return to the dashboard or explore the landing page.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/" className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-sky-400">Home</Link>
          <Link href="/login" className="rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500">Login</Link>
        </div>
      </div>
    </main>
  );
}

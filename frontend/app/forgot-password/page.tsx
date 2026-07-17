import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Button } from '../../components/button';

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-slate-100 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 rounded-[2rem] border border-slate-800/80 bg-slate-900/80 p-10 shadow-soft backdrop-blur-xl">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Reset your password</p>
          <h1 className="text-3xl font-semibold text-white">Forgot password? We’ll help you recover access.</h1>
          <p className="max-w-xl text-sm leading-7 text-slate-400">Enter your university email and a secure reset link will be sent to your inbox.</p>
        </div>
        <form className="space-y-6">
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5">
            <label className="block text-sm font-medium text-slate-300">Email</label>
            <div className="mt-3 flex items-center gap-3 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3">
              <Mail className="h-5 w-5 text-sky-300" />
              <input type="email" placeholder="you@uniport.edu" className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500" />
            </div>
          </div>
          <Button type="submit">Send recovery link</Button>
          <p className="text-center text-sm text-slate-500">Already remembered? <Link href="/login" className="text-sky-300 hover:text-sky-200">Sign in instead</Link></p>
        </form>
      </div>
    </main>
  );
}

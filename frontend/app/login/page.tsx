'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { loginSchema } from '../../lib/validation';
import { loginUser } from '../../lib/api';
import { Button } from '../../components/button';
import { Input } from '../../components/form-input';

type LoginForm = {
  email: string;
  password: string;
  remember: boolean;
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false }
  });

  const router = useRouter();

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (result) => {
      if (result.data?.token) {
        localStorage.setItem('token', result.data.token);
      }
      if (result.data?.user) {
        localStorage.setItem('user', JSON.stringify(result.data.user));
      }
      toast.success('Logged in successfully');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Unable to login. Please check credentials.');
    }
  });

  const onSubmit = async (values: LoginForm) => {
    mutation.mutate(values);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 rounded-[2rem] border border-slate-800/80 bg-slate-900/80 p-10 shadow-soft backdrop-blur-xl">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Secure campus sign in</p>
            <h1 className="text-4xl font-semibold text-white">Glassmorphism login for UniPort users.</h1>
            <p className="max-w-xl text-sm leading-7 text-slate-400">Access academic analytics, predictive reports, and tailored recommendations with a modern secure login experience.</p>
          </div>
          <div className="rounded-[2rem] border border-slate-800/70 bg-slate-950/70 p-8 shadow-soft">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input label="Email" icon={Mail} error={errors.email?.message} {...register('email')} />
              <Input label="Password" icon={Lock} type={showPassword ? 'text' : 'password'} error={errors.password?.message} {...register('password')}>
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-100" onClick={() => setShowPassword((current) => !current)}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </Input>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-sky-500 focus:ring-sky-500" {...register('remember')} />
                  Remember me
                </label>
                <Link href="/forgot-password" className="font-medium text-sky-300 hover:text-sky-200">Forgot password?</Link>
              </div>
              <Button type="submit" loading={isSubmitting}>Sign in</Button>
              <p className="text-center text-sm text-slate-500">Don’t have an account? <Link href="/register" className="text-sky-300 hover:text-sky-200">Register now</Link></p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

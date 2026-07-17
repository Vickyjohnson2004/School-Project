'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, Lock, Mail, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../../components/button';
import { Input } from '../../components/form-input';
import { registerSchema } from '../../lib/validation';
import { registerUser } from '../../lib/api';

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  role: string;
  additionalData?: {
    studentId?: string;
    lecturerId?: string;
    department?: string;
    level?: string;
    specialization?: string;
  };
};

export default function RegisterPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', role: 'student' }
  });

  const router = useRouter();

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Account created successfully');
      router.push('/login');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Unable to create account. Please try again.');
    }
  });

  const onSubmit = async (values: RegisterForm) => {
    mutation.mutate(values);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100 sm:px-10 lg:px-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-8 rounded-[2rem] border border-slate-800/80 bg-slate-900/80 p-10 shadow-soft backdrop-blur-xl">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Create your account</p>
            <h1 className="text-4xl font-semibold text-white">Join UniPort and start monitoring student success.</h1>
            <p className="max-w-xl text-sm leading-7 text-slate-400">Register as an admin, lecturer, advisor, or student to access your personalized dashboard.</p>
          </div>
          <div className="rounded-[2rem] border border-slate-800/70 bg-slate-950/70 p-8 shadow-soft">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input label="Full Name" icon={User} error={errors.name?.message} {...register('name')} />
              <Input label="University Email" icon={Mail} error={errors.email?.message} {...register('email')} />
              <Input label="Password" icon={Lock} type="password" error={errors.password?.message} {...register('password')} />
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4">
                <label className="block text-sm font-medium text-slate-300">Role</label>
                <select {...register('role')} className="mt-3 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20">
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <Button type="submit" loading={isSubmitting}>Create account</Button>
              <p className="text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="text-sky-300 hover:text-sky-200">Sign in</Link></p>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

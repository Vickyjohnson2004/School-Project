'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const redirectByRole = (role: string) => {
      if (!isMounted) return;

      switch (role) {
        case 'student':
          router.replace('/dashboard/student');
          break;
        case 'lecturer':
          router.replace('/dashboard/lecturer');
          break;
        case 'admin':
          router.replace('/dashboard/admin');
          break;
        default:
          router.replace('/login');
      }
    };

    const redirect = async () => {
      try {
        const res = await getCurrentUser().catch(() => null);
        const user = res?.data?.user;

        if (!user) {
          localStorage.removeItem('user');
          redirectByRole('');
          return;
        }

        localStorage.setItem('user', JSON.stringify(user));
        redirectByRole(user.role);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    redirect();

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="font-medium text-gray-700">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return null;
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Brain,
  FileText,
  GraduationCap,
  UserCog,
  LogOut
} from 'lucide-react';
import { logoutUser } from '../lib/api';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  student: [
    { label: 'Overview', href: '/dashboard/student', icon: LayoutDashboard },
    { label: 'My Performance', href: '/dashboard/student#performance', icon: BarChart3 },
    { label: 'Recommendations', href: '/dashboard/student#recommendations', icon: FileText }
  ],
  lecturer: [
    { label: 'Overview', href: '/dashboard/lecturer', icon: LayoutDashboard },
    { label: 'My Students', href: '/dashboard/lecturer#students', icon: GraduationCap },
    { label: 'ML Predictions', href: '/dashboard/ml', icon: Brain }
  ],
  admin: [
    { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
    { label: 'User Management', href: '/dashboard/admin#users', icon: Users },
    { label: 'ML Predictions', href: '/dashboard/ml', icon: Brain },
    { label: 'Reports', href: '/dashboard/admin#reports', icon: FileText }
  ]
};

const ROLE_LABELS: Record<string, { label: string; color: string; icon: React.ComponentType<{ size?: number | string }> }> = {
  student: { label: 'Student', color: 'bg-blue-100 text-blue-800', icon: GraduationCap },
  lecturer: { label: 'Lecturer', color: 'bg-purple-100 text-purple-800', icon: Users },
  admin: { label: 'Administrator', color: 'bg-red-100 text-red-800', icon: UserCog }
};

export function DashboardNav() {
  const [user, setUser] = useState<{ name?: string; role?: string } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) setUser(JSON.parse(userStr));
    } catch {
      // ignore malformed localStorage entry
    }
  }, []);

  if (!user?.role) return null;

  const items = NAV_ITEMS[user.role] ?? [];
  const roleInfo = ROLE_LABELS[user.role];

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      router.push('/login');
    }
  };

  const isActive = (href: string) => {
    const base = href.split('#')[0];
    return pathname === base && !href.includes('#');
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-1 overflow-x-auto">
            {items.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                  isActive(href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 pl-4">
            {roleInfo && (
              <span className={`hidden sm:inline-block px-3 py-1 rounded-full text-xs font-semibold ${roleInfo.color}`}>
                {roleInfo.label}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

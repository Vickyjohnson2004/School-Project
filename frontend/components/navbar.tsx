'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X, LogOut, Home, LogIn, UserPlus } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';

export function MainNav() {
  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('user');
      setUser(null);
      setMobileMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => pathname === path;
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'lecturer': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 dark:bg-slate-950 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 dark:text-sky-400 dark:hover:text-sky-300">
            UniPort
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                isActive('/') ? 'bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-sky-400' : 'text-gray-600 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Home size={18} />
              Home
            </Link>

            <ThemeToggle />

            {user ? (
              <>
                {user.role === 'student' && (
                  <Link
                    href="/dashboard/student"
                    className={`px-4 py-2 rounded-lg transition ${
                      isActive('/dashboard/student') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Student Dashboard
                  </Link>
                )}
                {user.role === 'lecturer' && (
                  <>
                    <Link
                      href="/dashboard/lecturer"
                      className={`px-4 py-2 rounded-lg transition ${
                        isActive('/dashboard/lecturer') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Lecturer Dashboard
                    </Link>
                    <Link
                      href="/dashboard/ml"
                      className={`px-4 py-2 rounded-lg transition ${
                        isActive('/dashboard/ml') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      ML Dataset
                    </Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link
                      href="/dashboard/admin"
                      className={`px-4 py-2 rounded-lg transition ${
                        isActive('/dashboard/admin') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      href="/dashboard/ml"
                      className={`px-4 py-2 rounded-lg transition ${
                        isActive('/dashboard/ml') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      ML Dataset
                    </Link>
                  </>
                )}

                <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getRoleBadgeColor(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    isActive('/login') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <LogIn size={18} />
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    isActive('/register') ? 'bg-blue-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  <UserPlus size={18} />
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-slate-800 dark:text-slate-200"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200 space-y-3 dark:border-slate-800">
            <div className="px-4">
              <ThemeToggle />
            </div>
            <Link
              href="/"
              className={`block px-4 py-2 rounded-lg transition ${
                isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            {user ? (
              <>
                {user.role === 'student' && (
                  <Link
                    href="/dashboard/student"
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Student Dashboard
                  </Link>
                )}
                {user.role === 'lecturer' && (
                  <>
                    <Link
                      href="/dashboard/lecturer"
                      className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Lecturer Dashboard
                    </Link>
                    <Link
                      href="/dashboard/ml"
                      className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      ML Dataset
                    </Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <>
                    <Link
                      href="/dashboard/admin"
                      className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      href="/dashboard/ml"
                      className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      ML Dataset
                    </Link>
                  </>
                )}

                <div className="pt-3 border-t border-gray-200">
                  <p className="px-4 py-2 font-semibold text-gray-900">{user.name}</p>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

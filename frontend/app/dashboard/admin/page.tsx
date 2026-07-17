'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueries } from '@tanstack/react-query';
import { fetchAdminDashboard, fetchAdminUsers, fetchMlDatasetPredictions, markStudentOutreach, updateStudentLevel, api } from '../../../lib/api';

interface AdminData {
  adminId: string;
  name: string;
  email: string;
  department: string;
  permissions: {
    canCreateUsers: boolean;
    canDeleteUsers: boolean;
    canEditSystem: boolean;
    canViewReports: boolean;
    canManageLecturers: boolean;
    canManageStudents: boolean;
  };
  statistics: {
    totalUsers: number;
    totalStudents: number;
    totalLecturers: number;
    totalAdmins: number;
    atRiskStudents: number;
    activeUsers: number;
  };
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  reachedOut?: boolean;
  level?: string | null;
}

interface DatasetPredictionSummary {
  total: number;
  Low: number;
  Medium: number;
  High: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [userFilter, setUserFilter] = useState('all');
  const [dashboardQuery, usersQuery, datasetQuery] = useQueries({
    queries: [
      { queryKey: ['adminDashboard'], queryFn: fetchAdminDashboard, retry: false },
      { queryKey: ['adminUsers'], queryFn: fetchAdminUsers, retry: false },
      { queryKey: ['mlDatasetPredictions'], queryFn: fetchMlDatasetPredictions, retry: false }
    ]
  });

  // Only redirect to login when the session is actually invalid (401/403).
  const authError = [dashboardQuery.error, usersQuery.error, datasetQuery.error].some(
    (err: any) => err?.response?.status === 401 || err?.response?.status === 403
  );

  useEffect(() => {
    if (authError) {
      router.push('/login');
    }
  }, [authError, router]);

  const admin = dashboardQuery.data?.data as AdminData | undefined;
  const users = usersQuery.data?.data?.users as User[] | undefined;
  const datasetSummary = datasetQuery.data?.data?.summary as DatasetPredictionSummary | undefined;
  const isLoading = dashboardQuery.isLoading || usersQuery.isLoading || datasetQuery.isLoading;

  const [usersList, setUsers] = useState<User[]>([]);
  // Which student row currently has its outreach note editor open.
  const [outreachEditor, setOutreachEditor] = useState<string | null>(null);
  const [outreachNote, setOutreachNote] = useState('');

  // keep local usersList in sync with query result
  useEffect(() => {
    if (users) setUsers(users);
  }, [users]);

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Are you sure you want to delete this ${user.role} account (${user.name})?`)) return;

    try {
      await api.delete(`/admin/users/${user._id}`);
      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      alert(`${user.role.charAt(0).toUpperCase() + user.role.slice(1)} deleted successfully`);
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, isActive: !u.isActive } : u)));
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const openOutreach = (user: User) => {
    setOutreachEditor(user._id);
    setOutreachNote('');
  };

  const submitOutreach = async (user: User) => {
    try {
      await markStudentOutreach(user._id, { reachedOut: true, reachedOutNote: outreachNote });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, reachedOut: true } : u)));
      setOutreachEditor(null);
      setOutreachNote('');
      alert('Student marked as reached out');
    } catch (err) {
      alert('Failed to update outreach status');
    }
  };

  const clearOutreach = async (user: User) => {
    try {
      await markStudentOutreach(user._id, { reachedOut: false });
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, reachedOut: false } : u)));
    } catch (err) {
      alert('Failed to update outreach status');
    }
  };

  const handleLevelChange = async (user: User, level: string) => {
    const previous = user.level;
    // optimistic update
    setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, level } : u)));
    try {
      await updateStudentLevel(user._id, level as '100' | '200' | '300' | '400');
    } catch (err) {
      // revert on failure
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, level: previous } : u)));
      alert('Failed to update student level');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-700 mb-4 dark:text-slate-300">
            {dashboardQuery.error
              ? 'Failed to load admin dashboard. Please try again.'
              : 'No dashboard data available'}
          </p>
          {dashboardQuery.error && (
            <button
              onClick={() => dashboardQuery.refetch()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1> victor johnson </h1>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2 dark:text-slate-400">
            Admin ID: {admin.adminId} • {admin.department}
          </p>
        </div>

      
        {/* Quick Statistics */}
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500 dark:bg-slate-900">
            <p className="text-gray-600 text-xs mb-1 dark:text-slate-400">Total Users</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{admin.statistics.totalUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500 dark:bg-slate-900">
            <p className="text-gray-600 text-xs mb-1 dark:text-slate-400">Active Users</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{admin.statistics.activeUsers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500 dark:bg-slate-900">
            <p className="text-gray-600 text-xs mb-1 dark:text-slate-400">Students</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{admin.statistics.totalStudents}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500 dark:bg-slate-900">
            <p className="text-gray-600 text-xs mb-1 dark:text-slate-400">Lecturers</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{admin.statistics.totalLecturers}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500 dark:bg-slate-900">
            <p className="text-gray-600 text-xs mb-1 dark:text-slate-400">At-Risk Students</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{admin.statistics.atRiskStudents}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-indigo-500 dark:bg-slate-900">
            <p className="text-gray-600 text-xs mb-1 dark:text-slate-400">Admins</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{admin.statistics.totalAdmins}</p>
          </div>
        </div>

        {datasetSummary && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500 dark:bg-slate-900">
              <p className="text-gray-600 text-sm mb-2 dark:text-slate-400">Dataset Total Rows</p>
              <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{datasetSummary.total}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500 dark:bg-slate-900">
              <p className="text-gray-600 text-sm mb-2 dark:text-slate-400">Predicted Medium Risk</p>
              <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">{datasetSummary.Medium}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 dark:bg-slate-900">
              <p className="text-gray-600 text-sm mb-2 dark:text-slate-400">Predicted High Risk</p>
              <p className="text-4xl font-bold text-red-600 dark:text-red-400">{datasetSummary.High}</p>
            </div>
          </div>
        )}

        {/* Permissions */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 dark:bg-slate-900">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Your Permissions</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(admin.permissions).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded dark:bg-slate-800">
                <span className="text-gray-700 font-medium dark:text-slate-300">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${value ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'}`}>
                  {value ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Users Management */}
        <div id="users" className="bg-white p-6 rounded-lg shadow-md scroll-mt-32 dark:bg-slate-900">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h3>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            >
              <option value="all">All Users</option>
              <option value="student">Students</option>
              <option value="lecturer">Lecturers</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Name</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Email</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Role</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Level</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Joined</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filteredUsers = userFilter === 'all'
                    ? usersList
                    : usersList.filter((u) => u.role === userFilter);
                  return filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800">
                      <td className="py-3 font-medium text-gray-900 dark:text-white">
                        {user.name}
                        {user.role === 'student' && user.reachedOut && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                            Reached out
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-slate-400">{user.email}</td>
                      <td className="py-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 capitalize dark:bg-blue-500/20 dark:text-blue-300">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3">
                        {user.role === 'student' ? (
                          admin.permissions.canManageStudents || admin.permissions.canEditSystem ? (
                            <select
                              value={user.level || '100'}
                              onChange={(e) => handleLevelChange(user, e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                            >
                              <option value="100">100L</option>
                              <option value="200">200L</option>
                              <option value="300">300L</option>
                              <option value="400">400L</option>
                            </select>
                          ) : (
                            <span className="text-gray-700 dark:text-slate-300">{(user.level || '100')}L</span>
                          )
                        ) : (
                          <span className="text-gray-400 dark:text-slate-600">—</span>
                        )}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3 text-gray-600 dark:text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            {admin.permissions.canDeleteUsers && (user.role === 'student' || user.role === 'lecturer') && (
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600 hover:text-red-800 font-semibold text-sm dark:text-red-400 dark:hover:text-red-300"
                              >
                                Delete {user.role}
                              </button>
                            )}
                            {admin.permissions.canDeleteUsers && user.role === 'admin' && (
                              <button
                                onClick={() => handleDeleteUser(user)}
                                className="text-red-600 hover:text-red-800 font-semibold text-sm dark:text-red-400 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            )}
                            {user.role === 'student' && (
                              user.reachedOut ? (
                                <button
                                  onClick={() => clearOutreach(user)}
                                  className="text-amber-600 hover:text-amber-800 font-semibold text-sm dark:text-amber-400 dark:hover:text-amber-300"
                                >
                                  Clear outreach
                                </button>
                              ) : (
                                <button
                                  onClick={() => openOutreach(user)}
                                  className="text-emerald-600 hover:text-emerald-800 font-semibold text-sm dark:text-emerald-400 dark:hover:text-emerald-300"
                                >
                                  Mark reached out
                                </button>
                              )
                            )}
                          </div>
                          {outreachEditor === user._id && (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <input
                                type="text"
                                value={outreachNote}
                                onChange={(e) => setOutreachNote(e.target.value)}
                                placeholder="Outreach note (optional)"
                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                              />
                              <button
                                onClick={() => submitOutreach(user)}
                                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setOutreachEditor(null)}
                                className="px-3 py-1.5 text-gray-600 text-sm dark:text-slate-400"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-600 dark:text-slate-400">
                      No users found
                    </td>
                  </tr>
                );
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

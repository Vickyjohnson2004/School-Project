'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  toggleAdminUserStatus
} from '../../../../lib/api';

interface Lecturer {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lecturerId?: string | null;
  department?: string | null;
  specialization?: string | null;
  officeLocation?: string | null;
  officeHours?: string | null;
}

interface LecturerForm {
  name: string;
  email: string;
  password: string;
  department: string;
  specialization: string;
  officeLocation: string;
  officeHours: string;
}

const EMPTY_FORM: LecturerForm = {
  name: '',
  email: '',
  password: '',
  department: '',
  specialization: '',
  officeLocation: '',
  officeHours: ''
};

export default function AdminLecturersPage() {
  const router = useRouter();
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LecturerForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const usersQuery = useQuery({ queryKey: ['adminUsers'], queryFn: fetchAdminUsers, retry: false });

  useEffect(() => {
    const err: any = usersQuery.error;
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      router.push('/login');
    }
  }, [usersQuery.error, router]);

  useEffect(() => {
    const all = usersQuery.data?.data?.users as Lecturer[] | undefined;
    if (all) setLecturers(all.filter((u) => u.role === 'lecturer'));
  }, [usersQuery.data]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (lecturer: Lecturer) => {
    setEditingId(lecturer._id);
    setForm({
      name: lecturer.name,
      email: lecturer.email,
      password: '',
      department: lecturer.department || '',
      specialization: lecturer.specialization || '',
      officeLocation: lecturer.officeLocation || '',
      officeHours: lecturer.officeHours || ''
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateAdminUser(editingId, {
          name: form.name,
          email: form.email,
          department: form.department,
          specialization: form.specialization,
          officeLocation: form.officeLocation,
          officeHours: form.officeHours
        });
      } else {
        await createAdminUser({
          name: form.name,
          email: form.email,
          password: form.password,
          role: 'lecturer',
          additionalData: {
            department: form.department,
            specialization: form.specialization
          }
        });
      }
      await usersQuery.refetch();
      closeForm();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save lecturer');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lecturer: Lecturer) => {
    if (!confirm(`Delete lecturer ${lecturer.name}?`)) return;
    try {
      await deleteAdminUser(lecturer._id);
      setLecturers((prev) => prev.filter((l) => l._id !== lecturer._id));
    } catch {
      alert('Failed to delete lecturer');
    }
  };

  const handleToggleStatus = async (lecturer: Lecturer) => {
    try {
      await toggleAdminUserStatus(lecturer._id, !lecturer.isActive);
      setLecturers((prev) => prev.map((l) => (l._id === lecturer._id ? { ...l, isActive: !l.isActive } : l)));
    } catch {
      alert('Failed to update status');
    }
  };

  const filtered = lecturers.filter((l) => {
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      l.email.toLowerCase().includes(q) ||
      (l.department || '').toLowerCase().includes(q) ||
      (l.specialization || '').toLowerCase().includes(q)
    );
  });

  if (usersQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading lecturers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Lecturers</h1>
            <p className="text-gray-600 mt-2 dark:text-slate-400">{lecturers.length} lecturer(s)</p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Add Lecturer
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, department, specialization"
            className="w-full sm:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Name</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Email</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Lecturer ID</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Department</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Specialization</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((lecturer) => (
                    <tr key={lecturer._id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800">
                      <td className="py-3 font-medium text-gray-900 dark:text-white">{lecturer.name}</td>
                      <td className="py-3 text-gray-600 dark:text-slate-400">{lecturer.email}</td>
                      <td className="py-3 text-gray-600 dark:text-slate-400">{lecturer.lecturerId || '—'}</td>
                      <td className="py-3 text-gray-600 dark:text-slate-400">{lecturer.department || '—'}</td>
                      <td className="py-3 text-gray-600 dark:text-slate-400">{lecturer.specialization || '—'}</td>
                      <td className="py-3">
                        <button
                          onClick={() => handleToggleStatus(lecturer)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            lecturer.isActive ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'
                          }`}
                        >
                          {lecturer.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEdit(lecturer)}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm dark:text-blue-400"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(lecturer)}
                            className="text-red-600 hover:text-red-800 font-semibold text-sm dark:text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-600 dark:text-slate-400">
                      No lecturers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingId ? 'Edit Lecturer' : 'Add Lecturer'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
              {!editingId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Password</label>
                  <input
                    required
                    type="password"
                    minLength={8}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Department</label>
                <input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Specialization</label>
                <input
                  value={form.specialization}
                  onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
              {editingId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Office Location</label>
                    <input
                      value={form.officeLocation}
                      onChange={(e) => setForm({ ...form, officeLocation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Office Hours</label>
                    <input
                      value={form.officeHours}
                      onChange={(e) => setForm({ ...form, officeHours: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                </>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-gray-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Lecturer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

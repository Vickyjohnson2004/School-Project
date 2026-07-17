'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  toggleAdminUserStatus,
  updateStudentLevel,
  markStudentOutreach
} from '../../../../lib/api';

interface Student {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  studentId?: string | null;
  department?: string | null;
  level?: string | null;
  reachedOut?: boolean;
}

interface StudentForm {
  name: string;
  email: string;
  password: string;
  department: string;
  level: string;
  studentId: string;
}

const EMPTY_FORM: StudentForm = {
  name: '',
  email: '',
  password: '',
  department: '',
  level: '100',
  studentId: ''
};

export default function AdminStudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<StudentForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const usersQuery = useQuery({ queryKey: ['adminUsers'], queryFn: fetchAdminUsers, retry: false });

  useEffect(() => {
    const err: any = usersQuery.error;
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      router.push('/login');
    }
  }, [usersQuery.error, router]);

  useEffect(() => {
    const all = usersQuery.data?.data?.users as Student[] | undefined;
    if (all) setStudents(all.filter((u) => u.role === 'student'));
  }, [usersQuery.data]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (student: Student) => {
    setEditingId(student._id);
    setForm({
      name: student.name,
      email: student.email,
      password: '',
      department: student.department || '',
      level: student.level || '100',
      studentId: student.studentId || ''
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
          level: form.level,
          studentId: form.studentId
        });
      } else {
        await createAdminUser({
          name: form.name,
          email: form.email,
          password: form.password,
          role: 'student',
          additionalData: {
            department: form.department,
            level: form.level,
            studentId: form.studentId || undefined
          }
        });
      }
      await usersQuery.refetch();
      closeForm();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to save student');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (student: Student) => {
    if (!confirm(`Delete student ${student.name}?`)) return;
    try {
      await deleteAdminUser(student._id);
      setStudents((prev) => prev.filter((s) => s._id !== student._id));
    } catch {
      alert('Failed to delete student');
    }
  };

  const handleToggleStatus = async (student: Student) => {
    try {
      await toggleAdminUserStatus(student._id, !student.isActive);
      setStudents((prev) => prev.map((s) => (s._id === student._id ? { ...s, isActive: !s.isActive } : s)));
    } catch {
      alert('Failed to update status');
    }
  };

  const handleLevelChange = async (student: Student, level: string) => {
    const previous = student.level;
    setStudents((prev) => prev.map((s) => (s._id === student._id ? { ...s, level } : s)));
    try {
      await updateStudentLevel(student._id, level as '100' | '200' | '300' | '400');
    } catch {
      setStudents((prev) => prev.map((s) => (s._id === student._id ? { ...s, level: previous } : s)));
      alert('Failed to update level');
    }
  };

  const handleToggleOutreach = async (student: Student) => {
    try {
      await markStudentOutreach(student._id, { reachedOut: !student.reachedOut });
      setStudents((prev) => prev.map((s) => (s._id === student._id ? { ...s, reachedOut: !s.reachedOut } : s)));
    } catch {
      alert('Failed to update outreach');
    }
  };

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.department || '').toLowerCase().includes(q) ||
      (s.studentId || '').toLowerCase().includes(q)
    );
  });

  if (usersQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Students</h1>
            <p className="text-gray-600 mt-2 dark:text-slate-400">{students.length} student(s)</p>
          </div>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Add Student
          </button>
        </div>

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, department, student ID"
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
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Student ID</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Department</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Level</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((student) => (
                    <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800">
                      <td className="py-3 font-medium text-gray-900 dark:text-white">
                        {student.name}
                        {student.reachedOut && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                            Reached out
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-gray-600 dark:text-slate-400">{student.email}</td>
                      <td className="py-3 text-gray-600 dark:text-slate-400">{student.studentId || '—'}</td>
                      <td className="py-3 text-gray-600 dark:text-slate-400">{student.department || '—'}</td>
                      <td className="py-3">
                        <select
                          value={student.level || '100'}
                          onChange={(e) => handleLevelChange(student, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                        >
                          <option value="100">100L</option>
                          <option value="200">200L</option>
                          <option value="300">300L</option>
                          <option value="400">400L</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleToggleStatus(student)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            student.isActive ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300'
                          }`}
                        >
                          {student.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEdit(student)}
                            className="text-blue-600 hover:text-blue-800 font-semibold text-sm dark:text-blue-400"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleOutreach(student)}
                            className="text-emerald-600 hover:text-emerald-800 font-semibold text-sm dark:text-emerald-400"
                          >
                            {student.reachedOut ? 'Clear outreach' : 'Mark reached out'}
                          </button>
                          <button
                            onClick={() => handleDelete(student)}
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
                      No students found
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
              {editingId ? 'Edit Student' : 'Add Student'}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Student ID</label>
                <input
                  value={form.studentId}
                  onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  placeholder="Auto-generated if left blank"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Department</label>
                <input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Level</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                >
                  <option value="100">100L</option>
                  <option value="200">200L</option>
                  <option value="300">300L</option>
                  <option value="400">400L</option>
                </select>
              </div>
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
                  {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

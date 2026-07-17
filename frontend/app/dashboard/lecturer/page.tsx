'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueries } from '@tanstack/react-query';
import {
  fetchLecturerDashboard,
  fetchLecturerStudents,
  fetchMlDatasetPredictions,
  searchLecturerStudents,
  predictStudentRisk,
  RiskPredictionInput
} from '../../../lib/api';

interface LecturerData {
  lecturerId: string;
  name: string;
  email: string;
  department: string;
  specialization: string;
  officeLocation?: string;
  officeHours?: string;
  bio?: string;
  qualifications?: string[];
  statistics: {
    totalStudentsAdvised: number;
    atRiskCount: number;
    coursesTeaching: number;
  };
  advisedStudents: any[];
  taughtCourses: any[];
}

interface StudentItem {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  level: string;
  riskLevel: string;
  currentGPA: number;
  attendancePercentage: number;
}

interface DatasetPredictionSummary {
  total: number;
  Low: number;
  Medium: number;
  High: number;
}

interface SearchResultStudent extends RiskPredictionInput {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  department: string;
  level: string;
  riskLevel: string;
}

// The 15 features the ML model expects, with human labels.
const PREDICT_FIELDS: { key: keyof RiskPredictionInput; label: string }[] = [
  { key: 'assignmentAverage', label: 'Assignment average (%)' },
  { key: 'quizAverage', label: 'Test/Quiz average (%)' },
  { key: 'midSemesterScore', label: 'Exam / Mid-semester score (%)' },
  { key: 'attendancePercentage', label: 'Attendance (%)' },
  { key: 'previousGPA', label: 'Previous GPA' },
  { key: 'currentGPA', label: 'Current GPA' },
  { key: 'studyHours', label: 'Study hours/day' },
  { key: 'participation', label: 'Participation (0-10)' },
  { key: 'libraryVisits', label: 'Library visits' },
  { key: 'lateSubmissionCount', label: 'Late submissions' },
  { key: 'disciplinaryRecord', label: 'Disciplinary record' },
  { key: 'lmsActivity', label: 'LMS activity (0-10)' },
  { key: 'courseLoad', label: 'Course load' },
  { key: 'sleepHours', label: 'Sleep hours/day' },
  { key: 'stressLevel', label: 'Stress level (0-10)' }
];

const EMPTY_FORM: RiskPredictionInput = {
  attendancePercentage: 0,
  assignmentAverage: 0,
  quizAverage: 0,
  midSemesterScore: 0,
  previousGPA: 0,
  currentGPA: 0,
  studyHours: 0,
  participation: 0,
  libraryVisits: 0,
  lateSubmissionCount: 0,
  disciplinaryRecord: 0,
  lmsActivity: 0,
  courseLoad: 0,
  sleepHours: 0,
  stressLevel: 0
};

export default function LecturerDashboard() {
  const router = useRouter();
  const [dashboardQuery, studentsQuery, datasetQuery] = useQueries({
    queries: [
      { queryKey: ['lecturerDashboard'], queryFn: fetchLecturerDashboard, retry: false },
      { queryKey: ['lecturerStudents'], queryFn: fetchLecturerStudents, retry: false },
      { queryKey: ['datasetPredictions'], queryFn: fetchMlDatasetPredictions, retry: false }
    ]
  });

  // Student search + risk prediction state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultStudent[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<SearchResultStudent | null>(null);
  const [form, setForm] = useState<RiskPredictionInput>(EMPTY_FORM);
  const [predicting, setPredicting] = useState(false);
  const [prediction, setPrediction] = useState<{ riskLevel: string; riskProbability: number; confidence: number } | null>(null);
  const [predictError, setPredictError] = useState('');

  // Only redirect to login on real auth failures (401/403), not any error.
  const authError = [dashboardQuery.error, studentsQuery.error, datasetQuery.error].some(
    (err: any) => err?.response?.status === 401 || err?.response?.status === 403
  );

  useEffect(() => {
    if (authError) {
      router.push('/login');
    }
  }, [authError, router]);

  const lecturer = dashboardQuery.data?.data as LecturerData | undefined;
  const students = studentsQuery.data?.data?.students as StudentItem[] | undefined;
  const datasetSummary = datasetQuery.data?.data?.summary as DatasetPredictionSummary | undefined;
  const isLoading = dashboardQuery.isLoading || studentsQuery.isLoading || datasetQuery.isLoading;
  const studentsList = students ?? [];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);
    try {
      const res = await searchLecturerStudents(searchTerm);
      setSearchResults((res?.data?.students as SearchResultStudent[]) ?? []);
    } catch (err) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectStudent = (student: SearchResultStudent) => {
    setSelectedStudent(student);
    setPrediction(null);
    setPredictError('');
    // Pre-fill the form from the student's stored records.
    const next: RiskPredictionInput = { ...EMPTY_FORM };
    (Object.keys(next) as (keyof RiskPredictionInput)[]).forEach((key) => {
      const value = (student as any)[key];
      next[key] = typeof value === 'number' ? value : Number(value) || 0;
    });
    setForm(next);
  };

  const handleFormChange = (key: keyof RiskPredictionInput, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value === '' ? 0 : Number(value) }));
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setPredicting(true);
    setPredictError('');
    setPrediction(null);
    try {
      const res = await predictStudentRisk(form);
      const data = res?.data ?? res;
      setPrediction({
        riskLevel: data.riskLevel,
        riskProbability: data.riskProbability,
        confidence: data.confidence
      });
    } catch (err) {
      setPredictError('Prediction failed. Ensure the ML service is running and records are valid.');
    } finally {
      setPredicting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!lecturer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No dashboard data available</p>
      </div>
    );
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'High': return 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300';
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Welcome, {lecturer.name}!</h1>
          <p className="text-gray-600 mt-2 dark:text-slate-400">
            Lecturer ID: {lecturer.lecturerId} • {lecturer.department} • {lecturer.specialization}
          </p>
        </div>

        {/* Quick Statistics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 dark:bg-slate-900">
            <p className="text-gray-600 text-sm mb-2 dark:text-slate-400">Total Students Advised</p>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{lecturer.statistics.totalStudentsAdvised}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500 dark:bg-slate-900">
            <p className="text-gray-600 text-sm mb-2 dark:text-slate-400">Students at Risk</p>
            <p className="text-4xl font-bold text-red-600 dark:text-red-400">{lecturer.statistics.atRiskCount}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 dark:bg-slate-900">
            <p className="text-gray-600 text-sm mb-2 dark:text-slate-400">Courses Teaching</p>
            <p className="text-4xl font-bold text-green-600 dark:text-green-400">{lecturer.statistics.coursesTeaching}</p>
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

        {/* Student Risk Prediction Tool */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 dark:bg-slate-900">
          <h3 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">Student Risk Prediction</h3>
          <p className="text-gray-600 text-sm mb-4 dark:text-slate-400">
            Search for a student, enter their test, assignment and exam records, then run the model to predict risk level.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, student ID or email"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
            />
            <button
              type="submit"
              disabled={searching}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mb-6 border border-gray-200 rounded-lg divide-y divide-gray-100 dark:border-slate-700 dark:divide-slate-800">
              {searchResults.map((student) => (
                <button
                  key={student._id}
                  onClick={() => selectStudent(student)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-800 ${
                    selectedStudent?._id === student._id ? 'bg-blue-50 dark:bg-slate-800' : ''
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      {student.studentId} • Level {student.level} • {student.department}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskBadge(student.riskLevel)}`}>
                    {student.riskLevel}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Records form + prediction */}
          {selectedStudent && (
            <form onSubmit={handlePredict}>
              <div className="mb-4">
                <p className="font-semibold text-gray-900 dark:text-white">
                  Records for {selectedStudent.name} ({selectedStudent.studentId})
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PREDICT_FIELDS.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm text-gray-600 mb-1 dark:text-slate-400">{field.label}</label>
                    <input
                      type="number"
                      step="any"
                      value={form[field.key]}
                      onChange={(e) => handleFormChange(field.key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={predicting}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
                >
                  {predicting ? 'Predicting...' : 'Predict risk'}
                </button>
                {predictError && <p className="text-sm text-red-600 dark:text-red-400">{predictError}</p>}
              </div>

              {prediction && (
                <div className="mt-6 p-5 rounded-lg border border-gray-200 dark:border-slate-700">
                  <p className="text-sm text-gray-600 mb-2 dark:text-slate-400">Predicted risk level</p>
                  <div className="flex flex-wrap items-center gap-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getRiskBadge(prediction.riskLevel)}`}>
                      {prediction.riskLevel}
                    </span>
                    <span className="text-gray-700 dark:text-slate-300">
                      Probability: <span className="font-semibold">{prediction.riskProbability.toFixed(1)}%</span>
                    </span>
                    <span className="text-gray-700 dark:text-slate-300">
                      Confidence: <span className="font-semibold">{prediction.confidence.toFixed(1)}%</span>
                    </span>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Profile Information */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8 dark:bg-slate-900">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Profile Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600 text-sm dark:text-slate-400">Email</p>
              <p className="font-semibold text-gray-900 dark:text-white">{lecturer.email}</p>
            </div>
            {lecturer.officeLocation && (
              <div>
                <p className="text-gray-600 text-sm dark:text-slate-400">Office Location</p>
                <p className="font-semibold text-gray-900 dark:text-white">{lecturer.officeLocation}</p>
              </div>
            )}
            {lecturer.officeHours && (
              <div>
                <p className="text-gray-600 text-sm dark:text-slate-400">Office Hours</p>
                <p className="font-semibold text-gray-900 dark:text-white">{lecturer.officeHours}</p>
              </div>
            )}
            {lecturer.bio && (
              <div className="md:col-span-2">
                <p className="text-gray-600 text-sm dark:text-slate-400">Bio</p>
                <p className="font-semibold text-gray-900 dark:text-white">{lecturer.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Advised Students */}
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-slate-900">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Your Advised Students</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Student ID</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Name</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Level</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Current GPA</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Attendance</th>
                  <th className="pb-3 font-semibold text-gray-900 dark:text-white">Risk Status</th>
                </tr>
              </thead>
              <tbody>
                {studentsList.length > 0 ? (
                  studentsList.map((student) => (
                    <tr key={student._id} className="border-b border-gray-100 hover:bg-gray-50 dark:border-slate-800 dark:hover:bg-slate-800">
                      <td className="py-3 text-gray-600 dark:text-slate-400">{student.studentId}</td>
                      <td className="py-3 font-medium text-gray-900 dark:text-white">{student.name}</td>
                      <td className="py-3 text-gray-600 dark:text-slate-400">Level {student.level}</td>
                      <td className="py-3 font-medium text-gray-900 dark:text-white">{student.currentGPA.toFixed(2)}</td>
                      <td className="py-3 text-gray-600 dark:text-slate-400">{student.attendancePercentage.toFixed(1)}%</td>
                      <td className="py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskBadge(student.riskLevel)}`}>
                          {student.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-600 dark:text-slate-400">
                      No students advised yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

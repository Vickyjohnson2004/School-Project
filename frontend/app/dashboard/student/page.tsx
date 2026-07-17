'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchStudentDashboard } from '../../../lib/api';

interface StudentData {
  studentId: string;
  name: string;
  email: string;
  department: string;
  level: string;
  advisor: any;
  riskStatus: string;
  riskProbability: number;
  academics: {
    currentGPA: number;
    previousGPA: number;
    assignmentAverage: number;
    quizAverage: number;
    midSemesterScore: number;
  };
  engagement: {
    attendancePercentage: number;
    participation: number;
    libraryVisits: number;
    lmsActivity: number;
    lateSubmissionCount: number;
  };
  wellbeing: {
    studyHours: number;
    sleepHours: number;
    stressLevel: number;
  };
  outreach?: {
    reachedOut: boolean;
    reachedOutNote: string;
    reachedOutAt: string | null;
  };
}

interface StudentDashboardResponse {
  status: string;
  data: StudentData;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { data, error, isLoading, isError } = useQuery({
    queryKey: ['studentDashboard'],
    queryFn: fetchStudentDashboard,
    retry: false
  });

  useEffect(() => {
    if (error) {
      router.push('/login');
    }
  }, [error, router]);

  const student = (data as StudentDashboardResponse | undefined)?.data;

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

  if (isError || !student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No dashboard data available</p>
      </div>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Welcome, {student.name}!</h1>
          <p className="text-gray-600 mt-2 dark:text-slate-400">Student ID: {student.studentId} • {student.department} • Level {student.level}</p>
        </div>

        {/* Outreach Notice */}
        {student.outreach?.reachedOut && (
          <div className="mb-8 p-6 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 dark:border-emerald-400">
            <h2 className="text-lg font-bold text-emerald-900 mb-1 dark:text-emerald-300">Academic support outreach</h2>
            <p className="text-sm text-emerald-800 dark:text-emerald-200">
              Your advisor / administration has reached out to you regarding your academic performance. Please respond and engage with the support offered.
            </p>
            {student.outreach.reachedOutNote && (
              <p className="mt-3 text-sm text-emerald-900 dark:text-emerald-200">
                <span className="font-semibold">Note:</span> {student.outreach.reachedOutNote}
              </p>
            )}
            {student.outreach.reachedOutAt && (
              <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                Reached out on {new Date(student.outreach.reachedOutAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Risk Status Banner */}
        <div className={`${getRiskColor(student.riskStatus)} p-6 rounded-lg mb-8 border-l-4 border-current`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Risk Assessment</h2>
              <p className="text-sm">Current Status: <span className="font-bold uppercase">{student.riskStatus}</span></p>
              <p className="text-sm">Risk Probability: {(student.riskProbability * 100).toFixed(1)}%</p>
            </div>
            <div className="text-4xl font-bold opacity-20">!</div>
          </div>
        </div>

        {/* Academic Performance */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md dark:bg-slate-900">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Academic Performance</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-400">Current GPA</span>
                <span className="font-bold text-lg dark:text-white">{student.academics.currentGPA.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-400">Previous GPA</span>
                <span className="font-bold dark:text-white">{student.academics.previousGPA.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-400">Assignment Average</span>
                <span className="font-bold dark:text-white">{student.academics.assignmentAverage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-400">Quiz Average</span>
                <span className="font-bold dark:text-white">{student.academics.quizAverage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-400">Mid Semester Score</span>
                <span className="font-bold dark:text-white">{student.academics.midSemesterScore.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="bg-white p-6 rounded-lg shadow-md dark:bg-slate-900">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Engagement</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-400">Attendance</span>
                <span className="font-bold dark:text-white">{student.engagement.attendancePercentage.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-400">Participation</span>
                <span className="font-bold dark:text-white">{student.engagement.participation.toFixed(1)}/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-400">Library Visits</span>
                <span className="font-bold dark:text-white">{student.engagement.libraryVisits}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-400">LMS Activity</span>
                <span className="font-bold dark:text-white">{student.engagement.lmsActivity.toFixed(1)}/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-slate-400">Late Submissions</span>
                <span className="font-bold dark:text-white">{student.engagement.lateSubmissionCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wellbeing */}
        <div className="bg-white p-6 rounded-lg shadow-md dark:bg-slate-900">
          <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Wellbeing & Lifestyle</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-gray-600 mb-2 dark:text-slate-400">Study Hours/Day</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{student.wellbeing.studyHours.toFixed(1)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-2 dark:text-slate-400">Sleep Hours/Day</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{student.wellbeing.sleepHours.toFixed(1)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 mb-2 dark:text-slate-400">Stress Level</p>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{student.wellbeing.stressLevel.toFixed(1)}/10</p>
            </div>
          </div>
        </div>

        {/* Advisor Info */}
        {student.advisor && (
          <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200 dark:bg-slate-900 dark:border-slate-700">
            <h3 className="text-lg font-bold text-gray-900 mb-3 dark:text-white">Your Academic Advisor</h3>
            <div>
              <p className="text-gray-700 dark:text-slate-300"><span className="font-semibold">Name:</span> {student.advisor.name}</p>
              <p className="text-gray-700 dark:text-slate-300"><span className="font-semibold">Email:</span> {student.advisor.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

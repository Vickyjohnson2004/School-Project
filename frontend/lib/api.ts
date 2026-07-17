import axiosInstance from "./axios";
import { AxiosError, AxiosRequestConfig } from "axios";

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshAccessToken() {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = axiosInstance.get('/auth/refresh')
    .then((response) => {
      const token = response.data?.data?.token;
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      return true;
    })
    .catch(() => false)
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean } | undefined;
    const requestUrl = originalRequest?.url ?? '';

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !requestUrl.includes('/auth/login') &&
      !requestUrl.includes('/auth/register') &&
      !requestUrl.includes('/auth/refresh')
    ) {
      originalRequest._retry = true;
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return axiosInstance.request(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

async function request<T = any>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, body?: any) {
  const response = await axiosInstance.request<T>({
    url: endpoint.startsWith('/') ? endpoint : `/${endpoint}`,
    method,
    data: body
  });

  return response.data;
}

export const api = {
  async get<T = any>(endpoint: string) {
    return request<T>('GET', endpoint);
  },

  async post<T = any>(endpoint: string, body?: any) {
    return request<T>('POST', endpoint, body);
  },

  async put<T = any>(endpoint: string, body?: any) {
    return request<T>('PUT', endpoint, body);
  },

  async delete<T = any>(endpoint: string) {
    return request<T>('DELETE', endpoint);
  }
};

export async function loginUser(body: { email: string; password: string }) {
  return api.post('/auth/login', body);
}

export async function registerUser(body: { name: string; email: string; password: string; role: string }) {
  return api.post('/auth/register', body);
}

export async function logoutUser() {
  try {
    return await api.post('/auth/logout');
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
}

export async function getCurrentUser() {
  return api.get('/auth/me');
}

export async function fetchStudentDashboard() {
  return api.get('/student/dashboard');
}

export async function fetchLecturerDashboard() {
  return api.get('/lecturer/dashboard');
}

export async function fetchLecturerStudents() {
  return api.get('/lecturer/students');
}

export async function searchLecturerStudents(q: string) {
  return api.get(`/lecturer/students/search?q=${encodeURIComponent(q)}`);
}

export interface RiskPredictionInput {
  attendancePercentage: number;
  assignmentAverage: number;
  quizAverage: number;
  midSemesterScore: number;
  previousGPA: number;
  currentGPA: number;
  studyHours: number;
  participation: number;
  libraryVisits: number;
  lateSubmissionCount: number;
  disciplinaryRecord: number;
  lmsActivity: number;
  courseLoad: number;
  sleepHours: number;
  stressLevel: number;
}

export async function predictStudentRisk(input: RiskPredictionInput) {
  return api.post('/ml/predict', input);
}

export async function markStudentOutreach(
  studentUserId: string,
  body: { reachedOut: boolean; reachedOutNote?: string }
) {
  return api.put(`/admin/students/${studentUserId}/outreach`, body);
}

export async function updateStudentLevel(
  studentUserId: string,
  level: '100' | '200' | '300' | '400'
) {
  return api.put(`/admin/students/${studentUserId}/level`, { level });
}

export async function fetchAdminDashboard() {
  return api.get('/admin/dashboard');
}

export async function fetchAdminUsers() {
  return api.get('/admin/users');
}

export async function fetchMlDatasetPredictions() {
  return api.get('/ml/dataset');
}

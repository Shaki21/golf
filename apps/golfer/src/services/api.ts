/**
 * API Service for AK Golf Mobile App
 *
 * Axios-based HTTP client with:
 * - Automatic token injection
 * - Token refresh on 401
 * - Request/response interceptors
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Platform } from 'react-native';

// API base URL - different for iOS simulator vs Android emulator vs device
const getBaseUrl = () => {
  if (__DEV__) {
    // Development
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3000/api/v1'; // Android emulator
    }
    return 'http://localhost:3000/api/v1'; // iOS simulator
  }
  // Production
  return 'https://iup-golf-backend-production.up.railway.app/api/v1';
};

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage (set by AuthContext)
let authToken: string | null = null;

// Request interceptor - add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 - token expired
    if (error.response?.status === 401) {
      // AuthContext will handle token refresh
      // This is handled by the refreshTokens function
    }
    return Promise.reject(error);
  }
);

// API methods
export const api = {
  // Set auth token (called by AuthContext)
  setAuthToken: (token: string | null) => {
    authToken = token;
  },

  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
      const response = await axiosInstance.post('/auth/login', { email, password });
      return response.data;
    },

    logout: async () => {
      await axiosInstance.post('/auth/logout');
    },

    refresh: async (refreshToken: string) => {
      const response = await axiosInstance.post('/auth/refresh', { refreshToken });
      return response.data;
    },

    me: async () => {
      const response = await axiosInstance.get('/me');
      return response.data;
    },
  },

  // Player endpoints
  player: {
    getProfile: async () => {
      const response = await axiosInstance.get('/me');
      return response.data;
    },

    getDashboard: async () => {
      const response = await axiosInstance.get('/dashboard');
      return response.data;
    },

    getNextSession: async () => {
      const response = await axiosInstance.get('/training-plan/today');
      return response.data;
    },

    getEffortStats: async () => {
      const response = await axiosInstance.get('/player-insights/effort');
      return response.data;
    },
  },

  // Session endpoints
  sessions: {
    getToday: async () => {
      const response = await axiosInstance.get('/training/sessions/today');
      return response.data;
    },

    getById: async (sessionId: string) => {
      const response = await axiosInstance.get(`/training/sessions/${sessionId}`);
      return response.data;
    },

    create: async (data: any) => {
      const response = await axiosInstance.post('/training/sessions', data);
      return response.data;
    },

    update: async (sessionId: string, data: any) => {
      const response = await axiosInstance.patch(`/training/sessions/${sessionId}`, data);
      return response.data;
    },

    complete: async (sessionId: string, data: any) => {
      const response = await axiosInstance.post(`/training/sessions/${sessionId}/complete`, data);
      return response.data;
    },

    addReflection: async (sessionId: string, reflection: any) => {
      const response = await axiosInstance.post(`/training/sessions/${sessionId}/reflection`, reflection);
      return response.data;
    },
  },

  // Test endpoints
  tests: {
    getAll: async () => {
      const response = await axiosInstance.get('/tests');
      return response.data;
    },

    getByNumber: async (testNumber: number) => {
      const response = await axiosInstance.get(`/tests/${testNumber}`);
      return response.data;
    },

    submitResult: async (data: any) => {
      const response = await axiosInstance.post('/tests/results/enhanced', data);
      return response.data;
    },

    getHistory: async (playerId: string, testNumber: number) => {
      const response = await axiosInstance.get(`/tests/players/${playerId}/history/${testNumber}`);
      return response.data;
    },
  },

  // Video/Proof endpoints
  videos: {
    upload: async (data: FormData) => {
      const response = await axiosInstance.post('/videos/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000, // 2 min for video upload
      });
      return response.data;
    },

    getUploadUrl: async (filename: string, contentType: string) => {
      const response = await axiosInstance.post('/videos/upload-url', { filename, contentType });
      return response.data;
    },

    confirmUpload: async (videoId: string) => {
      const response = await axiosInstance.post(`/videos/${videoId}/confirm`);
      return response.data;
    },

    getProgress: async () => {
      const response = await axiosInstance.get('/videos/progress');
      return response.data;
    },
  },

  // Breaking points endpoints
  breakingPoints: {
    getActive: async () => {
      const response = await axiosInstance.get('/breaking-points/active');
      return response.data;
    },

    getById: async (id: string) => {
      const response = await axiosInstance.get(`/breaking-points/${id}`);
      return response.data;
    },

    submitProof: async (id: string, data: any) => {
      const response = await axiosInstance.post(`/breaking-points/${id}/proof`, data);
      return response.data;
    },
  },

  // Calendar endpoints
  calendar: {
    getEvents: async (startDate: string, endDate: string) => {
      const response = await axiosInstance.get('/calendar/events', {
        params: { startDate, endDate },
      });
      return response.data;
    },

    getUpcoming: async () => {
      const response = await axiosInstance.get('/calendar/upcoming');
      return response.data;
    },
  },

  // Training plan endpoints
  trainingPlan: {
    getCurrent: async () => {
      const response = await axiosInstance.get('/training-plan/current');
      return response.data;
    },

    getWeek: async (weekNumber: number) => {
      const response = await axiosInstance.get(`/training-plan/week/${weekNumber}`);
      return response.data;
    },

    getToday: async () => {
      const response = await axiosInstance.get('/training-plan/today');
      return response.data;
    },
  },
};

export default api;

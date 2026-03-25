/**
 * API Service
 *
 * Centralized API client with type-safe endpoints for all backend services.
 * Uses axios with interceptors for authentication and error handling.
 */

import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// =============================================================================
// Type Definitions
// =============================================================================

// Common response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  role: 'admin' | 'coach' | 'player' | 'parent';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
}

// Player types
export interface Player {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  category: string;
  handicap?: number;
  coachId?: string;
  tenantId: string;
}

// Coach types
export interface Coach {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  specializations: string[];
  status: string;
  tenantId: string;
  maxPlayersPerSession?: number;
  active?: boolean;
  // Extended fields (may be returned by API)
  name?: string;
  phone?: string;
  title?: string;
  specialization?: string;
  bio?: string;
  description?: string;
  avatar?: string;
  profileImage?: string;
  user?: { email?: string; phone?: string };
  notificationSettings?: Record<string, boolean>;
}

export interface CoachAlert {
  id: string;
  type: string;
  message: string;
  playerId?: string;
  read: boolean;
  createdAt: string;
}

// Extended alert DTO from API (includes all possible fields)
export interface CoachAlertDTO {
  id: string;
  athleteId?: string;
  playerId?: string;
  player?: { id: string; firstName?: string; lastName?: string };
  athleteName?: string;
  playerName?: string;
  type?: string;
  message?: string;
  text?: string;
  description?: string;
  createdAt?: string;
  created_at?: string;
  read?: boolean;
  isRead?: boolean;
}

// Alerts response wrapper
export interface AlertsResponseDTO {
  alerts?: CoachAlertDTO[];
}

// Coach weekly stats from API
export interface CoachWeeklyStatsDTO {
  players?: {
    active?: number;
    total?: number;
  };
  sessions?: {
    thisWeek?: number;
    totalHours?: number;
    completed?: number;
  };
}

// Athlete DTO from API (raw format)
export interface AthleteDTO {
  id: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  category?: string;
  handicap?: number | string;
  nextSession?: string;
  planUpdated?: string;
  profileImageUrl?: string;
  avatar?: string;
  hasActivePlan?: boolean;
  trainingPlan?: {
    updatedAt?: string;
    weeks?: number;
  };
  weeksInPlan?: number;
  status?: string;
}

// Test types
export interface Test {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface TestResult {
  id: string;
  testId: string;
  playerId: string;
  score: number;
  testedAt: string;
}

// Exercise types
export interface Exercise {
  id: string;
  name: string;
  description: string;
  exerciseType: string;
  difficulty: string;
  processCategory: string;
}

export interface ExerciseFilters {
  exerciseType?: string;
  difficulty?: string;
  processCategory?: string;
  search?: string;
  createdBy?: string;
}

// Training plan types
export interface TrainingPlan {
  id: string;
  playerId: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
}

export interface TrainingPlanFilters {
  playerId?: string;
  status?: string;
}

// Session types
export interface Session {
  id: string;
  playerId: string;
  coachId?: string;
  sessionType: string;
  sessionDate: string;
  duration: number;
  status: string;
}

export interface SessionFilters {
  status?: string;
  playerId?: string;
  coachId?: string;
  today?: boolean;
  fromDate?: string;
  toDate?: string;
  completionStatus?: string;
}

export interface SessionEvaluation {
  focusRating?: number;
  effortRating?: number;
  notes?: string;
  technicalCues?: string[];
}

// Technique Plan / P-System types
export interface TechniqueTask {
  id: string;
  playerId: string;
  createdById: string;
  creatorType: 'coach' | 'player';
  title: string;
  description: string;
  instructions?: string;
  videoUrl?: string;
  technicalArea: string;
  targetMetrics?: Record<string, number>;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completedAt?: string;
  // P-System specific fields
  pLevel?: string;
  repetitions?: number;
  priorityOrder?: number;
  imageUrls?: string[];
  // Relations
  player?: {
    firstName: string;
    lastName: string;
  };
  drills?: TechniqueTaskDrill[];
  responsible?: TechniqueTaskResponsible[];
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

export interface TechniqueTaskDrill {
  id: string;
  taskId: string;
  exerciseId: string;
  orderIndex: number;
  notes?: string;
  exercise?: {
    id: string;
    name: string;
    exerciseType: string;
  };
  createdAt: string;
}

export interface TechniqueTaskResponsible {
  id: string;
  taskId: string;
  userId: string;
  role?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  assignedAt: string;
}

export interface CreateTechniqueTaskInput {
  playerId: string;
  title: string;
  description: string;
  instructions?: string;
  videoUrl?: string;
  technicalArea: string;
  targetMetrics?: Record<string, number>;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  // P-System fields
  pLevel?: string;
  repetitions?: number;
  priorityOrder?: number;
  imageUrls?: string[];
}

export interface UpdateTechniqueTaskInput {
  title?: string;
  description?: string;
  instructions?: string;
  videoUrl?: string;
  technicalArea?: string;
  targetMetrics?: Record<string, number>;
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  // P-System fields
  pLevel?: string;
  repetitions?: number;
  priorityOrder?: number;
  imageUrls?: string[];
}

export interface TechniqueTaskFilters {
  playerId?: string;
  status?: 'pending' | 'in_progress' | 'completed';
  technicalArea?: string;
  creatorType?: 'coach' | 'player';
  pLevel?: string;
  limit?: number;
  offset?: number;
}

export interface AddDrillInput {
  exerciseId: string;
  orderIndex?: number;
  notes?: string;
}

export interface AssignResponsibleInput {
  userId: string;
  role?: string;
}

// Calendar session type (used in Kalender.tsx)
export interface CalendarSession {
  id: string;
  name: string;
  type: string;
  time: string;
  duration: number;
  level: string;
  status: 'pending' | 'completed' | 'cancelled' | string;
  location?: string;
  notes?: string;
  exercises?: string[];
}

// Video DTO from videoApi (used in BevisContainer.tsx)
export interface VideoDTO {
  id: string;
  title?: string;
  fileName?: string;
  category?: string;
  status?: string;
  createdAt?: string;
  duration?: number;
  thumbnailUrl?: string | null;
  coachNotes?: string | null;
  tags?: string[];
}

// Achievement types
export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  earnedAt?: string;
  viewed: boolean;
}

// Badge types
export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  tier: number;
  requirements: Record<string, unknown>;
}

export interface BadgeProgress {
  badgeId: string;
  progress: number;
  earned: boolean;
  earnedAt?: string;
}

// Weather types
export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: string;
  precipitation: number;
  description: string;
  icon: string;
}

// Golf course types
export interface GolfCourse {
  id: string;
  name: string;
  clubName: string;
  city?: string;
  country: string;
  latitude: number;
  longitude: number;
}

// Calibration types
export interface Calibration {
  playerId: string;
  driverDistance?: number;
  ironDistance?: number;
  wedgeDistance?: number;
  puttingSkill?: number;
}

// Note types
export interface Note {
  id: string;
  playerId: string;
  coachId: string;
  content: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

// Note DTO from API (includes all possible fields)
export interface NoteDTO {
  id: string;
  playerId?: string;
  coachId?: string;
  content?: string;
  text?: string;
  message?: string;
  category?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  delivered?: boolean;
  isDelivered?: boolean;
}

// Message types
export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  subject: string;
  body: string;
  sentAt?: string;
  scheduledAt?: string;
}

// =============================================================================
// API Configuration
// =============================================================================

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// =============================================================================
// Token Refresh Logic
// =============================================================================

interface QueuedRequest {
  resolve: (value: string | null) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post<{ data: { accessToken: string; refreshToken?: string } }>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    localStorage.setItem('accessToken', accessToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    return accessToken;
  } catch {
    // Refresh failed, clear tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return null;
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic for auth endpoints to avoid loops
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/');

    // Only attempt refresh on 401 and if we haven't already tried
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            }
            return Promise.reject(error);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          processQueue(new Error('Token refresh failed'), null);
          // Redirect to login only if refresh fails
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For 401 on auth endpoints or other errors, just reject
    if (error.response?.status === 401 && isAuthEndpoint) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }

    return Promise.reject(error);
  }
);

// =============================================================================
// Auth API
// =============================================================================

export const authAPI = {
  login: (email: string, password: string): Promise<AxiosResponse<ApiResponse<AuthResponse>>> =>
    api.post('/auth/login', { email, password }),

  register: (data: RegisterData): Promise<AxiosResponse<ApiResponse<AuthResponse>>> =>
    api.post('/auth/register', data),

  logout: (): Promise<AxiosResponse<void>> =>
    api.post('/auth/logout'),

  // Password reset
  requestPasswordReset: (email: string): Promise<AxiosResponse<void>> =>
    api.post('/auth/forgot-password', { email }),

  verifyResetToken: (token: string): Promise<AxiosResponse<{ valid: boolean }>> =>
    api.post('/auth/verify-reset-token', { token }),

  resetPassword: (token: string, email: string, newPassword: string): Promise<AxiosResponse<void>> =>
    api.post('/auth/reset-password', { token, email, newPassword }),

  // 2FA
  generate2FASecret: (): Promise<AxiosResponse<{ secret: string; qrCode: string }>> =>
    api.post('/auth/2fa/setup'),

  verify2FACode: (code: string): Promise<AxiosResponse<{ verified: boolean }>> =>
    api.post('/auth/2fa/verify', { code }),

  disable2FA: (password: string): Promise<AxiosResponse<void>> =>
    api.post('/auth/2fa/disable', { password }),
};

// =============================================================================
// Dashboard API
// =============================================================================

export const dashboardAPI = {
  getStats: (playerId: string): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get(`/dashboard/${playerId}`),

  getRecentTests: (playerId: string): Promise<AxiosResponse<ApiResponse<TestResult[]>>> =>
    api.get(`/dashboard/${playerId}/recent-tests`),

  getUpcomingSessions: (playerId: string): Promise<AxiosResponse<ApiResponse<Session[]>>> =>
    api.get(`/dashboard/${playerId}/upcoming-sessions`),
};

// =============================================================================
// Players API
// =============================================================================

export const playersAPI = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Player[]>>> =>
    api.get('/players'),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<Player>>> =>
    api.get(`/players/${id}`),

  create: (data: Partial<Player>): Promise<AxiosResponse<ApiResponse<Player>>> =>
    api.post('/players', data),

  update: (id: string, data: Partial<Player>): Promise<AxiosResponse<ApiResponse<Player>>> =>
    api.put(`/players/${id}`, data),

  delete: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/players/${id}`),

  updateProfile: (data: Partial<Player>): Promise<AxiosResponse<ApiResponse<Player>>> =>
    api.put('/players/profile', data),

  getProfile: (): Promise<AxiosResponse<ApiResponse<Player>>> =>
    api.get('/players/profile'),

  uploadProfileImage: (file: File): Promise<AxiosResponse<ApiResponse<{ imageUrl: string }>>> => {
    const formData = new FormData();
    formData.append('profileImage', file);
    return api.post('/players/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  removeProfileImage: (): Promise<AxiosResponse<ApiResponse<void>>> =>
    api.delete('/players/profile-image'),
};

// =============================================================================
// Coaches API
// =============================================================================

export const coachesAPI = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Coach[]>>> =>
    api.get('/coaches'),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<Coach>>> =>
    api.get(`/coaches/${id}`),

  create: (data: Partial<Coach>): Promise<AxiosResponse<ApiResponse<Coach>>> =>
    api.post('/coaches', data),

  update: (id: string, data: Partial<Coach>): Promise<AxiosResponse<ApiResponse<Coach>>> =>
    api.put(`/coaches/${id}`, data),

  delete: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/coaches/${id}`),

  // Coach dashboard
  getAthletes: (): Promise<AxiosResponse<ApiResponse<Player[]>>> =>
    api.get('/coaches/me/players'),

  getAlerts: (unreadOnly = false): Promise<AxiosResponse<ApiResponse<CoachAlert[]>>> =>
    api.get('/coaches/me/alerts', { params: { unread: unreadOnly } }),

  dismissAlert: (alertId: string): Promise<AxiosResponse<void>> =>
    api.put(`/coaches/alerts/${alertId}/dismiss`),

  getStatistics: (coachId: string): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get(`/coaches/${coachId}/statistics`),

  getAvailability: (coachId: string, startDate: string, endDate: string): Promise<AxiosResponse<ApiResponse<unknown[]>>> =>
    api.get(`/coaches/${coachId}/availability`, { params: { startDate, endDate } }),

  getPlayers: (coachId: string): Promise<AxiosResponse<ApiResponse<Player[]>>> =>
    api.get(`/coaches/${coachId}/players`),

  // Aliases for backward compatibility
  getPendingItems: (): Promise<AxiosResponse<ApiResponse<CoachAlert[]>>> =>
    api.get('/coaches/me/alerts'),

  getTodaySchedule: (): Promise<AxiosResponse<ApiResponse<Session[]>>> =>
    api.get('/sessions', { params: { status: 'scheduled', today: true } }),

  getWeeklyStats: (coachId: string): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get(`/coaches/${coachId}/statistics`),

  getTeams: (): Promise<AxiosResponse<ApiResponse<Player[]>>> =>
    api.get('/coaches/me/players'),

  // Batch operations
  batchAssignSession: (data: {
    playerIds: string[];
    sessionType: string;
    scheduledDate: string;
    durationMinutes?: number;
    notes?: string;
  }): Promise<AxiosResponse<ApiResponse<{ success: string[]; failed: Array<{ playerId: string; error: string }> }>>> =>
    api.post('/coaches/me/batch/assign-session', data),

  batchSendNote: (data: {
    playerIds: string[];
    title: string;
    content: string;
    category?: string;
  }): Promise<AxiosResponse<ApiResponse<{ success: string[]; failed: Array<{ playerId: string; error: string }> }>>> =>
    api.post('/coaches/me/batch/send-note', data),

  batchUpdateStatus: (data: {
    playerIds: string[];
    status: 'active' | 'inactive' | 'on_break';
  }): Promise<AxiosResponse<ApiResponse<{ success: string[]; failed: Array<{ playerId: string; error: string }> }>>> =>
    api.post('/coaches/me/batch/update-status', data),

  batchCreatePlan: (data: {
    playerIds: string[];
    planName: string;
    startDate: string;
    durationWeeks: number;
    focusAreas?: string[];
  }): Promise<AxiosResponse<ApiResponse<{ success: string[]; failed: Array<{ playerId: string; error: string }> }>>> =>
    api.post('/coaches/me/batch/create-plan', data),
};

// =============================================================================
// Tests API
// =============================================================================

export const testsAPI = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Test[]>>> =>
    api.get('/tests'),

  getResults: (playerId: string): Promise<AxiosResponse<ApiResponse<TestResult[]>>> =>
    api.get(`/tests/results?playerId=${playerId}`),

  createResult: (data: Partial<TestResult>): Promise<AxiosResponse<ApiResponse<TestResult>>> =>
    api.post('/tests/results/enhanced', data),

  getResultById: (id: string): Promise<AxiosResponse<ApiResponse<TestResult>>> =>
    api.get(`/tests/results/${id}/enhanced`),
};

// =============================================================================
// Exercises API
// =============================================================================

export const exercisesAPI = {
  list: (params: ExerciseFilters = {}): Promise<AxiosResponse<ApiResponse<Exercise[]>>> =>
    api.get('/exercises', { params }),

  getAll: (): Promise<AxiosResponse<ApiResponse<Exercise[]>>> =>
    api.get('/exercises'),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<Exercise>>> =>
    api.get(`/exercises/${id}`),

  create: (data: Partial<Exercise>): Promise<AxiosResponse<ApiResponse<Exercise>>> =>
    api.post('/exercises', data),

  update: (id: string, data: Partial<Exercise>): Promise<AxiosResponse<ApiResponse<Exercise>>> =>
    api.put(`/exercises/${id}`, data),

  delete: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/exercises/${id}`),

  duplicate: (id: string): Promise<AxiosResponse<ApiResponse<Exercise>>> =>
    api.post(`/exercises/${id}/duplicate`),
};

// =============================================================================
// Training Plan API
// =============================================================================

export const trainingPlanAPI = {
  getAll: (): Promise<AxiosResponse<ApiResponse<TrainingPlan[]>>> =>
    api.get('/training-plan'),

  getPlans: (playerId: string): Promise<AxiosResponse<ApiResponse<TrainingPlan[]>>> =>
    api.get(`/training-plan?playerId=${playerId}`),

  getForPlayer: (playerId: string): Promise<AxiosResponse<ApiResponse<TrainingPlan>>> =>
    api.get(`/training-plan/player/${playerId}`),

  getFull: (planId: string, params: Record<string, unknown> = {}): Promise<AxiosResponse<ApiResponse<TrainingPlan>>> =>
    api.get(`/training-plan/${planId}/full`, { params }),

  getCalendar: (planId: string, params: Record<string, unknown> = {}): Promise<AxiosResponse<ApiResponse<unknown[]>>> =>
    api.get(`/training-plan/${planId}/calendar`, { params }),

  getToday: (planId: string): Promise<AxiosResponse<ApiResponse<unknown>>> =>
    api.get(`/training-plan/${planId}/today`),

  getAnalytics: (planId: string): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get(`/training-plan/${planId}/analytics`),

  getAchievements: (planId: string): Promise<AxiosResponse<ApiResponse<Achievement[]>>> =>
    api.get(`/training-plan/${planId}/achievements`),

  // CRUD
  createPlan: (data: Partial<TrainingPlan>): Promise<AxiosResponse<ApiResponse<TrainingPlan>>> =>
    api.post('/training-plan', data),

  generate: (data: Record<string, unknown>): Promise<AxiosResponse<ApiResponse<TrainingPlan>>> =>
    api.post('/training-plan/generate', data),

  updatePlan: (id: string, data: Partial<TrainingPlan>): Promise<AxiosResponse<ApiResponse<TrainingPlan>>> =>
    api.put(`/training-plan/${id}`, data),

  deletePlan: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/training-plan/${id}`),

  // Plan actions
  acceptPlan: (planId: string): Promise<AxiosResponse<ApiResponse<TrainingPlan>>> =>
    api.put(`/training-plan/${planId}/accept`),

  rejectPlan: (planId: string, data: { reason?: string }): Promise<AxiosResponse<ApiResponse<TrainingPlan>>> =>
    api.put(`/training-plan/${planId}/reject`, data),

  // Daily assignments
  updateDaily: (planId: string, date: string, data: Record<string, unknown>): Promise<AxiosResponse<ApiResponse<unknown>>> =>
    api.put(`/training-plan/${planId}/daily/${date}`, data),

  quickAction: (planId: string, date: string, data: Record<string, unknown>): Promise<AxiosResponse<ApiResponse<unknown>>> =>
    api.put(`/training-plan/${planId}/daily/${date}/quick-action`, data),

  findSubstitute: (planId: string, date: string): Promise<AxiosResponse<ApiResponse<Exercise>>> =>
    api.post(`/training-plan/${planId}/daily/${date}/substitute`),

  // Tournaments
  addTournament: (planId: string, data: Record<string, unknown>): Promise<AxiosResponse<ApiResponse<unknown>>> =>
    api.post(`/training-plan/${planId}/tournaments`, data),

  // Modification requests
  requestModification: (planId: string, data: Record<string, unknown>): Promise<AxiosResponse<ApiResponse<unknown>>> =>
    api.post(`/training-plan/${planId}/modification-request`, data),

  getModificationRequests: (params: Record<string, unknown> = {}): Promise<AxiosResponse<ApiResponse<unknown[]>>> =>
    api.get('/training-plan/modification-requests', { params }),

  respondToModification: (requestId: string, data: { approved: boolean; response?: string }): Promise<AxiosResponse<ApiResponse<unknown>>> =>
    api.put(`/training-plan/modification-requests/${requestId}/respond`, data),
};

// =============================================================================
// Technique Plan / P-System API
// =============================================================================

export const techniquePlanAPI = {
  // List tasks with optional filtering
  getTasks: (filters?: TechniqueTaskFilters): Promise<AxiosResponse<{ success: boolean; data: TechniqueTask[]; pagination: { total: number; limit: number; offset: number } }>> =>
    api.get('/technique-plan/tasks', { params: filters }),

  // Get single task
  getTask: (taskId: string): Promise<AxiosResponse<{ success: boolean; data: TechniqueTask }>> =>
    api.get(`/technique-plan/tasks/${taskId}`),

  // Get task with full details (player, drills, responsible persons)
  getTaskFull: (taskId: string): Promise<AxiosResponse<{ success: boolean; data: TechniqueTask }>> =>
    api.get(`/technique-plan/tasks/${taskId}/full`),

  // Get tasks filtered by P-level
  getTasksByPLevel: (playerId: string, pLevel: string): Promise<AxiosResponse<{ success: boolean; data: TechniqueTask[] }>> =>
    api.get('/technique-plan/tasks/by-p-level', { params: { playerId, pLevel } }),

  // Create task (with P-System fields)
  createTask: (data: CreateTechniqueTaskInput): Promise<AxiosResponse<{ success: boolean; data: TechniqueTask }>> =>
    api.post('/technique-plan/tasks', data),

  // Update task
  updateTask: (taskId: string, data: UpdateTechniqueTaskInput): Promise<AxiosResponse<{ success: boolean; data: TechniqueTask }>> =>
    api.patch(`/technique-plan/tasks/${taskId}`, data),

  // Delete task
  deleteTask: (taskId: string): Promise<AxiosResponse<{ success: boolean }>> =>
    api.delete(`/technique-plan/tasks/${taskId}`),

  // Update task priority order (drag-and-drop)
  updateTaskPriority: (taskId: string, priorityOrder: number): Promise<AxiosResponse<{ success: boolean; data: TechniqueTask }>> =>
    api.patch(`/technique-plan/tasks/${taskId}/priority`, { priorityOrder }),

  // Drill management
  addDrill: (taskId: string, data: AddDrillInput): Promise<AxiosResponse<{ success: boolean; data: TechniqueTaskDrill }>> =>
    api.post(`/technique-plan/tasks/${taskId}/drills`, data),

  removeDrill: (taskId: string, drillId: string): Promise<AxiosResponse<{ success: boolean }>> =>
    api.delete(`/technique-plan/tasks/${taskId}/drills/${drillId}`),

  // Responsible person management
  assignResponsible: (taskId: string, data: AssignResponsibleInput): Promise<AxiosResponse<{ success: boolean; data: TechniqueTaskResponsible }>> =>
    api.post(`/technique-plan/tasks/${taskId}/responsible`, data),

  removeResponsible: (taskId: string, responsibleId: string): Promise<AxiosResponse<{ success: boolean }>> =>
    api.delete(`/technique-plan/tasks/${taskId}/responsible/${responsibleId}`),
};

// =============================================================================
// Calendar/Bookings API
// =============================================================================

export const calendarAPI = {
  getAvailability: (coachId: string, date: string): Promise<AxiosResponse<ApiResponse<unknown[]>>> =>
    api.get(`/availability?coachId=${coachId}&date=${date}`),

  createBooking: (data: Record<string, unknown>): Promise<AxiosResponse<ApiResponse<unknown>>> =>
    api.post('/bookings', data),

  getBookings: (playerId: string): Promise<AxiosResponse<ApiResponse<unknown[]>>> =>
    api.get(`/bookings?playerId=${playerId}`),

  cancelBooking: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/bookings/${id}`),

  createTournamentResult: (data: Record<string, unknown>): Promise<AxiosResponse<ApiResponse<unknown>>> =>
    api.post('/calendar/tournament-result', data),

  getTournamentResults: (playerId: string): Promise<AxiosResponse<ApiResponse<unknown[]>>> =>
    api.get(`/calendar/tournament-results?playerId=${playerId}`),
};

// =============================================================================
// Coach Analytics API
// =============================================================================

export const analyticsAPI = {
  getPlayerOverview: (playerId: string): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get(`/coach-analytics/players/${playerId}/overview`),

  getCategoryProgression: (playerId: string): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get(`/coach-analytics/players/${playerId}/category-progression`),

  comparePlayers: (playerIds: string[]): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.post('/coach-analytics/compare-players', { playerIds }),

  getTeamAnalytics: (coachId: string): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get(`/coach-analytics/team/${coachId}`),

  getDashboard: (coachId: string): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get(`/coach-analytics/dashboard/${coachId}`),
};

// =============================================================================
// Peer Comparison API
// =============================================================================

export const peerComparisonAPI = {
  compare: (playerId: string, testId: string): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get(`/peer-comparison?playerId=${playerId}&testId=${testId}`),

  multiLevel: (playerId: string, testId: string): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get(`/peer-comparison/multi-level?playerId=${playerId}&testId=${testId}`),

  getPeerGroup: (category: string, gender: string, ageGroup: string): Promise<AxiosResponse<ApiResponse<Player[]>>> =>
    api.get(`/peer-comparison/peer-group?category=${category}&gender=${gender}&ageGroup=${ageGroup}`),
};

// =============================================================================
// Sessions API
// =============================================================================

export const sessionsAPI = {
  list: (params: SessionFilters = {}): Promise<AxiosResponse<ApiResponse<Session[]>>> =>
    api.get('/sessions', { params }),

  getMy: (params: SessionFilters = {}): Promise<AxiosResponse<ApiResponse<Session[]>>> =>
    api.get('/sessions/my', { params }),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<Session>>> =>
    api.get(`/sessions/${id}`),

  getInProgress: (): Promise<AxiosResponse<ApiResponse<Session[]>>> =>
    api.get('/sessions/in-progress'),

  create: (data: Partial<Session>): Promise<AxiosResponse<ApiResponse<Session>>> =>
    api.post('/sessions', data),

  update: (id: string, data: Partial<Session>): Promise<AxiosResponse<ApiResponse<Session>>> =>
    api.patch(`/sessions/${id}`, data),

  delete: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/sessions/${id}`),

  updateEvaluation: (id: string, data: SessionEvaluation): Promise<AxiosResponse<ApiResponse<Session>>> =>
    api.patch(`/sessions/${id}/evaluation`, data),

  complete: (id: string, data: SessionEvaluation): Promise<AxiosResponse<ApiResponse<Session>>> =>
    api.post(`/sessions/${id}/complete`, data),

  autoComplete: (id: string): Promise<AxiosResponse<ApiResponse<Session>>> =>
    api.post(`/sessions/${id}/auto-complete`),

  getEvaluationStats: (params: Record<string, unknown> = {}): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get('/sessions/stats/evaluation', { params }),

  getTechnicalCues: (): Promise<AxiosResponse<ApiResponse<string[]>>> =>
    api.get('/sessions/technical-cues'),
};

// =============================================================================
// DataGolf API
// =============================================================================

export const dataGolfAPI = {
  getPlayer: (playerId: string): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get(`/datagolf/players/${playerId}`),

  getTourAverages: (tour: string, season?: number): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get('/datagolf/tour-averages', { params: { tour, season } }),

  compare: (playerId: string, tour: string, season?: number): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get('/datagolf/compare', { params: { playerId, tour, season } }),

  syncStatus: (): Promise<AxiosResponse<ApiResponse<{ lastSync: string; status: string }>>> =>
    api.get('/datagolf/sync-status'),

  triggerSync: (): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.post('/datagolf/sync'),

  getCoachDashboard: (tour = 'pga', season?: number): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get('/datagolf/coach/dashboard', { params: { tour, season } }),

  getProPlayers: (tour = 'pga', limit = 50): Promise<AxiosResponse<ApiResponse<Record<string, unknown>[]>>> =>
    api.get('/datagolf/pro-players', { params: { tour, limit } }),

  getApproachSkill: (params: Record<string, unknown> = {}): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get('/datagolf/approach-skill', { params }),

  getApproachSkillAverages: (tour: string, season?: number): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get('/datagolf/approach-skill/averages', { params: { tour, season } }),

  getTopApproachSkill: (distance: number, tour: string, season?: number, limit = 20): Promise<AxiosResponse<ApiResponse<Record<string, unknown>[]>>> =>
    api.get('/datagolf/approach-skill/top', { params: { distance, tour, season, limit } }),

  getPlayerApproachSkill: (playerName: string, tour: string, season?: number): Promise<AxiosResponse<ApiResponse<Record<string, unknown>>>> =>
    api.get(`/datagolf/approach-skill/player/${encodeURIComponent(playerName)}`, { params: { tour, season } }),
};

// =============================================================================
// Messages API
// =============================================================================

export const messagesAPI = {
  send: (data: Partial<Message>): Promise<AxiosResponse<ApiResponse<Message>>> =>
    api.post('/messages', data),

  schedule: (data: Partial<Message>): Promise<AxiosResponse<ApiResponse<Message>>> =>
    api.post('/messages/schedule', data),

  list: (params: Record<string, unknown>): Promise<AxiosResponse<ApiResponse<Message[]>>> =>
    api.get('/messages', { params }),

  delete: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/messages/${id}`),

  sendNow: (id: string): Promise<AxiosResponse<ApiResponse<Message>>> =>
    api.post(`/messages/${id}/send-now`),

  getScheduled: (): Promise<AxiosResponse<ApiResponse<Message[]>>> =>
    api.get('/messages/scheduled'),
};

// =============================================================================
// Golf Courses API
// =============================================================================

export const golfCoursesAPI = {
  search: (params: { query?: string; country?: string; limit?: number } = {}): Promise<AxiosResponse<ApiResponse<GolfCourse[]>>> =>
    api.get('/golf-courses/search', { params }),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<GolfCourse>>> =>
    api.get(`/golf-courses/${id}`),

  getNorwegian: (): Promise<AxiosResponse<ApiResponse<GolfCourse[]>>> =>
    api.get('/golf-courses/norway'),

  getByCountry: (country: string): Promise<AxiosResponse<ApiResponse<GolfCourse[]>>> =>
    api.get(`/golf-courses/country/${encodeURIComponent(country)}`),

  getSyncStatus: (): Promise<AxiosResponse<ApiResponse<{ lastSync: string; status: string }>>> =>
    api.get('/golf-courses/sync/status'),

  sync: (country: string): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.post('/golf-courses/sync', { country }),
};

// =============================================================================
// Weather API
// =============================================================================

export const weatherAPI = {
  getCourseWeather: (courseId: string): Promise<AxiosResponse<ApiResponse<WeatherData>>> =>
    api.get(`/weather/course/${courseId}`),

  getClubWeather: (clubId: string): Promise<AxiosResponse<ApiResponse<WeatherData>>> =>
    api.get(`/weather/club/${clubId}`),

  getByLocation: (lat: number, lng: number): Promise<AxiosResponse<ApiResponse<WeatherData>>> =>
    api.get('/weather/location', { params: { lat, lng } }),

  getBestCourses: (limit = 10): Promise<AxiosResponse<ApiResponse<Array<GolfCourse & { weather: WeatherData }>>>> =>
    api.get('/weather/best-courses', { params: { limit } }),

  getRegionWeather: (city: string): Promise<AxiosResponse<ApiResponse<Array<GolfCourse & { weather: WeatherData }>>>> =>
    api.get('/weather/region', { params: { city } }),

  getWindForecast: (courseId: string): Promise<AxiosResponse<ApiResponse<WeatherData[]>>> =>
    api.get(`/weather/wind/${courseId}`),
};

// =============================================================================
// Settings API
// =============================================================================

// Complex notification settings structure (player settings page)
export interface NotificationSettingsPayload {
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
  categories: {
    training: { enabled: boolean; reminders: boolean; coachFeedback: boolean; planUpdates: boolean };
    tournaments: { enabled: boolean; registrationDeadlines: boolean; results: boolean; rankings: boolean };
    goals: { enabled: boolean; achievements: boolean; milestones: boolean; weeklyProgress: boolean };
    messages: { enabled: boolean; fromCoach: boolean; fromAdmin: boolean };
    system: { enabled: boolean; maintenance: boolean; newFeatures: boolean };
  };
  timing: {
    quietHoursEnabled: boolean;
    quietStart: string;
    quietEnd: string;
    dailySummary: boolean;
    dailySummaryTime: string;
  };
}

// Simple notification settings (coach settings page)
export interface CoachNotificationSettings {
  newBooking: boolean;
  bookingReminder: boolean;
  playerUpdate: boolean;
  tournamentResults: boolean;
  systemUpdates: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

export const settingsAPI = {
  saveNotifications: (data: NotificationSettingsPayload | CoachNotificationSettings): Promise<AxiosResponse<ApiResponse<void>>> =>
    api.post('/settings/notifications', data),
};

// =============================================================================
// Goals API
// =============================================================================

export interface GoalStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  streakStatus: 'active' | 'at_risk' | 'frozen' | 'inactive';
  daysUntilExpiry: number;
}

export interface GoalStats {
  totalActive: number;
  totalCompleted: number;
  averageProgress: number;
  completedThisMonth: number;
  upcomingDeadlines: Array<{
    id: string;
    title: string;
    deadline: string;
    progress: number;
    category: string;
  }>;
  recentActivity: Array<{
    date: string;
    updates: number;
  }>;
}

export interface GoalBadge {
  id: string;
  badgeId: string;
  name: string;
  description?: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
  viewed: boolean;
}

export interface GoalBadgesResponse {
  badges: GoalBadge[];
  unlockedCount: number;
  totalBadges: number;
  recentUnlocks: Array<{
    id: string;
    badgeId: string;
    name: string;
    icon: string;
    unlockedAt: string;
  }>;
}

export const goalsAPI = {
  // Streak endpoints
  getStreak: (): Promise<AxiosResponse<ApiResponse<GoalStreak>>> =>
    api.get('/goals/streak'),

  updateStreak: (goalId: string, progressValue: number): Promise<AxiosResponse<ApiResponse<{ success: boolean; currentStreak: number; streakUpdated: boolean; message: string }>>> =>
    api.post('/goals/streak/update', { goalId, progressValue }),

  // Stats endpoints
  getStats: (): Promise<AxiosResponse<ApiResponse<GoalStats>>> =>
    api.get('/goals/stats'),

  // Badges endpoints
  getBadges: (): Promise<AxiosResponse<ApiResponse<GoalBadgesResponse>>> =>
    api.get('/goals/badges'),

  unlockBadge: (badgeId: string): Promise<AxiosResponse<ApiResponse<{ success: boolean; badge: GoalBadge }>>> =>
    api.post(`/goals/badges/${badgeId}/unlock`),

  markBadgeViewed: (badgeId: string): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.patch(`/goals/badges/${badgeId}/viewed`),
};

// =============================================================================
// Achievements API
// =============================================================================

export const achievementsAPI = {
  list: (category?: string): Promise<AxiosResponse<ApiResponse<Achievement[]>>> =>
    api.get('/achievements', { params: category ? { category } : {} }),

  getNew: (): Promise<AxiosResponse<ApiResponse<Achievement[]>>> =>
    api.get('/achievements/new'),

  getStats: (): Promise<AxiosResponse<ApiResponse<Record<string, number>>>> =>
    api.get('/achievements/stats'),

  getRecent: (limit = 5): Promise<AxiosResponse<ApiResponse<Achievement[]>>> =>
    api.get('/achievements/recent', { params: { limit } }),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<Achievement>>> =>
    api.get(`/achievements/${id}`),

  markViewed: (id: string): Promise<AxiosResponse<ApiResponse<Achievement>>> =>
    api.patch(`/achievements/${id}/viewed`),

  markAllViewed: (): Promise<AxiosResponse<ApiResponse<void>>> =>
    api.post('/achievements/mark-all-viewed'),
};

// =============================================================================
// Badges API
// =============================================================================

export const badgesAPI = {
  getDefinitions: (includeUnavailable = true): Promise<AxiosResponse<ApiResponse<BadgeDefinition[]>>> =>
    api.get('/badges/definitions', { params: { includeUnavailable } }),

  getByCategory: (category: string, includeUnavailable = true): Promise<AxiosResponse<ApiResponse<BadgeDefinition[]>>> =>
    api.get(`/badges/definitions/${category}`, { params: { includeUnavailable } }),

  getProgress: (): Promise<AxiosResponse<ApiResponse<BadgeProgress[]>>> =>
    api.get('/badges/progress'),

  getRecent: (limit = 5): Promise<AxiosResponse<ApiResponse<BadgeProgress[]>>> =>
    api.get('/badges/recent', { params: { limit } }),

  getLeaderboard: (limit = 10): Promise<AxiosResponse<ApiResponse<Array<{ playerId: string; count: number }>>>> =>
    api.get('/badges/leaderboard', { params: { limit } }),

  award: (badgeId: string, playerId: string): Promise<AxiosResponse<ApiResponse<BadgeProgress>>> =>
    api.post('/badges/award', { badgeId, playerId }),
};

// =============================================================================
// Calibration API
// =============================================================================

export const calibrationAPI = {
  getCalibration: (playerId: string): Promise<AxiosResponse<ApiResponse<Calibration>>> =>
    api.get(`/calibration/player/${playerId}`),

  createCalibration: (data: Partial<Calibration>): Promise<AxiosResponse<ApiResponse<Calibration>>> =>
    api.post('/calibration', data),

  updateCalibration: (playerId: string, data: Partial<Calibration>): Promise<AxiosResponse<ApiResponse<Calibration>>> =>
    api.put(`/calibration/player/${playerId}`, data),

  deleteCalibration: (playerId: string): Promise<AxiosResponse<void>> =>
    api.delete(`/calibration/player/${playerId}`),

  startSession: (): Promise<AxiosResponse<ApiResponse<{ sessionId: string }>>> =>
    api.post('/calibration/start'),

  submitSamples: (sessionId: string, samples: Record<string, number>[]): Promise<AxiosResponse<ApiResponse<Calibration>>> =>
    api.post('/calibration/submit', { sessionId, samples }),
};

// =============================================================================
// Notes API
// =============================================================================

export const notesAPI = {
  getForPlayer: (playerId: string): Promise<AxiosResponse<ApiResponse<Note[]>>> =>
    api.get(`/notes/player/${playerId}`),

  getAll: (params: { playerId?: string; category?: string } = {}): Promise<AxiosResponse<ApiResponse<Note[]>>> =>
    api.get('/notes', { params }),

  getById: (noteId: string): Promise<AxiosResponse<ApiResponse<Note>>> =>
    api.get(`/notes/${noteId}`),

  create: (data: Partial<Note>): Promise<AxiosResponse<ApiResponse<Note>>> =>
    api.post('/notes', data),

  update: (noteId: string, data: Partial<Note>): Promise<AxiosResponse<ApiResponse<Note>>> =>
    api.put(`/notes/${noteId}`, data),

  delete: (noteId: string): Promise<AxiosResponse<void>> =>
    api.delete(`/notes/${noteId}`),
};

// =============================================================================
// Notifications API
// =============================================================================

export interface Notification {
  id: string;
  notificationType: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  nextCursor: string | null;
}

export const notificationsAPI = {
  getAll: (params: { unreadOnly?: string; limit?: string; cursor?: string } = {}): Promise<AxiosResponse<ApiResponse<NotificationsResponse>>> =>
    api.get('/notifications', { params }),

  getUnread: (): Promise<AxiosResponse<ApiResponse<NotificationsResponse>>> =>
    api.get('/notifications', { params: { unreadOnly: '1' } }),

  markRead: (id: string): Promise<AxiosResponse<ApiResponse<void>>> =>
    api.patch(`/notifications/${id}/read`),

  markAllRead: (): Promise<AxiosResponse<ApiResponse<{ count: number }>>> =>
    api.post('/notifications/read-all'),

  getStreamStatus: (): Promise<AxiosResponse<ApiResponse<{ mode: string; activeSubscriptions: number; redisAvailable: boolean }>>> =>
    api.get('/notifications/stream/status'),
};

// =============================================================================
// Conversations/Messages API
// =============================================================================

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'coach_player';
  name?: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: string;
  }>;
  lastMessage?: {
    id: string;
    content: string;
    senderName: string;
    sentAt: string;
    isRead: boolean;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  createdAt: string;
  readBy: Array<{ userId: string; readAt: string }>;
}

export const conversationsAPI = {
  getAll: (): Promise<AxiosResponse<ApiResponse<{ conversations: Conversation[]; total: number }>>> =>
    api.get('/messages/conversations'),

  getById: (id: string, params: { limit?: number; before?: string } = {}): Promise<AxiosResponse<ApiResponse<{ conversation: Conversation; messages: ConversationMessage[]; hasMore: boolean }>>> =>
    api.get(`/messages/conversations/${id}`, { params }),

  create: (data: { type: string; name?: string; participantIds: string[] }): Promise<AxiosResponse<ApiResponse<{ conversation: Conversation; existing: boolean }>>> =>
    api.post('/messages/conversations', data),

  markRead: (id: string): Promise<AxiosResponse<ApiResponse<{ markedAsRead: number }>>> =>
    api.post(`/messages/conversations/${id}/read`),

  sendMessage: (conversationId: string, content: string, attachments?: Array<{ type: string; url: string; name: string }>): Promise<AxiosResponse<ApiResponse<{ message: ConversationMessage }>>> =>
    api.post(`/messages/conversations/${conversationId}/messages`, { content, attachments }),

  editMessage: (messageId: string, content: string): Promise<AxiosResponse<ApiResponse<{ message: ConversationMessage }>>> =>
    api.patch(`/messages/messages/${messageId}`, { content }),

  deleteMessage: (messageId: string): Promise<AxiosResponse<ApiResponse<void>>> =>
    api.delete(`/messages/messages/${messageId}`),

  getUnreadCount: (): Promise<AxiosResponse<ApiResponse<{ unreadCount: number }>>> =>
    api.get('/messages/unread-count'),
};

// =============================================================================
// Tournaments API
// =============================================================================

export interface Tournament {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location?: string;
  courseName?: string;
  city?: string;
  tournamentType?: string;
  level?: string;
  format?: string;
  entryFee?: number;
  maxParticipants?: number;
  currentParticipants?: number;
  registrationDeadline?: string;
  status?: string;
  description?: string;
}

export interface TournamentResult {
  id: string;
  name: string;
  date: string;
  location: string;
  result: {
    position: number;
    score: number;
    field: number;
  };
}

export const tournamentsAPI = {
  getAll: (): Promise<AxiosResponse<ApiResponse<Tournament[]>>> =>
    api.get('/calendar/tournaments'),

  getMy: (): Promise<AxiosResponse<ApiResponse<{ registered: Tournament[]; pastResults: TournamentResult[] }>>> =>
    api.get('/calendar/my-tournaments'),

  getExternal: (): Promise<AxiosResponse<ApiResponse<{ tournaments: Tournament[] }>>> =>
    api.get('/calendar/external-tournaments'),

  addToCalendar: (tournamentId: string, data?: Record<string, unknown>): Promise<AxiosResponse<ApiResponse<void>>> =>
    api.post('/calendar/add-tournament', { tournamentId, ...data }),

  recordResult: (data: { tournamentId: string; playerId: string; position: number; score: number; totalField: number }): Promise<AxiosResponse<ApiResponse<TournamentResult>>> =>
    api.post('/calendar/tournament-result', data),
};

// =============================================================================
// Export API (PDF/Excel)
// =============================================================================

export const exportAPI = {
  playerReport: (playerId: string): Promise<AxiosResponse<Blob>> =>
    api.get(`/export/player/${playerId}/report`, { responseType: 'blob' }),

  testResults: (params: { playerId?: string; startDate?: string; endDate?: string; testId?: string } = {}): Promise<AxiosResponse<Blob>> =>
    api.get('/export/test-results', { params, responseType: 'blob' }),

  trainingSessions: (params: { playerId?: string; startDate?: string; endDate?: string } = {}): Promise<AxiosResponse<Blob>> =>
    api.get('/export/training-sessions', { params, responseType: 'blob' }),

  statistics: (): Promise<AxiosResponse<Blob>> =>
    api.get('/export/statistics', { responseType: 'blob' }),

  trainingPlan: (playerId: string): Promise<AxiosResponse<Blob>> =>
    api.get(`/export/training-plan/${playerId}`, { responseType: 'blob' }),
};

// =============================================================================
// Videos API
// =============================================================================

export interface Video {
  id: string;
  title: string;
  description?: string;
  playerId: string;
  category: 'swing' | 'putting' | 'short_game' | 'other';
  clubType?: string;
  viewAngle?: 'face_on' | 'down_the_line' | 'overhead' | 'side';
  status: 'processing' | 'ready' | 'reviewed' | 'failed' | 'deleted';
  duration?: number;
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoRequest {
  id: string;
  playerId: string;
  drillType?: string;
  category?: string;
  viewAngle?: string;
  instructions?: string;
  dueDate?: string;
  status: 'pending' | 'fulfilled' | 'expired' | 'cancelled';
  createdAt: string;
}

export const videosAPI = {
  list: (params: { playerId?: string; category?: string; status?: string; limit?: number; offset?: number } = {}): Promise<AxiosResponse<ApiResponse<{ videos: Video[]; total: number }>>> =>
    api.get('/videos', { params }),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<Video>>> =>
    api.get(`/videos/${id}`),

  getPlaybackUrl: (id: string, expiresIn?: number): Promise<AxiosResponse<ApiResponse<{ url: string; expiresAt: string }>>> =>
    api.get(`/videos/${id}/playback`, { params: { expiresIn } }),

  getThumbnailUrl: (id: string): Promise<AxiosResponse<ApiResponse<{ url: string | null; expiresAt: string | null }>>> =>
    api.get(`/videos/${id}/thumbnail`),

  initiateUpload: (data: { clientUploadId: string; title: string; playerId: string; fileName: string; fileSize: number; mimeType: string; category?: string; viewAngle?: string; description?: string }): Promise<AxiosResponse<ApiResponse<{ videoId: string; uploadId: string; key: string; signedUrls: string[] }>>> =>
    api.post('/videos/upload/init', data),

  completeUpload: (data: { videoId: string; uploadId: string; parts: Array<{ etag: string; partNumber: number }>; duration?: number; width?: number; height?: number }): Promise<AxiosResponse<ApiResponse<{ video: Video }>>> =>
    api.post('/videos/upload/complete', data),

  update: (id: string, data: Partial<Video>): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.patch(`/videos/${id}`, data),

  delete: (id: string, hardDelete = false): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.delete(`/videos/${id}`, { params: { hardDelete } }),

  share: (id: string, playerIds: string[]): Promise<AxiosResponse<ApiResponse<{ shared: number; alreadyShared: number }>>> =>
    api.post(`/videos/${id}/share`, { playerIds }),

  getShares: (id: string): Promise<AxiosResponse<ApiResponse<{ shares: Array<{ playerId: string; sharedAt: string }> }>>> =>
    api.get(`/videos/${id}/shares`),

  removeShare: (id: string, playerId: string): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.delete(`/videos/${id}/shares/${playerId}`),

  createRequest: (data: { playerId: string; drillType?: string; category?: string; viewAngle?: string; instructions?: string; dueDate?: string }): Promise<AxiosResponse<ApiResponse<VideoRequest>>> =>
    api.post('/videos/requests', data),

  listRequests: (params: { playerId?: string; status?: string; limit?: number; offset?: number } = {}): Promise<AxiosResponse<ApiResponse<{ requests: VideoRequest[]; total: number }>>> =>
    api.get('/videos/requests', { params }),

  updateRequest: (id: string, data: { status: string; fulfilledVideoId?: string }): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.patch(`/videos/requests/${id}`, data),
};

// =============================================================================
// Player Insights API (SG Journey, Skill DNA, Bounty Board)
// =============================================================================

export interface SGJourney {
  currentLevel: string;
  sgTotal: number;
  progress: number;
  nextMilestone: string;
  distanceToNext: number;
}

export interface SkillDNA {
  fingerprint: Record<string, number>;
  proMatch?: { name: string; similarity: number };
  strengths: string[];
  weaknesses: string[];
}

export interface Bounty {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  progress: number;
  status: 'available' | 'active' | 'completed' | 'expired';
  reward: string;
  deadline?: string;
}

export const playerInsightsAPI = {
  getAll: (playerId?: string): Promise<AxiosResponse<ApiResponse<{ sgJourney: SGJourney; skillDNA: SkillDNA; bountyBoard: Bounty[] }>>> =>
    api.get('/player-insights', { params: { playerId } }),

  getSGJourney: (playerId?: string): Promise<AxiosResponse<ApiResponse<SGJourney>>> =>
    api.get('/player-insights/sg-journey', { params: { playerId } }),

  getSkillDNA: (playerId?: string): Promise<AxiosResponse<ApiResponse<SkillDNA>>> =>
    api.get('/player-insights/skill-dna', { params: { playerId } }),

  getBountyBoard: (playerId?: string): Promise<AxiosResponse<ApiResponse<Bounty[]>>> =>
    api.get('/player-insights/bounty-board', { params: { playerId } }),

  activateBounty: (bountyId: string, playerId?: string): Promise<AxiosResponse<ApiResponse<Bounty>>> =>
    api.post(`/player-insights/bounty/${bountyId}/activate`, {}, { params: { playerId } }),

  updateBountyProgress: (bountyId: string, newValue: number, playerId?: string): Promise<AxiosResponse<ApiResponse<Bounty>>> =>
    api.put(`/player-insights/bounty/${bountyId}/progress`, { newValue }, { params: { playerId } }),
};

// =============================================================================
// Focus Engine API
// =============================================================================

export interface FocusRecommendation {
  playerId: string;
  playerName: string;
  focusComponent: 'OTT' | 'APP' | 'ARG' | 'PUTT';
  focusScores: Record<string, number>;
  recommendedSplit: Record<string, number>;
  reasonCodes: string[];
  confidence: 'low' | 'med' | 'high';
  approachWeakestBucket?: string;
  computedAt: string;
}

export interface ComponentWeights {
  windowStartSeason: number;
  windowEndSeason: number;
  wOtt: number;
  wApp: number;
  wArg: number;
  wPutt: number;
  computedAt: string;
}

export const focusEngineAPI = {
  getWeights: (): Promise<AxiosResponse<ApiResponse<ComponentWeights>>> =>
    api.get('/focus-engine/weights'),

  getMyFocus: (includeApproachDetail = false): Promise<AxiosResponse<ApiResponse<FocusRecommendation>>> =>
    api.get('/focus-engine/me/focus', { params: { includeApproachDetail } }),

  getUserFocus: (userId: string, includeApproachDetail = false): Promise<AxiosResponse<ApiResponse<FocusRecommendation>>> =>
    api.get(`/focus-engine/users/${userId}/focus`, { params: { includeApproachDetail } }),

  getTeamFocus: (coachId: string, teamId: string): Promise<AxiosResponse<ApiResponse<{ teamId: string; playerCount: number; heatmap: Record<string, unknown>; topReasonCodes: string[]; atRiskPlayers: Array<Record<string, unknown>> }>>> =>
    api.get(`/focus-engine/coaches/${coachId}/teams/${teamId}/focus`),

  getStats: (): Promise<AxiosResponse<ApiResponse<{ playerSeasons: number; approachSkills: number; weightsComputed: number; currentWeights: ComponentWeights | null; latestSeason: number | null }>>> =>
    api.get('/focus-engine/stats'),
};

// =============================================================================
// Archive API
// =============================================================================

export interface ArchivedItem {
  id: string;
  entityType: string;
  entityId: string;
  entityData: Record<string, unknown>;
  archivedAt: string;
  reason?: string;
}

export const archiveAPI = {
  list: (entityType?: string): Promise<AxiosResponse<ApiResponse<ArchivedItem[]>>> =>
    api.get('/archive', { params: { entityType } }),

  getCount: (): Promise<AxiosResponse<ApiResponse<{ total: number; byType: Record<string, number> }>>> =>
    api.get('/archive/count'),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<ArchivedItem>>> =>
    api.get(`/archive/${id}`),

  archive: (data: { entityType: string; entityId: string; reason?: string }): Promise<AxiosResponse<ApiResponse<ArchivedItem>>> =>
    api.post('/archive', data),

  restore: (id: string): Promise<AxiosResponse<ApiResponse<{ restored: boolean; entityType: string; entityId: string }>>> =>
    api.post(`/archive/${id}/restore`),

  bulkDelete: (archiveIds: string[]): Promise<AxiosResponse<ApiResponse<{ deleted: number }>>> =>
    api.post('/archive/bulk-delete', { archiveIds }),

  delete: (id: string): Promise<AxiosResponse<ApiResponse<{ deleted: boolean }>>> =>
    api.delete(`/archive/${id}`),
};

// =============================================================================
// Intake API (Player Onboarding)
// =============================================================================

export interface PlayerIntake {
  id: string;
  playerId: string;
  tenantId: string;
  completionPercentage: number;
  isComplete: boolean;
  background?: Record<string, unknown>;
  availability?: Record<string, unknown>;
  goals?: Record<string, unknown>;
  weaknesses?: Record<string, unknown>;
  health?: Record<string, unknown>;
  lifestyle?: Record<string, unknown>;
  equipment?: Record<string, unknown>;
  learning?: Record<string, unknown>;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const intakeAPI = {
  submit: (data: { playerId: string } & Partial<Omit<PlayerIntake, 'id' | 'playerId' | 'tenantId' | 'completionPercentage' | 'isComplete'>>): Promise<AxiosResponse<ApiResponse<{ id: string; completionPercentage: number; isComplete: boolean }>>> =>
    api.post('/intake', data),

  getForPlayer: (playerId: string): Promise<AxiosResponse<ApiResponse<PlayerIntake>>> =>
    api.get(`/intake/player/${playerId}`),

  generatePlan: (intakeId: string): Promise<AxiosResponse<ApiResponse<{ annualPlan: Record<string, unknown>; periodizations: unknown[]; dailyAssignments: unknown[]; tournaments: unknown[] }>>> =>
    api.post(`/intake/${intakeId}/generate-plan`),

  getTenantIntakes: (tenantId: string, params: { isComplete?: string; hasGeneratedPlan?: string } = {}): Promise<AxiosResponse<ApiResponse<PlayerIntake[]>>> =>
    api.get(`/intake/tenant/${tenantId}`, { params }),

  delete: (intakeId: string): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.delete(`/intake/${intakeId}`),
};

// =============================================================================
// Season API (Baseline Management)
// =============================================================================

export interface SeasonBaseline {
  id: string;
  userId: string;
  season: number;
  baselineType: 'season_average' | 'last_8_rounds';
  baselineScore: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface BaselineRecommendation {
  recommended: 'season_average' | 'last_8_rounds';
  confidence: number;
  reasoning: string[];
  metrics: {
    last8StdDev: number;
    seasonStdDev: number;
    trendDirection: 'improving' | 'declining' | 'stable';
    trendStrength: number;
    consistencyScore: number;
  };
}

export const seasonAPI = {
  getRecommendation: (season: number): Promise<AxiosResponse<BaselineRecommendation>> =>
    api.get('/season/recommendation', { params: { season } }),

  setBaseline: (data: { season: number; baselineType: 'season_average' | 'last_8_rounds'; baselineScore: number; metadata?: Record<string, unknown> }): Promise<AxiosResponse<SeasonBaseline>> =>
    api.post('/season/baseline', data),

  getBaseline: (season: number): Promise<AxiosResponse<SeasonBaseline>> =>
    api.get('/season/baseline', { params: { season } }),
};

// =============================================================================
// Breaking Points API
// =============================================================================

export interface BreakingPoint {
  id: string;
  playerId: string;
  title: string;
  description?: string;
  domain: string;
  proofMetric?: string;
  baselineValue?: number;
  targetValue?: number;
  currentValue?: number;
  progressPercent: number;
  effortPercent: number;
  status: 'identified' | 'active' | 'improving' | 'resolved' | 'stalled';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

export const breakingPointsAPI = {
  list: (params: { playerId?: string; status?: string; priority?: string; limit?: number; offset?: number } = {}): Promise<AxiosResponse<ApiResponse<{ breakingPoints: BreakingPoint[]; total: number }>>> =>
    api.get('/breaking-points', { params }),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<BreakingPoint>>> =>
    api.get(`/breaking-points/${id}`),

  create: (data: Partial<BreakingPoint>): Promise<AxiosResponse<ApiResponse<BreakingPoint>>> =>
    api.post('/breaking-points', data),

  update: (id: string, data: Partial<BreakingPoint>): Promise<AxiosResponse<ApiResponse<BreakingPoint>>> =>
    api.patch(`/breaking-points/${id}`, data),

  delete: (id: string): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.delete(`/breaking-points/${id}`),

  updateProgress: (id: string, data: { currentValue?: number; notes?: string }): Promise<AxiosResponse<ApiResponse<BreakingPoint>>> =>
    api.post(`/breaking-points/${id}/progress`, data),

  getEvidence: (id: string): Promise<AxiosResponse<ApiResponse<{ effortPercent: number; progressPercent: number; sessionsCompleted: number; benchmarkResults: unknown[] }>>> =>
    api.get(`/breaking-points/${id}/evidence`),

  recordEffort: (id: string): Promise<AxiosResponse<ApiResponse<{ effortPercent: number }>>> =>
    api.post(`/breaking-points/${id}/effort`),

  evaluateBenchmark: (id: string, data: { testResultId: string; value: number }): Promise<AxiosResponse<ApiResponse<{ progressPercent: number; improved: boolean }>>> =>
    api.post(`/breaking-points/${id}/benchmark`, data),

  configureEvidence: (id: string, data: { domain?: string; proofMetric?: string; baselineValue?: number; targetValue?: number }): Promise<AxiosResponse<ApiResponse<BreakingPoint>>> =>
    api.patch(`/breaking-points/${id}/evidence`, data),

  applyTransition: (id: string): Promise<AxiosResponse<ApiResponse<{ transitionApplied: boolean; newStatus?: string }>>> =>
    api.post(`/breaking-points/${id}/transition`),
};

// =============================================================================
// Filters API (Saved Filters for Coach)
// =============================================================================

export interface FilterCriteria {
  categories?: string[];
  gender?: string;
  ageRange?: { min: number; max: number };
  handicapRange?: { min: number; max: number };
  testNumbers?: number[];
  dateRange?: { from: string; to: string };
  testStatus?: 'passed' | 'failed' | 'all';
  minCompletionRate?: number;
}

export interface SavedFilter {
  id: string;
  coachId: string;
  tenantId: string;
  name: string;
  description?: string;
  filters: FilterCriteria;
  createdAt: string;
  updatedAt: string;
}

export const filtersAPI = {
  list: (coachId: string): Promise<AxiosResponse<ApiResponse<SavedFilter[]>>> =>
    api.get('/filters', { params: { coachId } }),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<SavedFilter>>> =>
    api.get(`/filters/${id}`),

  create: (data: { coachId: string; name: string; description?: string; filters: FilterCriteria }): Promise<AxiosResponse<ApiResponse<SavedFilter>>> =>
    api.post('/filters', data),

  update: (id: string, data: { name?: string; description?: string; filters?: FilterCriteria }): Promise<AxiosResponse<ApiResponse<SavedFilter>>> =>
    api.put(`/filters/${id}`, data),

  delete: (id: string): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.delete(`/filters/${id}`),

  apply: (data: { filters: FilterCriteria; limit?: number; offset?: number }): Promise<AxiosResponse<ApiResponse<{ players: Player[]; total: number }>>> =>
    api.post('/filters/apply', data),

  getSuggestions: (): Promise<AxiosResponse<ApiResponse<{ categories: string[]; genders: string[]; handicapRange: { min: number; max: number } }>>> =>
    api.get('/filters/suggestions'),
};

// =============================================================================
// Admin Types
// =============================================================================

export interface SystemStatus {
  environment: 'production' | 'staging' | 'development';
  version: string;
  uptimeHours: number;
  uptime: number;
  timestamp: string;
  counts: {
    users: number;
    coaches: number;
    players: number;
  };
  responseTime: number;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  rolloutPercentage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupportCase {
  id: string;
  title: string;
  description?: string;
  category?: string;
  priority: string;
  status: string;
  reportedById: string;
  resolution?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: Record<string, boolean>;
  active: boolean;
}

// =============================================================================
// Admin API
// =============================================================================

export const adminAPI = {
  // System Status
  getSystemStatus: (): Promise<AxiosResponse<{ data: SystemStatus }>> =>
    api.get('/admin/system/status'),

  // Feature Flags
  getFeatureFlags: (): Promise<AxiosResponse<{ data: FeatureFlag[] }>> =>
    api.get('/admin/feature-flags'),

  createFeatureFlag: (data: { key: string; name: string; description?: string; enabled?: boolean }): Promise<AxiosResponse<{ data: FeatureFlag }>> =>
    api.post('/admin/feature-flags', data),

  updateFeatureFlag: (id: string, data: { name?: string; description?: string; enabled?: boolean; rolloutPercentage?: number }): Promise<AxiosResponse<{ data: FeatureFlag }>> =>
    api.patch(`/admin/feature-flags/${id}`, data),

  deleteFeatureFlag: (id: string): Promise<AxiosResponse<{ success: boolean }>> =>
    api.delete(`/admin/feature-flags/${id}`),

  // Support Cases
  getSupportCases: (status?: string): Promise<AxiosResponse<{ data: SupportCase[] }>> =>
    api.get('/admin/support-cases', { params: status ? { status } : {} }),

  getSupportCase: (id: string): Promise<AxiosResponse<{ data: SupportCase }>> =>
    api.get(`/admin/support-cases/${id}`),

  createSupportCase: (data: { title: string; description?: string; category?: string; priority?: string }): Promise<AxiosResponse<{ data: SupportCase }>> =>
    api.post('/admin/support-cases', data),

  updateSupportCase: (id: string, data: { status?: string; resolution?: string; priority?: string }): Promise<AxiosResponse<{ data: SupportCase }>> =>
    api.patch(`/admin/support-cases/${id}`, data),

  // Tiers
  getTiers: (): Promise<AxiosResponse<{ data: { tiers: SubscriptionTier[] } }>> =>
    api.get('/admin/tiers'),

  updateTier: (id: string, data: { active?: boolean }): Promise<AxiosResponse<{ data: SubscriptionTier }>> =>
    api.patch(`/admin/tiers/${id}`, data),
};

// =============================================================================
// Training Stats API
// =============================================================================

export interface WeeklyTrainingStats {
  id: string;
  playerId: string;
  year: number;
  weekNumber: number;
  weekStartDate: string;
  weekEndDate: string;
  plannedSessions: number;
  completedSessions: number;
  skippedSessions: number;
  completionRate: number;
  plannedMinutes: number;
  actualMinutes: number;
  sessionTypeBreakdown: Record<string, number>;
  learningPhaseMinutes: Record<string, number>;
  avgQuality?: number;
  avgFocus?: number;
  avgIntensity?: number;
  currentStreak: number;
  period?: string;
  calculatedAt: string;
}

export interface MonthlyTrainingStats {
  id: string;
  playerId: string;
  year: number;
  month: number;
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  totalMinutes: number;
  avgMinutesPerSession: number;
  avgMinutesPerDay: number;
  sessionTypeBreakdown: Record<string, number>;
  avgQuality?: number;
  avgFocus?: number;
  testsCompleted: number;
  testsPassed: number;
  badgesEarned: number;
}

export interface DailyTrainingStats {
  id: string;
  playerId: string;
  date: string;
  plannedSessions: number;
  completedSessions: number;
  plannedMinutes: number;
  actualMinutes: number;
  sessions: unknown[];
  avgQuality?: number;
  avgFocus?: number;
  streakDay: number;
}

export const trainingStatsAPI = {
  getWeeklyStats: (playerId: string, params?: { year?: number; weekNumber?: number; startDate?: string; endDate?: string }): Promise<AxiosResponse<ApiResponse<WeeklyTrainingStats[]>>> =>
    api.get(`/training-stats/players/${playerId}/weekly`, { params }),

  getMonthlyStats: (playerId: string, params?: { year?: number; month?: number }): Promise<AxiosResponse<ApiResponse<MonthlyTrainingStats[]>>> =>
    api.get(`/training-stats/players/${playerId}/monthly`, { params }),

  getDailyStats: (playerId: string, params?: { startDate?: string; endDate?: string }): Promise<AxiosResponse<ApiResponse<DailyTrainingStats[]>>> =>
    api.get(`/training-stats/players/${playerId}/daily`, { params }),

  calculateWeeklyStats: (playerId: string, data: { year: number; weekNumber: number }): Promise<AxiosResponse<ApiResponse<WeeklyTrainingStats>>> =>
    api.post(`/training-stats/players/${playerId}/weekly/calculate`, data),

  getTeamStats: (params: { year: string; weekNumber?: string }): Promise<AxiosResponse<ApiResponse<{ teamSummary: unknown; playerStats: WeeklyTrainingStats[] }>>> =>
    api.get('/training-stats/team', { params }),
};

// =============================================================================
// Chat API
// =============================================================================

export interface ChatGroup {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  groupType: 'direct' | 'team' | 'academy' | 'coach_player';
  avatarUrl?: string;
  avatarInitials?: string;
  avatarColor?: string;
  isArchived: boolean;
  isMuted: boolean;
  lastMessageAt?: string;
  createdAt: string;
  unreadCount?: number;
  lastMessage?: ChatMessage;
}

export interface ChatGroupMember {
  id: string;
  groupId: string;
  memberType: 'player' | 'coach' | 'parent';
  memberId: string;
  role: 'admin' | 'member';
  lastReadAt?: string;
  unreadCount: number;
  isMuted: boolean;
  notificationsEnabled: boolean;
}

export interface ChatMessage {
  id: string;
  groupId: string;
  senderType: string;
  senderId?: string;
  messageType: 'text' | 'image' | 'video' | 'file' | 'system';
  content: string;
  metadata?: Record<string, unknown>;
  replyToId?: string;
  replyTo?: { id: string; content: string; senderType: string; senderId?: string };
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
}

export const chatAPI = {
  // Groups
  createGroup: (data: { name: string; description?: string; groupType: string; memberIds: Array<{ type: string; id: string }> }): Promise<AxiosResponse<ApiResponse<ChatGroup>>> =>
    api.post('/chat/groups', data),

  getGroups: (): Promise<AxiosResponse<ApiResponse<ChatGroup[]>>> =>
    api.get('/chat/groups'),

  getGroup: (groupId: string): Promise<AxiosResponse<ApiResponse<ChatGroup>>> =>
    api.get(`/chat/groups/${groupId}`),

  leaveGroup: (groupId: string): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.post(`/chat/groups/${groupId}/leave`),

  archiveGroup: (groupId: string): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.post(`/chat/groups/${groupId}/archive`),

  // Messages
  getMessages: (groupId: string, params?: { limit?: number; before?: string }): Promise<AxiosResponse<ApiResponse<ChatMessage[]>>> =>
    api.get(`/chat/groups/${groupId}/messages`, { params }),

  sendMessage: (groupId: string, data: { content: string; messageType?: string; metadata?: Record<string, unknown>; replyToId?: string }): Promise<AxiosResponse<ApiResponse<ChatMessage>>> =>
    api.post(`/chat/groups/${groupId}/messages`, data),

  editMessage: (groupId: string, messageId: string, data: { content: string }): Promise<AxiosResponse<ApiResponse<ChatMessage>>> =>
    api.patch(`/chat/groups/${groupId}/messages/${messageId}`, data),

  deleteMessage: (groupId: string, messageId: string): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.delete(`/chat/groups/${groupId}/messages/${messageId}`),

  markAsRead: (groupId: string): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.post(`/chat/groups/${groupId}/read`),
};

// =============================================================================
// Support Cases API (Direct endpoints, separate from admin)
// =============================================================================

export const supportAPI = {
  create: (data: { title: string; description?: string; priority?: string; category?: string }): Promise<AxiosResponse<ApiResponse<SupportCase>>> =>
    api.post('/support', data),

  list: (params?: { status?: string; priority?: string; category?: string; page?: number; limit?: number }): Promise<AxiosResponse<ApiResponse<{ cases: SupportCase[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>>> =>
    api.get('/support', { params }),

  getById: (caseId: string): Promise<AxiosResponse<ApiResponse<SupportCase>>> =>
    api.get(`/support/${caseId}`),

  update: (caseId: string, data: { title?: string; description?: string; status?: string; priority?: string; category?: string; resolution?: string }): Promise<AxiosResponse<ApiResponse<SupportCase>>> =>
    api.patch(`/support/${caseId}`, data),

  delete: (caseId: string): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.delete(`/support/${caseId}`),

  getStats: (): Promise<AxiosResponse<ApiResponse<{ byStatus: Record<string, number>; urgent: number; highPriority: number; total: number }>>> =>
    api.get('/support/stats'),
};

// =============================================================================
// Feature Flags API (Direct endpoints)
// =============================================================================

export const featureFlagsAPI = {
  list: (): Promise<AxiosResponse<ApiResponse<FeatureFlag[]>>> =>
    api.get('/feature-flags'),

  getByKey: (key: string): Promise<AxiosResponse<ApiResponse<FeatureFlag>>> =>
    api.get(`/feature-flags/${key}`),

  create: (data: { key: string; name: string; description?: string; enabled?: boolean; rolloutPercentage?: number }): Promise<AxiosResponse<ApiResponse<FeatureFlag>>> =>
    api.post('/feature-flags', data),

  update: (key: string, data: { name?: string; description?: string; enabled?: boolean; rolloutPercentage?: number }): Promise<AxiosResponse<ApiResponse<FeatureFlag>>> =>
    api.patch(`/feature-flags/${key}`, data),

  toggle: (key: string): Promise<AxiosResponse<ApiResponse<FeatureFlag>>> =>
    api.post(`/feature-flags/${key}/toggle`),

  delete: (key: string): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.delete(`/feature-flags/${key}`),

  // User-facing
  getEnabledForMe: (): Promise<AxiosResponse<ApiResponse<string[]>>> =>
    api.get('/feature-flags/me'),

  checkFlag: (key: string): Promise<AxiosResponse<ApiResponse<{ key: string; enabled: boolean }>>> =>
    api.get('/feature-flags/check', { params: { key } }),
};

// =============================================================================
// Audit API
// =============================================================================

export interface AuditEvent {
  id: string;
  tenantId: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  subjectId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  createdAt: string;
  actor?: { id: string; firstName: string; lastName: string; email: string; role?: string };
}

export const auditAPI = {
  list: (params?: { action?: string; resourceType?: string; resourceId?: string; actorId?: string; startDate?: string; endDate?: string; page?: number; limit?: number }): Promise<AxiosResponse<ApiResponse<{ events: AuditEvent[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>>> =>
    api.get('/audit', { params }),

  getStats: (params?: { days?: number }): Promise<AxiosResponse<ApiResponse<{ totalEvents: number; periodDays: number; byAction: Array<{ action: string; count: number }>; byResourceType: Array<{ resourceType: string; count: number }>; topActors: Array<{ actor: unknown; count: number }>; dailyTrend: Array<{ date: string; count: number }> }>>> =>
    api.get('/audit/stats', { params }),

  search: (params: { q: string; limit?: number }): Promise<AxiosResponse<ApiResponse<AuditEvent[]>>> =>
    api.get('/audit/search', { params }),

  getResourceHistory: (resourceType: string, resourceId: string): Promise<AxiosResponse<ApiResponse<AuditEvent[]>>> =>
    api.get(`/audit/resource/${resourceType}/${resourceId}`),

  getActorHistory: (actorId: string): Promise<AxiosResponse<ApiResponse<AuditEvent[]>>> =>
    api.get(`/audit/actor/${actorId}`),
};

// =============================================================================
// AI Conversations API
// =============================================================================

export interface AIConversation {
  id: string;
  playerId: string;
  title?: string;
  messages: Array<{ role: string; content: string; timestamp: string }>;
  context?: Record<string, unknown>;
  totalInputTokens: number;
  totalOutputTokens: number;
  toolsUsed: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIUsageStats {
  totalConversations: number;
  totalMessages: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  last30Days: {
    conversations: number;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export const aiConversationsAPI = {
  create: (data?: { title?: string; context?: Record<string, unknown> }): Promise<AxiosResponse<ApiResponse<AIConversation>>> =>
    api.post('/ai-conversations', data || {}),

  list: (params?: { isActive?: boolean; limit?: number; offset?: number }): Promise<AxiosResponse<ApiResponse<{ conversations: AIConversation[]; pagination: { limit: number; offset: number; total: number } }>>> =>
    api.get('/ai-conversations', { params }),

  getById: (conversationId: string): Promise<AxiosResponse<ApiResponse<AIConversation>>> =>
    api.get(`/ai-conversations/${conversationId}`),

  getActive: (): Promise<AxiosResponse<ApiResponse<AIConversation>>> =>
    api.get('/ai-conversations/active'),

  getStats: (): Promise<AxiosResponse<ApiResponse<AIUsageStats>>> =>
    api.get('/ai-conversations/stats'),

  addMessage: (conversationId: string, data: { role: 'user' | 'assistant' | 'system'; content: string; inputTokens?: number; outputTokens?: number; toolsUsed?: string[] }): Promise<AxiosResponse<ApiResponse<AIConversation>>> =>
    api.post(`/ai-conversations/${conversationId}/messages`, data),

  updateTitle: (conversationId: string, data: { title: string }): Promise<AxiosResponse<ApiResponse<AIConversation>>> =>
    api.patch(`/ai-conversations/${conversationId}`, data),

  archive: (conversationId: string): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.post(`/ai-conversations/${conversationId}/archive`),

  delete: (conversationId: string): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.delete(`/ai-conversations/${conversationId}`),
};

// =============================================================================
// Samling API (Training Camps)
// =============================================================================

export interface Samling {
  id: string;
  tenantId: string;
  coachId: string;
  name: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate: string;
  maxParticipants?: number;
  status: 'draft' | 'published' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  participants?: SamlingParticipant[];
  sessions?: SamlingSession[];
}

export interface SamlingParticipant {
  playerId: string;
  status: 'invited' | 'confirmed' | 'declined' | 'waitlist';
  registeredAt?: string;
  player?: {
    id: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface SamlingSession {
  id: string;
  samlingId: string;
  title: string;
  description?: string;
  sessionDate: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  sessionType?: string;
}

export const samlingAPI = {
  create: (data: { name: string; description?: string; location?: string; startDate: string; endDate: string; maxParticipants?: number }): Promise<AxiosResponse<ApiResponse<Samling>>> =>
    api.post('/samling', data),

  list: (params?: { status?: string; upcoming?: boolean; limit?: number; offset?: number }): Promise<AxiosResponse<ApiResponse<{ samlinger: Samling[]; total: number }>>> =>
    api.get('/samling', { params }),

  getById: (id: string): Promise<AxiosResponse<ApiResponse<Samling>>> =>
    api.get(`/samling/${id}`),

  update: (id: string, data: Partial<{ name: string; description?: string; location?: string; startDate: string; endDate: string; maxParticipants?: number }>): Promise<AxiosResponse<ApiResponse<Samling>>> =>
    api.put(`/samling/${id}`, data),

  delete: (id: string): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.delete(`/samling/${id}`),

  publish: (id: string): Promise<AxiosResponse<ApiResponse<Samling>>> =>
    api.post(`/samling/${id}/publish`),

  cancel: (id: string): Promise<AxiosResponse<ApiResponse<Samling>>> =>
    api.post(`/samling/${id}/cancel`),

  complete: (id: string): Promise<AxiosResponse<ApiResponse<Samling>>> =>
    api.post(`/samling/${id}/complete`),

  // Participants
  addParticipants: (id: string, data: { playerIds: string[] }): Promise<AxiosResponse<ApiResponse<Samling>>> =>
    api.post(`/samling/${id}/participants`, data),

  updateParticipantStatus: (samlingId: string, playerId: string, data: { status: 'confirmed' | 'declined' | 'waitlist' }): Promise<AxiosResponse<ApiResponse<Samling>>> =>
    api.put(`/samling/${samlingId}/participants/${playerId}`, data),

  removeParticipant: (samlingId: string, playerId: string): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.delete(`/samling/${samlingId}/participants/${playerId}`),

  // Sessions
  createSession: (samlingId: string, data: { title: string; description?: string; sessionDate: string; startTime?: string; endTime?: string; location?: string; sessionType?: string }): Promise<AxiosResponse<ApiResponse<SamlingSession>>> =>
    api.post(`/samling/${samlingId}/sessions`, data),

  updateSession: (samlingId: string, sessionId: string, data: Partial<{ title: string; description?: string; sessionDate: string; startTime?: string; endTime?: string; location?: string; sessionType?: string }>): Promise<AxiosResponse<ApiResponse<SamlingSession>>> =>
    api.put(`/samling/${samlingId}/sessions/${sessionId}`, data),

  deleteSession: (samlingId: string, sessionId: string): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.delete(`/samling/${samlingId}/sessions/${sessionId}`),

  recordAttendance: (samlingId: string, sessionId: string, data: { attendees: Array<{ playerId: string; status: 'present' | 'absent' | 'late'; notes?: string }> }): Promise<AxiosResponse<ApiResponse<{ success: boolean }>>> =>
    api.post(`/samling/${samlingId}/sessions/${sessionId}/attendance`, data),
};

// =============================================================================
// Sport Config API
// =============================================================================

export type SportIdType = 'GOLF' | 'RUNNING' | 'HANDBALL' | 'FOOTBALL' | 'TENNIS' | 'SWIMMING' | 'JAVELIN';

export interface SportInfo {
  id: SportIdType;
  name: string;
  nameNO: string;
}

export interface SportConfigData {
  id: string;
  tenantId: string;
  sportId: SportIdType;
  trainingAreasOverride: Record<string, unknown> | null;
  environmentsOverride: Record<string, unknown> | null;
  phasesOverride: Record<string, unknown> | null;
  benchmarksOverride: Record<string, unknown> | null;
  terminologyOverride: Record<string, unknown> | null;
  navigationOverride: Record<string, unknown> | null;
  usesHandicap: boolean | null;
  usesClubSpeed: boolean | null;
  usesSG: boolean | null;
  usesAKFormula: boolean | null;
  usesBenchmarks: boolean | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SportConfigResponse {
  success: boolean;
  data: SportConfigData | null;
  sportId: SportIdType;
  hasCustomConfig: boolean;
}

export interface SportConfigInput {
  sportId: SportIdType;
  trainingAreasOverride?: Record<string, unknown>;
  environmentsOverride?: Record<string, unknown>;
  phasesOverride?: Record<string, unknown>;
  benchmarksOverride?: Record<string, unknown>;
  terminologyOverride?: Record<string, unknown>;
  navigationOverride?: Record<string, unknown>;
  usesHandicap?: boolean;
  usesClubSpeed?: boolean;
  usesSG?: boolean;
  usesAKFormula?: boolean;
  usesBenchmarks?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
}

export const sportConfigAPI = {
  /** Get list of available sports */
  getSports: (): Promise<AxiosResponse<{ success: boolean; data: SportInfo[] }>> =>
    api.get('/sport-config/sports'),

  /** Get current tenant's sport configuration */
  getConfig: (): Promise<AxiosResponse<SportConfigResponse>> =>
    api.get('/sport-config'),

  /** Update tenant's sport configuration (admin only) */
  updateConfig: (data: SportConfigInput): Promise<AxiosResponse<{ success: boolean; message: string; data: SportConfigData }>> =>
    api.put('/sport-config', data),

  /** Reset tenant's sport configuration to defaults (admin only) */
  resetConfig: (): Promise<AxiosResponse<{ success: boolean; message: string }>> =>
    api.delete('/sport-config'),

  /** Get all configurations (admin only) */
  getAllConfigs: (): Promise<AxiosResponse<{ success: boolean; data: SportConfigData[]; total: number }>> =>
    api.get('/sport-config/all'),

  /** Get configurations by sport (admin only) */
  getBySport: (sportId: SportIdType): Promise<AxiosResponse<{ success: boolean; data: SportConfigData[]; total: number }>> =>
    api.get(`/sport-config/by-sport/${sportId}`),
};

// =============================================================================
// useApi Hook
// =============================================================================

/**
 * Hook for making API calls with built-in error handling
 * Returns an object with get and post methods
 */
export function useApi() {
  const get = async <T>(url: string): Promise<T> => {
    const response = await api.get<T>(url);
    return response.data;
  };

  const post = async <T>(url: string, data?: unknown): Promise<T> => {
    const response = await api.post<T>(url, data);
    return response.data;
  };

  const put = async <T>(url: string, data?: unknown): Promise<T> => {
    const response = await api.put<T>(url, data);
    return response.data;
  };

  const del = async <T>(url: string): Promise<T> => {
    const response = await api.delete<T>(url);
    return response.data;
  };

  return { get, post, put, delete: del };
}

// =============================================================================
// TrackMan / Launch Monitor API
// =============================================================================

export const trackmanAPI = {
  createSession: (data: { playerId: string; deviceType: string; location?: string; notes?: string }): Promise<AxiosResponse<{ success: boolean; data: any }>> =>
    api.post('/trackman/sessions', data),

  addShot: (data: {
    sessionId: string;
    club: string;
    ballSpeed?: number;
    clubSpeed?: number;
    launchAngle?: number;
    spinRate?: number;
    carryDistance?: number;
    totalDistance?: number;
    smashFactor?: number;
    attackAngle?: number;
    clubPath?: number;
    faceAngle?: number;
  }): Promise<AxiosResponse<{ success: boolean; data: any }>> =>
    api.post('/trackman/shots', data),

  getSession: (sessionId: string): Promise<AxiosResponse<{ success: boolean; data: any }>> =>
    api.get(`/trackman/sessions/${sessionId}`),

  getClubGapping: (playerId: string): Promise<AxiosResponse<{ success: boolean; data: any[] }>> =>
    api.get(`/trackman/club-gapping/${playerId}`),
};

// =============================================================================
// Export
// =============================================================================

export default api;

/**
 * API Client - Axios instance with auth and error handling
 * TypeScript version with proper types
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// =============================================================================
// Types
// =============================================================================

export interface ApiError {
  type: string;
  message: string;
  details?: unknown;
  status: number;
}

export interface ApiErrorResponse {
  type?: string;
  message?: string;
  details?: unknown;
}

// =============================================================================
// API Client Configuration
// =============================================================================

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000, // 30 second timeout
});

// =============================================================================
// Request Interceptor - Add Auth Token
// =============================================================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError): Promise<never> => {
    return Promise.reject(error);
  }
);

// =============================================================================
// Response Interceptor - Handle Errors
// =============================================================================

apiClient.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => response,
  (error: AxiosError<ApiErrorResponse>): Promise<never> => {
    if (error.response) {
      // Server responded with error
      const errorData = error.response.data;

      // Handle 401 - redirect to login (unless already on login page)
      if (error.response.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userData');
        // Avoid redirect loop on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      // Handle 403 - log forbidden access attempt
      if (error.response.status === 403) {
        console.warn('[Auth] Forbidden access:', error.config?.url);
      }

      // Return standardized error
      const apiError: ApiError = {
        type: errorData?.type || 'system_failure',
        message: errorData?.message || 'An error occurred',
        details: errorData?.details,
        status: error.response.status,
      };
      return Promise.reject(apiError);
    }

    // Network or timeout error
    const networkError: ApiError = {
      type: 'system_failure',
      message: 'Network error. Please check your connection.',
      status: 0,
    };
    return Promise.reject(networkError);
  }
);

// =============================================================================
// Typed API Methods
// =============================================================================

export const api = {
  get: <T>(url: string, config?: Parameters<typeof apiClient.get>[1]) =>
    apiClient.get<T>(url, config).then(res => res.data),

  post: <T>(url: string, data?: unknown, config?: Parameters<typeof apiClient.post>[2]) =>
    apiClient.post<T>(url, data, config).then(res => res.data),

  put: <T>(url: string, data?: unknown, config?: Parameters<typeof apiClient.put>[2]) =>
    apiClient.put<T>(url, data, config).then(res => res.data),

  patch: <T>(url: string, data?: unknown, config?: Parameters<typeof apiClient.patch>[2]) =>
    apiClient.patch<T>(url, data, config).then(res => res.data),

  delete: <T>(url: string, config?: Parameters<typeof apiClient.delete>[1]) =>
    apiClient.delete<T>(url, config).then(res => res.data),
};

export default apiClient;

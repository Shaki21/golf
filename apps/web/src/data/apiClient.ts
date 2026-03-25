/**
 * API Client
 * TypeScript wrapper around the existing axios-based apiClient
 * Provides typed API methods for the data layer
 */

// Import the existing axios client
import apiClient from '../services/apiClient';

export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ApiError {
  type: string;
  message: string;
  details?: unknown;
  status: number;
}

/**
 * Typed GET request
 */
export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, unknown>
): Promise<T> {
  const response = await apiClient.get(endpoint, { params });
  return response.data;
}

/**
 * Typed POST request
 */
export async function apiPost<T, D = unknown>(
  endpoint: string,
  data?: D
): Promise<T> {
  const response = await apiClient.post(endpoint, data);
  return response.data;
}

/**
 * Typed PUT request
 */
export async function apiPut<T, D = unknown>(
  endpoint: string,
  data?: D
): Promise<T> {
  const response = await apiClient.put(endpoint, data);
  return response.data;
}

/**
 * Typed DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await apiClient.delete(endpoint);
  return response.data;
}

export { apiClient };
export default apiClient;

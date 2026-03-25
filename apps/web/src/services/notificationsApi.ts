/**
 * Notifications API Service
 * TypeScript version with proper types
 * Handles all notification-related API calls
 */

import apiClient from './apiClient';

// =============================================================================
// Types
// =============================================================================

export interface Notification {
  id: string | number;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  readAt?: string | null;
  data?: Record<string, unknown>;
}

export interface GetNotificationsOptions {
  unreadOnly?: boolean;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface MarkReadResponse {
  success: boolean;
  message: string;
}

export interface MarkAllReadResponse {
  success: boolean;
  message: string;
  count: number;
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get notifications for the current user
 */
export async function getNotifications(
  options: GetNotificationsOptions = {}
): Promise<NotificationsResponse> {
  const { unreadOnly = false } = options;

  const params = new URLSearchParams();
  if (unreadOnly) {
    params.append('unreadOnly', '1');
  }

  const response = await apiClient.get<{ data: NotificationsResponse }>(
    `/notifications?${params.toString()}`
  );
  return response.data.data;
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(
  notificationId: string | number
): Promise<MarkReadResponse> {
  const response = await apiClient.patch<MarkReadResponse>(
    `/notifications/${notificationId}/read`
  );
  return response.data;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(): Promise<MarkAllReadResponse> {
  const response = await apiClient.post<MarkAllReadResponse>('/notifications/read-all');
  return response.data;
}

// Default export for backwards compatibility
export default {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
};

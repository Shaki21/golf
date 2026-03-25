/**
 * Annual Plan API Service
 * Handles API calls for annual training plans
 */

import api from './api';
import type { Period } from '../features/coach-annual-plan/components/PeriodDetailPanel';

export interface AnnualPlanData {
  id?: string;
  playerId: string;
  playerName?: string;
  name: string;
  startDate: string;
  endDate: string;
  periods: Period[];
  status?: string;
  createdAt?: string;
}

export interface CreateAnnualPlanPayload {
  playerId: string;
  name: string;
  startDate: string;
  endDate: string;
  periods: Period[];
}

export interface UpdateAnnualPlanPayload {
  name?: string;
  startDate?: string;
  endDate?: string;
  periods?: Period[];
  status?: 'active' | 'completed' | 'paused' | 'cancelled';
}

/**
 * Create a new annual plan
 */
export async function createAnnualPlan(data: CreateAnnualPlanPayload): Promise<AnnualPlanData> {
  const response = await api.post('/coach/annual-plans', data);
  return response.data.data;
}

/**
 * Get annual plan by ID
 */
export async function getAnnualPlanById(planId: string): Promise<AnnualPlanData> {
  const response = await api.get(`/coach/annual-plans/${planId}`);
  return response.data.data;
}

/**
 * Get annual plan by player ID
 */
export async function getAnnualPlanByPlayerId(playerId: string): Promise<AnnualPlanData | null> {
  try {
    const response = await api.get(`/coach/annual-plans/player/${playerId}`);
    return response.data.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * List all annual plans for coach's players
 */
export async function listAnnualPlans(): Promise<AnnualPlanData[]> {
  const response = await api.get('/coach/annual-plans');
  return response.data.data;
}

/**
 * Update annual plan
 */
export async function updateAnnualPlan(
  planId: string,
  data: UpdateAnnualPlanPayload
): Promise<AnnualPlanData> {
  const response = await api.put(`/coach/annual-plans/${planId}`, data);
  return response.data.data;
}

/**
 * Delete annual plan
 */
export async function deleteAnnualPlan(planId: string): Promise<void> {
  await api.delete(`/coach/annual-plans/${planId}`);
}

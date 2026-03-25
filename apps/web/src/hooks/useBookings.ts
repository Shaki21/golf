/**
 * useBookings - Hooks for player booking system
 * TypeScript version with proper types
 *
 * Provides access to:
 * - Coach availability
 * - Booking requests (create, view, cancel)
 * - Player's bookings list
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/apiClient';

// =============================================================================
// Types
// =============================================================================

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AvailabilityDay {
  date: string;
  slots: TimeSlot[];
}

export interface CoachAvailability {
  coachId: string;
  coachName: string;
  availability: AvailabilityDay[];
}

export interface Coach {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  profileImageUrl?: string;
  specialties?: string[];
  bio?: string;
}

export interface BookingCoach {
  firstName: string;
  lastName: string;
  email: string;
}

export interface Booking {
  id: string;
  playerId: string;
  coachId: string;
  coach?: BookingCoach;
  coachName?: string;
  title?: string;
  reason?: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration?: number;
  status: BookingStatus;
  location?: string;
  notes?: string;
  coachNotes?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface CreateBookingData {
  coachId: string;
  date: string;
  startTime: string;
  endTime: string;
  title?: string;
  description?: string;
  location?: string;
}

export interface BookingsResponse {
  bookings: Booking[];
  total?: number;
}

export interface CoachesResponse {
  coaches: Coach[];
}

// Return types for hooks
export interface UseCoachAvailabilityReturn {
  availability: CoachAvailability[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseCreateBookingReturn {
  createBooking: (data: CreateBookingData) => Promise<Booking>;
  loading: boolean;
  error: string | null;
}

export interface UseMyBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseCancelBookingReturn {
  cancelBooking: (bookingId: string, reason?: string) => Promise<Booking>;
  loading: boolean;
  error: string | null;
}

export interface UseUpdateBookingStatusReturn {
  updateStatus: (bookingId: string, status: BookingStatus, notes?: string) => Promise<Booking>;
  loading: boolean;
  error: string | null;
}

export interface UsePlayerCoachesReturn {
  coaches: Coach[];
  loading: boolean;
  error: string | null;
}

// =============================================================================
// Hook Implementations
// =============================================================================

/**
 * Hook for fetching coach availability
 */
export function useCoachAvailability(
  coachId?: string | null,
  dateRange?: DateRange | null
): UseCoachAvailabilityReturn {
  const [data, setData] = useState<CoachAvailability[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async () => {
    if (!dateRange) return;

    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string> = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };

      if (coachId) {
        params.coachId = coachId;
      }

      const response = await apiClient.get<CoachAvailability[]>('/availability', { params });
      setData(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load availability';
      setError(errorMessage);
      console.error('[Bookings] Error fetching availability:', err);
    } finally {
      setLoading(false);
    }
  }, [coachId, dateRange]);

  useEffect(() => {
    if (dateRange) {
      fetchAvailability();
    }
  }, [fetchAvailability, dateRange]);

  return {
    availability: data || [],
    loading,
    error,
    refetch: fetchAvailability,
  };
}

/**
 * Hook for creating a booking request
 */
export function useCreateBooking(): UseCreateBookingReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = useCallback(async (bookingData: CreateBookingData): Promise<Booking> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.post<Booking>('/bookings', bookingData);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      setError(errorMessage);
      console.error('[Bookings] Error creating booking:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createBooking, loading, error };
}

/**
 * Hook for fetching player's bookings
 */
export function useMyBookings(status?: BookingStatus): UseMyBookingsReturn {
  const [data, setData] = useState<BookingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string> = status ? { status } : {};
      const response = await apiClient.get<BookingsResponse>('/bookings', { params });

      setData(response.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bookings';
      setError(errorMessage);
      console.error('[Bookings] Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return {
    bookings: data?.bookings || [],
    loading,
    error,
    refetch: fetchBookings,
  };
}

/**
 * Hook for cancelling a booking
 */
export function useCancelBooking(): UseCancelBookingReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelBooking = useCallback(async (bookingId: string, reason?: string): Promise<Booking> => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.patch<Booking>(`/bookings/${bookingId}/cancel`, { reason });
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to cancel booking';
      setError(errorMessage);
      console.error('[Bookings] Error cancelling booking:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { cancelBooking, loading, error };
}

/**
 * Hook for updating booking status (coach only, but included for completeness)
 */
export function useUpdateBookingStatus(): UseUpdateBookingStatusReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = useCallback(
    async (bookingId: string, status: BookingStatus, notes?: string): Promise<Booking> => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.patch<Booking>(`/bookings/${bookingId}/status`, {
          status,
          notes,
        });
        return response.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update booking status';
        setError(errorMessage);
        console.error('[Bookings] Error updating status:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateStatus, loading, error };
}

/**
 * Hook for fetching player's coaches
 */
export function usePlayerCoaches(): UsePlayerCoachesReturn {
  const [data, setData] = useState<CoachesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<CoachesResponse>('/players/me/coaches');
        setData(response.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load coaches';
        setError(errorMessage);
        console.error('[Bookings] Error fetching coaches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, []);

  return {
    coaches: data?.coaches || [],
    loading,
    error,
  };
}

export default useMyBookings;

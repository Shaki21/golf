/**
 * Weather Hooks
 * Hooks for fetching weather data for golf courses
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';

/**
 * Get weather for a specific course
 */
export function useCourseWeather(courseId, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/weather/course/${courseId}`);
      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load weather');
      console.error('[Weather] Error fetching course weather:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchWeather();
    }
  }, [fetchWeather, options.enabled]);

  return {
    weather: data,
    loading,
    error,
    refetch: fetchWeather,
  };
}

/**
 * Get best courses to play today based on weather
 */
export function useBestCoursesToday(limit = 10) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBestCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/weather/best-courses', {
        params: { limit },
      });
      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load best courses');
      console.error('[Weather] Error fetching best courses:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchBestCourses();
  }, [fetchBestCourses]);

  return {
    courses: data,
    loading,
    error,
    refetch: fetchBestCourses,
  };
}

/**
 * Get weather for courses in a region/city
 */
export function useRegionWeather(city) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRegionWeather = useCallback(async () => {
    if (!city) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/weather/region', {
        params: { city },
      });
      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load region weather');
      console.error('[Weather] Error fetching region weather:', err);
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    fetchRegionWeather();
  }, [fetchRegionWeather]);

  return {
    courses: data,
    loading,
    error,
    refetch: fetchRegionWeather,
  };
}

/**
 * Get wind forecast for a course (24 hours)
 */
export function useWindForecast(courseId, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWindForecast = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/weather/wind/${courseId}`);
      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load wind forecast');
      console.error('[Weather] Error fetching wind forecast:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchWindForecast();
    }
  }, [fetchWindForecast, options.enabled]);

  return {
    forecast: data,
    loading,
    error,
    refetch: fetchWindForecast,
  };
}

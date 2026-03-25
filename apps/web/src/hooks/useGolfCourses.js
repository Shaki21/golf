/**
 * Golf Courses Hooks
 * Hooks for searching and browsing golf courses
 */

import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';

/**
 * Search golf courses
 */
export function useSearchCourses(params = {}) {
  const [data, setData] = useState({ courses: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { query, country, city, limit = 50, offset = 0 } = params;

  const searchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {};
      if (query) queryParams.query = query;
      if (country) queryParams.country = country;
      if (city) queryParams.city = city;
      queryParams.limit = limit;
      queryParams.offset = offset;

      const response = await apiClient.get('/golf-courses/search', {
        params: queryParams,
      });

      setData({
        courses: response.data.courses || [],
        total: response.data.total || 0,
      });
    } catch (err) {
      setError(err.message || 'Failed to search courses');
      console.error('[GolfCourses] Error searching courses:', err);
    } finally {
      setLoading(false);
    }
  }, [query, country, city, limit, offset]);

  useEffect(() => {
    searchCourses();
  }, [searchCourses]);

  return {
    courses: data.courses,
    total: data.total,
    loading,
    error,
    refetch: searchCourses,
  };
}

/**
 * Get Norwegian golf courses
 */
export function useNorwegianCourses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/golf-courses/norway');
      setData(response.data.clubs || []);
    } catch (err) {
      setError(err.message || 'Failed to load Norwegian courses');
      console.error('[GolfCourses] Error fetching Norwegian courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  return {
    clubs: data,
    loading,
    error,
    refetch: fetchCourses,
  };
}

/**
 * Get course by ID
 */
export function useCourse(courseId, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourse = useCallback(async () => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/golf-courses/${courseId}`);
      setData(response.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load course');
      console.error('[GolfCourses] Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (options.enabled !== false) {
      fetchCourse();
    }
  }, [fetchCourse, options.enabled]);

  return {
    course: data,
    loading,
    error,
    refetch: fetchCourse,
  };
}

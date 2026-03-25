/**
 * Hook for fetching TRAJECTORY screen data
 *
 * Handles:
 * - Fetching test history
 * - Filtering by category
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

interface TestResult {
  id: string;
  testName: string;
  category: string;
  value: number;
  unit: string;
  baseline?: number;
  benchmarkDate: Date;
  isFirstTest?: boolean;
}

export function useTrajectoryData(playerId: string) {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch test history
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.tests.getAll();

      // Transform API response to TestResult format
      const transformedTests: TestResult[] = (response.data || response || []).map((test: any, index: number) => ({
        id: test.id || `test-${index}`,
        testName: test.name || test.testName || `Test ${test.testNumber}`,
        category: test.category || 'Generelt',
        value: test.value || test.score || test.result || 0,
        unit: test.unit || '%',
        baseline: test.baseline || test.baselineValue,
        benchmarkDate: new Date(test.date || test.testDate || test.createdAt),
        isFirstTest: index === (response.data || response || []).length - 1, // Last in array is first chronologically
      }));

      // Sort by date descending
      transformedTests.sort((a, b) => b.benchmarkDate.getTime() - a.benchmarkDate.getTime());

      // Mark actual first test
      if (transformedTests.length > 0) {
        transformedTests.forEach((test, idx) => {
          test.isFirstTest = idx === transformedTests.length - 1;
        });
      }

      setTests(transformedTests);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch test history'));
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    tests,
    loading,
    error,
    refresh: fetchData,
  };
}

export default useTrajectoryData;

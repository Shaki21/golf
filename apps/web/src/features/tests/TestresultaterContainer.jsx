import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Testresultater from './Testresultater';

const TestresultaterContainer = () => {
  const { user } = useAuth();
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [player, setPlayer] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setState('loading');
      setError(null);

      const playerId = user.playerId || user.id;

      // Fetch tests, results, and player progress in parallel
      const [testsResponse, resultsResponse, progressResponse, playerResponse] = await Promise.all([
        apiClient.get('/tests?isActive=true&limit=50'),
        apiClient.get(`/tests/results?playerId=${playerId}&limit=200&sortBy=testDate&sortOrder=desc`),
        apiClient.get(`/tests/progress?playerId=${playerId}`),
        user.role === 'player' ? apiClient.get('/me') : Promise.resolve({ data: { data: null } }),
      ]);

      const testsData = testsResponse.data?.data?.tests || [];
      const resultsData = resultsResponse.data?.data?.results || [];
      const progressData = progressResponse.data?.data;
      const playerData = playerResponse.data?.data;

      // Group results by test and build history
      const testResultsWithHistory = testsData.map(test => {
        const testResults = resultsData
          .filter(r => r.testId === test.id)
          .sort((a, b) => new Date(a.testDate) - new Date(b.testDate));

        // Build history array for charts
        const history = testResults.map(r => ({
          label: new Date(r.testDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
          value: r.value || r.pei || 0,
          date: r.testDate,
        }));

        return {
          id: test.id,
          name: test.name,
          testNumber: test.testNumber,
          category: test.category,
          icon: getCategoryIcon(test.category),
          unit: getTestUnit(test.testType),
          requirement: getRequirementForCategory(test, playerData?.category || 'B'),
          lowerIsBetter: isLowerBetter(test.testType),
          history,
        };
      }).filter(t => t.history.length > 0);

      setTestResults(testResultsWithHistory);
      setPlayer(playerData || progressData?.player);
      setState(testResultsWithHistory.length === 0 ? 'empty' : 'idle');
    } catch (err) {
      console.error('Error fetching test results:', err);
      setError(err);
      setState('error');
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  if (state === 'loading') {
    return <LoadingState message="Loading test results..." />;
  }

  if (state === 'error') {
    return (
      <ErrorState
        errorType={error?.type}
        message={error?.message || 'Could not load test results'}
        onRetry={fetchData}
      />
    );
  }

  if (state === 'empty') {
    return (
      <EmptyState
        title="No test results"
        message="You have no registered test results yet."
      />
    );
  }

  return <Testresultater testResults={testResults} player={player} onRefresh={fetchData} />;
};

// Helper functions
function getCategoryIcon(category) {
  const icons = {
    speed: 'zap',
    distance: 'ruler',
    accuracy: 'target',
    short_game: 'flag',
    putting: 'circle',
    physical: 'dumbbell',
    mental: 'brain',
    scoring: 'bar-chart',
  };
  return icons[category] || 'file-text';
}

function getTestUnit(testType) {
  const units = {
    speed_measurement: 'mph',
    distance_measurement: 'm',
    accuracy_measurement: '%',
    putting_test: '%',
    physical_test: '',
    mobility_test: '°',
    scoring_test: '',
    mental_test: '',
  };
  return units[testType] || '';
}

function isLowerBetter(testType) {
  return ['accuracy_measurement'].includes(testType);
}

function getRequirementForCategory(test, category) {
  // Default requirements per category (can be extended from API later)
  const requirements = {
    A: { speed: 120, distance: 280, accuracy: 0.04 },
    B: { speed: 112, distance: 260, accuracy: 0.05 },
    C: { speed: 105, distance: 240, accuracy: 0.06 },
    D: { speed: 98, distance: 220, accuracy: 0.07 },
  };

  // Return a reasonable default based on test category
  const catReqs = requirements[category] || requirements.B;
  if (test.category === 'speed') return catReqs.speed;
  if (test.category === 'distance') return catReqs.distance;
  if (test.category === 'accuracy') return catReqs.accuracy;
  return 100; // Default percentage requirement
}

export default TestresultaterContainer;

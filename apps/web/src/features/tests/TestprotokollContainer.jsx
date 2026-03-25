import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import Testprotokoll from './Testprotokoll';

const TestprotokollContainer = () => {
  const { user } = useAuth();
  const [state, setState] = useState('loading');
  const [error, setError] = useState(null);
  const [tests, setTests] = useState([]);
  const [player, setPlayer] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setState('loading');
      setError(null);

      // Fetch tests and results in parallel
      const [testsResponse, resultsResponse, playerResponse] = await Promise.all([
        apiClient.get('/tests?isActive=true&limit=50'),
        apiClient.get(`/tests/results?playerId=${user.playerId || user.id}&limit=100`),
        user.role === 'player' ? apiClient.get('/me') : Promise.resolve({ data: { data: null } }),
      ]);

      const testsData = testsResponse.data?.data?.tests || [];
      const resultsData = resultsResponse.data?.data?.results || [];
      const playerData = playerResponse.data?.data;

      // Merge results into tests
      const testsWithResults = testsData.map(test => {
        const testResults = resultsData
          .filter(r => r.testId === test.id)
          .sort((a, b) => new Date(b.testDate) - new Date(a.testDate));

        const latestResult = testResults[0];
        const previousResult = testResults[1];

        return {
          ...test,
          currentResult: latestResult?.value || latestResult?.pei || null,
          previousResult: previousResult?.value || previousResult?.pei || null,
          bestResult: testResults.length > 0
            ? Math.max(...testResults.map(r => r.value || r.pei || 0))
            : null,
          lastTested: latestResult?.testDate
            ? new Date(latestResult.testDate).toISOString().split('T')[0]
            : null,
          results: testResults,
        };
      });

      setTests(testsWithResults);
      setPlayer(playerData);
      setState('idle');
    } catch (err) {
      console.error('Error fetching tests:', err);
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
    return <LoadingState message="Loading test protocol..." />;
  }

  if (state === 'error') {
    return (
      <ErrorState
        errorType={error?.type}
        message={error?.message || 'Could not load test protocol'}
        onRetry={fetchData}
      />
    );
  }

  return <Testprotokoll tests={tests} player={player} onRefresh={fetchData} />;
};

export default TestprotokollContainer;

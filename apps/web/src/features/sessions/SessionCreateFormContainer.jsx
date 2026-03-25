/**
 * SessionCreateFormContainer - Smart component for creating sessions
 *
 * Handles:
 * - Creating new training sessions via API
 * - Error handling
 * - Navigation after creation
 *
 * Design Pattern: Container/Presentational
 */
import React, { useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sessionsAPI } from '../../services/api';
import SessionCreateForm from './SessionCreateForm';
import ErrorState from '../../components/ui/ErrorState';

export default function SessionCreateFormContainer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get optional dailyAssignmentId from URL params
  const dailyAssignmentId = searchParams.get('assignmentId');

  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle form submission
  const handleSubmit = useCallback(
    async (formData) => {
      try {
        setIsLoading(true);
        setError(null);

        // Add dailyAssignmentId if present
        const submitData = {
          ...formData,
          dailyAssignmentId: dailyAssignmentId || undefined,
        };

        const response = await sessionsAPI.create(submitData);
        const sessionId = response.data.id;

        // Navigate to session detail or start active session
        navigate(`/sessions/${sessionId}`, {
          state: { message: 'Treningsokt opprettet!' },
        });
      } catch (err) {
        console.error('Failed to create session:', err);
        setError(err.response?.data?.message || 'Kunne ikke opprette okt');
        setIsLoading(false);
      }
    },
    [navigate, dailyAssignmentId]
  );

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Show error if API call failed but allow retry
  if (error && !isLoading) {
    return (
      <ErrorState
        message={error}
        onRetry={() => setError(null)}
        retryLabel="Prøv igjen"
      />
    );
  }

  // Initial values (can be populated from training plan assignment)
  const initialValues = {
    sessionDate: new Date().toISOString().slice(0, 16),
    duration: 60,
  };

  return (
    <SessionCreateForm
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isLoading={isLoading}
    />
  );
}

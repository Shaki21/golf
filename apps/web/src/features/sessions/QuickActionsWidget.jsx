/**
 * TIER Golf - Quick Actions Widget
 * Design System v3.0 - Premium Light
 *
 * Today's training quick actions: start, complete, skip, substitute.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import Button from '../../ui/primitives/Button';
import { SubSectionTitle, CardTitle } from '../../components/typography';

export default function QuickActionsWidget({ planId }) {
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSubstitute, setShowSubstitute] = useState(false);
  const [alternatives, setAlternatives] = useState([]);

  // Navigate to evaluation form
  const handleEvaluate = () => {
    if (assignment?.sessionId) {
      navigate(`/session/${assignment.sessionId}/evaluate`);
    }
  };

  useEffect(() => {
    if (planId) loadToday();
  }, [planId]);

  const loadToday = async () => {
    try {
      const { data } = await apiClient.get(
        `/training-plan/${planId}/today`
      );
      if (data.data.hasAssignment) {
        setAssignment(data.data.assignment);
      }
    } catch (err) {
      console.error('Failed to load today:', err);
    }
  };

  const handleQuickAction = async (action) => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await apiClient.put(
        `/training-plan/${planId}/daily/${today}/quick-action`,
        { action }
      );
      loadToday();
    } catch (err) {
      alert('Handling feilet: ' + (err.response?.data?.error?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const loadSubstitutes = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await apiClient.post(
        `/training-plan/${planId}/daily/${today}/substitute`,
        {}
      );
      setAlternatives(data.data.alternatives);
      setShowSubstitute(true);
    } catch (err) {
      alert('Kan ikke bytte: ' + (err.message || 'Ukjent feil'));
    } finally {
      setLoading(false);
    }
  };

  if (!assignment) {
    return (
      <div className="bg-tier-white rounded-lg shadow p-6">
        <SubSectionTitle className="mb-2">Dagens trening</SubSectionTitle>
        <p className="text-tier-text-secondary mb-4">Ingen økt planlagt for i dag</p>
        <Button
          variant="primary"
          onClick={() => navigate('/session/new')}
          className="w-full"
        >
          + Opprett treningsøkt
        </Button>
      </div>
    );
  }

  if (assignment.isRestDay) {
    return (
      <div className="bg-tier-navy/10 rounded-lg shadow p-6 border-2 border-tier-navy/30">
        <SubSectionTitle className="mb-2">Hviledag</SubSectionTitle>
        <p className="text-tier-navy">Restitusjon er viktig! Nyt hviledagen din.</p>
      </div>
    );
  }

  const statusColors = {
    planned: 'bg-tier-surface-base text-tier-text-secondary',
    in_progress: 'bg-tier-navy/15 text-tier-navy',
    completed: 'bg-tier-success/15 text-tier-success',
    skipped: 'bg-tier-warning/15 text-tier-warning',
  };

  return (
    <div className="bg-tier-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <SubSectionTitle>Dagens trening</SubSectionTitle>
          <span className={`inline-block px-2 py-1 rounded text-sm font-medium mt-1 ${statusColors[assignment.status]}`}>
            {assignment.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <span className="text-sm text-tier-text-secondary">{assignment.period} periode</span>
      </div>

      <div className="mb-4">
        <CardTitle>{assignment.type}</CardTitle>
        <p className="text-tier-text-secondary text-sm">Varighet: {assignment.duration} minutter</p>
        {assignment.sessionTemplate?.description && (
          <p className="text-tier-text-secondary text-sm mt-2">{assignment.sessionTemplate.description}</p>
        )}
        {assignment.notes && (
          <div className="mt-2 p-2 bg-amber-50 rounded text-sm">
            <strong>Trenernotater:</strong> {assignment.notes}
          </div>
        )}
      </div>

      {showSubstitute ? (
        <div className="border-t border-tier-border-default pt-4">
          <CardTitle className="mb-3">Alternative økter:</CardTitle>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {alternatives.map(alt => (
              <div key={alt.id} className="p-3 bg-tier-surface-base rounded hover:bg-tier-white cursor-pointer">
                <div className="font-medium text-tier-navy">{alt.name}</div>
                <div className="text-sm text-tier-text-secondary">
                  {alt.duration} min • {alt.period} • {alt.learningPhase}
                </div>
                {alt.description && <div className="text-sm text-tier-text-secondary mt-1">{alt.description}</div>}
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSubstitute(false)}
            className="mt-3"
          >
            ← Tilbake
          </Button>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          {assignment.status === 'planned' && (
            <>
              <Button
                variant="primary"
                onClick={() => handleQuickAction('start')}
                disabled={loading}
                className="flex-1"
              >
                Start
              </Button>
              <Button
                variant="primary"
                onClick={() => handleQuickAction('complete')}
                disabled={loading}
                className="flex-1 bg-tier-success hover:bg-tier-success/90"
              >
                Fullfor
              </Button>
            </>
          )}
          {assignment.status === 'in_progress' && (
            <>
              <Button
                variant="primary"
                onClick={handleEvaluate}
                disabled={loading}
                className="flex-1 bg-tier-success hover:bg-tier-success/90"
              >
                Evaluer
              </Button>
              <Button
                variant="primary"
                onClick={() => handleQuickAction('complete')}
                disabled={loading}
                className="flex-1"
              >
                Fullfor
              </Button>
            </>
          )}
          {assignment.status === 'planned' && (
            <Button
              variant="secondary"
              onClick={() => handleQuickAction('skip')}
              disabled={loading}
            >
              Hopp over
            </Button>
          )}
          {assignment.canBeSubstituted && assignment.status === 'planned' && (
            <Button
              variant="secondary"
              onClick={loadSubstitutes}
              disabled={loading}
              className="bg-orange-400/20 text-orange-700 hover:bg-orange-400/30"
            >
              Bytt okt
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

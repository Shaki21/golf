/**
 * FocusWidget - Player focus recommendation widget
 * Shows focus area and recommended training split
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import Button from '../../ui/primitives/Button';
import { SubSectionTitle } from '../../components/typography';

const COMPONENT_LABELS = {
  OTT: 'Off the Tee',
  APP: 'Approach',
  ARG: 'Around the Green',
  PUTT: 'Putting',
};

const COMPONENT_COLORS = {
  OTT: 'var(--info)', // Blue
  APP: 'var(--status-success)', // Green
  ARG: 'var(--status-warning)', // Amber
  PUTT: 'rgb(var(--category-j))', // Purple
};

const REASON_MESSAGES = {
  weak_ott_test_cluster: 'Your driving tests show room for improvement',
  weak_app_test_cluster: 'Your approach tests show room for improvement',
  weak_arg_test_cluster: 'Your short game tests show room for improvement',
  weak_putt_test_cluster: 'Your putting tests show room for improvement',
  high_weight_ott: 'Driving has high impact on scoring',
  high_weight_app: 'Approach play has high impact on scoring',
  high_weight_arg: 'Short game has high impact on scoring',
  high_weight_putt: 'Putting has high impact on scoring',
  insufficient_test_data: 'Complete more tests for better recommendations',
};

export function FocusWidget({ className = '' }) {
  const [focus, setFocus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFocus();
  }, []);

  const loadFocus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/focus-engine/me/focus?includeApproachDetail=true');
      if (response.data.success) {
        setFocus(response.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load focus');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !focus) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
        <p className="text-gray-500">Unable to load focus recommendations</p>
      </div>
    );
  }

  const primaryReason = focus.reasonCodes.find(
    (code) => code.startsWith('weak_') && code.includes(focus.focusComponent.toLowerCase())
  );

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <SubSectionTitle className="text-lg font-semibold text-gray-900">Fokus denne uken</SubSectionTitle>
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            focus.confidence === 'high'
              ? 'bg-green-100 text-green-800'
              : focus.confidence === 'med'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {focus.confidence === 'high' ? 'Sikker' : focus.confidence === 'med' ? 'Moderat' : 'Begrenset data'}
        </span>
      </div>

      {/* Primary Focus */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${COMPONENT_COLORS[focus.focusComponent]}20` }}
        >
          <span className="text-xl font-bold" style={{ color: COMPONENT_COLORS[focus.focusComponent] }}>
            {focus.focusComponent.charAt(0)}
          </span>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{COMPONENT_LABELS[focus.focusComponent]}</p>
          <p className="text-sm text-gray-500">
            {primaryReason ? REASON_MESSAGES[primaryReason] : 'Anbefalt fokusområde'}
          </p>
        </div>
      </div>

      {/* Approach bucket detail */}
      {focus.approachWeakestBucket && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <span className="font-medium">Spesifikt:</span> Fokuser på{' '}
            {focus.approachWeakestBucket.replace('_', '-')} yards approach
          </p>
        </div>
      )}

      {/* Plan Split */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Anbefalt treningsfordeling</p>
        {Object.entries(focus.recommendedSplit).map(([component, value]) => (
          <div key={component} className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-8">{component}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${value * 100}%`,
                  backgroundColor: COMPONENT_COLORS[component],
                }}
              />
            </div>
            <span className="text-xs text-gray-600 w-10 text-right">{Math.round(value * 100)}%</span>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="mt-6 flex gap-2">
        <Button variant="primary" className="flex-1">
          Start økt
        </Button>
        <Button variant="secondary" className="flex-1">
          Oppdater plan
        </Button>
      </div>
    </div>
  );
}

export default FocusWidget;

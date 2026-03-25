/**
 * TIER Golf - Progress Widget
 * Design System v3.0 - Premium Light
 *
 * Compact progress overview widget.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { SubSectionTitle } from '../../components/typography';

export default function ProgressWidget({ planId }) {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (planId) loadAnalytics();
  }, [planId]);

  const loadAnalytics = async () => {
    try {
      const { data: response } = await apiClient.get(
        `/training-plan/${planId}/analytics`
      );
      setData(response.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  if (!data) return null;

  const { overview } = data;

  return (
    <div className="bg-tier-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <SubSectionTitle>Your Progress</SubSectionTitle>
        <button
          onClick={() => navigate('/progress')}
          className="text-sm text-tier-navy font-medium bg-transparent border-none cursor-pointer hover:underline"
        >
          View Details
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-tier-navy/10 rounded-lg">
          <div className="text-[32px] font-bold text-tier-navy">
            {overview.completionRate}%
          </div>
          <div className="text-sm text-tier-text-secondary mt-1">Completed</div>
        </div>
        <div className="text-center p-3 bg-tier-warning/10 rounded-lg">
          <div className="text-[32px] font-bold text-tier-warning">
            {overview.currentStreak}
          </div>
          <div className="text-sm text-tier-text-secondary mt-1">Day streak</div>
        </div>
      </div>

      <div className="flex justify-between text-sm text-tier-text-secondary">
        <span>{overview.totalSessionsCompleted} sessions completed</span>
        <span>{overview.totalHoursCompleted}h trained</span>
      </div>
    </div>
  );
}

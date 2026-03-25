/**
 * TeamFocusHeatmap - Coach team focus overview
 * Shows heatmap of player focus areas and at-risk players
 */

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { SubSectionTitle } from '../../components/typography';

const COMPONENT_LABELS = {
  OTT: 'Off the Tee',
  APP: 'Approach',
  ARG: 'Around the Green',
  PUTT: 'Putting',
};

const COMPONENT_COLORS = {
  OTT: 'var(--info)',
  APP: 'var(--status-success)',
  ARG: 'var(--status-warning)',
  PUTT: 'rgb(var(--category-j))',
};

const REASON_LABELS = {
  weak_ott_test_cluster: 'Svak driving',
  weak_app_test_cluster: 'Svak approach',
  weak_arg_test_cluster: 'Svak nærspill',
  weak_putt_test_cluster: 'Svak putting',
  high_weight_ott: 'Driving viktig',
  high_weight_app: 'Approach viktig',
  low_training_adherence: 'Lav treningsfrekvens',
};

export function TeamFocusHeatmap({ coachId, teamId, className = '' }) {
  const [teamFocus, setTeamFocus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (coachId && teamId) {
      loadTeamFocus();
    }
  }, [coachId, teamId]);

  const loadTeamFocus = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/focus-engine/coaches/${coachId}/teams/${teamId}/focus`);
      if (response.data.success) {
        setTeamFocus(response.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load team focus');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !teamFocus) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
        <p className="text-gray-500">Unable to load team focus</p>
      </div>
    );
  }

  const maxCount = Math.max(...Object.values(teamFocus.heatmap), 1);

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <SubSectionTitle className="text-lg font-semibold text-gray-900">Team Focus Heatmap</SubSectionTitle>
        <span className="text-sm text-gray-500">{teamFocus.playerCount} spillere</span>
      </div>

      {/* Heatmap Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {Object.entries(teamFocus.heatmap).map(([component, count]) => {
          const intensity = count / maxCount;
          return (
            <div
              key={component}
              className="relative rounded-lg p-4 text-center transition-all hover:scale-105 cursor-pointer"
              style={{
                backgroundColor: `${COMPONENT_COLORS[component]}${Math.round(intensity * 60 + 20)
                  .toString(16)
                  .padStart(2, '0')}`,
              }}
            >
              <div className="text-3xl font-bold" style={{ color: COMPONENT_COLORS[component] }}>
                {count}
              </div>
              <div className="text-xs font-medium text-gray-700 mt-1">{COMPONENT_LABELS[component]}</div>
            </div>
          );
        })}
      </div>

      {/* Top Reason Codes */}
      {teamFocus.topReasonCodes.length > 0 && (
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Vanlige årsaker</p>
          <div className="flex flex-wrap gap-2">
            {teamFocus.topReasonCodes.map((code) => (
              <span
                key={code}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {REASON_LABELS[code] || code}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* At-Risk Players */}
      {teamFocus.atRiskPlayers.length > 0 && (
        <div>
          <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Spillere med lav adherens
          </p>
          <div className="space-y-2">
            {teamFocus.atRiskPlayers.map((player) => (
              <div
                key={player.playerId}
                className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: COMPONENT_COLORS[player.focusComponent] }}
                  >
                    {player.playerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{player.playerName}</p>
                    <p className="text-xs text-gray-500">
                      Fokus: {COMPONENT_LABELS[player.focusComponent]}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-red-700">{player.adherenceScore}%</div>
                  <div className="text-xs text-gray-500">adherens</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {teamFocus.atRiskPlayers.length === 0 && (
        <div className="p-4 bg-green-50 rounded-lg text-center">
          <p className="text-sm text-green-700">Alle spillere har god treningsfrekvens</p>
        </div>
      )}
    </div>
  );
}

export default TeamFocusHeatmap;

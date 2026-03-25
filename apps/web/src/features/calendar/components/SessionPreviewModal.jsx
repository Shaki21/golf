/**
 * SessionPreviewModal Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React from 'react';
import { X, Clock, MapPin, Play, Check, Edit2, Trash2, User } from 'lucide-react';
import { getSessionIcon } from '../../../components/icons';
import { SubSectionTitle } from '../../../components/typography';

const SessionPreviewModal = ({
  session,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStart
}) => {
  if (!isOpen || !session) return null;

  // Session colors using semantic tokens (see COLOR_USAGE_RULES.md)
  const getSessionColor = (type) => {
    const colors = {
      teknikk: 'rgb(var(--tier-gold))',
      golfslag: 'rgb(var(--tier-navy))',
      spill: 'rgb(var(--status-success))',
      konkurranse: 'rgb(var(--status-info))',
      fysisk: 'rgb(var(--tier-gold))',
      mental: 'rgb(var(--text-tertiary))',
    };
    return colors[type] || 'rgb(var(--text-secondary))';
  };

  const getSessionTypeIcon = (type) => {
    return getSessionIcon(type, { size: 28, color: getSessionColor(type) });
  };

  const getLevelLabel = (level) => {
    const labels = {
      L1: 'Lett',
      L2: 'Moderat',
      L3: 'Middels',
      L4: 'Krevende',
      L5: 'Maksimal',
    };
    return labels[level] || level;
  };

  const sessionColor = getSessionColor(session.type);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-tier-white rounded-2xl max-w-md w-full overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with color strip */}
        <div
          className="h-2"
          style={{ backgroundColor: sessionColor }}
        />

        <div className="p-5">
          {/* Close button */}
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="p-1 hover:bg-tier-surface-base rounded-lg transition-colors"
            >
              <X size={20} className="text-tier-text-secondary" />
            </button>
          </div>

          {/* Session Icon & Title */}
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${sessionColor}15` }}
            >
              {getSessionTypeIcon(session.type)}
            </div>
            <div className="flex-1">
              <SubSectionTitle className="text-lg font-semibold text-tier-navy">
                {session.name}
              </SubSectionTitle>
              <p className="text-sm text-tier-text-secondary capitalize">
                {session.type}
              </p>
            </div>
          </div>

          {/* Session Details */}
          <div className="space-y-3 mb-5">
            {/* Time & Duration */}
            <div className="flex items-center gap-3 p-3 bg-tier-surface-base rounded-xl">
              <Clock size={18} className="text-tier-navy" />
              <div>
                <p className="text-sm font-medium text-tier-navy">
                  {session.time}
                </p>
                {session.duration > 0 && (
                  <p className="text-xs text-tier-text-secondary">
                    Varighet: {session.duration} minutter
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            {session.location && (
              <div className="flex items-center gap-3 p-3 bg-tier-surface-base rounded-xl">
                <MapPin size={18} className="text-tier-navy" />
                <div>
                  <p className="text-sm font-medium text-tier-navy">
                    {session.location}
                  </p>
                </div>
              </div>
            )}

            {/* Level */}
            <div className="flex items-center justify-between p-3 bg-tier-surface-base rounded-xl">
              <span className="text-sm text-tier-navy">Nivå</span>
              <span
                className="px-2 py-1 rounded-lg text-xs font-medium"
                style={{
                  backgroundColor: `${sessionColor}20`,
                  color: sessionColor
                }}
              >
                {session.level} - {getLevelLabel(session.level)}
              </span>
            </div>

            {/* Assigned by coach */}
            {session.assignedByCoach && (
              <div className="flex items-center gap-2 p-3 bg-tier-navy/5 rounded-xl">
                <User size={16} className="text-tier-navy" />
                <span className="text-sm text-tier-navy">
                  Tildelt av trener
                </span>
              </div>
            )}

            {/* Reps/Sets if available */}
            {session.reps && (
              <div className="p-3 bg-tier-surface-base rounded-xl">
                <p className="text-xs text-tier-text-secondary mb-1">Repetisjoner</p>
                <p className="text-sm font-medium text-tier-navy">
                  {session.reps}
                </p>
              </div>
            )}

            {/* Notes if available */}
            {session.notes && (
              <div className="p-3 bg-tier-surface-base rounded-xl">
                <p className="text-xs text-tier-text-secondary mb-1">Notater</p>
                <p className="text-sm text-tier-navy">
                  {session.notes}
                </p>
              </div>
            )}
          </div>

          {/* Status Badge */}
          {session.status && (
            <div className="mb-4">
              {session.status === 'completed' ? (
                <div className="flex items-center gap-2 p-3 bg-tier-success/10 rounded-xl">
                  <Check size={18} className="text-tier-success" />
                  <span className="text-sm font-medium text-tier-success">
                    Fullført
                  </span>
                </div>
              ) : session.status === 'rest' ? (
                <div className="flex items-center gap-2 p-3 bg-tier-surface-base rounded-xl">
                  {getSessionIcon('rest', { size: 18, color: 'var(--text-secondary)' })}
                  <span className="text-sm text-tier-text-secondary">
                    Hviledag
                  </span>
                </div>
              ) : null}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {session.status === 'upcoming' && (
              <button
                onClick={() => onStart?.(session)}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-tier-navy text-white rounded-xl font-medium hover:bg-tier-navy/90 transition-colors"
              >
                <Play size={18} />
                Start økt
              </button>
            )}

            <button
              onClick={() => onEdit?.(session)}
              className="p-3 bg-tier-surface-base text-tier-navy rounded-xl hover:bg-tier-surface-base transition-colors"
              title="Rediger"
            >
              <Edit2 size={18} />
            </button>

            <button
              onClick={() => onDelete?.(session)}
              className="p-3 bg-tier-error/10 text-tier-error rounded-xl hover:bg-tier-error/20 transition-colors"
              title="Slett"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionPreviewModal;

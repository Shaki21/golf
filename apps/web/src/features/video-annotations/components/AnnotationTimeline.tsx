/**
 * Annotation Timeline Component
 * Displays annotations on a visual timeline below the video
 */

import React from 'react';
import { MessageCircle, Pencil, Play, Trash2 } from 'lucide-react';
import { SubSectionTitle } from '../../../ui/primitives/typography';

interface Annotation {
  id: string;
  type: string;
  timestamp: number;
  duration?: number;
  note?: string;
  color?: string;
  createdBy?: {
    firstName?: string;
    lastName?: string;
  };
}

interface Props {
  annotations: Annotation[];
  videoDuration: number;
  currentTime: number;
  onSeek: (time: number) => void;
  onDelete?: (annotationId: string) => void;
  onSelect?: (annotation: Annotation) => void;
  selectedId?: string;
  className?: string;
}

const AnnotationTimeline: React.FC<Props> = ({
  annotations,
  videoDuration,
  currentTime,
  onSeek,
  onDelete,
  onSelect,
  selectedId,
  className = '',
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnnotationIcon = (type: string) => {
    if (type === 'note' || type === 'text') return MessageCircle;
    if (type === 'drawing') return Pencil;
    return Pencil;
  };

  const getAnnotationLeft = (timestamp: number) => {
    if (videoDuration === 0) return 0;
    return `${(timestamp / videoDuration) * 100}%`;
  };

  const getAnnotationWidth = (duration?: number) => {
    if (!duration || videoDuration === 0) return 'auto';
    return `${(duration / videoDuration) * 100}%`;
  };

  const getCurrentTimePosition = () => {
    if (videoDuration === 0) return 0;
    return `${(currentTime / videoDuration) * 100}%`;
  };

  return (
    <div className={`bg-white border border-tier-border-default rounded-lg p-4 ${className}`}>
      <div className="mb-3">
        <SubSectionTitle style={{ marginBottom: 0 }}>
          Annoteringer ({annotations.length})
        </SubSectionTitle>
        <p className="text-xs text-tier-text-secondary">
          Click on an annotation to jump to that timestamp
        </p>
      </div>

      {/* Timeline bar */}
      <div className="relative bg-tier-surface-base rounded h-16 mb-4">
        {/* Timeline markers (every 10%) */}
        {[...Array(11)].map((_, i) => {
          const percent = i * 10;
          const time = (videoDuration * percent) / 100;
          return (
            <div
              key={i}
              className="absolute top-0 bottom-0 flex flex-col items-center"
              style={{ left: `${percent}%` }}
            >
              <div className="w-px h-2 bg-tier-border-default" />
              <span className="text-xs text-tier-text-tertiary mt-1">
                {formatTime(time)}
              </span>
            </div>
          );
        })}

        {/* Annotation markers */}
        {annotations.map((annotation) => {
          const Icon = getAnnotationIcon(annotation.type);
          const isSelected = selectedId === annotation.id;

          return (
            <div
              key={annotation.id}
              className={`absolute top-0 group cursor-pointer transition-all ${
                isSelected ? 'z-20' : 'z-10'
              }`}
              style={{
                left: getAnnotationLeft(annotation.timestamp),
                width: getAnnotationWidth(annotation.duration),
              }}
            >
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded shadow-sm transition-all ${
                  isSelected
                    ? 'bg-tier-info text-white scale-110'
                    : 'bg-white text-tier-navy group-hover:scale-105'
                }`}
                style={
                  !isSelected && annotation.color
                    ? { borderLeft: `3px solid ${annotation.color}` }
                    : {}
                }
                onClick={() => {
                  onSeek(annotation.timestamp);
                  onSelect?.(annotation);
                }}
              >
                <Icon size={14} />
                <span className="text-xs font-medium whitespace-nowrap">
                  {formatTime(annotation.timestamp)}
                </span>
                {annotation.duration && (
                  <span className="text-xs opacity-70">
                    ({Math.round(annotation.duration)}s)
                  </span>
                )}
              </div>

              {/* Delete button (on hover) */}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm('Delete this annotation?')) {
                      onDelete(annotation.id);
                    }
                  }}
                  className="absolute -top-1 -right-1 p-1 bg-tier-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          );
        })}

        {/* Current time indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-tier-error z-30 transition-all"
          style={{ left: getCurrentTimePosition() }}
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            <Play size={16} className="text-tier-error fill-tier-error" />
          </div>
        </div>
      </div>

      {/* Annotation list */}
      {annotations.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {annotations.map((annotation) => {
            const Icon = getAnnotationIcon(annotation.type);
            const isSelected = selectedId === annotation.id;

            return (
              <div
                key={annotation.id}
                onClick={() => {
                  onSeek(annotation.timestamp);
                  onSelect?.(annotation);
                }}
                className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-tier-info-light border border-tier-info'
                    : 'hover:bg-tier-surface-base border border-transparent'
                }`}
              >
                <div
                  className="mt-1 p-1.5 rounded"
                  style={{ backgroundColor: annotation.color || '#666', color: 'white' }}
                >
                  <Icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-sm font-medium text-tier-navy">
                      {formatTime(annotation.timestamp)}
                    </span>
                    {annotation.createdBy && (
                      <span className="text-xs text-tier-text-secondary">
                        {annotation.createdBy.firstName} {annotation.createdBy.lastName}
                      </span>
                    )}
                  </div>
                  {annotation.note && (
                    <p className="text-xs text-tier-text-secondary truncate">
                      {annotation.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AnnotationTimeline;

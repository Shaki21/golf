/**
 * DurationSlider.jsx
 * Design System v3.0 - Premium Light
 *
 * FASE 5: Duration slider for session length
 *
 * Features:
 * - Drag to adjust duration (15-240 minutes)
 * - Default 30 minutes
 * - Visual time display
 * - Quick preset buttons
 */

import React from 'react';
import { Clock } from 'lucide-react';

const DURATION_PRESETS = [15, 30, 45, 60, 90, 120, 180, 240];

export const DurationSlider = ({ value = 30, onChange }) => {
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} time${hours > 1 ? 'r' : ''}`;
    }
    return `${hours}t ${mins}m`;
  };

  return (
    <div className="space-y-4">
      {/* Current Duration Display */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-tier-text-secondary flex items-center gap-1">
          <Clock size={14} />
          Varighet
        </label>
        <div className="text-2xl font-bold text-tier-navy">
          {formatDuration(value)}
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min="15"
          max="240"
          step="5"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-tier-surface-base rounded-lg appearance-none cursor-pointer slider-thumb"
          style={{
            background: `linear-gradient(to right,
              rgb(var(--tier-navy)) 0%,
              rgb(var(--tier-navy)) ${((value - 15) / (240 - 15)) * 100}%,
              rgb(var(--tier-surface-base)) ${((value - 15) / (240 - 15)) * 100}%,
              rgb(var(--tier-surface-base)) 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-tier-text-tertiary mt-1">
          <span>15 min</span>
          <span>1t</span>
          <span>2t</span>
          <span>3t</span>
          <span>4t</span>
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <div className="text-xs text-tier-text-secondary mb-2">Hurtigvalg:</div>
        <div className="flex gap-2 flex-wrap">
          {DURATION_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`px-3 py-1.5 rounded-lg border transition-all text-xs font-medium ${
                value === preset
                  ? 'bg-tier-navy text-white border-tier-navy'
                  : 'bg-tier-surface-base text-tier-text-secondary border-tier-border-default hover:border-tier-navy'
              }`}
            >
              {formatDuration(preset)}
            </button>
          ))}
        </div>
      </div>

      {/* Helper text */}
      <div className="text-xs text-tier-text-tertiary p-2 bg-tier-surface-base rounded">
        💡 Dra slideren eller velg et hurtigvalg for å sette varighet
      </div>
    </div>
  );
};

export default DurationSlider;

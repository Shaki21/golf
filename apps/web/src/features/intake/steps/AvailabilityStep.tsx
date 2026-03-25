/**
 * Availability Step - Time and facility access
 */

import React, { useState, useEffect } from 'react';
import Input from '../../../ui/primitives/Input';

interface Props {
  data?: any;
  onComplete: (data: any) => void;
}

const WEEKDAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const AvailabilityStep: React.FC<Props> = ({ data, onComplete }) => {
  const [formData, setFormData] = useState({
    hoursPerWeek: data?.hoursPerWeek || 5,
    preferredDays: data?.preferredDays || [],
    canTravelToFacility: data?.canTravelToFacility ?? true,
    hasHomeEquipment: data?.hasHomeEquipment ?? false,
    seasonalAvailability: data?.seasonalAvailability || {
      summer: 8,
      winter: 4,
    },
  });

  useEffect(() => {
    onComplete(formData);
  }, [formData, onComplete]);

  const toggleDay = (day: number) => {
    const days = formData.preferredDays.includes(day)
      ? formData.preferredDays.filter((d: number) => d !== day)
      : [...formData.preferredDays, day];
    setFormData({ ...formData, preferredDays: days });
  };

  return (
    <div className="space-y-6">
      {/* Hours Per Week */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          How many hours per week can you train? <span className="text-tier-text-secondary font-normal">(yearly average)</span>
        </label>
        <Input
          type="number"
          min={1}
          max={40}
          value={formData.hoursPerWeek}
          onChange={(e) => setFormData({ ...formData, hoursPerWeek: parseInt(e.target.value) || 5 })}
          className="w-full"
        />
        <p className="text-xs text-tier-text-secondary mt-1">Includes practice, exercises, and rounds</p>
      </div>

      {/* Preferred Days */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Which days are best for training?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {WEEKDAYS.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                formData.preferredDays.includes(day.value)
                  ? 'border-tier-info bg-tier-info-light text-tier-navy'
                  : 'border-tier-border-default text-tier-text-secondary hover:border-tier-info'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Seasonal Availability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-tier-navy mb-2">
            Hours per week - Summer
          </label>
          <Input
            type="number"
            min={1}
            max={40}
            value={formData.seasonalAvailability.summer}
            onChange={(e) =>
              setFormData({
                ...formData,
                seasonalAvailability: {
                  ...formData.seasonalAvailability,
                  summer: parseInt(e.target.value) || 8,
                },
              })
            }
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-tier-navy mb-2">
            Hours per week - Winter
          </label>
          <Input
            type="number"
            min={1}
            max={40}
            value={formData.seasonalAvailability.winter}
            onChange={(e) =>
              setFormData({
                ...formData,
                seasonalAvailability: {
                  ...formData.seasonalAvailability,
                  winter: parseInt(e.target.value) || 4,
                },
              })
            }
            className="w-full"
          />
        </div>
      </div>

      {/* Facility Access */}
      <div>
        <label className="flex items-center gap-3 p-4 bg-tier-surface-base rounded-lg cursor-pointer hover:bg-tier-info-light transition-all">
          <input
            type="checkbox"
            checked={formData.canTravelToFacility}
            onChange={(e) => setFormData({ ...formData, canTravelToFacility: e.target.checked })}
            className="w-5 h-5 text-tier-info rounded focus:ring-tier-info"
          />
          <div>
            <div className="font-medium text-sm text-tier-navy">Can travel to training facility</div>
            <div className="text-xs text-tier-text-secondary">Has access to driving range, golf course, etc.</div>
          </div>
        </label>
      </div>

      {/* Home Equipment */}
      <div>
        <label className="flex items-center gap-3 p-4 bg-tier-surface-base rounded-lg cursor-pointer hover:bg-tier-info-light transition-all">
          <input
            type="checkbox"
            checked={formData.hasHomeEquipment}
            onChange={(e) => setFormData({ ...formData, hasHomeEquipment: e.target.checked })}
            className="w-5 h-5 text-tier-info rounded focus:ring-tier-info"
          />
          <div>
            <div className="font-medium text-sm text-tier-navy">Has equipment at home</div>
            <div className="text-xs text-tier-text-secondary">Net, mats, putting green, etc. for home training</div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default AvailabilityStep;

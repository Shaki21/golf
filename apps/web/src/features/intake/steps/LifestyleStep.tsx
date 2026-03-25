/**
 * Lifestyle Step - Work schedule, stress, sleep, nutrition
 */

import React, { useState, useEffect } from 'react';
import { CardTitle } from '../../../components/typography';

interface Props {
  data?: any;
  onComplete: (data: any) => void;
}

const WORK_SCHEDULES = [
  { value: 'flexible', label: 'Flexible', description: 'Can train anytime' },
  { value: 'regular_hours', label: 'Regular hours', description: '9-5 or similar' },
  { value: 'irregular', label: 'Irregular', description: 'Varies from week to week' },
  { value: 'shift_work', label: 'Shift work', description: 'Night/day/evening shifts' },
];

const PHYSICAL_ACTIVITY = [
  { value: 'sedentary', label: 'Sedentary', description: 'Most of the day sitting' },
  { value: 'light', label: 'Lightly active', description: 'Some movement in daily life' },
  { value: 'moderate', label: 'Moderately active', description: 'Regular exercise' },
  { value: 'active', label: 'Very active', description: 'Daily training/physical work' },
];

const LifestyleStep: React.FC<Props> = ({ data, onComplete }) => {
  const [formData, setFormData] = useState({
    workSchedule: data?.workSchedule || 'regular_hours',
    stressLevel: data?.stressLevel || 3,
    sleepQuality: data?.sleepQuality || 3,
    nutritionFocus: data?.nutritionFocus ?? false,
    physicalActivity: data?.physicalActivity || 'moderate',
  });

  useEffect(() => {
    onComplete(formData);
  }, [formData, onComplete]);

  return (
    <div className="space-y-6">
      {/* Work Schedule */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Work schedule
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {WORK_SCHEDULES.map((schedule) => (
            <button
              key={schedule.value}
              type="button"
              onClick={() => setFormData({ ...formData, workSchedule: schedule.value })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                formData.workSchedule === schedule.value
                  ? 'border-tier-info bg-tier-info-light'
                  : 'border-tier-border-default hover:border-tier-info'
              }`}
            >
              <div className="font-medium text-sm text-tier-navy mb-1">{schedule.label}</div>
              <div className="text-xs text-tier-text-secondary">{schedule.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Stress Level */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Daily stress level
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={formData.stressLevel}
            onChange={(e) => setFormData({ ...formData, stressLevel: parseInt(e.target.value) })}
            className="w-full h-2 bg-tier-surface-base rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--tier-success) 0%, var(--tier-warning) 50%, var(--tier-error) 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-tier-text-secondary">
            <span>Low (1)</span>
            <span className="font-semibold text-tier-navy">Level {formData.stressLevel}</span>
            <span>High (5)</span>
          </div>
        </div>
      </div>

      {/* Sleep Quality */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Sleep quality
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={formData.sleepQuality}
            onChange={(e) => setFormData({ ...formData, sleepQuality: parseInt(e.target.value) })}
            className="w-full h-2 bg-tier-surface-base rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--tier-error) 0%, var(--tier-warning) 50%, var(--tier-success) 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-tier-text-secondary">
            <span>Poor (1)</span>
            <span className="font-semibold text-tier-navy">Quality {formData.sleepQuality}</span>
            <span>Excellent (5)</span>
          </div>
        </div>
      </div>

      {/* Physical Activity */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Physical activity outside of golf
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PHYSICAL_ACTIVITY.map((activity) => (
            <button
              key={activity.value}
              type="button"
              onClick={() => setFormData({ ...formData, physicalActivity: activity.value })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                formData.physicalActivity === activity.value
                  ? 'border-tier-success bg-tier-success-light'
                  : 'border-tier-border-default hover:border-tier-success'
              }`}
            >
              <div className="font-medium text-sm text-tier-navy mb-1">{activity.label}</div>
              <div className="text-xs text-tier-text-secondary">{activity.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Nutrition Focus */}
      <div>
        <label className="flex items-center gap-3 p-4 bg-tier-surface-base rounded-lg cursor-pointer hover:bg-tier-info-light transition-all">
          <input
            type="checkbox"
            checked={formData.nutritionFocus}
            onChange={(e) => setFormData({ ...formData, nutritionFocus: e.target.checked })}
            className="w-5 h-5 text-tier-info rounded focus:ring-tier-info"
          />
          <div>
            <div className="font-medium text-sm text-tier-navy">Focus on nutrition</div>
            <div className="text-xs text-tier-text-secondary">
              I follow or want to follow a nutrition program for optimal performance
            </div>
          </div>
        </label>
      </div>

      {/* Info Box */}
      <div className="bg-tier-info-light border border-tier-info rounded-lg p-4">
        <CardTitle className="text-sm font-semibold text-tier-navy mb-2">Why do we ask about this?</CardTitle>
        <p className="text-xs text-tier-text-secondary">
          Lifestyle factors like sleep, stress, and activity level affect both performance and recovery.
          This helps us tailor your training plan to your overall life situation, making it realistic and sustainable.
        </p>
      </div>
    </div>
  );
};

export default LifestyleStep;

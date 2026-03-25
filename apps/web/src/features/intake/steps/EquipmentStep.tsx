/**
 * Equipment Step - Access to equipment and willingness to invest
 */

import React, { useState, useEffect } from 'react';
import Input from '../../../ui/primitives/Input';
import { CardTitle } from '../../../components/typography';

interface Props {
  data?: any;
  onComplete: (data: any) => void;
}

const INVESTMENT_LEVELS = [
  { value: 'minimal', label: 'Minimal', description: 'Only the essentials' },
  { value: 'moderate', label: 'Moderate', description: 'Reasonable investments' },
  { value: 'significant', label: 'Significant', description: 'Willing to make larger investments' },
];

const EquipmentStep: React.FC<Props> = ({ data, onComplete }) => {
  const [formData, setFormData] = useState({
    hasDriverSpeedMeasurement: data?.hasDriverSpeedMeasurement ?? false,
    driverSpeed: data?.driverSpeed || null,
    recentClubFitting: data?.recentClubFitting ?? false,
    accessToTrackMan: data?.accessToTrackMan ?? false,
    accessToGym: data?.accessToGym ?? false,
    willingToInvest: data?.willingToInvest || 'moderate',
  });

  useEffect(() => {
    onComplete(formData);
  }, [formData, onComplete]);

  return (
    <div className="space-y-6">
      {/* Driver Speed */}
      <div>
        <label className="flex items-center gap-3 p-4 bg-tier-surface-base rounded-lg cursor-pointer hover:bg-tier-info-light transition-all mb-3">
          <input
            type="checkbox"
            checked={formData.hasDriverSpeedMeasurement}
            onChange={(e) => setFormData({ ...formData, hasDriverSpeedMeasurement: e.target.checked })}
            className="w-5 h-5 text-tier-info rounded focus:ring-tier-info"
          />
          <div>
            <div className="font-medium text-sm text-tier-navy">Have measured driver speed</div>
            <div className="text-xs text-tier-text-secondary">Know my clubhead speed with driver</div>
          </div>
        </label>

        {formData.hasDriverSpeedMeasurement && (
          <div className="pl-8">
            <label className="block text-sm font-medium text-tier-navy mb-2">
              Driver speed (mph)
            </label>
            <Input
              type="number"
              min={40}
              max={150}
              value={formData.driverSpeed || ''}
              onChange={(e) => setFormData({ ...formData, driverSpeed: e.target.value ? parseFloat(e.target.value) : null })}
              placeholder="e.g. 95"
              className="w-full"
            />
            <p className="text-xs text-tier-text-secondary mt-1">Measured with TrackMan, FlightScope, or similar</p>
          </div>
        )}
      </div>

      {/* Recent Club Fitting */}
      <div>
        <label className="flex items-center gap-3 p-4 bg-tier-surface-base rounded-lg cursor-pointer hover:bg-tier-info-light transition-all">
          <input
            type="checkbox"
            checked={formData.recentClubFitting}
            onChange={(e) => setFormData({ ...formData, recentClubFitting: e.target.checked })}
            className="w-5 h-5 text-tier-info rounded focus:ring-tier-info"
          />
          <div>
            <div className="font-medium text-sm text-tier-navy">Recent club fitting</div>
            <div className="text-xs text-tier-text-secondary">Had clubs fitted in the last 12 months</div>
          </div>
        </label>
      </div>

      {/* TrackMan Access */}
      <div>
        <label className="flex items-center gap-3 p-4 bg-tier-surface-base rounded-lg cursor-pointer hover:bg-tier-info-light transition-all">
          <input
            type="checkbox"
            checked={formData.accessToTrackMan}
            onChange={(e) => setFormData({ ...formData, accessToTrackMan: e.target.checked })}
            className="w-5 h-5 text-tier-info rounded focus:ring-tier-info"
          />
          <div>
            <div className="font-medium text-sm text-tier-navy">Access to TrackMan</div>
            <div className="text-xs text-tier-text-secondary">Have regular access to TrackMan or similar launch monitor</div>
          </div>
        </label>
      </div>

      {/* Gym Access */}
      <div>
        <label className="flex items-center gap-3 p-4 bg-tier-surface-base rounded-lg cursor-pointer hover:bg-tier-success-light transition-all">
          <input
            type="checkbox"
            checked={formData.accessToGym}
            onChange={(e) => setFormData({ ...formData, accessToGym: e.target.checked })}
            className="w-5 h-5 text-tier-success rounded focus:ring-tier-success"
          />
          <div>
            <div className="font-medium text-sm text-tier-navy">Access to gym</div>
            <div className="text-xs text-tier-text-secondary">
              Have access to a gym for strength and conditioning training
            </div>
          </div>
        </label>
      </div>

      {/* Investment Willingness */}
      <div>
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Willingness to invest in equipment and training aids
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {INVESTMENT_LEVELS.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setFormData({ ...formData, willingToInvest: level.value })}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                formData.willingToInvest === level.value
                  ? 'border-tier-info bg-tier-info-light'
                  : 'border-tier-border-default hover:border-tier-info'
              }`}
            >
              <div className="font-medium text-sm text-tier-navy mb-1">{level.label}</div>
              <div className="text-xs text-tier-text-secondary">{level.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-tier-info-light border border-tier-info rounded-lg p-4">
        <CardTitle className="text-sm font-semibold text-tier-navy mb-2">Why do we ask about this?</CardTitle>
        <p className="text-xs text-tier-text-secondary">
          Access to equipment like TrackMan, gym, and well-fitted clubs affects which training methods
          are available to you. This helps us create a plan that fits your situation and resources.
        </p>
      </div>
    </div>
  );
};

export default EquipmentStep;

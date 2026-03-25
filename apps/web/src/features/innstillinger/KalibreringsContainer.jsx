/**
 * TIER Golf - Kalibrerings Container
 * Design System v3.0 - Premium Light
 *
 * Calibration settings for player metrics and club distances.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Target, Save, RotateCcw,
  Gauge, Activity, Info, Check
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SubSectionTitle, CardTitle } from '../../components/typography';
import { useAuth } from '../../contexts/AuthContext';

// ============================================================================
// STORAGE KEY & DEFAULT DATA
// ============================================================================

const STORAGE_KEY = 'tier_golf_calibration';

const DEFAULT_CALIBRATION = {
  driving: {
    clubSpeed: { value: 108, unit: 'mph', lastUpdated: null },
    ballSpeed: { value: 158, unit: 'mph', lastUpdated: null },
  },
  irons: {
    '7iron_carry': { value: 160, unit: 'm', lastUpdated: null },
    '7iron_total': { value: 168, unit: 'm', lastUpdated: null },
    'gapping': { value: 12, unit: 'm', lastUpdated: null },
  },
  physical: {
    benchPress: { value: 60, unit: 'kg', lastUpdated: null },
    trapBarDeadlift: { value: 100, unit: 'kg', lastUpdated: null },
    medicineBallThrow: { value: 8, unit: 'm', lastUpdated: null },
    standingLongJump: { value: 200, unit: 'cm', lastUpdated: null },
    running3000m: { value: 720, unit: 'sek', lastUpdated: null },
  },
};

const DEFAULT_CLUB_SPEEDS = [
  { club: 'Driver', clubSpeed: 108 },
  { club: '3-wood', clubSpeed: 102 },
  { club: '5-wood', clubSpeed: 98 },
  { club: '4-hybrid', clubSpeed: 94 },
  { club: '5-iron', clubSpeed: 90 },
  { club: '6-iron', clubSpeed: 87 },
  { club: '7-iron', clubSpeed: 84 },
  { club: '8-iron', clubSpeed: 81 },
  { club: '9-iron', clubSpeed: 78 },
  { club: 'PW', clubSpeed: 75 },
  { club: 'GW', clubSpeed: 72 },
  { club: 'SW', clubSpeed: 68 },
  { club: 'LW', clubSpeed: 64 },
];

// Load calibration from localStorage
const loadCalibration = (userId) => {
  try {
    const key = `${STORAGE_KEY}_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error('Error loading calibration:', err);
  }
  return null;
};

// Save calibration to localStorage
const saveCalibrationToStorage = (userId, data) => {
  try {
    const key = `${STORAGE_KEY}_${userId}`;
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error('Error saving calibration:', err);
    return false;
  }
};

// ============================================================================
// CALIBRATION INPUT
// ============================================================================

const CalibrationInput = ({ label, value, unit, lastUpdated, onChange }) => (
  <div className="flex items-center justify-between py-3 px-3.5 bg-tier-surface-base rounded-[10px] mb-2">
    <div>
      <div className="text-[13px] font-medium text-tier-navy">
        {label}
      </div>
      <div className="text-[11px] text-tier-text-secondary">
        Updated: {new Date(lastUpdated).toLocaleDateString('en-US')}
      </div>
    </div>
    <div className="flex items-center gap-2">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-20 py-2 px-3 rounded-md border border-tier-border-default text-sm font-medium text-right outline-none focus:border-tier-navy bg-tier-white"
      />
      <span className="text-[13px] text-tier-text-secondary min-w-[40px]">
        {unit}
      </span>
    </div>
  </div>
);

// ============================================================================
// CLUB SPEED ROW
// ============================================================================

const ClubSpeedRow = ({ club, clubSpeed, onChange }) => (
  <div className="grid grid-cols-[100px_1fr_60px] gap-3 items-center py-2.5 border-b border-tier-border-default">
    <span className="text-[13px] font-medium text-tier-navy">
      {club}
    </span>
    <input
      type="number"
      value={clubSpeed}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="py-2 px-3 rounded-md border border-tier-border-default text-sm text-center outline-none focus:border-tier-navy bg-tier-white"
    />
    <span className="text-[13px] text-tier-text-secondary">mph</span>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const KalibreringsContainer = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [drivingSettings, setDrivingSettings] = useState(DEFAULT_CALIBRATION.driving);
  const [ironsSettings, setIronsSettings] = useState(DEFAULT_CALIBRATION.irons);
  const [physicalSettings, setPhysicalSettings] = useState(DEFAULT_CALIBRATION.physical);
  const [clubSpeeds, setClubSpeeds] = useState(DEFAULT_CLUB_SPEEDS);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load saved calibration on mount
  useEffect(() => {
    if (user?.id) {
      const saved = loadCalibration(user.id);
      if (saved) {
        if (saved.driving) setDrivingSettings(saved.driving);
        if (saved.irons) setIronsSettings(saved.irons);
        if (saved.physical) setPhysicalSettings(saved.physical);
        if (saved.clubSpeeds) setClubSpeeds(saved.clubSpeeds);
      }
      setLoading(false);
    }
  }, [user?.id]);

  const handleSave = useCallback(async () => {
    if (!user?.id) return;

    setSaving(true);
    setError(null);

    // Update timestamps
    const now = new Date().toISOString().split('T')[0];
    const updatedDriving = { ...drivingSettings };
    Object.keys(updatedDriving).forEach(key => {
      if (updatedDriving[key].lastUpdated === null) {
        updatedDriving[key] = { ...updatedDriving[key], lastUpdated: now };
      }
    });

    const updatedPhysical = { ...physicalSettings };
    Object.keys(updatedPhysical).forEach(key => {
      if (updatedPhysical[key].lastUpdated === null) {
        updatedPhysical[key] = { ...updatedPhysical[key], lastUpdated: now };
      }
    });

    const dataToSave = {
      driving: updatedDriving,
      irons: ironsSettings,
      physical: updatedPhysical,
      clubSpeeds,
      savedAt: new Date().toISOString(),
    };

    try {
      const saved = saveCalibrationToStorage(user.id, dataToSave);
      if (saved) {
        setDrivingSettings(updatedDriving);
        setPhysicalSettings(updatedPhysical);
        setSuccess(true);
        setHasChanges(false);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('Could not save');
      }
    } catch (err) {
      setError(err.message || 'Could not save calibration.');
    } finally {
      setSaving(false);
    }
  }, [user?.id, drivingSettings, ironsSettings, physicalSettings, clubSpeeds]);

  const handleReset = () => {
    setDrivingSettings(DEFAULT_CALIBRATION.driving);
    setIronsSettings(DEFAULT_CALIBRATION.irons);
    setPhysicalSettings(DEFAULT_CALIBRATION.physical);
    setClubSpeeds(DEFAULT_CLUB_SPEEDS);
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tier-surface-base flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-tier-border-default border-t-tier-navy rounded-full animate-spin mx-auto mb-4" />
          <p className="text-tier-text-secondary">Loading calibration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Calibration"
        subtitle="Adjust your personal goals and values"
        helpText="Configure personal reference values for tests and performance. Adjust target values based on your category and ambition level."
      />

      <div className="p-4 px-6 pb-6 max-w-[800px] mx-auto">
        {/* Info Banner */}
        <div className="flex items-start gap-3 p-3.5 bg-tier-navy/10 rounded-xl mb-6">
          <Info size={20} className="text-tier-navy flex-shrink-0 mt-0.5" />
          <div>
            <CardTitle className="text-sm font-semibold text-tier-navy m-0 mb-1">
              Important for accurate goals
            </CardTitle>
            <p className="text-[13px] text-tier-text-secondary m-0 leading-snug">
              Update these values regularly to get the most accurate training goals and analyses.
              The values are used to calculate progress and compare with benchmarks.
            </p>
          </div>
        </div>

        {/* Success Banner */}
        {success && (
          <div className="flex items-center gap-2.5 py-3 px-3.5 bg-tier-success/15 rounded-[10px] mb-4">
            <Check size={18} className="text-tier-success" />
            <span className="text-sm text-tier-success font-medium">
              Calibration saved!
            </span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2.5 py-3 px-3.5 bg-tier-error/15 rounded-[10px] mb-4">
            <Info size={18} className="text-tier-error" />
            <span className="text-sm text-tier-error font-medium">
              {error}
            </span>
          </div>
        )}

        {/* Driving Settings */}
        <div className="bg-tier-white rounded-[14px] p-4 mb-5">
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="w-9 h-9 rounded-lg bg-tier-navy/15 flex items-center justify-center">
              <Gauge size={18} className="text-tier-navy" />
            </div>
            <SubSectionTitle className="text-[15px] font-semibold text-tier-navy m-0">
              Driver values
            </SubSectionTitle>
          </div>

          <CalibrationInput
            label="Club speed"
            value={drivingSettings.clubSpeed.value}
            unit={drivingSettings.clubSpeed.unit}
            lastUpdated={drivingSettings.clubSpeed.lastUpdated}
            onChange={(val) => {
              setDrivingSettings({ ...drivingSettings, clubSpeed: { ...drivingSettings.clubSpeed, value: val } });
              setHasChanges(true);
            }}
          />
          <CalibrationInput
            label="Ball speed"
            value={drivingSettings.ballSpeed.value}
            unit={drivingSettings.ballSpeed.unit}
            lastUpdated={drivingSettings.ballSpeed.lastUpdated}
            onChange={(val) => {
              setDrivingSettings({ ...drivingSettings, ballSpeed: { ...drivingSettings.ballSpeed, value: val } });
              setHasChanges(true);
            }}
          />
        </div>

        {/* Club Speeds */}
        <div className="bg-tier-white rounded-[14px] p-4 mb-5">
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="w-9 h-9 rounded-lg bg-tier-success/15 flex items-center justify-center">
              <Gauge size={18} className="text-tier-success" />
            </div>
            <SubSectionTitle className="text-[15px] font-semibold text-tier-navy m-0">
              Club speed per club
            </SubSectionTitle>
          </div>

          <div className="grid grid-cols-[100px_1fr_60px] gap-3 py-2 border-b-2 border-tier-border-default mb-2">
            <span className="text-xs font-semibold text-tier-text-secondary">Club</span>
            <span className="text-xs font-semibold text-tier-text-secondary text-center">Club Speed</span>
            <span className="text-xs font-semibold text-tier-text-secondary"></span>
          </div>

          {clubSpeeds.map((club, idx) => (
            <ClubSpeedRow
              key={club.club}
              club={club.club}
              clubSpeed={club.clubSpeed}
              onChange={(value) => {
                const newSpeeds = [...clubSpeeds];
                newSpeeds[idx] = { ...newSpeeds[idx], clubSpeed: value };
                setClubSpeeds(newSpeeds);
                setHasChanges(true);
              }}
            />
          ))}
        </div>

        {/* Physical Settings */}
        <div className="bg-tier-white rounded-[14px] p-4 mb-5">
          <div className="flex items-center gap-2.5 mb-3.5">
            <div className="w-9 h-9 rounded-lg bg-tier-error/15 flex items-center justify-center">
              <Activity size={18} className="text-tier-error" />
            </div>
            <SubSectionTitle className="text-[15px] font-semibold text-tier-navy m-0">
              Physical values
            </SubSectionTitle>
          </div>

          <CalibrationInput
            label="Bench press"
            value={physicalSettings.benchPress.value}
            unit={physicalSettings.benchPress.unit}
            lastUpdated={physicalSettings.benchPress.lastUpdated}
            onChange={(val) => {
              setPhysicalSettings({ ...physicalSettings, benchPress: { ...physicalSettings.benchPress, value: val } });
              setHasChanges(true);
            }}
          />
          <CalibrationInput
            label="Trap bar deadlift"
            value={physicalSettings.trapBarDeadlift.value}
            unit={physicalSettings.trapBarDeadlift.unit}
            lastUpdated={physicalSettings.trapBarDeadlift.lastUpdated}
            onChange={(val) => {
              setPhysicalSettings({ ...physicalSettings, trapBarDeadlift: { ...physicalSettings.trapBarDeadlift, value: val } });
              setHasChanges(true);
            }}
          />
          <CalibrationInput
            label="Medicine ball throw"
            value={physicalSettings.medicineBallThrow.value}
            unit={physicalSettings.medicineBallThrow.unit}
            lastUpdated={physicalSettings.medicineBallThrow.lastUpdated}
            onChange={(val) => {
              setPhysicalSettings({ ...physicalSettings, medicineBallThrow: { ...physicalSettings.medicineBallThrow, value: val } });
              setHasChanges(true);
            }}
          />
          <CalibrationInput
            label="Standing long jump"
            value={physicalSettings.standingLongJump.value}
            unit={physicalSettings.standingLongJump.unit}
            lastUpdated={physicalSettings.standingLongJump.lastUpdated}
            onChange={(val) => {
              setPhysicalSettings({ ...physicalSettings, standingLongJump: { ...physicalSettings.standingLongJump, value: val } });
              setHasChanges(true);
            }}
          />
          <CalibrationInput
            label="3000 m running"
            value={physicalSettings.running3000m.value}
            unit={physicalSettings.running3000m.unit}
            lastUpdated={physicalSettings.running3000m.lastUpdated}
            onChange={(val) => {
              setPhysicalSettings({ ...physicalSettings, running3000m: { ...physicalSettings.running3000m, value: val } });
              setHasChanges(true);
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[10px] border border-tier-border-default bg-tier-white text-tier-navy text-[15px] font-medium cursor-pointer hover:bg-tier-surface-base transition-colors"
          >
            <RotateCcw size={18} />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-[10px] border-none text-[15px] font-semibold transition-colors ${
              hasChanges
                ? 'bg-tier-navy text-white cursor-pointer hover:bg-tier-navy/90'
                : 'bg-tier-border-default text-tier-text-secondary cursor-not-allowed'
            }`}
          >
            <Save size={18} />
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default KalibreringsContainer;

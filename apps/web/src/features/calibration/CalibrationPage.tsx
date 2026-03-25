/**
 * Club Speed Calibration Page
 * Calibrate club speeds with 3 shots per club for accurate test calculations
 */

import React, { useState, useEffect } from 'react';
import { Target, Plus, Edit2, Trash2, TrendingUp, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import {
  usePlayerCalibration,
  useCreateCalibration,
  useUpdateCalibration,
  useDeleteCalibration,
} from '../../hooks/useCalibration';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import PageHeader from '../../components/layout/PageHeader';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';

interface Calibration {
  id: string;
  playerId: string;
  clubType?: string;
  speed1?: number;
  speed2?: number;
  speed3?: number;
  averageSpeed?: number;
  calibrationDate: string;
  notes?: string;
  driverSpeed?: number;
  speedProfile?: Record<string, number>;
  clubs?: Array<any>;
}

const CLUB_TYPES = [
  { value: 'driver', label: 'Driver', category: 'woods' },
  { value: '3wood', label: '3-Wood', category: 'woods' },
  { value: '5wood', label: '5-Wood', category: 'woods' },
  { value: '3hybrid', label: '3-Hybrid', category: 'hybrids' },
  { value: '4hybrid', label: '4-Hybrid', category: 'hybrids' },
  { value: '3iron', label: '3-Iron', category: 'irons' },
  { value: '4iron', label: '4-Iron', category: 'irons' },
  { value: '5iron', label: '5-Iron', category: 'irons' },
  { value: '6iron', label: '6-Iron', category: 'irons' },
  { value: '7iron', label: '7-Iron', category: 'irons' },
  { value: '8iron', label: '8-Iron', category: 'irons' },
  { value: '9iron', label: '9-Iron', category: 'irons' },
  { value: 'pw', label: 'Pitching Wedge', category: 'wedges' },
  { value: 'gw', label: 'Gap Wedge', category: 'wedges' },
  { value: 'sw', label: 'Sand Wedge', category: 'wedges' },
  { value: 'lw', label: 'Lob Wedge', category: 'wedges' },
];

const CalibrationPage: React.FC = () => {
  const { user } = useAuth();
  const playerId = user?.playerId || user?.id;

  const { calibration, loading, error, refetch } = usePlayerCalibration(playerId) as {
    calibration: Calibration | null;
    loading: boolean;
    error: any;
    refetch: () => void;
  };
  const [showCalibrationWizard, setShowCalibrationWizard] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (!playerId) {
    return (
      <div className="min-h-screen bg-tier-surface-base p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="p-8 text-center text-tier-error">No user found. Please log in.</div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Target size={28} className="text-tier-navy" />
            <PageHeader
              title="Club Speed Calibration"
              subtitle="Calibrate club speeds for accurate test calculations"
              helpText=""
              actions={null}
              className="mb-0"
            />
          </div>
        </div>

        {loading ? (
          <Card>
            <div className="p-12 text-center">
              <p className="text-tier-text-secondary">Loading calibration...</p>
            </div>
          </Card>
        ) : error ? (
          <Card>
            <div className="p-12 text-center">
              <AlertCircle size={48} className="mx-auto text-tier-error mb-4" />
              <p className="text-tier-error">{error}</p>
            </div>
          </Card>
        ) : !calibration ? (
          <Card>
            <div className="p-12 text-center">
              <Target size={64} className="mx-auto text-tier-text-tertiary mb-4" />
              <SubSectionTitle style={{ marginBottom: '0.5rem' }}>No calibration found</SubSectionTitle>
              <p className="text-tier-text-secondary mb-6">
                Calibrate your club speeds for more accurate test calculations and recommendations.
              </p>
              <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setShowCalibrationWizard(true)}>
                Start calibration
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Calibration Summary */}
            <Card>
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <SectionTitle style={{ marginBottom: '0.25rem' }}>Your calibration</SectionTitle>
                    <p className="text-sm text-tier-text-secondary">
                      Last updated: {new Date(calibration.calibrationDate).toLocaleDateString('en-US')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={<Edit2 size={14} />}
                      onClick={() => {
                        setIsEditing(true);
                        setShowCalibrationWizard(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      leftIcon={<Trash2 size={14} />}
                      onClick={async () => {
                        if (confirm('Delete calibration? This cannot be undone.')) {
                          const { deleteCalibration } = useDeleteCalibration();
                          try {
                            await deleteCalibration(playerId);
                            refetch();
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Driver Speed Highlight */}
                <div className="bg-gradient-to-r from-tier-info-light to-tier-success-light rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-white rounded-full p-4">
                      <Zap size={32} className="text-tier-info" />
                    </div>
                    <div>
                      <p className="text-sm text-tier-text-secondary mb-1">Driver club speed</p>
                      <p className="text-4xl font-bold text-tier-navy">{calibration.driverSpeed?.toFixed(1) || '0.0'} m/s</p>
                      <p className="text-xs text-tier-text-secondary mt-1">
                        ({((calibration.driverSpeed || 0) * 2.237).toFixed(1)} mph)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Speed Profile Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {calibration.speedProfile && Object.entries(calibration.speedProfile).map(([category, speed]: [string, any]) => (
                    <div key={category} className="bg-tier-surface-base rounded-lg p-4 border border-tier-border-default">
                      <p className="text-xs text-tier-text-secondary mb-1 capitalize">{category}</p>
                      <p className="text-2xl font-bold text-tier-navy">{speed.toFixed(1)} m/s</p>
                    </div>
                  ))}
                </div>

                {calibration.notes && (
                  <div className="mt-6 p-4 bg-tier-surface-base rounded-lg border border-tier-border-default">
                    <p className="text-sm font-semibold text-tier-navy mb-1">Notes</p>
                    <p className="text-sm text-tier-text-secondary">{calibration.notes}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Club Details */}
            <Card>
              <div className="p-6">
                <SubSectionTitle style={{ marginBottom: '1rem' }}>Calibrated clubs</SubSectionTitle>
                <div className="space-y-2">
                  {calibration.clubs && Array.isArray(calibration.clubs) && calibration.clubs.map((club: any, idx: number) => {
                    const clubInfo = CLUB_TYPES.find((c) => c.value === club.clubType);
                    const avgSpeed = (club.shot1Speed + club.shot2Speed + club.shot3Speed) / 3;

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-tier-surface-base rounded-lg border border-tier-border-default"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-tier-navy-light rounded-full p-2">
                            <Target size={16} className="text-tier-navy" />
                          </div>
                          <div>
                            <p className="font-medium text-tier-navy">{clubInfo?.label || club.clubType}</p>
                            <p className="text-xs text-tier-text-secondary">
                              {club.shot1Speed} / {club.shot2Speed} / {club.shot3Speed} m/s
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-tier-navy">{avgSpeed.toFixed(1)} m/s</p>
                          <p className="text-xs text-tier-text-secondary">Average</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Calibration Wizard Modal */}
        {showCalibrationWizard && (
          <CalibrationWizard
            existingCalibration={isEditing ? calibration : null}
            playerId={playerId!}
            onClose={() => {
              setShowCalibrationWizard(false);
              setIsEditing(false);
            }}
            onSuccess={() => {
              setShowCalibrationWizard(false);
              setIsEditing(false);
              refetch();
            }}
          />
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Calibration Wizard Component
// ============================================================================

interface CalibrationWizardProps {
  existingCalibration: any;
  playerId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CalibrationWizard: React.FC<CalibrationWizardProps> = ({
  existingCalibration,
  playerId,
  onClose,
  onSuccess,
}) => {
  const { createCalibration, loading: creating } = useCreateCalibration();
  const { updateCalibration, loading: updating } = useUpdateCalibration();
  const loading = creating || updating;

  const [selectedClubs, setSelectedClubs] = useState<string[]>(
    existingCalibration?.clubs?.map((c: any) => c.clubType) || ['driver']
  );
  const [clubSpeeds, setClubSpeeds] = useState<Record<string, { shot1: string; shot2: string; shot3: string }>>(
    existingCalibration?.clubs?.reduce((acc: any, club: any) => {
      acc[club.clubType] = {
        shot1: club.shot1Speed.toString(),
        shot2: club.shot2Speed.toString(),
        shot3: club.shot3Speed.toString(),
      };
      return acc;
    }, {}) || { driver: { shot1: '', shot2: '', shot3: '' } }
  );
  const [notes, setNotes] = useState(existingCalibration?.notes || '');
  const [currentStep, setCurrentStep] = useState(0);

  const toggleClub = (clubType: string) => {
    if (clubType === 'driver') return; // Driver is mandatory

    if (selectedClubs.includes(clubType)) {
      setSelectedClubs(selectedClubs.filter((c) => c !== clubType));
      const newSpeeds = { ...clubSpeeds };
      delete newSpeeds[clubType];
      setClubSpeeds(newSpeeds);
    } else {
      setSelectedClubs([...selectedClubs, clubType]);
      setClubSpeeds({ ...clubSpeeds, [clubType]: { shot1: '', shot2: '', shot3: '' } });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const clubs = selectedClubs.map((clubType) => ({
      clubType,
      shot1Speed: Number(clubSpeeds[clubType].shot1),
      shot2Speed: Number(clubSpeeds[clubType].shot2),
      shot3Speed: Number(clubSpeeds[clubType].shot3),
    }));

    const data = {
      playerId,
      calibrationDate: new Date().toISOString(),
      clubs,
      notes,
    };

    try {
      if (existingCalibration) {
        await updateCalibration(playerId, data);
      } else {
        await createCalibration(data);
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving calibration:', err);
    }
  };

  const canProceed = () => {
    if (currentStep === 0) return selectedClubs.length > 0;
    if (currentStep === 1) {
      return selectedClubs.every((club) => {
        const speeds = clubSpeeds[club];
        return (
          speeds &&
          speeds.shot1 &&
          speeds.shot2 &&
          speeds.shot3 &&
          Number(speeds.shot1) >= 40 &&
          Number(speeds.shot2) >= 40 &&
          Number(speeds.shot3) >= 40
        );
      });
    }
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <SectionTitle style={{ marginBottom: 0 }}>
            {existingCalibration ? 'Edit calibration' : 'New calibration'}
          </SectionTitle>
          <button onClick={onClose} className="p-2 hover:bg-tier-surface-base rounded">
            <AlertCircle size={20} className="text-tier-text-secondary" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {['Select clubs', 'Enter speeds', 'Complete'].map((step, idx) => (
            <React.Fragment key={idx}>
              <div
                className={`flex-1 h-2 rounded-full ${
                  idx <= currentStep ? 'bg-tier-navy' : 'bg-tier-border-default'
                }`}
              />
              {idx < 2 && <span className="text-xs text-tier-text-secondary">{idx + 1}</span>}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Select Clubs */}
          {currentStep === 0 && (
            <div>
              <SubSectionTitle style={{ marginBottom: '1rem' }}>Select clubs to calibrate</SubSectionTitle>
              <p className="text-sm text-tier-text-secondary mb-6">
                Driver is mandatory. Select other clubs you want to calibrate.
              </p>

              {['woods', 'hybrids', 'irons', 'wedges'].map((category) => (
                <div key={category} className="mb-6">
                  <p className="text-sm font-semibold text-tier-navy mb-3 capitalize">{category}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {CLUB_TYPES.filter((c) => c.category === category).map((club) => (
                      <button
                        key={club.value}
                        type="button"
                        disabled={club.value === 'driver'}
                        onClick={() => toggleClub(club.value)}
                        className={`p-3 rounded-lg border transition-all ${
                          selectedClubs.includes(club.value)
                            ? 'border-tier-navy bg-tier-navy-light'
                            : 'border-tier-border-default hover:border-tier-navy hover:bg-tier-surface-base'
                        } ${club.value === 'driver' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <p className="font-medium text-tier-navy text-sm">{club.label}</p>
                        {selectedClubs.includes(club.value) && (
                          <CheckCircle size={16} className="text-tier-success mt-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 2: Enter Speeds */}
          {currentStep === 1 && (
            <div>
              <SubSectionTitle style={{ marginBottom: '1rem' }}>Enter club speeds</SubSectionTitle>
              <p className="text-sm text-tier-text-secondary mb-6">
                Hit 3 shots with each club and enter the speeds (40-150 m/s).
              </p>

              <div className="space-y-4">
                {selectedClubs.map((clubType) => {
                  const clubInfo = CLUB_TYPES.find((c) => c.value === clubType);
                  return (
                    <div
                      key={clubType}
                      className="p-4 bg-tier-surface-base rounded-lg border border-tier-border-default"
                    >
                      <p className="font-semibold text-tier-navy mb-3">{clubInfo?.label}</p>
                      <div className="grid grid-cols-3 gap-3">
                        {['shot1', 'shot2', 'shot3'].map((shot, idx) => (
                          <div key={shot}>
                            <label className="block text-xs text-tier-text-secondary mb-1">Shot {idx + 1}</label>
                            <input
                              type="number"
                              step="0.1"
                              min="40"
                              max="150"
                              value={clubSpeeds[clubType]?.[shot as 'shot1' | 'shot2' | 'shot3'] || ''}
                              onChange={(e) =>
                                setClubSpeeds({
                                  ...clubSpeeds,
                                  [clubType]: { ...clubSpeeds[clubType], [shot]: e.target.value },
                                })
                              }
                              className="w-full px-3 py-2 border border-tier-border-default rounded"
                              placeholder="m/s"
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Notes & Submit */}
          {currentStep === 2 && (
            <div>
              <SubSectionTitle style={{ marginBottom: '1rem' }}>Notes (optional)</SubSectionTitle>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-tier-border-default rounded"
                rows={4}
                placeholder="E.g. used trackman, indoors, felt good..."
              />

              <div className="mt-6 p-4 bg-tier-info-light rounded-lg border border-tier-info">
                <div className="flex items-start gap-3">
                  <TrendingUp size={20} className="text-tier-info flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-tier-navy mb-1">Ready to save!</p>
                    <p className="text-sm text-tier-text-secondary">
                      Your calibration will be used to calculate more accurate test results and
                      recommendations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 mt-8">
            {currentStep > 0 && (
              <Button type="button" variant="secondary" onClick={() => setCurrentStep(currentStep - 1)}>
                Previous
              </Button>
            )}
            {currentStep < 2 ? (
              <Button
                type="button"
                variant="primary"
                className="flex-1"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
              >
                Next
              </Button>
            ) : (
              <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                {loading ? 'Saving...' : existingCalibration ? 'Update calibration' : 'Save calibration'}
              </Button>
            )}
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CalibrationPage;

/**
 * TIER Golf - Coach Edit Modal
 * Design System v3.0 - Premium Light
 *
 * Modal for editing existing coach accounts.
 * Uses coachesAPI.update() backend endpoint.
 */

import React, { useState, useEffect } from 'react';
import { X, Loader2, UserCog, Trash2 } from 'lucide-react';
import { coachesAPI } from '../../services/api';
import Button from '../../ui/primitives/Button';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';

interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specializations?: string[];
  maxPlayersPerSession?: number;
  isActive?: boolean;
}

interface CoachEditModalProps {
  isOpen: boolean;
  coach: Coach | null;
  onClose: () => void;
  onSuccess: () => void;
  onDelete?: (coachId: string) => void;
}

export const CoachEditModal: React.FC<CoachEditModalProps> = ({
  isOpen,
  coach,
  onClose,
  onSuccess,
  onDelete,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    specializations: '',
    maxPlayersPerSession: 4,
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form when coach changes
  useEffect(() => {
    if (coach) {
      setFormData({
        firstName: coach.firstName || '',
        lastName: coach.lastName || '',
        email: coach.email || '',
        specializations: coach.specializations?.join(', ') || '',
        maxPlayersPerSession: coach.maxPlayersPerSession || 4,
      });
    }
  }, [coach]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coach) return;

    if (!formData.firstName || !formData.lastName) {
      setError('Fyll ut alle obligatoriske felt');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await coachesAPI.update(coach.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        specializations: formData.specializations
          ? formData.specializations.split(',').map((s) => s.trim())
          : [],
        maxPlayersPerSession: formData.maxPlayersPerSession,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Failed to update coach:', err);
      const errorMessage = err instanceof Error ? err.message : 'Kunne ikke oppdatere trener';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!coach || !onDelete) return;

    setDeleting(true);
    setError(null);

    try {
      await coachesAPI.delete(coach.id);
      onDelete(coach.id);
      onClose();
    } catch (err: unknown) {
      console.error('Failed to delete coach:', err);
      const errorMessage = err instanceof Error ? err.message : 'Kunne ikke slette trener';
      setError(errorMessage);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!isOpen || !coach) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-tier-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-tier-border-default">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tier-navy/10 flex items-center justify-center">
              <UserCog size={20} className="text-tier-navy" />
            </div>
            <SectionTitle style={{ marginBottom: 0 }}>
              Rediger trener
            </SectionTitle>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-tier-surface-base rounded-lg transition-colors"
          >
            <X size={20} className="text-tier-text-tertiary" />
          </button>
        </div>

        {/* Delete confirmation */}
        {showDeleteConfirm ? (
          <div className="p-5">
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-tier-error/10 flex items-center justify-center">
                <Trash2 size={32} className="text-tier-error" />
              </div>
              <SubSectionTitle style={{ marginBottom: 8 }}>
                Slett trener?
              </SubSectionTitle>
              <p className="text-sm text-tier-text-secondary mb-6">
                Er du sikker på at du vil slette{' '}
                <span className="font-medium text-tier-navy">
                  {coach.firstName} {coach.lastName}
                </span>
                ? Denne handlingen kan ikke angres.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1"
                >
                  Avbryt
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 bg-tier-error hover:bg-tier-error/90"
                >
                  {deleting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sletter...
                    </>
                  ) : (
                    'Ja, slett'
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {error && (
              <div className="p-3 bg-tier-error/10 border border-tier-error/20 rounded-lg">
                <p className="text-sm text-tier-error">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tier-navy mb-1.5">
                  Fornavn *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-lg border border-tier-border-default bg-tier-white text-sm text-tier-navy outline-none focus:border-tier-navy transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tier-navy mb-1.5">
                  Etternavn *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-lg border border-tier-border-default bg-tier-white text-sm text-tier-navy outline-none focus:border-tier-navy transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-tier-navy mb-1.5">
                E-post
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full py-2.5 px-3 rounded-lg border border-tier-border-default bg-tier-surface-base text-sm text-tier-text-tertiary cursor-not-allowed"
              />
              <p className="text-xs text-tier-text-tertiary mt-1">
                E-post kan ikke endres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-tier-navy mb-1.5">
                Spesialiseringer
              </label>
              <input
                type="text"
                value={formData.specializations}
                onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                className="w-full py-2.5 px-3 rounded-lg border border-tier-border-default bg-tier-white text-sm text-tier-navy outline-none focus:border-tier-navy transition-colors"
                placeholder="Putting, Driving, Mental trening"
              />
              <p className="text-xs text-tier-text-tertiary mt-1">
                Separer med komma
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-tier-navy mb-1.5">
                Maks spillere per økt
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={formData.maxPlayersPerSession}
                onChange={(e) => setFormData({ ...formData, maxPlayersPerSession: parseInt(e.target.value) || 4 })}
                className="w-full py-2.5 px-3 rounded-lg border border-tier-border-default bg-tier-white text-sm text-tier-navy outline-none focus:border-tier-navy transition-colors"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                  className="text-tier-error hover:bg-tier-error/10"
                >
                  <Trash2 size={16} />
                </Button>
              )}
              <div className="flex-1" />
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Avbryt
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Lagrer...
                  </>
                ) : (
                  'Lagre endringer'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CoachEditModal;

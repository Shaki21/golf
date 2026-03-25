/**
 * TIER Golf - Delete Feature Flag Modal
 * Design System v3.0 - Premium Light
 *
 * Confirmation modal for deleting feature flags.
 * Uses featureFlagsAPI.delete() backend endpoint.
 */

import React, { useState } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import { featureFlagsAPI } from '../../services/api';
import Button from '../../ui/primitives/Button';
import { SectionTitle } from '../../components/typography/Headings';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
}

interface DeleteFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  flag: FeatureFlag | null;
}

export const DeleteFlagModal: React.FC<DeleteFlagModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  flag,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!flag) return;

    setLoading(true);
    setError(null);

    try {
      await featureFlagsAPI.delete(flag.key);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Failed to delete feature flag:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Kunne ikke slette funksjonsflagg';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !flag) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-tier-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-tier-border-default">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <SectionTitle style={{ marginBottom: 0 }}>
              Slett funksjonsflagg
            </SectionTitle>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-tier-surface-base rounded-lg transition-colors"
          >
            <X size={20} className="text-tier-text-tertiary" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-tier-text-primary">
              Er du sikker på at du vil slette funksjonsflagget{' '}
              <span className="font-semibold text-tier-navy">"{flag.name}"</span>?
            </p>

            <div className="p-3 bg-tier-surface-base rounded-lg">
              <code className="text-sm font-mono text-tier-text-secondary">
                {flag.key}
              </code>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                ⚠️ Denne handlingen kan ikke angres. Alle referanser til dette flagget vil slutte å fungere.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Avbryt
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirm}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sletter...
                </>
              ) : (
                'Slett flagg'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

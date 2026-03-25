/**
 * TIER Golf - Create Feature Flag Modal
 * Design System v3.0 - Premium Light
 *
 * Modal for creating new feature flags.
 * Uses featureFlagsAPI.create() backend endpoint.
 */

import React, { useState } from 'react';
import { X, Loader2, Flag } from 'lucide-react';
import { featureFlagsAPI } from '../../services/api';
import Button from '../../ui/primitives/Button';
import { SectionTitle } from '../../components/typography/Headings';

interface CreateFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateFlagModal: React.FC<CreateFlagModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    enabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.key || !formData.name) {
      setError('Key og navn er obligatorisk');
      return;
    }

    // Validate key format (snake_case)
    if (!/^[a-z0-9_]+$/.test(formData.key)) {
      setError('Key må være i snake_case format (kun små bokstaver, tall og understrek)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await featureFlagsAPI.create({
        key: formData.key,
        name: formData.name,
        description: formData.description,
        enabled: formData.enabled,
      });

      onSuccess();
      onClose();

      // Reset form
      setFormData({
        key: '',
        name: '',
        description: '',
        enabled: false,
      });
    } catch (err: unknown) {
      console.error('Failed to create feature flag:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Kunne ikke opprette funksjonsflagg';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-tier-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-tier-border-default">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tier-navy/10 flex items-center justify-center">
              <Flag size={20} className="text-tier-navy" />
            </div>
            <SectionTitle style={{ marginBottom: 0 }}>
              Opprett nytt funksjonsflagg
            </SectionTitle>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-tier-surface-base rounded-lg transition-colors"
          >
            <X size={20} className="text-tier-text-tertiary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-tier-navy">
              Key <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.key}
              onChange={(e) =>
                setFormData({ ...formData, key: e.target.value })
              }
              placeholder="new_feature_flag"
              className="w-full px-3 py-2 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-navy/20"
            />
            <p className="text-xs text-tier-text-secondary">
              Snake_case format (kun små bokstaver, tall og understrek)
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-tier-navy">
              Navn <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ny Funksjon"
              className="w-full px-3 py-2 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-navy/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-tier-navy">
              Beskrivelse
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Hva gjør denne funksjonen?"
              rows={3}
              className="w-full px-3 py-2 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-navy/20 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 p-3 bg-tier-surface-base rounded-lg">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) =>
                setFormData({ ...formData, enabled: e.target.checked })
              }
              className="w-4 h-4 text-tier-navy border-tier-border-default rounded focus:ring-tier-navy/20"
            />
            <label htmlFor="enabled" className="text-sm font-medium text-tier-navy cursor-pointer">
              Aktiver som standard
            </label>
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
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Oppretter...
                </>
              ) : (
                'Opprett flagg'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/**
 * TIER Golf - Admin Feature Flags Editor
 *
 * Archetype: A - List/Index Page with Full CRUD
 * Purpose: Manage system feature flags
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 * Full CRUD: Create, Read, Update, Delete, Toggle
 */

import React, { useEffect, useState } from 'react';
import {
  Flag,
  Plus,
  Search,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Page } from '../../ui/components/Page';
import { Text } from '../../ui/primitives';
import Button from '../../ui/primitives/Button';
import { featureFlagsAPI } from '../../services/api';
import { CreateFlagModal } from './CreateFlagModal';
import { EditFlagModal } from './EditFlagModal';
import { DeleteFlagModal } from './DeleteFlagModal';

// ============================================================================
// TYPES
// ============================================================================

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminFeatureFlagsEditor() {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [filteredFlags, setFilteredFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled'>('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);

  // Fetch feature flags
  const fetchFeatureFlags = async () => {
    setLoading(true);
    try {
      const response = await featureFlagsAPI.list();
      const flags = response.data.data || [];
      setFeatureFlags(flags);
      setFilteredFlags(flags);
    } catch (error) {
      console.error('Failed to fetch feature flags:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatureFlags();
  }, []);

  // Filter flags based on search and status
  useEffect(() => {
    let filtered = featureFlags;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (flag) =>
          flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
          flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (flag.description && flag.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter === 'enabled') {
      filtered = filtered.filter((flag) => flag.enabled);
    } else if (statusFilter === 'disabled') {
      filtered = filtered.filter((flag) => !flag.enabled);
    }

    setFilteredFlags(filtered);
  }, [featureFlags, searchQuery, statusFilter]);

  // Toggle flag
  const handleToggle = async (flag: FeatureFlag) => {
    try {
      await featureFlagsAPI.toggle(flag.key);
      fetchFeatureFlags();
    } catch (error) {
      console.error('Failed to toggle feature flag:', error);
    }
  };

  // Open edit modal
  const handleEdit = (flag: FeatureFlag) => {
    setSelectedFlag(flag);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleDelete = (flag: FeatureFlag) => {
    setSelectedFlag(flag);
    setShowDeleteModal(true);
  };

  // Success handlers
  const handleSuccess = () => {
    fetchFeatureFlags();
  };

  // Calculate stats
  const totalFlags = featureFlags.length;
  const enabledCount = featureFlags.filter((f) => f.enabled).length;
  const disabledCount = totalFlags - enabledCount;

  // Determine page state
  const pageState = loading ? 'loading' : featureFlags.length === 0 ? 'empty' : 'idle';

  return (
    <>
      <Page state={pageState} maxWidth="xl">
        <Page.Header
          title="Funksjonsflagg"
          subtitle="Administrer systemfunksjoner og aktiver/deaktiver features"
          helpText="Administrator-side for styring av funksjonsflagg (feature flags) som kontrollerer systemfunksjoner. Se alle flagg, filtrer etter status (aktiv/deaktivert), søk etter nøkkel eller navn. Opprett nye flagg, rediger beskrivelser, aktiver/deaktiver features og slett flagg. Bruk for å gradvis lansere funksjoner eller deaktivere features ved behov."
          actions={
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Opprett flagg
            </Button>
          }
        />

        <Page.Content>
          {/* Stats Cards */}
          {totalFlags > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-tier-white border border-tier-border-default rounded-xl p-4">
                <Text variant="caption1" color="secondary" className="mb-1">
                  Totalt antall
                </Text>
                <Text className="text-2xl font-bold text-tier-navy">
                  {totalFlags}
                </Text>
              </div>

              <div className="bg-tier-white border border-tier-border-default rounded-xl p-4">
                <Text variant="caption1" color="secondary" className="mb-1">
                  Aktiverte
                </Text>
                <Text className="text-2xl font-bold text-tier-success">
                  {enabledCount}
                </Text>
              </div>

              <div className="bg-tier-white border border-tier-border-default rounded-xl p-4">
                <Text variant="caption1" color="secondary" className="mb-1">
                  Deaktiverte
                </Text>
                <Text className="text-2xl font-bold text-tier-text-secondary">
                  {disabledCount}
                </Text>
              </div>
            </div>
          )}

          {/* Search and Filter Bar */}
          {totalFlags > 0 && (
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-tertiary"
                />
                <input
                  type="text"
                  placeholder="Søk etter nøkkel, navn eller beskrivelse..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-navy/20"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'enabled' | 'disabled')}
                className="px-4 py-2 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-navy/20 bg-tier-white"
              >
                <option value="all">Alle flagg</option>
                <option value="enabled">Kun aktiverte</option>
                <option value="disabled">Kun deaktiverte</option>
              </select>
            </div>
          )}

          {/* Flags Grid */}
          <Page.Section>
            {filteredFlags.length === 0 && !loading ? (
              <div className="text-center py-12">
                <Flag size={48} className="mx-auto mb-4 text-tier-text-tertiary" />
                <Text variant="body" color="secondary">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Ingen flagg matcher søket ditt'
                    : 'Ingen funksjonsflagg opprettet ennå'}
                </Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFlags.map((flag) => (
                  <div
                    key={flag.id}
                    className="bg-tier-white border border-tier-border-default rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    {/* Card Header */}
                    <div className="p-4 border-b border-tier-border-default">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <Text className="font-semibold text-tier-navy mb-1 truncate">
                            {flag.name}
                          </Text>
                          <code className="text-xs bg-tier-surface-base px-2 py-1 rounded text-tier-text-secondary font-mono">
                            {flag.key}
                          </code>
                        </div>

                        <button
                          onClick={() => handleToggle(flag)}
                          className={`
                            flex-shrink-0 p-2 rounded-lg transition-colors
                            ${
                              flag.enabled
                                ? 'bg-tier-success-light text-tier-success'
                                : 'bg-tier-surface-base text-tier-text-tertiary'
                            }
                          `}
                        >
                          {flag.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        </button>
                      </div>

                      {flag.description && (
                        <Text variant="caption1" color="secondary" className="mt-2 line-clamp-2">
                          {flag.description}
                        </Text>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="p-3 bg-tier-surface-base flex items-center gap-2">
                      <div
                        className={`
                          flex-1 px-3 py-1.5 rounded text-xs font-medium text-center
                          ${
                            flag.enabled
                              ? 'bg-tier-success-light text-tier-success'
                              : 'bg-tier-surface-base text-tier-text-secondary border border-tier-border-default'
                          }
                        `}
                      >
                        {flag.enabled ? 'Aktivert' : 'Deaktivert'}
                      </div>

                      <button
                        onClick={() => handleEdit(flag)}
                        className="p-2 hover:bg-tier-white rounded-lg transition-colors"
                        title="Rediger"
                      >
                        <Edit2 size={16} className="text-tier-text-secondary" />
                      </button>

                      <button
                        onClick={() => handleDelete(flag)}
                        className="p-2 hover:bg-tier-white rounded-lg transition-colors"
                        title="Slett"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Page.Section>
        </Page.Content>
      </Page>

      {/* Modals */}
      <CreateFlagModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleSuccess}
      />

      <EditFlagModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleSuccess}
        flag={selectedFlag}
      />

      <DeleteFlagModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onSuccess={handleSuccess}
        flag={selectedFlag}
      />
    </>
  );
}

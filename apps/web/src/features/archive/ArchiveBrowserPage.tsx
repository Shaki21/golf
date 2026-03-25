/**
 * Archive Browser Page
 * Browse and manage archived data
 */

import React, { useState } from 'react';
import { Archive, RotateCcw, Trash2, CheckSquare } from 'lucide-react';
import {
  useArchive,
  useArchiveCount,
  useRestoreArchiveItem,
  useDeleteArchiveItem,
  useBulkDeleteArchive
} from '../../hooks/useArchive';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import PageHeader from '../../components/layout/PageHeader';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';

const ENTITY_TYPES = [
  { value: '', label: 'Alle typer' },
  { value: 'test', label: 'Tester' },
  { value: 'session', label: 'Økter' },
  { value: 'goal', label: 'Mål' },
  { value: 'exercise', label: 'Øvelser' },
  { value: 'note', label: 'Notater' },
  { value: 'video', label: 'Videoer' },
  { value: 'document', label: 'Dokumenter' },
];

const ArchiveBrowserPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { items, loading, error, refetch } = useArchive(selectedType || null);
  const { count } = useArchiveCount();
  const { restoreItem, loading: restoring } = useRestoreArchiveItem();
  const { deleteItem, loading: deleting } = useDeleteArchiveItem();
  const { bulkDelete, loading: bulkDeleting } = useBulkDeleteArchive();

  const handleRestore = async (itemId: string) => {
    try {
      await restoreItem(itemId);
      refetch();
    } catch (err) {
      console.error('Failed to restore:', err);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      await deleteItem(itemToDelete);
      setShowDeleteModal(false);
      setItemToDelete(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;

    if (!window.confirm(`Slett permanent ${selectedItems.length} elementer fra arkivet? Dette kan ikke angres.`)) {
      return;
    }

    try {
      await bulkDelete(selectedItems);
      setSelectedItems([]);
      refetch();
    } catch (err) {
      console.error('Failed to bulk delete:', err);
    }
  };

  const toggleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map((item: any) => item.id));
    }
  };

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Arkiv"
          subtitle="Administrer arkiverte elementer"
          helpText=""
          actions={null}
        />

        {/* Stats */}
        {count && (
          <Card className="mb-6">
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-tier-text-secondary mb-1">Totalt</div>
                  <div className="text-2xl font-bold text-tier-navy">{count.total || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-tier-text-secondary mb-1">Tester</div>
                  <div className="text-2xl font-bold text-tier-navy">{count.byType?.test || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-tier-text-secondary mb-1">Økter</div>
                  <div className="text-2xl font-bold text-tier-navy">{count.byType?.session || 0}</div>
                </div>
                <div>
                  <div className="text-sm text-tier-text-secondary mb-1">Andre</div>
                  <div className="text-2xl font-bold text-tier-navy">
                    {(count.total || 0) - (count.byType?.test || 0) - (count.byType?.session || 0)}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Filters and actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-tier-border-default rounded-lg text-tier-navy"
            >
              {ENTITY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            {items.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<CheckSquare size={16} />}
                onClick={toggleSelectAll}
              >
                {selectedItems.length === items.length ? 'Avmerk alle' : 'Merk alle'}
              </Button>
            )}
          </div>

          {selectedItems.length > 0 && (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 size={16} />}
              onClick={handleBulkDelete}
              loading={bulkDeleting}
            >
              Slett {selectedItems.length} valgte
            </Button>
          )}
        </div>

        {/* Archive list */}
        {loading ? (
          <Card>
            <div className="p-12 text-center text-tier-text-secondary">Laster arkiv...</div>
          </Card>
        ) : error ? (
          <Card>
            <div className="p-12 text-center text-tier-error">{error}</div>
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <Archive size={64} className="mx-auto text-tier-text-tertiary mb-4" />
              <SubSectionTitle style={{ marginBottom: '0.5rem' }}>Tomt arkiv</SubSectionTitle>
              <p className="text-tier-text-secondary">
                {selectedType
                  ? `Ingen arkiverte ${ENTITY_TYPES.find((t) => t.value === selectedType)?.label.toLowerCase()}`
                  : 'Ingen arkiverte elementer'}
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {items.map((item: any) => (
              <Card key={item.id}>
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleSelectItem(item.id)}
                      className="mt-1 w-5 h-5 text-tier-info"
                    />

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <SubSectionTitle style={{ marginBottom: '0.25rem' }}>
                            {item.entityName || item.entityId}
                          </SubSectionTitle>
                          <div className="flex items-center gap-3 text-sm text-tier-text-secondary">
                            <span className="px-2 py-1 bg-tier-surface-base rounded text-tier-navy font-medium">
                              {ENTITY_TYPES.find((t) => t.value === item.entityType)?.label || item.entityType}
                            </span>
                            <span>Arkivert {new Date(item.archivedAt).toLocaleDateString('no-NO')}</span>
                          </div>
                        </div>
                      </div>

                      {item.reason && (
                        <p className="text-sm text-tier-text-secondary mb-4">
                          <span className="font-medium">Årsak:</span> {item.reason}
                        </p>
                      )}

                      {item.data && (
                        <div className="text-sm text-tier-text-secondary bg-tier-surface-base rounded p-3 mb-4">
                          <pre className="whitespace-pre-wrap font-mono text-xs">
                            {JSON.stringify(item.data, null, 2).slice(0, 500)}
                            {JSON.stringify(item.data, null, 2).length > 500 && '...'}
                          </pre>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<RotateCcw size={16} />}
                          onClick={() => handleRestore(item.id)}
                          loading={restoring}
                        >
                          Gjenopprett
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={<Trash2 size={16} />}
                          onClick={() => {
                            setItemToDelete(item.id);
                            setShowDeleteModal(true);
                          }}
                          loading={deleting}
                        >
                          Slett permanent
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Delete confirmation modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <SectionTitle style={{ marginBottom: '1rem' }}>Bekreft sletting</SectionTitle>
              <p className="text-tier-text-secondary mb-6">
                Er du sikker på at du vil slette dette elementet permanent? Dette kan ikke angres.
              </p>
              <div className="flex gap-3">
                <Button variant="danger" className="flex-1" onClick={handleDelete} loading={deleting}>
                  Slett permanent
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                  }}
                >
                  Avbryt
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArchiveBrowserPage;

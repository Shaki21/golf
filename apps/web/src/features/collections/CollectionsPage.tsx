/**
 * Collections Page
 * Organize videos, exercises, and training plans into collections
 */

import React, { useState } from 'react';
import { Folder, Plus, Edit2, Trash2, FolderPlus, Video, Target, Calendar, X } from 'lucide-react';
import { PageTitle, SectionTitle, SubSectionTitle } from '../../components/typography/Headings';
import {
  useCollections,
  useCollection,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
  useRemoveCollectionItem,
} from '../../hooks/useCollections';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';

interface Collection {
  id: string;
  name: string;
  description?: string;
  isPublic?: boolean;
  createdAt: string;
  items?: Array<any>;
}

const CollectionsPage: React.FC = () => {
  const { collections, loading, error, refetch } = useCollections();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any>(null);

  const { collection, loading: collectionLoading, refetch: refetchCollection } = useCollection(
    selectedCollectionId || ''
  ) as { collection: Collection | null; loading: boolean; refetch: () => void };
  const { createCollection } = useCreateCollection();
  const { updateCollection } = useUpdateCollection();
  const { deleteCollection } = useDeleteCollection();
  const { removeItem } = useRemoveCollectionItem();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCollection(formData);
      setShowCreateModal(false);
      setFormData({ name: '', description: '', isPublic: false });
      refetch();
    } catch (err) {
      console.error('Error creating collection:', err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection) return;
    try {
      await updateCollection(editingCollection.id, formData);
      setShowEditModal(false);
      setEditingCollection(null);
      refetch();
      if (selectedCollectionId === editingCollection.id) {
        refetchCollection();
      }
    } catch (err) {
      console.error('Error updating collection:', err);
    }
  };

  const handleDelete = async (collectionId: string) => {
    if (!confirm('Slette denne samlingen?')) return;
    try {
      await deleteCollection(collectionId);
      if (selectedCollectionId === collectionId) {
        setSelectedCollectionId(null);
      }
      refetch();
    } catch (err) {
      console.error('Error deleting collection:', err);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!selectedCollectionId || !confirm('Fjerne dette elementet fra samlingen?')) return;
    try {
      await removeItem(selectedCollectionId, itemId);
      refetchCollection();
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video size={16} className="text-tier-info" />;
      case 'exercise':
        return <Target size={16} className="text-tier-success" />;
      case 'plan':
        return <Calendar size={16} className="text-tier-warning" />;
      default:
        return <Folder size={16} className="text-tier-text-secondary" />;
    }
  };

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Folder size={28} className="text-tier-navy" />
              <PageTitle style={{ marginBottom: 0 }}>Samlinger</PageTitle>
            </div>
            <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
              Ny samling
            </Button>
          </div>
          <p className="text-tier-text-secondary">Organiser videoer, øvelser og planer i samlinger</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Collections List */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-4">
                <SectionTitle style={{ marginBottom: '1rem' }}>Mine samlinger</SectionTitle>
                {loading ? (
                  <p className="text-center text-tier-text-secondary py-8">Laster...</p>
                ) : error ? (
                  <p className="text-center text-tier-error py-8">{error}</p>
                ) : collections.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderPlus size={48} className="mx-auto text-tier-text-tertiary mb-4" />
                    <p className="text-sm text-tier-text-secondary">Ingen samlinger ennå</p>
                    <Button variant="secondary" size="sm" className="mt-4" onClick={() => setShowCreateModal(true)}>
                      Opprett første samling
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {collections.map((coll: any) => (
                      <div
                        key={coll.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedCollectionId === coll.id
                            ? 'border-tier-navy bg-tier-navy-light'
                            : 'border-tier-border-default hover:border-tier-navy hover:bg-tier-surface-base'
                        }`}
                        onClick={() => setSelectedCollectionId(coll.id)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Folder size={18} className="text-tier-navy flex-shrink-0" />
                            <p className="font-medium text-tier-navy text-sm truncate">{coll.name}</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCollection(coll);
                                setFormData({
                                  name: coll.name,
                                  description: coll.description || '',
                                  isPublic: coll.isPublic || false,
                                });
                                setShowEditModal(true);
                              }}
                              className="p-1 hover:bg-tier-surface-base rounded"
                            >
                              <Edit2 size={14} className="text-tier-text-secondary" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(coll.id);
                              }}
                              className="p-1 hover:bg-tier-error-light rounded"
                            >
                              <Trash2 size={14} className="text-tier-error" />
                            </button>
                          </div>
                        </div>
                        {coll.description && (
                          <p className="text-xs text-tier-text-secondary line-clamp-2 mb-2">{coll.description}</p>
                        )}
                        <div className="flex items-center justify-between text-xs text-tier-text-secondary">
                          <span>{coll._count?.items || 0} elementer</span>
                          {coll.isPublic && <span className="text-tier-info">Offentlig</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Collection Detail */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-4">
                {!selectedCollectionId ? (
                  <div className="text-center py-12">
                    <Folder size={64} className="mx-auto text-tier-text-tertiary mb-4" />
                    <SubSectionTitle style={{ marginBottom: '0.5rem' }}>Velg en samling</SubSectionTitle>
                    <p className="text-sm text-tier-text-secondary">Velg en samling fra listen for å se innholdet</p>
                  </div>
                ) : collectionLoading ? (
                  <div className="text-center py-12">
                    <p className="text-tier-text-secondary">Laster samling...</p>
                  </div>
                ) : collection ? (
                  <div>
                    <div className="mb-6 pb-4 border-b border-tier-border-default">
                      <SectionTitle style={{ marginBottom: '0.5rem' }}>{collection?.name || 'Untitled'}</SectionTitle>
                      {collection?.description && (
                        <p className="text-sm text-tier-text-secondary mb-3">{collection.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-tier-text-secondary">
                        <span>{collection?.items?.length || 0} elementer</span>
                        <span>Opprettet {collection?.createdAt ? new Date(collection.createdAt).toLocaleDateString('no-NO') : 'N/A'}</span>
                        {collection?.isPublic && (
                          <span className="px-2 py-1 bg-tier-info-light text-tier-info rounded text-xs">Offentlig</span>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    {collection?.items && collection.items.length > 0 ? (
                      <div className="space-y-3">
                        {collection.items.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 bg-tier-surface-base rounded-lg border border-tier-border-default"
                          >
                            {getItemIcon(item.type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-tier-navy text-sm">{item.title || item.name || 'Untitled'}</p>
                              <p className="text-xs text-tier-text-secondary capitalize">{item.type}</p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-2 hover:bg-tier-error-light rounded transition-colors"
                            >
                              <X size={16} className="text-tier-error" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Target size={48} className="mx-auto text-tier-text-tertiary mb-4" />
                        <SubSectionTitle style={{ marginBottom: '0.5rem' }}>Tom samling</SubSectionTitle>
                        <p className="text-sm text-tier-text-secondary mb-4">
                          Legg til videoer, øvelser eller planer i denne samlingen
                        </p>
                        <Button variant="secondary" size="sm">
                          Legg til innhold
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-tier-error">Kunne ikke laste samling</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <SectionTitle style={{ marginBottom: '1rem' }}>Ny samling</SectionTitle>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-tier-navy mb-1">Navn</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-tier-border-default rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-tier-navy mb-1">Beskrivelse</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-tier-border-default rounded"
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  />
                  <label htmlFor="isPublic" className="text-sm text-tier-navy">
                    Offentlig samling
                  </label>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" variant="primary" className="flex-1">
                    Opprett
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ name: '', description: '', isPublic: false });
                    }}
                  >
                    Avbryt
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingCollection && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <SectionTitle style={{ marginBottom: '1rem' }}>Rediger samling</SectionTitle>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-tier-navy mb-1">Navn</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-tier-border-default rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-tier-navy mb-1">Beskrivelse</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-tier-border-default rounded"
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPublicEdit"
                    checked={formData.isPublic}
                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  />
                  <label htmlFor="isPublicEdit" className="text-sm text-tier-navy">
                    Offentlig samling
                  </label>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" variant="primary" className="flex-1">
                    Lagre
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingCollection(null);
                    }}
                  >
                    Avbryt
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsPage;

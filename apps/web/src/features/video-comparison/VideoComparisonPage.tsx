/**
 * Video Comparison Page
 * Side-by-side video comparison with synchronized playback
 */

import React, { useState } from 'react';
import { Play, Pause, Plus, Trash2, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  useVideoComparisons,
  useVideoComparison,
  useCreateVideoComparison,
  useUpdateVideoComparison,
  useDeleteVideoComparison,
} from '../../hooks/useVideoComparisons';
import { useVideos as usePlayerVideos } from '../../hooks/useVideos';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import PageHeader from '../../components/layout/PageHeader';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';

const VideoComparisonPage: React.FC = () => {
  const [selectedComparisonId, setSelectedComparisonId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingComparison, setEditingComparison] = useState<any>(null);

  const { comparisons, loading, error, refetch } = useVideoComparisons();
  const { comparison, loading: comparisonLoading, refetch: refetchComparison } = useVideoComparison(selectedComparisonId || '');
  const { deleteComparison } = useDeleteVideoComparison();

  const handleDelete = async (comparisonId: string) => {
    if (!confirm('Delete this comparison?')) return;
    try {
      await deleteComparison(comparisonId);
      if (selectedComparisonId === comparisonId) {
        setSelectedComparisonId(null);
      }
      refetch();
    } catch (err) {
      console.error('Error deleting comparison:', err);
    }
  };

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Video Comparison"
          subtitle="Compare videos side-by-side with synchronized playback"
          helpText=""
          actions={null}
        />

        <div className="mb-6">
          <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
            New comparison
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Comparisons List */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-4">
                <SectionTitle style={{ marginBottom: '1rem' }} className="text-lg font-semibold text-tier-navy">My comparisons</SectionTitle>
                {loading ? (
                  <p className="text-center text-tier-text-secondary py-8">Loading...</p>
                ) : error ? (
                  <p className="text-center text-tier-error py-8">{error}</p>
                ) : comparisons.length === 0 ? (
                  <div className="text-center py-8">
                    <Play size={48} className="mx-auto text-tier-text-tertiary mb-4" />
                    <p className="text-sm text-tier-text-secondary">No comparisons yet</p>
                    <Button variant="secondary" size="sm" className="mt-4" onClick={() => setShowCreateModal(true)}>
                      Create first comparison
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {comparisons.map((comp: any) => (
                      <div
                        key={comp.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedComparisonId === comp.id
                            ? 'border-tier-navy bg-tier-navy-light'
                            : 'border-tier-border-default hover:border-tier-navy hover:bg-tier-surface-base'
                        }`}
                        onClick={() => setSelectedComparisonId(comp.id)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-medium text-tier-navy text-sm line-clamp-2">
                            {comp.title || 'Untitled comparison'}
                          </p>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingComparison(comp);
                              }}
                              className="p-1 hover:bg-tier-surface-base rounded"
                            >
                              <Edit2 size={14} className="text-tier-text-secondary" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(comp.id);
                              }}
                              className="p-1 hover:bg-tier-error-light rounded"
                            >
                              <Trash2 size={14} className="text-tier-error" />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-tier-text-secondary">
                          Created {new Date(comp.createdAt).toLocaleDateString('en-US')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Comparison Viewer */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-4">
                {!selectedComparisonId ? (
                  <div className="text-center py-12">
                    <Play size={64} className="mx-auto text-tier-text-tertiary mb-4" />
                    <SubSectionTitle style={{ marginBottom: '0.5rem' }} className="text-lg font-semibold text-tier-navy">Select a comparison</SubSectionTitle>
                    <p className="text-sm text-tier-text-secondary">Select a comparison from the list to view videos side-by-side</p>
                  </div>
                ) : comparisonLoading ? (
                  <div className="text-center py-12">
                    <p className="text-tier-text-secondary">Loading comparison...</p>
                  </div>
                ) : comparison ? (
                  <ComparisonViewer comparison={comparison} />
                ) : (
                  <div className="text-center py-12">
                    <p className="text-tier-error">Could not load comparison</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Create Comparison Modal */}
        {showCreateModal && (
          <CreateComparisonModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              refetch();
            }}
          />
        )}

        {/* Edit Comparison Modal */}
        {editingComparison && (
          <EditComparisonModal
            comparison={editingComparison}
            onClose={() => setEditingComparison(null)}
            onSuccess={() => {
              setEditingComparison(null);
              refetch();
              if (selectedComparisonId === editingComparison.id) {
                refetchComparison();
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Comparison Viewer Component
// ============================================================================

interface ComparisonViewerProps {
  comparison: any;
}

const ComparisonViewer: React.FC<ComparisonViewerProps> = ({ comparison }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  return (
    <div>
      <div className="mb-6 pb-4 border-b border-tier-border-default">
        <SectionTitle style={{ marginBottom: '0.5rem' }} className="text-xl font-bold text-tier-navy">
          {comparison.title || 'Untitled comparison'}
        </SectionTitle>
        {comparison.notes && (
          <p className="text-sm text-tier-text-secondary">{comparison.notes}</p>
        )}
      </div>

      {/* Side-by-side Video Players */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-tier-navy">Primary video</p>
          <div className="bg-tier-surface-base rounded-lg border border-tier-border-default aspect-video flex items-center justify-center">
            <Play size={48} className="text-tier-text-tertiary" />
            <p className="text-sm text-tier-text-secondary ml-2">Video player goes here</p>
          </div>
          <p className="text-xs text-tier-text-secondary">Sync point: {comparison.syncPoint1}s</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-tier-navy">Compare with</p>
          <div className="bg-tier-surface-base rounded-lg border border-tier-border-default aspect-video flex items-center justify-center">
            <Play size={48} className="text-tier-text-tertiary" />
            <p className="text-sm text-tier-text-secondary ml-2">Video player goes here</p>
          </div>
          <p className="text-xs text-tier-text-secondary">Sync point: {comparison.syncPoint2}s</p>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="bg-tier-surface-base rounded-xl border border-tier-border-default p-4">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Button variant="secondary" size="sm" leftIcon={<ChevronLeft size={16} />}>
            -0.1s
          </Button>
          <Button
            variant={isPlaying ? 'secondary' : 'primary'}
            size="lg"
            leftIcon={isPlaying ? <Pause size={20} /> : <Play size={20} />}
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button variant="secondary" size="sm" rightIcon={<ChevronRight size={16} />}>
            +0.1s
          </Button>
        </div>

        {/* Timeline Slider */}
        <div className="w-full">
          <input
            type="range"
            min="0"
            max="100"
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="w-full h-2 bg-tier-border-default rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-tier-text-secondary mt-1">
            <span>0:00</span>
            <span>Synchronized playback</span>
            <span>0:10</span>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-tier-text-secondary">
            Videos are synchronized based on the sync points you have set
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Create Comparison Modal
// ============================================================================

interface CreateComparisonModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateComparisonModal: React.FC<CreateComparisonModalProps> = ({ onClose, onSuccess }) => {
  const { createComparison, loading } = useCreateVideoComparison();
  const { videos } = usePlayerVideos({});

  const [formData, setFormData] = useState({
    primaryVideoId: '',
    comparisonVideoId: '',
    title: '',
    notes: '',
    syncPoint1: 0,
    syncPoint2: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.primaryVideoId || !formData.comparisonVideoId) {
      alert('Select both primary video and comparison video');
      return;
    }
    try {
      await createComparison(formData);
      onSuccess();
    } catch (err) {
      console.error('Error creating comparison:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <SectionTitle style={{ marginBottom: '1rem' }} className="text-xl font-bold text-tier-navy">New video comparison</SectionTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-tier-navy mb-1">Title (optional)</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-tier-border-default rounded"
              placeholder="E.g. Driver swing comparison"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-tier-navy mb-1">Primary video *</label>
              <select
                value={formData.primaryVideoId}
                onChange={(e) => setFormData({ ...formData, primaryVideoId: e.target.value })}
                className="w-full px-3 py-2 border border-tier-border-default rounded"
                required
              >
                <option value="">Select video</option>
                {videos.map((video: any) => (
                  <option key={video.id} value={video.id}>
                    {video.title || 'Untitled'} - {new Date(video.uploadedAt).toLocaleDateString('en-US')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-tier-navy mb-1">Compare with *</label>
              <select
                value={formData.comparisonVideoId}
                onChange={(e) => setFormData({ ...formData, comparisonVideoId: e.target.value })}
                className="w-full px-3 py-2 border border-tier-border-default rounded"
                required
              >
                <option value="">Select video</option>
                {videos.map((video: any) => (
                  <option key={video.id} value={video.id}>
                    {video.title || 'Untitled'} - {new Date(video.uploadedAt).toLocaleDateString('en-US')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-tier-navy mb-1">
                Sync point primary (seconds) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.syncPoint1}
                onChange={(e) => setFormData({ ...formData, syncPoint1: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-tier-border-default rounded"
                required
              />
              <p className="text-xs text-tier-text-secondary mt-1">
                Timestamp to start playback from
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-tier-navy mb-1">
                Sync point comparison (seconds) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.syncPoint2}
                onChange={(e) => setFormData({ ...formData, syncPoint2: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-tier-border-default rounded"
                required
              />
              <p className="text-xs text-tier-text-secondary mt-1">
                Timestamp to start playback from
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-tier-navy mb-1">Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-tier-border-default rounded"
              rows={3}
              placeholder="What do you want to compare? What differences do you see?"
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
              {loading ? 'Creating...' : 'Create comparison'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// Edit Comparison Modal
// ============================================================================

interface EditComparisonModalProps {
  comparison: any;
  onClose: () => void;
  onSuccess: () => void;
}

const EditComparisonModal: React.FC<EditComparisonModalProps> = ({ comparison, onClose, onSuccess }) => {
  const { updateComparison, loading } = useUpdateVideoComparison();

  const [formData, setFormData] = useState({
    title: comparison.title || '',
    notes: comparison.notes || '',
    syncPoint1: comparison.syncPoint1,
    syncPoint2: comparison.syncPoint2,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateComparison(comparison.id, formData);
      onSuccess();
    } catch (err) {
      console.error('Error updating comparison:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6">
        <SectionTitle style={{ marginBottom: '1rem' }} className="text-xl font-bold text-tier-navy">Edit comparison</SectionTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-tier-navy mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-tier-border-default rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-tier-navy mb-1">
                Sync point primary (seconds)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.syncPoint1}
                onChange={(e) => setFormData({ ...formData, syncPoint1: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-tier-border-default rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-tier-navy mb-1">
                Sync point comparison (seconds)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.syncPoint2}
                onChange={(e) => setFormData({ ...formData, syncPoint2: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-tier-border-default rounded"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-tier-navy mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-tier-border-default rounded"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
              {loading ? 'Saving...' : 'Save changes'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VideoComparisonPage;

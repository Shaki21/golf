/**
 * Season Management Page
 * Multi-season planning and periodization
 */

import React, { useState } from 'react';
import { Calendar, Plus, TrendingUp } from 'lucide-react';
// import { useSeasons, useCreateSeason } from '../../hooks/useSeason'; // TODO: Fix hook exports
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../ui/primitives/Card';
import Button from '../../ui/primitives/Button';
import PageHeader from '../../components/layout/PageHeader';
import { SectionTitle, SubSectionTitle } from '../../components/typography';

const SeasonManagementPage: React.FC = () => {
  const { user } = useAuth();
  const playerId = user?.playerId || user?.id;
  // TODO: Implement useSeasons hook or use correct import
  const seasons: any[] = [];
  const loading = false;
  const error = null;
  const refetch = () => {};
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!playerId) {
    return (
      <div className="min-h-screen bg-tier-surface-base p-6">
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="p-8 text-center text-tier-error">Ingen bruker funnet. Vennligst logg inn.</div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base p-6">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Sesongplanlegging"
          subtitle="Planlegg og følg opp treningssesonger"
          helpText=""
          actions={null}
        />

        <div className="mb-6">
          <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
            Ny sesong
          </Button>
        </div>

        {loading ? (
          <Card><div className="p-12 text-center text-tier-text-secondary">Laster sesonger...</div></Card>
        ) : error ? (
          <Card><div className="p-12 text-center text-tier-error">{error}</div></Card>
        ) : seasons.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <Calendar size={64} className="mx-auto text-tier-text-tertiary mb-4" />
              <SubSectionTitle className="mb-2">Ingen sesonger planlagt</SubSectionTitle>
              <p className="text-tier-text-secondary mb-6">Start med å lage din første treningssesong</p>
              <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
                Opprett første sesong
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4">
            {seasons.map((season: any) => (
              <Card key={season.id}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <SubSectionTitle className="mb-1">{season.name}</SubSectionTitle>
                      <p className="text-sm text-tier-text-secondary">
                        {new Date(season.startDate).toLocaleDateString('no-NO')} - {new Date(season.endDate).toLocaleDateString('no-NO')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      season.status === 'active' ? 'bg-tier-success-light text-tier-success' :
                      season.status === 'planned' ? 'bg-tier-info-light text-tier-info' :
                      'bg-tier-border-default text-tier-text-secondary'
                    }`}>
                      {season.status === 'active' ? 'Aktiv' : season.status === 'planned' ? 'Planlagt' : 'Avsluttet'}
                    </span>
                  </div>
                  {season.goals && (
                    <div className="flex items-center gap-2 text-sm text-tier-text-secondary">
                      <TrendingUp size={16} />
                      <span>{season.goals}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {showCreateModal && (
          <CreateSeasonModal
            playerId={playerId}
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              refetch();
            }}
          />
        )}
      </div>
    </div>
  );
};

interface CreateSeasonModalProps {
  playerId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateSeasonModal: React.FC<CreateSeasonModalProps> = ({ playerId, onClose, onSuccess }) => {
  // TODO: Implement useCreateSeason hook
  const createSeason = async (_data: any) => {
    // TODO: Implement API call
  };
  const loading = false;

  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    goals: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSeason({ ...formData, playerId });
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <SectionTitle className="mb-4">Ny sesong</SectionTitle>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-tier-navy mb-1">Navn</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-tier-border-default rounded"
              placeholder="F.eks. Vår 2025"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-tier-navy mb-1">Startdato</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-tier-border-default rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-tier-navy mb-1">Sluttdato</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-tier-border-default rounded"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-tier-navy mb-1">Mål</label>
            <textarea
              value={formData.goals}
              onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
              className="w-full px-3 py-2 border border-tier-border-default rounded"
              rows={3}
              placeholder="Hva vil du oppnå denne sesongen?"
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
              {loading ? 'Oppretter...' : 'Opprett sesong'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Avbryt
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeasonManagementPage;

import React, { useState, useEffect } from 'react';
import { peerComparisonAPI, Player } from '../../services/api';
import { useToast } from '../../components/shadcn/use-toast';
import Button from '../../ui/primitives/Button';
import Card from '../../ui/primitives/Card';
import { Select } from '../../ui/primitives/Input';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';
import { Users, Filter, ChevronRight } from 'lucide-react';

interface PeerGroupSelectorProps {
  onSelectPlayer?: (playerId: string) => void;
  onCompare?: (playerIds: string[]) => void;
  initialCategory?: string;
  initialGender?: string;
  initialAgeGroup?: string;
}

const categoryOptions = [
  { value: 'A', label: 'Kategori A' },
  { value: 'B', label: 'Kategori B' },
  { value: 'C', label: 'Kategori C' },
  { value: 'D', label: 'Kategori D' },
];

const genderOptions = [
  { value: 'male', label: 'Gutter/Menn' },
  { value: 'female', label: 'Jenter/Kvinner' },
  { value: 'all', label: 'Alle' },
];

const ageGroupOptions = [
  { value: 'junior', label: 'Junior (under 18)' },
  { value: 'adult', label: 'Voksen (18+)' },
  { value: 'senior', label: 'Senior (50+)' },
  { value: 'all', label: 'Alle aldere' },
];

export const PeerGroupSelector: React.FC<PeerGroupSelectorProps> = ({
  onSelectPlayer,
  onCompare,
  initialCategory = 'B',
  initialGender = 'all',
  initialAgeGroup = 'all',
}) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    category: initialCategory,
    gender: initialGender,
    ageGroup: initialAgeGroup,
  });
  const [peers, setPeers] = useState<Player[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const searchPeers = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const response = await peerComparisonAPI.getPeerGroup(
        filters.category,
        filters.gender,
        filters.ageGroup
      );
      setPeers(response.data.data || []);
      setSelectedIds([]);
    } catch (error) {
      toast({ title: 'Feil', description: 'Kunne ikke hente peer-gruppe', variant: 'destructive' });
      // Demo data
      setPeers([
        { id: '1', firstName: 'Anders', lastName: 'Hansen', category: 'B', email: '', gender: 'male', dateOfBirth: '', tenantId: '' },
        { id: '2', firstName: 'Erik', lastName: 'Johansen', category: 'B', email: '', gender: 'male', dateOfBirth: '', tenantId: '' },
        { id: '3', firstName: 'Sofie', lastName: 'Berg', category: 'B', email: '', gender: 'female', dateOfBirth: '', tenantId: '' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (playerId: string) => {
    setSelectedIds(prev =>
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  return (
    <Card variant="default" padding="lg">
      <SectionTitle className="mb-4">Peer-gruppe</SectionTitle>

      {/* Filters */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Select
          label="Kategori"
          options={categoryOptions}
          value={filters.category}
          onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
        />
        <Select
          label="Kjonn"
          options={genderOptions}
          value={filters.gender}
          onChange={(value) => setFilters(prev => ({ ...prev, gender: value }))}
        />
        <Select
          label="Aldersgruppe"
          options={ageGroupOptions}
          value={filters.ageGroup}
          onChange={(value) => setFilters(prev => ({ ...prev, ageGroup: value }))}
        />
      </div>

      <Button
        variant="primary"
        onClick={searchPeers}
        loading={loading}
        fullWidth
        className="mb-4"
      >
        <Filter size={16} />
        Søk etter peers
      </Button>

      {/* Results */}
      {searched && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <SubSectionTitle>
              {peers.length} spillere funnet
            </SubSectionTitle>
            {selectedIds.length > 0 && onCompare && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onCompare(selectedIds)}
              >
                Sammenlign ({selectedIds.length})
              </Button>
            )}
          </div>

          {peers.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {peers.map(player => {
                const isSelected = selectedIds.includes(player.id);
                return (
                  <div
                    key={player.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-tier-navy/10 border-2 border-tier-navy'
                        : 'bg-tier-surface-base hover:bg-tier-border-default border-2 border-transparent'
                    }`}
                    onClick={() => onCompare ? toggleSelect(player.id) : onSelectPlayer?.(player.id)}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                      isSelected ? 'bg-tier-navy' : 'bg-tier-text-secondary'
                    }`}>
                      {player.firstName[0]}{player.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-tier-navy">
                        {player.firstName} {player.lastName}
                      </p>
                      <p className="text-xs text-tier-text-secondary">
                        Kat. {player.category} • HCP {player.handicap || '-'}
                      </p>
                    </div>
                    {onSelectPlayer && !onCompare && (
                      <ChevronRight size={18} className="text-tier-text-secondary" />
                    )}
                    {onCompare && isSelected && (
                      <div className="w-5 h-5 rounded-full bg-tier-navy flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users size={32} className="mx-auto text-tier-border-default mb-2" />
              <p className="text-tier-text-secondary">Ingen spillere matcher kriteriene</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default PeerGroupSelector;

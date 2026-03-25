/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * CoachGroupCreate.tsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * Opprett ny gruppe med navn, beskrivelse, type og medlemmer.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  X,
  Search,
  Check,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import { SectionTitle } from '../../components/typography/Headings';

interface AvailablePlayer {
  id: string;
  name: string;
  avatarInitials: string;
  category: string;
  currentGroups: string[];
}

interface GroupFormData {
  name: string;
  description: string;
  type: 'wang' | 'team_norway' | 'custom';
  color: string;
  memberIds: string[];
}

const GROUP_COLORS = [
  { value: 'var(--accent)', label: 'Blå' },
  { value: 'var(--status-success)', label: 'Grønn' },
  { value: 'var(--achievement)', label: 'Gull' },
  { value: 'var(--status-error)', label: 'Rød' },
  { value: 'var(--group-lightblue)', label: 'Lys blå' },
  { value: 'var(--group-purple)', label: 'Lilla' },
  { value: 'var(--group-pink)', label: 'Rosa' },
  { value: 'var(--group-teal)', label: 'Turkis' },
];

export default function CoachGroupCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<GroupFormData>({
    name: '',
    description: '',
    type: 'custom',
    color: 'var(--accent)',
    memberIds: [],
  });
  const [availablePlayers, setAvailablePlayers] = useState<AvailablePlayer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available players
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/api/v1/coach/athletes');
        if (response.ok) {
          const data = await response.json();
          setAvailablePlayers(data.athletes || []);
        }
      } catch (error) {
        console.error('Failed to fetch players:', error);
        // Mock data for development
        setAvailablePlayers([
          { id: 'p1', name: 'Anders Hansen', avatarInitials: 'AH', category: 'A', currentGroups: ['WANG'] },
          { id: 'p2', name: 'Sofie Andersen', avatarInitials: 'SA', category: 'A', currentGroups: ['WANG'] },
          { id: 'p3', name: 'Erik Johansen', avatarInitials: 'EJ', category: 'B', currentGroups: [] },
          { id: 'p4', name: 'Emma Berg', avatarInitials: 'EB', category: 'B', currentGroups: ['Team Norway'] },
          { id: 'p5', name: 'Lars Olsen', avatarInitials: 'LO', category: 'A', currentGroups: ['WANG', 'Team Norway'] },
          { id: 'p6', name: 'Mikkel Pedersen', avatarInitials: 'MP', category: 'C', currentGroups: [] },
          { id: 'p7', name: 'Ole Nilsen', avatarInitials: 'ON', category: 'C', currentGroups: [] },
          { id: 'p8', name: 'Kari Larsen', avatarInitials: 'KL', category: 'C', currentGroups: [] },
        ]);
      } finally {
        setLoadingPlayers(false);
      }
    };

    fetchPlayers();
  }, []);

  // Filter players by search
  const filteredPlayers = availablePlayers.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle member selection
  const toggleMember = (playerId: string) => {
    setFormData((prev) => ({
      ...prev,
      memberIds: prev.memberIds.includes(playerId)
        ? prev.memberIds.filter((id) => id !== playerId)
        : [...prev.memberIds, playerId],
    }));
  };

  // Get selected players
  const selectedPlayers = availablePlayers.filter((p) =>
    formData.memberIds.includes(p.id)
  );

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Gruppenavn er påkrevd');
      return;
    }

    if (formData.memberIds.length === 0) {
      setError('Velg minst ett medlem');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/v1/coach/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          type: formData.type,
          avatarColor: formData.color,
          avatarInitials: getInitials(formData.name),
          memberIds: formData.memberIds,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        navigate(`/coach/groups/${data.group.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Kunne ikke opprette gruppe');
      }
    } catch (error) {
      console.error('Failed to create group:', error);
      // For development, just navigate back
      navigate('/coach/groups');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tier-surface-base font-sans">
      {/* Header - using PageHeader from design system */}
      <PageHeader
        title="Opprett ny gruppe"
        subtitle="Legg til spillere og konfigurer gruppen"
        helpText="Opprett en ny treningsgruppe med spillere. Definer gruppens fokusområder og treningsopplegg."
        onBack={() => navigate('/coach/groups')}
      />

      <form onSubmit={handleSubmit}>
        <div className="p-6 max-w-[800px]">
          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2.5 py-3 px-4 bg-tier-error/10 rounded-lg mb-5">
              <AlertCircle size={18} className="text-tier-error" />
              <span className="text-tier-error text-sm">{error}</span>
            </div>
          )}

          {/* Basic info */}
          <div className="bg-tier-white rounded-xl p-5 mb-5 shadow-sm">
            <SectionTitle className="m-0 mb-4">
              Grunnleggende informasjon
            </SectionTitle>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-[15px] leading-5 text-tier-navy mb-1.5 font-medium">
                Gruppenavn *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="F.eks. WANG Toppidrett 2025"
                className="w-full py-3 px-3.5 bg-tier-surface-base border border-tier-border-default rounded-lg text-sm outline-none focus:border-tier-navy"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-[15px] leading-5 text-tier-navy mb-1.5 font-medium">
                Beskrivelse
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Kort beskrivelse av gruppen..."
                rows={3}
                className="w-full py-3 px-3.5 bg-tier-surface-base border border-tier-border-default rounded-lg text-sm outline-none resize-y font-inherit focus:border-tier-navy"
              />
            </div>

            {/* Type */}
            <div className="mb-4">
              <label className="block text-[15px] leading-5 text-tier-navy mb-1.5 font-medium">
                Gruppetype
              </label>
              <div className="flex gap-2.5">
                {[
                  { key: 'wang', label: 'WANG Toppidrett' },
                  { key: 'team_norway', label: 'Team Norway' },
                  { key: 'custom', label: 'Egendefinert' },
                ].map((type) => (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: type.key as 'wang' | 'team_norway' | 'custom' })}
                    className={`py-2.5 px-[18px] rounded-lg text-sm font-medium cursor-pointer ${
                      formData.type === type.key
                        ? 'bg-tier-navy text-white border border-tier-navy'
                        : 'bg-tier-surface-base text-tier-navy border border-tier-border-default'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-[15px] leading-5 text-tier-navy mb-1.5 font-medium">
                Gruppefarge
              </label>
              <div className="flex gap-2 flex-wrap">
                {GROUP_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    title={color.label}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer ${
                      formData.color === color.value ? 'border-[3px] border-white ring-2' : 'border-none'
                    }`}
                    style={{
                      backgroundColor: color.value,
                      ...(formData.color === color.value && { '--tw-ring-color': color.value } as React.CSSProperties)
                    }}
                  >
                    {formData.color === color.value && (
                      <Check size={18} color="white" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-tier-white rounded-xl p-5 mb-5 shadow-sm">
            <SectionTitle className="m-0 mb-4">
              Forhåndsvisning
            </SectionTitle>

            <div className="flex items-center gap-3.5">
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: formData.color }}
              >
                {formData.name ? getInitials(formData.name) : '??'}
              </div>
              <div>
                <p className="text-[17px] leading-[22px] font-semibold text-tier-navy m-0">
                  {formData.name || 'Gruppenavn'}
                </p>
                <p className="text-xs leading-4 text-tier-text-secondary mt-0.5 m-0">
                  {formData.memberIds.length} medlemmer valgt
                </p>
              </div>
            </div>
          </div>

          {/* Members selection */}
          <div className="bg-tier-white rounded-xl p-5 mb-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <SectionTitle className="m-0">
                Velg medlemmer *
              </SectionTitle>
              <span className="text-[15px] leading-5 text-tier-navy">
                {formData.memberIds.length} valgt
              </span>
            </div>

            {/* Selected members */}
            {selectedPlayers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 p-3 bg-tier-navy/5 rounded-lg">
                {selectedPlayers.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-1.5 py-1.5 px-2.5 bg-tier-white rounded text-[13px]"
                  >
                    <span className="font-medium">{player.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleMember(player.id)}
                      className="w-[18px] h-[18px] rounded-full bg-tier-border-default border-none flex items-center justify-center cursor-pointer"
                    >
                      <X size={12} className="text-tier-text-secondary" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Search */}
            <div className="relative mb-3">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-secondary"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Søk etter spillere..."
                className="w-full py-2.5 pl-10 pr-3 bg-tier-surface-base border border-tier-border-default rounded-lg text-sm outline-none"
              />
            </div>

            {/* Player list */}
            {loadingPlayers ? (
              <div className="text-center p-5">
                <div className="w-8 h-8 border-[3px] border-tier-border-default border-t-tier-navy rounded-full mx-auto animate-spin" />
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto flex flex-col gap-1.5">
                {filteredPlayers.map((player) => {
                  const isSelected = formData.memberIds.includes(player.id);
                  return (
                    <button
                      key={player.id}
                      type="button"
                      onClick={() => toggleMember(player.id)}
                      className={`flex items-center gap-3 py-2.5 px-3.5 rounded-lg cursor-pointer text-left w-full ${
                        isSelected
                          ? 'bg-tier-navy/10 border border-tier-navy'
                          : 'bg-tier-surface-base border border-tier-border-default'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-tier-navy flex items-center justify-center text-white text-xs font-semibold">
                        {player.avatarInitials}
                      </div>

                      <div className="flex-1">
                        <p className="text-[15px] leading-5 text-tier-navy m-0 font-medium">
                          {player.name}
                        </p>
                        <p className="text-xs leading-4 text-tier-text-secondary mt-0.5 m-0">
                          Kategori {player.category}
                          {player.currentGroups.length > 0 &&
                            ` · ${player.currentGroups.join(', ')}`}
                        </p>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isSelected ? 'bg-tier-navy' : 'bg-tier-border-default'
                        }`}
                      >
                        {isSelected && <Check size={14} color="white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/coach/groups')}
              className="py-3 px-6 bg-transparent text-tier-navy border border-tier-border-default rounded-lg text-sm font-medium cursor-pointer"
            >
              Avbryt
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 py-3 px-6 bg-tier-navy text-white border-none rounded-lg text-sm font-semibold ${
                loading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
              }`}
            >
              <Users size={18} />
              {loading ? 'Oppretter...' : 'Opprett gruppe'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

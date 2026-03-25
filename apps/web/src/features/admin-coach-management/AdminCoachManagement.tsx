/**
 * TIER Golf - Admin Coach Management
 *
 * Archetype: A - List/Index Page
 * Purpose: Manage coach accounts as system users
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, CheckCircle, XCircle, Plus, Pencil, UserPlus, Eye } from 'lucide-react';
import { Page } from '../../ui/components/Page';
import { Text, Badge, Button } from '../../ui/primitives';
import apiClient from '../../services/apiClient';
import { CoachCreateModal } from './CoachCreateModal';
import { CoachEditModal } from './CoachEditModal';

// ============================================================================
// TYPES
// ============================================================================

type CoachAccount = {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  active: boolean;
  specializations?: string[];
  maxPlayersPerSession?: number;
};

// ============================================================================
// AVATAR COMPONENT
// ============================================================================

function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full bg-tier-navy text-white
        flex items-center justify-center font-semibold flex-shrink-0
      `}
    >
      {initials}
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AdminCoachManagement() {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState<CoachAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoach, setEditingCoach] = useState<CoachAccount | null>(null);

  const loadCoaches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await apiClient.get('/coaches');
      const coachList = data.data.coaches || data.data || [];
      setCoaches(
        coachList.map(
          (c: {
            id: string;
            firstName: string;
            lastName: string;
            email?: string;
            specializations?: string[];
            maxPlayersPerSession?: number;
            user?: { email: string; isActive: boolean };
          }) => ({
            id: c.id,
            name: `${c.firstName} ${c.lastName}`,
            firstName: c.firstName,
            lastName: c.lastName,
            email: c.email || c.user?.email || '',
            active: c.user?.isActive ?? true,
            specializations: c.specializations,
            maxPlayersPerSession: c.maxPlayersPerSession,
          })
        )
      );
    } catch (err) {
      console.error('Failed to load coaches:', err);
      setError('Kunne ikke laste trenere');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoaches();
  }, [loadCoaches]);

  const toggleActive = async (id: string) => {
    const coach = coaches.find((c) => c.id === id);
    if (!coach) return;

    try {
      await apiClient.patch(`/coaches/${id}`, { isActive: !coach.active });
      setCoaches((prev) => prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
    } catch (err) {
      console.error('Failed to toggle coach status:', err);
    }
  };

  const activeCount = coaches.filter((c) => c.active).length;

  // Determine page state
  const pageState = loading ? 'loading' : error ? 'error' : coaches.length === 0 ? 'empty' : 'idle';

  const handleDeleteCoach = (coachId: string) => {
    setCoaches((prev) => prev.filter((c) => c.id !== coachId));
  };

  return (
    <Page state={pageState} maxWidth="xl">
      <Page.Header
        title="Trenerkontoer"
        subtitle={coaches.length > 0 ? `${activeCount} aktive av ${coaches.length} kontoer` : undefined}
        helpText="Administrator-side for styring av trenerkontoer. Opprett nye trenere med fornavn, etternavn, e-post, telefon, spesialiseringer og sertifiseringer. Se liste over alle trenere med status (aktiv/inaktiv), antall spillere, økter denne måneden. Rediger trenerprofiler, endre status, vis detaljer, slett kontoer. Bruk for komplett administrasjon av trenerteamet."
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
          >
            <UserPlus size={16} />
            Opprett trener
          </Button>
        }
      />

      <Page.Content>
        <Page.Section title="Trenere" description="Administrer trenerkontoer">
          <div className="divide-y divide-tier-border-default">
            {coaches.map((coach) => (
              <div
                key={coach.id}
                className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
              >
                <Avatar name={coach.name} />

                <div className="flex-1 min-w-0">
                  <Text variant="body" color="primary" className="font-medium">
                    {coach.name}
                  </Text>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Mail size={14} className="text-tier-text-secondary" />
                    <Text variant="caption1" color="secondary">
                      {coach.email}
                    </Text>
                  </div>
                </div>

                <Badge variant={coach.active ? 'success' : 'default'} size="sm">
                  <span className="flex items-center gap-1.5">
                    {coach.active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {coach.active ? 'Aktiv' : 'Inaktiv'}
                  </span>
                </Badge>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/admin/users/coaches/${coach.id}`)}
                >
                  <Eye size={14} />
                  Vis
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingCoach(coach)}
                >
                  <Pencil size={14} />
                  Rediger
                </Button>

                <Button
                  variant={coach.active ? 'ghost' : 'secondary'}
                  size="sm"
                  onClick={() => toggleActive(coach.id)}
                >
                  {coach.active ? 'Deaktiver' : 'Aktiver'}
                </Button>
              </div>
            ))}
          </div>
        </Page.Section>
      </Page.Content>

      {/* Modals */}
      <CoachCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={loadCoaches}
      />

      <CoachEditModal
        isOpen={!!editingCoach}
        coach={editingCoach}
        onClose={() => setEditingCoach(null)}
        onSuccess={loadCoaches}
        onDelete={handleDeleteCoach}
      />
    </Page>
  );
}

/**
 * TIER Golf - Coach Detail View (Admin)
 * Design System v3.0 - Premium Light
 *
 * Detailed view of a coach for admin users.
 * Shows coach info, assigned players, and statistics.
 * Uses coachesAPI.getById() and coachesAPI.getStatistics()
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Users,
  Calendar,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit,
} from 'lucide-react';
import { coachesAPI } from '../../services/api';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import StateCard from '../../ui/composites/StateCard';
import Button from '../../ui/primitives/Button';
import { SectionTitle } from '../../components/typography/Headings';

// Types
interface Coach {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specializations?: string[];
  certifications?: string[];
  yearsExperience?: number;
  bio?: string;
  maxPlayersPerSession?: number;
  status?: string;
  createdAt?: string;
}

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  category: string;
}

interface CoachStats {
  totalPlayers?: number;
  activePlayers?: number;
  sessionsThisMonth?: number;
  totalSessions?: number;
  averageRating?: number;
}

export const CoachDetailView: React.FC = () => {
  const { coachId } = useParams<{ coachId: string }>();
  const navigate = useNavigate();

  const [coach, setCoach] = useState<Coach | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [stats, setStats] = useState<CoachStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!coachId) return;

      try {
        setError(null);

        // Fetch coach details, players, and stats in parallel
        const [coachRes, playersRes, statsRes] = await Promise.all([
          coachesAPI.getById(coachId).catch(() => null),
          coachesAPI.getPlayers(coachId).catch(() => null),
          coachesAPI.getStatistics(coachId).catch(() => null),
        ]);

        if (coachRes?.data?.data) {
          setCoach(coachRes.data.data);
        } else {
          setError('Trener ikke funnet');
        }

        if (playersRes?.data?.data) {
          setPlayers(playersRes.data.data);
        }

        if (statsRes?.data?.data) {
          setStats(statsRes.data.data as CoachStats);
        }
      } catch (err) {
        console.error('Failed to fetch coach:', err);
        setError('Kunne ikke laste trenerdata');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [coachId]);

  const getCategoryClasses = (category: string) => {
    switch (category) {
      case 'A':
        return { bg: 'bg-tier-success/10', text: 'text-tier-success' };
      case 'B':
        return { bg: 'bg-tier-navy/10', text: 'text-tier-navy' };
      case 'C':
        return { bg: 'bg-tier-warning/10', text: 'text-tier-warning' };
      default:
        return { bg: 'bg-tier-white', text: 'text-tier-text-secondary' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-tier-surface-base">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-tier-navy" />
          <p className="text-sm text-tier-text-secondary">Laster trenerdata...</p>
        </div>
      </div>
    );
  }

  if (error || !coach) {
    return (
      <div className="p-6 bg-tier-surface-base min-h-screen">
        <button
          onClick={() => navigate('/admin/users/coaches')}
          className="flex items-center gap-2 text-sm text-tier-text-secondary hover:text-tier-navy mb-6"
        >
          <ArrowLeft size={16} />
          Tilbake til trenere
        </button>
        <StateCard
          variant="error"
          title="Kunne ikke laste trener"
          description={error || 'Prøv igjen senere'}
          action={<Button onClick={() => navigate('/admin/users/coaches')}>Tilbake</Button>}
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-tier-surface-base min-h-screen">
      {/* Back navigation */}
      <button
        onClick={() => navigate('/admin/users/coaches')}
        className="flex items-center gap-2 text-sm text-tier-text-secondary hover:text-tier-navy mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        Tilbake til trenere
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-tier-navy flex items-center justify-center text-white text-xl font-semibold">
            {coach.firstName[0]}{coach.lastName[0]}
          </div>
          <div>
            <PageHeader
              title={`${coach.firstName} ${coach.lastName}`}
              subtitle={coach.status === 'active' ? 'Aktiv trener' : 'Inaktiv'}
              helpText="Detaljert oversikt over trener med kontaktinformasjon, tildelte spillere og grupper. Administrer trenerens tilganger og status."
              divider={false}
            />
            {coach.specializations && coach.specializations.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {coach.specializations.map((spec, idx) => (
                  <span
                    key={idx}
                    className="text-xs py-1 px-2.5 rounded-md bg-tier-navy/10 text-tier-navy font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/admin/users/coaches`)}
        >
          <Edit size={16} />
          Rediger
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-tier-white rounded-2xl p-5 border border-tier-border-default">
          <div className="flex items-center gap-2 text-tier-text-tertiary mb-2">
            <Users size={18} />
            <span className="text-sm">Spillere</span>
          </div>
          <p className="text-2xl font-bold text-tier-navy">
            {stats?.totalPlayers ?? players.length}
          </p>
        </div>
        <div className="bg-tier-white rounded-2xl p-5 border border-tier-border-default">
          <div className="flex items-center gap-2 text-tier-text-tertiary mb-2">
            <Calendar size={18} />
            <span className="text-sm">Økter denne mnd</span>
          </div>
          <p className="text-2xl font-bold text-tier-navy">
            {stats?.sessionsThisMonth ?? '-'}
          </p>
        </div>
        <div className="bg-tier-white rounded-2xl p-5 border border-tier-border-default">
          <div className="flex items-center gap-2 text-tier-text-tertiary mb-2">
            <BarChart3 size={18} />
            <span className="text-sm">Totale økter</span>
          </div>
          <p className="text-2xl font-bold text-tier-navy">
            {stats?.totalSessions ?? '-'}
          </p>
        </div>
        <div className="bg-tier-white rounded-2xl p-5 border border-tier-border-default">
          <div className="flex items-center gap-2 text-tier-text-tertiary mb-2">
            <Clock size={18} />
            <span className="text-sm">Maks per økt</span>
          </div>
          <p className="text-2xl font-bold text-tier-navy">
            {coach.maxPlayersPerSession ?? 4}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="bg-tier-white rounded-2xl p-5 border border-tier-border-default">
          <div className="flex items-center gap-2 mb-4">
            <User size={20} className="text-tier-navy" />
            <SectionTitle className="m-0">Kontaktinfo</SectionTitle>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-tier-text-tertiary" />
              <span className="text-sm text-tier-navy">{coach.email}</span>
            </div>
            {coach.phone && (
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-tier-text-tertiary" />
                <span className="text-sm text-tier-navy">{coach.phone}</span>
              </div>
            )}
            {coach.yearsExperience && (
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-tier-text-tertiary" />
                <span className="text-sm text-tier-navy">
                  {coach.yearsExperience} års erfaring
                </span>
              </div>
            )}
          </div>

          {coach.bio && (
            <div className="mt-4 pt-4 border-t border-tier-border-default">
              <p className="text-sm text-tier-text-secondary">{coach.bio}</p>
            </div>
          )}

          {coach.certifications && coach.certifications.length > 0 && (
            <div className="mt-4 pt-4 border-t border-tier-border-default">
              <p className="text-xs font-medium text-tier-text-tertiary mb-2">
                Sertifiseringer
              </p>
              <div className="flex flex-wrap gap-2">
                {coach.certifications.map((cert, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 text-xs py-1 px-2 rounded bg-tier-surface-base text-tier-text-secondary"
                  >
                    <CheckCircle2 size={12} className="text-tier-success" />
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Players List */}
        <div className="lg:col-span-2 bg-tier-white rounded-2xl p-5 border border-tier-border-default">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={20} className="text-tier-navy" />
              <SectionTitle className="m-0">
                Tilknyttede spillere ({players.length})
              </SectionTitle>
            </div>
          </div>

          {players.length === 0 ? (
            <div className="text-center py-8 bg-tier-surface-base rounded-xl">
              <Users size={32} className="mx-auto text-tier-text-tertiary mb-2" />
              <p className="text-sm text-tier-text-secondary">
                Ingen spillere tilknyttet denne treneren
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 py-3 px-4 bg-tier-surface-base rounded-xl hover:bg-tier-white transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-tier-navy/15 flex items-center justify-center text-sm font-semibold text-tier-navy">
                    {player.firstName[0]}{player.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-tier-navy">
                      {player.firstName} {player.lastName}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium py-1 px-2 rounded ${
                      getCategoryClasses(player.category).bg
                    } ${getCategoryClasses(player.category).text}`}
                  >
                    Kat. {player.category}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachDetailView;

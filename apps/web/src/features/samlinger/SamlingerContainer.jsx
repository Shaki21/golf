/**
 * TIER Golf - Samlinger Container
 * Design System v3.0 - Premium Light
 *
 * Training camps and gatherings overview with registration.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Calendar, MapPin, Clock, ChevronRight,
  CheckCircle, AlertCircle, Tent, Target, Dumbbell,
  BookOpen, Utensils, Car, X
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionTitle, SubSectionTitle } from '../../components/typography';
import Button from '../../ui/primitives/Button';
import StateCard from '../../ui/composites/StateCard';
import { useAuth } from '../../contexts/AuthContext';
import { samlingAPI } from '../../services/api';

// ============================================================================
// MOCK DATA - Will be replaced with API data
// ============================================================================

const MOCK_CAMPS = [
  {
    id: 'c1',
    name: 'Winter Camp 2025',
    type: 'training',
    startDate: '2025-02-15',
    endDate: '2025-02-18',
    location: 'PGA Catalunya',
    country: 'Spain',
    registrationDeadline: '2025-01-31',
    maxParticipants: 16,
    currentParticipants: 12,
    status: 'registration_open',
    isRegistered: true,
    description: 'Intensive training camp with focus on long game and course strategy. Includes 3 rounds and daily training sessions.',
    program: ['Technique training', 'Course play', 'Mental training', 'Physical training'],
    includes: ['Accommodation', 'Breakfast', 'Lunch', 'Transport to course'],
    price: 12500,
    coach: 'Anders Kristiansen',
  },
  {
    id: 'c2',
    name: 'Easter Camp Junior',
    type: 'intensive',
    startDate: '2025-04-12',
    endDate: '2025-04-16',
    location: 'Miklagard Golf',
    country: 'Norway',
    registrationDeadline: '2025-03-28',
    maxParticipants: 20,
    currentParticipants: 8,
    status: 'registration_open',
    isRegistered: false,
    description: 'Easter camp for juniors with focus on short game and putting. Perfect for preparing for season start.',
    program: ['Short game', 'Putting', 'Bunker play', 'Rules course'],
    includes: ['Lunch', 'Range balls', 'Greenfee'],
    price: 4500,
    coach: 'Maria Hansen',
  },
  {
    id: 'c3',
    name: 'Summer Camp Elite',
    type: 'elite',
    startDate: '2025-07-07',
    endDate: '2025-07-11',
    location: 'St Andrews Links',
    country: 'Scotland',
    registrationDeadline: '2025-05-15',
    maxParticipants: 12,
    currentParticipants: 0,
    status: 'upcoming',
    isRegistered: false,
    description: 'Exclusive training camp at the home of golf. Play on Old Course and intensive training with international coaches.',
    program: ['Links golf', 'Wind play', 'Advanced strategy', 'Video analysis'],
    includes: ['Flight', 'Hotel', 'All meals', 'Greenfee', 'Caddie'],
    price: 35000,
    coach: 'David Smith',
  },
  {
    id: 'c4',
    name: 'Fall Camp U18',
    type: 'training',
    startDate: '2025-10-18',
    endDate: '2025-10-20',
    location: 'Borre Golfklubb',
    country: 'Norway',
    registrationDeadline: '2025-10-05',
    maxParticipants: 24,
    currentParticipants: 0,
    status: 'upcoming',
    isRegistered: false,
    description: 'Closing camp for the season with focus on evaluation and planning for next season.',
    program: ['Season evaluation', 'Test protocol', 'Goals 2026', 'Coach meetings'],
    includes: ['Lunch', 'Test report'],
    price: 2500,
    coach: 'Anders Kristiansen',
  },
];

const PAST_CAMPS = [
  {
    id: 'p1',
    name: 'Fall Camp 2024',
    date: '2024-10-20',
    location: 'Losby Golfklubb',
    participated: true,
    highlights: 'Personal record of 68 in practice round',
  },
  {
    id: 'p2',
    name: 'Summer Camp Junior 2024',
    date: '2024-07-15',
    location: 'Holtsmark GK',
    participated: true,
    highlights: 'Best putting score at training camp',
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

const formatDateRange = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const startStr = startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  const endStr = endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  return `${startStr} - ${endStr}`;
};

const getDaysUntil = (dateStr) => {
  const today = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diff;
};

const getDuration = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  return days === 1 ? '1 day' : `${days} days`;
};

const getStatusConfig = (status, isRegistered) => {
  if (isRegistered) {
    return {
      label: 'Registered',
      colorClasses: { bg: 'bg-tier-success/15', text: 'text-tier-success' },
      icon: CheckCircle,
    };
  }

  switch (status) {
    case 'registration_open':
      return {
        label: 'Open for registration',
        colorClasses: { bg: 'bg-tier-navy/15', text: 'text-tier-navy' },
        icon: Calendar,
      };
    case 'registration_closed':
      return {
        label: 'Full',
        colorClasses: { bg: 'bg-tier-error/15', text: 'text-tier-error' },
        icon: AlertCircle,
      };
    case 'upcoming':
      return {
        label: 'Coming soon',
        colorClasses: { bg: 'bg-tier-surface-base', text: 'text-tier-text-secondary' },
        icon: Clock,
      };
    default:
      return {
        label: status,
        colorClasses: { bg: 'bg-tier-surface-base', text: 'text-tier-text-secondary' },
        icon: Tent,
      };
  }
};

const getTypeConfig = (type) => {
  switch (type) {
    case 'elite':
      return { label: 'Elite', colorClasses: { bg: 'bg-gold-500/15', text: 'text-gold-600' }, icon: Target };
    case 'intensive':
      return { label: 'Intensive', colorClasses: { bg: 'bg-tier-navy/15', text: 'text-tier-navy' }, icon: Dumbbell };
    case 'training':
    default:
      return { label: 'Training', colorClasses: { bg: 'bg-tier-success/15', text: 'text-tier-success' }, icon: Tent };
  }
};

// ============================================================================
// CAMP CARD COMPONENT
// ============================================================================

const CampCard = ({ camp, onSelect }) => {
  const statusConfig = getStatusConfig(camp.status, camp.isRegistered);
  const typeConfig = getTypeConfig(camp.type);
  const StatusIcon = statusConfig.icon;
  const TypeIcon = typeConfig.icon;
  const daysUntil = getDaysUntil(camp.startDate);

  return (
    <div
      onClick={() => onSelect(camp)}
      className={`bg-tier-white rounded-2xl p-5 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${
        camp.isRegistered ? 'border-2 border-tier-success' : 'border-2 border-transparent'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl ${typeConfig.colorClasses.bg} flex items-center justify-center`}>
            <TypeIcon size={22} className={typeConfig.colorClasses.text} />
          </div>
          <div>
            <SubSectionTitle className="text-base font-semibold text-tier-navy m-0">
              {camp.name}
            </SubSectionTitle>
            <span className={`text-xs font-medium ${typeConfig.colorClasses.bg} ${typeConfig.colorClasses.text} py-0.5 px-2 rounded mt-1 inline-block`}>
              {typeConfig.label}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg ${statusConfig.colorClasses.bg}`}>
          <StatusIcon size={14} className={statusConfig.colorClasses.text} />
          <span className={`text-xs font-medium ${statusConfig.colorClasses.text}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-tier-text-secondary" />
          <span className="text-sm text-tier-navy">
            {formatDateRange(camp.startDate, camp.endDate)}
          </span>
          <span className="text-[11px] text-tier-text-secondary bg-tier-surface-base py-0.5 px-1.5 rounded">
            {getDuration(camp.startDate, camp.endDate)}
          </span>
          {daysUntil > 0 && daysUntil <= 60 && (
            <span className="text-[11px] text-tier-navy bg-tier-navy/10 py-0.5 px-1.5 rounded">
              in {daysUntil} days
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-tier-text-secondary" />
          <span className="text-sm text-tier-navy">
            {camp.location}, {camp.country}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={14} className="text-tier-text-secondary" />
          <span className="text-sm text-tier-navy">
            {camp.currentParticipants}/{camp.maxParticipants} registered
          </span>
          {camp.currentParticipants >= camp.maxParticipants && (
            <span className="text-[11px] text-tier-error font-medium">
              (Full)
            </span>
          )}
        </div>
      </div>

      {/* Program preview */}
      <div className="mb-4">
        <div className="text-xs text-tier-text-secondary mb-1.5">Program</div>
        <div className="flex gap-1.5 flex-wrap">
          {camp.program.slice(0, 3).map((item, idx) => (
            <span
              key={idx}
              className="text-[11px] text-tier-navy bg-tier-surface-base py-1 px-2 rounded-md"
            >
              {item}
            </span>
          ))}
          {camp.program.length > 3 && (
            <span className="text-[11px] text-tier-text-secondary py-1 px-2">
              +{camp.program.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-tier-border-default">
        <div>
          <span className="text-xs text-tier-text-secondary">Price</span>
          <div className="text-base font-semibold text-tier-navy">
            {camp.price.toLocaleString('nb-NO')} kr
          </div>
        </div>
        <div className="flex items-center gap-1 text-tier-navy text-sm font-medium">
          View details
          <ChevronRight size={16} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PAST CAMP CARD COMPONENT
// ============================================================================

const PastCampCard = ({ camp }) => {
  return (
    <div className="bg-tier-white rounded-xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${
        camp.participated ? 'bg-tier-success/15' : 'bg-tier-surface-base'
      }`}>
        {camp.participated ? (
          <CheckCircle size={20} className="text-tier-success" />
        ) : (
          <Tent size={20} className="text-tier-text-secondary" />
        )}
      </div>

      <div className="flex-1">
        <div className="text-sm font-medium text-tier-navy">
          {camp.name}
        </div>
        <div className="text-xs text-tier-text-secondary mt-0.5">
          {formatDate(camp.date)} - {camp.location}
        </div>
      </div>

      {camp.highlights && (
        <div className="bg-gold-500/15 py-1.5 px-2.5 rounded-lg max-w-[200px]">
          <div className="text-[11px] text-gold-600 font-medium">
            {camp.highlights}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// FILTER COMPONENT
// ============================================================================

const FilterBar = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'private', label: 'Private' },
    { key: 'club', label: 'Club' },
    { key: 'school', label: 'School' },
    { key: 'federation', label: 'Federation' },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`py-2 px-4 rounded-full border-none text-[13px] font-medium cursor-pointer transition-colors whitespace-nowrap ${
            activeFilter === filter.key
              ? 'bg-tier-navy text-white shadow-none'
              : 'bg-tier-white text-tier-navy shadow-sm hover:bg-tier-surface-base'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// CAMP DETAIL MODAL
// ============================================================================

const CampDetailModal = ({ camp, onClose, onRegister }) => {
  if (!camp) return null;

  const typeConfig = getTypeConfig(camp.type);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5"
      onClick={onClose}
    >
      <div
        className="bg-tier-white rounded-[20px] max-w-[500px] w-full max-h-[85vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-tier-border-default">
          <div className="flex justify-between items-start">
            <div>
              <SectionTitle className="text-xl font-bold text-tier-navy m-0 mb-2">
                {camp.name}
              </SectionTitle>
              <span className={`text-xs font-medium ${typeConfig.colorClasses.bg} ${typeConfig.colorClasses.text} py-1 px-2.5 rounded-md`}>
                {typeConfig.label}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border-none bg-tier-surface-base cursor-pointer text-lg text-tier-text-secondary flex items-center justify-center hover:bg-tier-border-default"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-tier-navy leading-relaxed m-0 mb-5">
            {camp.description}
          </p>

          {/* Info grid */}
          <div className="flex flex-col gap-3 mb-5">
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-tier-navy" />
              <div>
                <div className="text-sm font-medium text-tier-navy">
                  {formatDateRange(camp.startDate, camp.endDate)} ({getDuration(camp.startDate, camp.endDate)})
                </div>
                <div className="text-xs text-tier-text-secondary">
                  Registration deadline: {formatDate(camp.registrationDeadline)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-tier-navy" />
              <div>
                <div className="text-sm font-medium text-tier-navy">
                  {camp.location}
                </div>
                <div className="text-xs text-tier-text-secondary">
                  {camp.country}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users size={18} className="text-tier-navy" />
              <div className="text-sm font-medium text-tier-navy">
                {camp.currentParticipants}/{camp.maxParticipants} registered - Coach: {camp.coach}
              </div>
            </div>
          </div>

          {/* Program */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={16} className="text-tier-navy" />
              <span className="text-sm font-semibold text-tier-navy">Program</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {camp.program.map((item, idx) => (
                <span
                  key={idx}
                  className="text-xs text-tier-navy bg-tier-surface-base py-1.5 px-2.5 rounded-lg"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Includes */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={16} className="text-tier-success" />
              <span className="text-sm font-semibold text-tier-navy">Included</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {camp.includes.map((item, idx) => (
                <span
                  key={idx}
                  className="text-xs text-tier-success bg-tier-success/10 py-1.5 px-2.5 rounded-lg flex items-center gap-1"
                >
                  {item.includes('Accommodation') && <Tent size={12} />}
                  {item.includes('reakfast') && <Utensils size={12} />}
                  {item.includes('Transport') && <Car size={12} />}
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="bg-tier-surface-base rounded-xl p-4 mb-5">
            <div className="text-xs text-tier-text-secondary mb-1">
              Price
            </div>
            <div className="text-2xl font-bold text-tier-navy">
              {camp.price.toLocaleString('nb-NO')} kr
            </div>
          </div>

          {/* Action button */}
          {camp.status === 'registration_open' && !camp.isRegistered && (
            <Button
              variant="primary"
              onClick={() => onRegister(camp.id)}
              className="w-full"
            >
              Register
            </Button>
          )}
          {camp.isRegistered && (
            <div className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-tier-success/15 text-tier-success text-[15px] font-semibold">
              <CheckCircle size={18} />
              You are registered
            </div>
          )}
          {camp.status === 'upcoming' && (
            <div className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-tier-surface-base text-tier-text-secondary text-[15px] font-medium">
              <Clock size={18} />
              Registration opens soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const SamlingerContainer = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [selectedCamp, setSelectedCamp] = useState(null);
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCamps = useCallback(async () => {
    try {
      setLoading(true);
      const response = await samlingAPI.list({ upcoming: true });
      const data = response.data?.data?.samlinger || response.data?.data || [];

      if (Array.isArray(data) && data.length > 0) {
        // Transform API data to component format
        const transformedCamps = data.map((s) => ({
          id: s.id,
          name: s.name,
          type: s.sessionType || 'training',
          startDate: s.startDate,
          endDate: s.endDate,
          location: s.location || 'TBD',
          country: 'Norge',
          registrationDeadline: s.startDate, // Use start date as default
          maxParticipants: s.maxParticipants || 20,
          currentParticipants: s.participants?.length || 0,
          status: s.status === 'published' ? 'registration_open' : s.status,
          isRegistered: s.participants?.some((p) => p.playerId === user?.playerId) || false,
          description: s.description || '',
          program: [],
          includes: [],
          price: 0,
          coach: 'TIER Golf',
        }));
        setCamps(transformedCamps);
      } else {
        // Fallback to mock data when API returns empty
        setCamps(MOCK_CAMPS);
      }
    } catch (err) {
      console.error('Error fetching samlinger:', err);
      // Fallback to mock data on error
      setCamps(MOCK_CAMPS);
    } finally {
      setLoading(false);
    }
  }, [user?.playerId]);

  useEffect(() => {
    if (user) {
      fetchCamps();
    } else {
      setCamps(MOCK_CAMPS);
      setLoading(false);
    }
  }, [user, fetchCamps]);

  const filteredCamps = camps.filter((c) => {
    if (filter === 'all') return true;
    // TODO: Add category field to camp data from backend
    // For now, show all camps for category filters
    if (filter === 'private') return c.category === 'private' || false;
    if (filter === 'club') return c.category === 'club' || false;
    if (filter === 'school') return c.category === 'school' || false;
    if (filter === 'federation') return c.category === 'federation' || false;
    return true;
  });

  const handleRegister = (campId) => {
    setCamps((prev) =>
      prev.map((c) =>
        c.id === campId ? { ...c, isRegistered: true, currentParticipants: c.currentParticipants + 1 } : c
      )
    );
    setSelectedCamp(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tier-surface-base flex items-center justify-center">
        <StateCard variant="loading" title="Loading training camps..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Training Camps"
      />

      <div className="p-6 w-full">
        {/* Stats Row */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3 mb-4">
          <div className="bg-tier-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-tier-navy">
              {camps.length}
            </div>
            <div className="text-xs text-tier-text-secondary">Upcoming</div>
          </div>
          <div className="bg-tier-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-tier-success">
              {camps.filter(c => c.isRegistered).length}
            </div>
            <div className="text-xs text-tier-text-secondary">Registered</div>
          </div>
          <div className="bg-tier-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-tier-navy">
              {camps.filter(c => c.status === 'registration_open' && !c.isRegistered).length}
            </div>
            <div className="text-xs text-tier-text-secondary">Open registration</div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-5">
          <FilterBar activeFilter={filter} onFilterChange={setFilter} />
        </div>

        {/* Upcoming Camps */}
        <div className="mb-8">
          <SectionTitle className="text-lg font-semibold text-tier-navy m-0 mb-4">
            Upcoming training camps
          </SectionTitle>

          {filteredCamps.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-4">
              {filteredCamps.map((camp) => (
                <CampCard
                  key={camp.id}
                  camp={camp}
                  onSelect={setSelectedCamp}
                />
              ))}
            </div>
          ) : (
            <StateCard
              variant="empty"
              icon={Tent}
              title="No training camps found"
              description="No training camps found with selected filter"
            />
          )}
        </div>

        {/* Past Camps */}
        <div>
          <SectionTitle className="text-lg font-semibold text-tier-navy m-0 mb-4">
            Past training camps
          </SectionTitle>

          <div className="flex flex-col gap-2">
            {PAST_CAMPS.map((camp) => (
              <PastCampCard key={camp.id} camp={camp} />
            ))}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <CampDetailModal
        camp={selectedCamp}
        onClose={() => setSelectedCamp(null)}
        onRegister={handleRegister}
      />
    </div>
  );
};

export default SamlingerContainer;

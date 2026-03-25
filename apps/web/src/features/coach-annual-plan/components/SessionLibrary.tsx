/**
 * SessionLibrary.tsx
 * Library of session templates organized by AK Formula categories
 */

import React, { useState } from 'react';
import { Search, Clock, Dumbbell, Target, Zap, Flag, Trophy, ChevronDown } from 'lucide-react';
import { SubSectionTitle } from '../../../components/typography';
import { TrainingCategoryBadge } from '../../../components/shadcn/golf';

// ============================================================================
// TYPES
// ============================================================================

export interface SessionTemplate {
  id: string;
  name: string;
  category: 'fysisk' | 'teknikk' | 'slag' | 'spill' | 'turnering';
  duration: number;
  description: string;
  akFormula?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment?: string[];
}

// ============================================================================
// SESSION TEMPLATES DATA
// ============================================================================

export const SESSION_TEMPLATES: SessionTemplate[] = [
  // FYSISK
  {
    id: 'fys-1',
    name: 'Styrketrening',
    category: 'fysisk',
    duration: 60,
    description: 'Generell styrketrening med fokus på core og rotasjon',
    difficulty: 'intermediate',
    equipment: ['Vekter', 'Kettlebell'],
  },
  {
    id: 'fys-2',
    name: 'Mobilitet & Fleksibilitet',
    category: 'fysisk',
    duration: 30,
    description: 'Dynamisk oppvarming og mobilitet',
    difficulty: 'beginner',
  },
  {
    id: 'fys-3',
    name: 'Power-trening',
    category: 'fysisk',
    duration: 45,
    description: 'Eksplosiv kraft og hurtighet',
    difficulty: 'advanced',
    equipment: ['Medisinball', 'Kettlebell'],
  },

  // TEKNIKK
  {
    id: 'tek-1',
    name: 'Svingteknikk - Fundamentals',
    category: 'teknikk',
    duration: 45,
    description: 'Grunnleggende svingbevegelse og posisjoner',
    difficulty: 'beginner',
  },
  {
    id: 'tek-2',
    name: 'P-Posisjoner 1.0-5.0',
    category: 'teknikk',
    duration: 60,
    description: 'Detaljert arbeid med golfsvingposisjoner',
    difficulty: 'intermediate',
    equipment: ['Speil', 'Video'],
  },
  {
    id: 'tek-3',
    name: 'Alignment & Setup',
    category: 'teknikk',
    duration: 30,
    description: 'Perfeksjonering av setup og alignment',
    difficulty: 'beginner',
  },

  // SLAG
  {
    id: 'slag-1',
    name: 'Driver - Tee Total',
    category: 'slag',
    duration: 45,
    description: 'Maksimal avstand og kontroll med driver',
    difficulty: 'intermediate',
    equipment: ['Range', 'Driver'],
  },
  {
    id: 'slag-2',
    name: 'Innspill 100-150m',
    category: 'slag',
    duration: 60,
    description: 'Presisjon på mellomlange innspill',
    difficulty: 'intermediate',
    equipment: ['Range'],
  },
  {
    id: 'slag-3',
    name: 'Chip & Pitch',
    category: 'slag',
    duration: 45,
    description: 'Kort spill rundt green',
    difficulty: 'beginner',
    equipment: ['Chipping-område'],
  },
  {
    id: 'slag-4',
    name: 'Putting - Lag Putts',
    category: 'slag',
    duration: 45,
    description: 'Distance control på lange putts',
    difficulty: 'intermediate',
    equipment: ['Putting green'],
  },
  {
    id: 'slag-5',
    name: 'Bunkertrening',
    category: 'slag',
    duration: 30,
    description: 'Bunkerslag fra ulike lier',
    difficulty: 'intermediate',
    equipment: ['Bunker'],
  },

  // SPILL
  {
    id: 'spill-1',
    name: 'Banestrategi',
    category: 'spill',
    duration: 120,
    description: 'Strategisk planlegging og kursmanagement',
    difficulty: 'intermediate',
    equipment: ['Bane'],
  },
  {
    id: 'spill-2',
    name: 'Simulert Runde',
    category: 'spill',
    duration: 90,
    description: 'Øvingsrunde med fokus på rutiner',
    difficulty: 'intermediate',
    equipment: ['Bane'],
  },
  {
    id: 'spill-3',
    name: 'Par 3-utfordringer',
    category: 'spill',
    duration: 60,
    description: 'Repetitiv trening på par 3 hull',
    difficulty: 'beginner',
    equipment: ['Bane'],
  },

  // TURNERING
  {
    id: 'turn-1',
    name: 'Mental Trening',
    category: 'turnering',
    duration: 45,
    description: 'Visualisering og fokusøvelser',
    difficulty: 'intermediate',
  },
  {
    id: 'turn-2',
    name: 'Presstrening',
    category: 'turnering',
    duration: 60,
    description: 'Øvelser under press og konkurranse',
    difficulty: 'advanced',
    equipment: ['Range/Bane'],
  },
  {
    id: 'turn-3',
    name: 'Pre-round Rutiner',
    category: 'turnering',
    duration: 30,
    description: 'Oppvarming og mental forberedelse',
    difficulty: 'beginner',
  },
];

// ============================================================================
// CATEGORY CONFIG
// ============================================================================

const CATEGORY_CONFIG = {
  fysisk: {
    label: 'Fysisk',
    icon: Dumbbell,
    color: 'rgb(var(--status-warning))',
  },
  teknikk: {
    label: 'Teknikk',
    icon: Target,
    color: 'rgb(var(--category-j))',
  },
  slag: {
    label: 'Golfslag',
    icon: Zap,
    color: 'rgb(var(--status-success))',
  },
  spill: {
    label: 'Spill',
    icon: Flag,
    color: 'rgb(var(--status-info))',
  },
  turnering: {
    label: 'Tournament',
    icon: Trophy,
    color: 'rgb(var(--tier-gold))',
  },
};

// ============================================================================
// COMPONENT
// ============================================================================

interface SessionLibraryProps {
  onSelectSession?: (session: SessionTemplate) => void;
}

const SessionLibrary: React.FC<SessionLibraryProps> = ({ onSelectSession }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['fysisk', 'teknikk', 'slag', 'spill', 'turnering'])
  );

  // Filter sessions
  const filteredSessions = SESSION_TEMPLATES.filter((session) => {
    const matchesSearch = session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || session.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group by category
  const sessionsByCategory = filteredSessions.reduce((acc, session) => {
    if (!acc[session.category]) {
      acc[session.category] = [];
    }
    acc[session.category].push(session);
    return acc;
  }, {} as Record<string, SessionTemplate[]>);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-tier-border-default">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-tier-text-secondary" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-tier-border-default text-sm outline-none focus:border-tier-navy"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="p-4 border-b border-tier-border-default">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              selectedCategory === null
                ? 'bg-tier-navy text-white'
                : 'bg-tier-surface-base text-tier-text-secondary hover:bg-tier-border-default'
            }`}
          >
            All
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                selectedCategory === key
                  ? 'bg-tier-navy text-white'
                  : 'bg-tier-surface-base text-tier-text-secondary hover:bg-tier-border-default'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto">
        {Object.entries(sessionsByCategory).map(([category, sessions]) => {
          const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG];
          const Icon = config.icon;
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} className="border-b border-tier-border-default">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-4 bg-tier-surface-base hover:bg-tier-border-default transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Icon size={18} style={{ color: config.color }} />
                  <span className="text-sm font-semibold text-tier-navy">
                    {config.label}
                  </span>
                  <span className="text-xs text-tier-text-tertiary">
                    ({sessions.length})
                  </span>
                </div>
                <ChevronDown
                  size={18}
                  className={`text-tier-text-secondary transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Sessions */}
              {isExpanded && (
                <div className="p-2 space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => onSelectSession?.(session)}
                      className="p-3 rounded-lg bg-tier-white border border-tier-border-default hover:border-tier-navy/50 hover:shadow-sm cursor-pointer transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-tier-navy group-hover:text-tier-navy transition-colors">
                              {session.name}
                            </span>
                            <TrainingCategoryBadge
                              category={session.category}
                              size="sm"
                            />
                          </div>
                          <p className="text-xs text-tier-text-secondary line-clamp-2">
                            {session.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-tier-text-tertiary">
                        <div className="flex items-center gap-1">
                          <Clock size={12} />
                          <span>{session.duration} min</span>
                        </div>
                        {session.equipment && session.equipment.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{session.equipment[0]}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t border-tier-border-default bg-tier-surface-base">
        <div className="text-xs text-tier-text-secondary text-center">
          {filteredSessions.length} sessions available
        </div>
      </div>
    </div>
  );
};

export default SessionLibrary;

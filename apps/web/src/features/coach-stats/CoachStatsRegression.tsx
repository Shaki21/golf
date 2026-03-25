/**
 * TIER Golf - Coach Stats Regression
 * Design System v3.0 - Premium Light
 *
 * Shows players who need attention due to negative trends.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  Search,
  ArrowDownRight,
  AlertTriangle,
  Calendar,
  Clock,
  MessageCircle,
  ChevronRight,
  Phone,
  Mail,
  XCircle
} from 'lucide-react';
import StateCard from '../../ui/composites/StateCard';
import Button from '../../ui/primitives/Button';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import { SubSectionTitle } from "../../ui/components/typography";

interface PlayerRegression {
  id: string;
  name: string;
  avatar?: string;
  category: 'A' | 'B' | 'C';
  currentHcp: number;
  previousHcp: number;
  hcpChange: number;
  daysSinceSession: number;
  missedSessions: number;
  totalSessions: number;
  lastSession: string;
  concerns: string[];
  contactInfo: {
    phone: string;
    email: string;
  };
  notes?: string;
  riskLevel: 'low' | 'medium' | 'high';
}

const mockRegressionPlayers: PlayerRegression[] = [
  {
    id: '1',
    name: 'Jonas Pedersen',
    category: 'B',
    currentHcp: 16.8,
    previousHcp: 14.2,
    hcpChange: 2.6,
    daysSinceSession: 28,
    missedSessions: 4,
    totalSessions: 22,
    lastSession: '2024-12-22',
    concerns: ['Missing training', 'Motivation', 'Technique regression'],
    contactInfo: {
      phone: '+47 912 34 567',
      email: 'jonas.pedersen@email.no'
    },
    notes: 'Mentioned school pressure last time we talked. Should follow up.',
    riskLevel: 'high'
  },
  {
    id: '2',
    name: 'Kristine Olsen',
    category: 'A',
    currentHcp: 7.5,
    previousHcp: 5.8,
    hcpChange: 1.7,
    daysSinceSession: 14,
    missedSessions: 2,
    totalSessions: 38,
    lastSession: '2025-01-05',
    concerns: ['Putting issues', 'Confidence'],
    contactInfo: {
      phone: '+47 923 45 678',
      email: 'kristine.olsen@email.no'
    },
    riskLevel: 'medium'
  },
  {
    id: '3',
    name: 'Martin Haugen',
    category: 'C',
    currentHcp: 32.0,
    previousHcp: 28.5,
    hcpChange: 3.5,
    daysSinceSession: 42,
    missedSessions: 6,
    totalSessions: 12,
    lastSession: '2024-12-08',
    concerns: ['Long break', 'Possible dropout?'],
    contactInfo: {
      phone: '+47 934 56 789',
      email: 'martin.haugen@email.no'
    },
    notes: 'Has not responded to messages. Try calling.',
    riskLevel: 'high'
  },
  {
    id: '4',
    name: 'Ida Eriksen',
    category: 'B',
    currentHcp: 18.2,
    previousHcp: 16.9,
    hcpChange: 1.3,
    daysSinceSession: 10,
    missedSessions: 1,
    totalSessions: 25,
    lastSession: '2025-01-09',
    concerns: ['Swing technique change', 'Uncertainty'],
    contactInfo: {
      phone: '+47 945 67 890',
      email: 'ida.eriksen@email.no'
    },
    riskLevel: 'low'
  },
  {
    id: '5',
    name: 'Lars Johansen',
    category: 'A',
    currentHcp: 6.2,
    previousHcp: 4.8,
    hcpChange: 1.4,
    daysSinceSession: 21,
    missedSessions: 3,
    totalSessions: 48,
    lastSession: '2024-12-29',
    concerns: ['Injury?', 'Few competitions'],
    contactInfo: {
      phone: '+47 956 78 901',
      email: 'lars.johansen@email.no'
    },
    notes: 'Possible wrist injury. Check status.',
    riskLevel: 'medium'
  }
];

export const CoachStatsRegression: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const filteredPlayers = useMemo(() => {
    let players = [...mockRegressionPlayers];

    if (searchQuery) {
      players = players.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (riskFilter !== 'all') {
      players = players.filter(p => p.riskLevel === riskFilter);
    }

    // Sort by risk level (high first) then by HCP change
    players.sort((a, b) => {
      const riskOrder = { high: 0, medium: 1, low: 2 };
      if (riskOrder[a.riskLevel] !== riskOrder[b.riskLevel]) {
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      }
      return b.hcpChange - a.hcpChange;
    });

    return players;
  }, [searchQuery, riskFilter]);

  const stats = useMemo(() => ({
    total: mockRegressionPlayers.length,
    highRisk: mockRegressionPlayers.filter(p => p.riskLevel === 'high').length,
    mediumRisk: mockRegressionPlayers.filter(p => p.riskLevel === 'medium').length,
    lowRisk: mockRegressionPlayers.filter(p => p.riskLevel === 'low').length
  }), []);

  const getCategoryClasses = (category: string) => {
    switch (category) {
      case 'A': return { bg: 'bg-tier-success/10', text: 'text-tier-success' };
      case 'B': return { bg: 'bg-tier-navy/10', text: 'text-tier-navy' };
      case 'C': return { bg: 'bg-tier-warning/10', text: 'text-tier-warning' };
      default: return { bg: 'bg-tier-white', text: 'text-tier-text-secondary' };
    }
  };

  const getRiskClasses = (risk: string) => {
    switch (risk) {
      case 'high': return { bg: 'bg-tier-error/15', border: 'border-tier-error/30', text: 'text-tier-error' };
      case 'medium': return { bg: 'bg-tier-warning/15', border: 'border-tier-warning/30', text: 'text-tier-warning' };
      case 'low': return { bg: 'bg-tier-success/15', border: 'border-tier-success/30', text: 'text-tier-success' };
      default: return { bg: 'bg-tier-white', border: 'border-tier-border-default', text: 'text-tier-text-secondary' };
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'high': return 'High risk';
      case 'medium': return 'Medium risk';
      case 'low': return 'Low risk';
      default: return risk;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="p-6 bg-tier-white min-h-screen">
      {/* Header with icon */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tier-error to-tier-error flex items-center justify-center flex-shrink-0">
          <TrendingDown size={24} className="text-white" />
        </div>
        <div className="flex-1">
          <PageHeader
            title="Follow-up Required"
            subtitle="Players with negative trends who need attention"
            helpText="Alphabetical list of players with handicap regression, missing training or other concerns. View risk level, contact info and suggested follow-up actions."
            divider={false}
          />
        </div>
      </div>

      {/* Risk Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-tier-white rounded-xl p-4 border border-tier-border-default">
          <p className="text-xs text-tier-text-tertiary m-0 mb-1">
            Total
          </p>
          <p className="text-[28px] font-bold text-tier-navy m-0">
            {stats.total}
          </p>
        </div>
        <div className="bg-tier-error/5 rounded-xl p-4 border border-tier-error/20">
          <div className="flex items-center gap-1.5 mb-1">
            <AlertTriangle size={14} className="text-tier-error" />
            <p className="text-xs text-tier-error m-0">High risk</p>
          </div>
          <p className="text-[28px] font-bold text-tier-error m-0">
            {stats.highRisk}
          </p>
        </div>
        <div className="bg-tier-warning/5 rounded-xl p-4 border border-tier-warning/20">
          <p className="text-xs text-tier-warning m-0 mb-1">
            Medium risk
          </p>
          <p className="text-[28px] font-bold text-tier-warning m-0">
            {stats.mediumRisk}
          </p>
        </div>
        <div className="bg-tier-success/5 rounded-xl p-4 border border-tier-success/20">
          <p className="text-xs text-tier-success m-0 mb-1">
            Low risk
          </p>
          <p className="text-[28px] font-bold text-tier-success m-0">
            {stats.lowRisk}
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-tertiary"
          />
          <input
            type="text"
            placeholder="Search for player..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3 pr-3 pl-10 rounded-[10px] border border-tier-border-default bg-tier-white text-sm text-tier-navy outline-none"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'high', 'medium', 'low'] as const).map(risk => (
            <Button
              key={risk}
              variant={riskFilter === risk ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setRiskFilter(risk)}
              className={riskFilter === risk && risk !== 'all' ? getRiskClasses(risk).text : ''}
            >
              {risk === 'all' ? 'All' : getRiskLabel(risk)}
            </Button>
          ))}
        </div>
      </div>

      {/* Player List */}
      <div className="flex flex-col gap-3">
        {filteredPlayers.map((player) => {
          const riskClasses = getRiskClasses(player.riskLevel);
          return (
            <div
              key={player.id}
              className={`bg-tier-white rounded-2xl p-5 border ${riskClasses.border} border-l-4`}
              style={{ borderLeftColor: player.riskLevel === 'high' ? 'rgb(var(--status-error-rgb))' : player.riskLevel === 'medium' ? 'rgb(var(--status-warning-rgb))' : 'rgb(var(--status-success-rgb))' }}
            >
              <div className="flex justify-between items-start">
                {/* Left side - Player info */}
                <div className="flex gap-4 flex-1">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-semibold ${riskClasses.bg} ${riskClasses.text}`}>
                    {player.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <SubSectionTitle className="m-0">
                        {player.name}
                      </SubSectionTitle>
                      <span className={`text-[11px] font-medium py-0.5 px-2 rounded ${getCategoryClasses(player.category).bg} ${getCategoryClasses(player.category).text}`}>
                        Kat. {player.category}
                      </span>
                      <span className={`text-[11px] font-semibold py-0.5 px-2 rounded flex items-center gap-1 ${riskClasses.bg} ${riskClasses.text}`}>
                        {player.riskLevel === 'high' && <AlertTriangle size={10} />}
                        {getRiskLabel(player.riskLevel)}
                      </span>
                    </div>

                    {/* Warning stats */}
                    <div className="flex gap-5 mb-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-tier-error" />
                        <span className="text-[13px] text-tier-error font-medium">
                          {player.daysSinceSession} days since last
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <XCircle size={14} className="text-tier-text-tertiary" />
                        <span className="text-[13px] text-tier-text-secondary">
                          {player.missedSessions} sessions cancelled/missed
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-tier-text-tertiary" />
                        <span className="text-[13px] text-tier-text-secondary">
                          Last: {formatDate(player.lastSession)}
                        </span>
                      </div>
                    </div>

                    {/* Concerns */}
                    <div className="flex gap-2 flex-wrap mb-3">
                      {player.concerns.map((concern, idx) => (
                        <span key={idx} className="text-[11px] py-1 px-2.5 rounded-md bg-tier-error/15 text-tier-error font-medium">
                          {concern}
                        </span>
                      ))}
                    </div>

                    {/* Notes if any */}
                    {player.notes && (
                      <div className="py-2.5 px-3 bg-tier-warning/15 rounded-lg border-l-[3px] border-tier-warning mb-3">
                        <p className="text-[13px] text-tier-warning m-0 italic">
                          {player.notes}
                        </p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<MessageCircle size={14} />}
                      >
                        Send message
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Phone size={14} />}
                      >
                        Call
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Mail size={14} />}
                      >
                        Email
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right side - HCP change */}
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1 py-2 px-4 bg-tier-error/15 rounded-[10px]">
                    <ArrowDownRight size={18} className="text-tier-error" />
                    <span className="text-xl font-bold text-tier-error">
                      +{player.hcpChange}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-tier-text-tertiary m-0">
                      HCP: {player.previousHcp} → {player.currentHcp}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                  >
                    View history
                    <ChevronRight size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPlayers.length === 0 && (
        <StateCard
          variant="empty"
          title="No players found"
          description="Try adjusting the filter to see more players."
        />
      )}
    </div>
  );
};

export default CoachStatsRegression;

/**
 * Round Detail Page - TIER Golf
 *
 * Comprehensive view of a golf round with hole-by-hole SG breakdown,
 * shot visualization, and performance insights.
 */

import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Share2,
  Download,
  Flag,
  Target,
  CircleDot,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  MapPin,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Eye,
  Award,
} from 'lucide-react';

// Hooks
import { useRound, usePlayerTrends } from '../../hooks/useManualStats';
import { useAuth } from '../../contexts/AuthContext';

// UI Components
import Button from '../../ui/primitives/Button';
import { Card } from '../../ui/primitives/Card';
import StateCard from '../../ui/composites/StateCard';
import { Badge } from '../../components/shadcn/badge';
import { GolfBarChart, chartColors } from '../../components/shadcn/chart';

// Services
import exportService, { type ExportFormat, type RoundExportData } from '../../services/exportService';

// ============================================================================
// TYPES
// ============================================================================

interface HoleSGData {
  holeNumber: number;
  par: number;
  score: number;
  lengthM: number;
  sgTee: number;
  sgApproach: number;
  sgShortGame: number;
  sgPutting: number;
  sgTotal: number;
  shots: ShotData[];
}

interface ShotData {
  shotNumber: number;
  category: 'TEE' | 'APPROACH' | 'SHORT_GAME' | 'PUTTING';
  startDistanceM: number;
  endDistanceM: number;
  startLie: string;
  endLie: string;
  club?: string;
  sgValue: number;
  expectedBefore: number;
  expectedAfter: number;
}

interface RoundSummary {
  totalScore: number;
  totalPar: number;
  sgTotal: number;
  sgTee: number;
  sgApproach: number;
  sgShortGame: number;
  sgPutting: number;
  bestHole: number;
  worstHole: number;
  birdiesOrBetter: number;
  pars: number;
  bogeys: number;
  doublePlus: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CATEGORY_CONFIG = {
  TEE: { name: 'Tee', color: '#0A2540', icon: Activity },
  APPROACH: { name: 'Approach', color: '#10B981', icon: Target },
  SHORT_GAME: { name: 'Short Game', color: '#C9A227', icon: Flag },
  PUTTING: { name: 'Putting', color: '#8B5CF6', icon: CircleDot },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Page Header
 */
const RoundHeader: React.FC<{
  courseName: string;
  roundDate: string;
  score: number;
  par: number;
  sgTotal: number;
  onBack: () => void;
  onShare: () => void;
  onExport: (format: ExportFormat) => void;
}> = ({ courseName, roundDate, score, par, sgTotal, onBack, onShare, onExport }) => {
  const scoreToPar = score - par;
  const [showExportMenu, setShowExportMenu] = useState(false);

  return (
    <div className="bg-tier-navy text-white">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-white/10 rounded-lg">
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-2 relative">
          <button onClick={onShare} className="p-2 hover:bg-white/10 rounded-lg" title="Share">
            <Share2 size={20} />
          </button>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="p-2 hover:bg-white/10 rounded-lg"
            title="Export"
          >
            <Download size={20} />
          </button>

          {/* Export dropdown */}
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg py-1 min-w-[120px] z-50">
              <button
                onClick={() => { onExport('pdf'); setShowExportMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-tier-navy hover:bg-tier-navy/5"
              >
                Export PDF
              </button>
              <button
                onClick={() => { onExport('csv'); setShowExportMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-tier-navy hover:bg-tier-navy/5"
              >
                Export CSV
              </button>
              <button
                onClick={() => { onExport('json'); setShowExportMenu(false); }}
                className="w-full px-4 py-2 text-left text-sm text-tier-navy hover:bg-tier-navy/5"
              >
                Export JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Round info */}
      <div className="px-4 pb-6">
        <h1 className="text-xl font-bold">{courseName}</h1>
        <div className="flex items-center gap-2 mt-1 text-white/70 text-sm">
          <Calendar size={14} />
          <span>{roundDate}</span>
        </div>

        {/* Score and SG */}
        <div className="flex items-end justify-between mt-4">
          <div>
            <span className="text-4xl font-bold">{score}</span>
            <span className="text-lg text-white/70 ml-2">
              ({scoreToPar >= 0 ? '+' : ''}{scoreToPar})
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm text-white/70">Strokes Gained</span>
            <span className={`block text-2xl font-bold ${sgTotal >= 0 ? 'text-tier-success' : 'text-tier-error'}`}>
              {sgTotal >= 0 ? '+' : ''}{sgTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * SG Category Breakdown Card
 */
const SGBreakdownCard: React.FC<{
  sgTee: number;
  sgApproach: number;
  sgShortGame: number;
  sgPutting: number;
}> = ({ sgTee, sgApproach, sgShortGame, sgPutting }) => {
  const categories = [
    { id: 'TEE', value: sgTee },
    { id: 'APPROACH', value: sgApproach },
    { id: 'SHORT_GAME', value: sgShortGame },
    { id: 'PUTTING', value: sgPutting },
  ];

  // Find best and worst
  const sorted = [...categories].sort((a, b) => b.value - a.value);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  return (
    <Card>
      <div className="p-4 border-b border-tier-navy/10">
        <div className="flex items-center gap-2">
          <BarChart3 size={18} className="text-tier-gold" />
          <h3 className="text-base font-semibold text-tier-navy">SG Breakdown</h3>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => {
            const config = CATEGORY_CONFIG[cat.id as keyof typeof CATEGORY_CONFIG];
            const Icon = config.icon;
            const isBest = cat.id === best.id && best.value > 0;
            const isWorst = cat.id === worst.id && worst.value < 0;

            return (
              <div
                key={cat.id}
                className={`
                  p-3 rounded-xl border
                  ${isBest ? 'border-tier-success/30 bg-tier-success/5' :
                    isWorst ? 'border-tier-error/30 bg-tier-error/5' :
                    'border-tier-navy/10 bg-tier-navy/5'}
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={16} style={{ color: config.color }} />
                  <span className="text-xs text-tier-navy/60">{config.name}</span>
                  {isBest && <Badge className="text-xs bg-tier-success/20 text-tier-success">Best</Badge>}
                  {isWorst && <Badge className="text-xs bg-tier-error/20 text-tier-error">Focus</Badge>}
                </div>
                <span className={`text-xl font-bold ${cat.value >= 0 ? 'text-tier-success' : 'text-tier-error'}`}>
                  {cat.value >= 0 ? '+' : ''}{cat.value.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

/**
 * Scoring Summary Card
 */
const ScoringSummaryCard: React.FC<{
  birdiesOrBetter: number;
  pars: number;
  bogeys: number;
  doublePlus: number;
}> = ({ birdiesOrBetter, pars, bogeys, doublePlus }) => {
  const total = birdiesOrBetter + pars + bogeys + doublePlus;

  const segments = [
    { label: 'Birdie+', count: birdiesOrBetter, color: 'bg-tier-success' },
    { label: 'Par', count: pars, color: 'bg-tier-navy' },
    { label: 'Bogey', count: bogeys, color: 'bg-tier-warning' },
    { label: 'Double+', count: doublePlus, color: 'bg-tier-error' },
  ];

  return (
    <Card>
      <div className="p-4 border-b border-tier-navy/10">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-tier-gold" />
          <h3 className="text-base font-semibold text-tier-navy">Scoring</h3>
        </div>
      </div>

      <div className="p-4">
        {/* Visual bar */}
        <div className="flex h-4 rounded-full overflow-hidden mb-4">
          {segments.map((seg) => (
            <div
              key={seg.label}
              className={`${seg.color} transition-all`}
              style={{ width: `${(seg.count / total) * 100}%` }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-4 gap-2">
          {segments.map((seg) => (
            <div key={seg.label} className="text-center">
              <span className="text-lg font-bold text-tier-navy">{seg.count}</span>
              <span className="block text-xs text-tier-navy/60">{seg.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

/**
 * Hole Card Component
 */
const HoleCard: React.FC<{
  hole: HoleSGData;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ hole, isExpanded, onToggle }) => {
  const scoreToPar = hole.score - hole.par;
  const scoreLabel = scoreToPar === 0 ? 'Par' :
    scoreToPar === -1 ? 'Birdie' :
    scoreToPar === -2 ? 'Eagle' :
    scoreToPar <= -3 ? 'Albatross' :
    scoreToPar === 1 ? 'Bogey' :
    scoreToPar === 2 ? 'Double' :
    `+${scoreToPar}`;

  const scoreColor = scoreToPar <= -2 ? 'bg-tier-gold text-white' :
    scoreToPar === -1 ? 'bg-tier-success text-white' :
    scoreToPar === 0 ? 'bg-tier-navy/10 text-tier-navy' :
    scoreToPar === 1 ? 'bg-tier-warning/20 text-tier-warning' :
    'bg-tier-error/20 text-tier-error';

  return (
    <Card className={hole.sgTotal >= 0.5 ? 'border-tier-success/30' : hole.sgTotal <= -0.5 ? 'border-tier-error/30' : ''}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-tier-navy/10 flex items-center justify-center">
            <span className="text-sm font-bold text-tier-navy">{hole.holeNumber}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-tier-navy">Par {hole.par}</span>
              <span className="text-xs text-tier-navy/60">{hole.lengthM}m</span>
            </div>
            <div className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${scoreColor}`}>
              {hole.score} ({scoreLabel})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`text-lg font-bold ${hole.sgTotal >= 0 ? 'text-tier-success' : 'text-tier-error'}`}>
            {hole.sgTotal >= 0 ? '+' : ''}{hole.sgTotal.toFixed(2)}
          </span>
          {isExpanded ? <ChevronUp size={18} className="text-tier-navy/40" /> : <ChevronDown size={18} className="text-tier-navy/40" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-tier-navy/10 pt-4">
          {/* Category breakdown */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {Object.entries({
              TEE: hole.sgTee,
              APPROACH: hole.sgApproach,
              SHORT_GAME: hole.sgShortGame,
              PUTTING: hole.sgPutting,
            }).map(([cat, value]) => {
              const config = CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG];
              return (
                <div key={cat} className="text-center">
                  <span className={`text-sm font-bold ${value >= 0 ? 'text-tier-success' : 'text-tier-error'}`}>
                    {value >= 0 ? '+' : ''}{value.toFixed(2)}
                  </span>
                  <span className="block text-xs text-tier-navy/60">{config.name}</span>
                </div>
              );
            })}
          </div>

          {/* Shot-by-shot breakdown */}
          {hole.shots.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-medium text-tier-navy/60">Shot Details</span>
              {hole.shots.map((shot) => {
                const config = CATEGORY_CONFIG[shot.category];
                const Icon = config.icon;
                return (
                  <div
                    key={shot.shotNumber}
                    className="flex items-center gap-3 p-2 bg-tier-navy/5 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                      <Icon size={14} style={{ color: config.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-tier-navy">
                          Shot {shot.shotNumber}
                        </span>
                        {shot.club && (
                          <span className="text-xs text-tier-navy/60">{shot.club}</span>
                        )}
                      </div>
                      <span className="text-xs text-tier-navy/60">
                        {shot.startDistanceM}m {shot.startLie} → {shot.endDistanceM}m {shot.endLie}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${shot.sgValue >= 0 ? 'text-tier-success' : 'text-tier-error'}`}>
                        {shot.sgValue >= 0 ? '+' : ''}{shot.sgValue.toFixed(2)}
                      </span>
                      <span className="block text-xs text-tier-navy/40">
                        {shot.expectedBefore.toFixed(2)} → {shot.expectedAfter.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

/**
 * SG by Hole Chart
 */
const SGByHoleChart: React.FC<{
  holes: HoleSGData[];
}> = ({ holes }) => {
  const chartData = holes.map((h) => ({
    name: `${h.holeNumber}`,
    SG: h.sgTotal,
    fill: h.sgTotal >= 0 ? chartColors.success : chartColors.error,
  }));

  return (
    <Card>
      <div className="p-4 border-b border-tier-navy/10">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-tier-gold" />
          <h3 className="text-base font-semibold text-tier-navy">SG by Hole</h3>
        </div>
      </div>

      <div className="p-4">
        <GolfBarChart
          data={chartData}
          dataKeys={['SG']}
          xAxisKey="name"
          colors={[chartColors.primary]}
          height={200}
        />
      </div>
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RoundDetailPage() {
  const navigate = useNavigate();
  const { roundId } = useParams<{ roundId: string }>();
  const { user } = useAuth();
  const playerId = (user as { playerId?: string })?.playerId;

  // Fetch round data
  const { data: round, isLoading } = useRound(roundId);

  // Local state
  const [expandedHole, setExpandedHole] = useState<number | null>(null);

  // Mock hole data for now - would come from API
  const holeData: HoleSGData[] = useMemo(() => {
    if (!round) return [];

    // Generate mock data based on round
    return Array.from({ length: round.holesPlayed }, (_, i) => {
      const holeNum = i + 1;
      const par = holeNum % 3 === 0 ? 5 : holeNum % 3 === 1 ? 4 : 3;
      const baseScore = par + Math.floor(Math.random() * 3) - 1;

      return {
        holeNumber: holeNum,
        par,
        score: baseScore,
        lengthM: par === 3 ? 150 + Math.floor(Math.random() * 50) :
                 par === 4 ? 350 + Math.floor(Math.random() * 50) :
                 480 + Math.floor(Math.random() * 50),
        sgTee: par >= 4 ? (Math.random() - 0.5) * 0.6 : 0,
        sgApproach: (Math.random() - 0.5) * 0.8,
        sgShortGame: (Math.random() - 0.5) * 0.4,
        sgPutting: (Math.random() - 0.5) * 0.6,
        sgTotal: (Math.random() - 0.5) * 1.5,
        shots: [],
      };
    });
  }, [round]);

  // Calculate summary
  const summary: RoundSummary | null = useMemo(() => {
    if (!holeData.length) return null;

    let birdiesOrBetter = 0, pars = 0, bogeys = 0, doublePlus = 0;
    let bestSG = -Infinity, worstSG = Infinity;
    let bestHole = 1, worstHole = 1;

    holeData.forEach((h) => {
      const diff = h.score - h.par;
      if (diff <= -1) birdiesOrBetter++;
      else if (diff === 0) pars++;
      else if (diff === 1) bogeys++;
      else doublePlus++;

      if (h.sgTotal > bestSG) {
        bestSG = h.sgTotal;
        bestHole = h.holeNumber;
      }
      if (h.sgTotal < worstSG) {
        worstSG = h.sgTotal;
        worstHole = h.holeNumber;
      }
    });

    return {
      totalScore: holeData.reduce((sum, h) => sum + h.score, 0),
      totalPar: holeData.reduce((sum, h) => sum + h.par, 0),
      sgTotal: holeData.reduce((sum, h) => sum + h.sgTotal, 0),
      sgTee: holeData.reduce((sum, h) => sum + h.sgTee, 0),
      sgApproach: holeData.reduce((sum, h) => sum + h.sgApproach, 0),
      sgShortGame: holeData.reduce((sum, h) => sum + h.sgShortGame, 0),
      sgPutting: holeData.reduce((sum, h) => sum + h.sgPutting, 0),
      bestHole,
      worstHole,
      birdiesOrBetter,
      pars,
      bogeys,
      doublePlus,
    };
  }, [holeData]);

  // Handlers
  const handleShare = async () => {
    if (!roundId) return;
    try {
      const shareUrl = await exportService.generateShareLink(roundId, { method: 'copy' });
      // Show success toast or notification
      console.log('Share link copied:', shareUrl);
    } catch (error) {
      console.error('Failed to generate share link:', error);
    }
  };

  const handleExport = (format: ExportFormat = 'pdf') => {
    if (!round || !summary) return;

    const exportData: RoundExportData = {
      round: {
        id: round.id,
        courseName: round.courseName,
        roundDate: round.roundDate,
        totalScore: round.totalScore,
        status: round.status,
      },
      holes: holeData.map(h => ({
        holeNumber: h.holeNumber,
        par: h.par,
        score: h.score,
      })),
      sgData: {
        total: summary.sgTotal,
        tee: summary.sgTee,
        approach: summary.sgApproach,
        shortGame: summary.sgShortGame,
        putting: summary.sgPutting,
      },
    };

    exportService.exportRound(exportData, { format });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 p-4 w-full">
        <StateCard variant="loading" title="Loading round..." />
      </div>
    );
  }

  // No round found
  if (!round || !summary) {
    return (
      <div className="flex flex-col gap-5 p-4 w-full">
        <StateCard
          variant="empty"
          title="Round not found"
          description="This round doesn't exist or has been deleted."
          action={
            <Button variant="primary" onClick={() => navigate('/rounds')}>
              Back to Rounds
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-tier-background">
      {/* Header */}
      <RoundHeader
        courseName={round.courseName || 'Unknown Course'}
        roundDate={new Date(round.roundDate).toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
        score={summary.totalScore}
        par={summary.totalPar}
        sgTotal={summary.sgTotal}
        onBack={() => navigate(-1)}
        onShare={handleShare}
        onExport={handleExport}
      />

      {/* Content */}
      <div className="flex flex-col gap-4 p-4">
        {/* SG Breakdown */}
        <SGBreakdownCard
          sgTee={summary.sgTee}
          sgApproach={summary.sgApproach}
          sgShortGame={summary.sgShortGame}
          sgPutting={summary.sgPutting}
        />

        {/* Scoring Summary */}
        <ScoringSummaryCard
          birdiesOrBetter={summary.birdiesOrBetter}
          pars={summary.pars}
          bogeys={summary.bogeys}
          doublePlus={summary.doublePlus}
        />

        {/* SG by Hole Chart */}
        <SGByHoleChart holes={holeData} />

        {/* Hole-by-hole breakdown */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-tier-navy px-1">Hole by Hole</h3>
          {holeData.map((hole) => (
            <HoleCard
              key={hole.holeNumber}
              hole={hole}
              isExpanded={expandedHole === hole.holeNumber}
              onToggle={() => setExpandedHole(
                expandedHole === hole.holeNumber ? null : hole.holeNumber
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

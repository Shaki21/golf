/**
 * Manual Stats Page V5 - TIER Golf
 *
 * Manual round entry and AI image extraction page using TIER design system.
 * Mobile-first responsive layout with semantic TIER tokens.
 *
 * Zones:
 * - Header: Page title + New round button
 * - Quick Stats: Recent SG overview
 * - Input Mode: AI-first vs Manual-first selection
 * - Recent Rounds: List of logged rounds
 * - Pending Reviews: Rounds needing attention
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  Edit3,
  Plus,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileImage,
  Upload,
  Flag,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Trash2,
  RotateCcw,
  BarChart3,
  Loader2,
  X,
} from 'lucide-react';

// Hooks
import { useAuth } from '../../contexts/AuthContext';
import { usePlayerRounds, usePlayerTrends, useStrokesGainedDashboard } from '../../hooks/useManualStats';
import { useImageExtraction } from '../../hooks/useImageExtraction';

// UI Components
import Button from '../../ui/primitives/Button';
import { Card } from '../../ui/primitives/Card';
import StateCard from '../../ui/composites/StateCard';
import { Badge } from '../../components/shadcn/badge';

// AI Coach
import { AICoachGuide } from '../ai-coach';
import { GUIDE_PRESETS } from '../ai-coach/types';

// ============================================================================
// TYPES
// ============================================================================

type RoundStatus = 'draft' | 'pending_extraction' | 'pending_review' | 'finalized' | 'archived';
type InputMode = 'ai' | 'manual';

interface GolfRound {
  id: string;
  date: string;
  courseName: string;
  totalScore?: number;
  totalPar: number;
  holesPlayed: number;
  status: RoundStatus;
  inputMethod: InputMode;
  sgTotal?: number;
  sgTee?: number;
  sgApproach?: number;
  sgShortGame?: number;
  sgPutting?: number;
  dataQuality?: number;
  pendingReviewCount?: number;
}

interface QuickStat {
  id: string;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_CONFIG: Record<RoundStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ElementType;
}> = {
  draft: {
    label: 'Draft',
    color: 'text-tier-navy/60',
    bgColor: 'bg-tier-navy/10',
    icon: Edit3,
  },
  pending_extraction: {
    label: 'Processing',
    color: 'text-tier-warning',
    bgColor: 'bg-tier-warning/10',
    icon: Clock,
  },
  pending_review: {
    label: 'Needs Review',
    color: 'text-tier-gold',
    bgColor: 'bg-tier-gold/10',
    icon: AlertCircle,
  },
  finalized: {
    label: 'Complete',
    color: 'text-tier-success',
    bgColor: 'bg-tier-success/10',
    icon: CheckCircle2,
  },
  archived: {
    label: 'Archived',
    color: 'text-tier-navy/40',
    bgColor: 'bg-tier-navy/5',
    icon: Clock,
  },
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Page Header
 */
const PageHeader: React.FC<{
  onNewRound: () => void;
}> = ({ onNewRound }) => (
  <div className="flex justify-between items-start mb-6">
    <div>
      <h1 className="text-2xl font-bold text-tier-navy">Round Tracking</h1>
      <p className="text-sm text-tier-navy/60">Log rounds and track Strokes Gained</p>
    </div>
    <Button variant="primary" size="sm" leftIcon={<Plus size={16} />} onClick={onNewRound}>
      New Round
    </Button>
  </div>
);

/**
 * Quick Stats Grid
 */
const QuickStatsGrid: React.FC<{ stats: QuickStat[] }> = ({ stats }) => (
  <div className="grid grid-cols-2 gap-3">
    {stats.map((stat) => (
      <Card key={stat.id} className="p-4">
        <div className="flex flex-col">
          <span className="text-xl font-bold text-tier-navy">{stat.value}</span>
          <span className="text-xs text-tier-navy/60">{stat.label}</span>
          {stat.change && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${
              stat.trend === 'up' ? 'text-tier-success' :
              stat.trend === 'down' ? 'text-tier-error' :
              'text-tier-navy/60'
            }`}>
              {stat.trend === 'up' ? <TrendingUp size={12} /> :
               stat.trend === 'down' ? <TrendingDown size={12} /> :
               <Minus size={12} />}
              {stat.change}
            </div>
          )}
        </div>
      </Card>
    ))}
  </div>
);

/**
 * Input Mode Selection Card
 */
const InputModeCard: React.FC<{
  onSelectMode: (mode: InputMode) => void;
}> = ({ onSelectMode }) => (
  <Card>
    <div className="p-4 border-b border-tier-navy/10">
      <h3 className="text-base font-semibold text-tier-navy">How do you want to enter data?</h3>
      <p className="text-xs text-tier-navy/60 mt-1">Choose based on your scorecard format</p>
    </div>

    <div className="grid grid-cols-2 gap-3 p-4">
      {/* AI Mode */}
      <button
        onClick={() => onSelectMode('ai')}
        className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-dashed border-tier-navy/20 hover:border-tier-gold hover:bg-tier-gold/5 transition-all group"
      >
        <div className="w-14 h-14 rounded-xl bg-tier-gold/10 flex items-center justify-center group-hover:bg-tier-gold/20 transition-colors">
          <Camera size={28} className="text-tier-gold" />
        </div>
        <div className="text-center">
          <span className="block text-sm font-semibold text-tier-navy">Photo Upload</span>
          <span className="text-xs text-tier-navy/60">AI extracts data from scorecard</span>
        </div>
        <Badge variant="secondary" className="text-xs">Recommended</Badge>
      </button>

      {/* Manual Mode */}
      <button
        onClick={() => onSelectMode('manual')}
        className="flex flex-col items-center gap-3 p-4 rounded-xl border-2 border-dashed border-tier-navy/20 hover:border-tier-navy hover:bg-tier-navy/5 transition-all group"
      >
        <div className="w-14 h-14 rounded-xl bg-tier-navy/10 flex items-center justify-center group-hover:bg-tier-navy/20 transition-colors">
          <Edit3 size={28} className="text-tier-navy" />
        </div>
        <div className="text-center">
          <span className="block text-sm font-semibold text-tier-navy">Manual Entry</span>
          <span className="text-xs text-tier-navy/60">Enter hole-by-hole data</span>
        </div>
      </button>
    </div>
  </Card>
);

/**
 * Round Card Component
 */
const RoundCard: React.FC<{
  round: GolfRound;
  onClick: () => void;
}> = ({ round, onClick }) => {
  const statusConfig = STATUS_CONFIG[round.status];
  const StatusIcon = statusConfig.icon;

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-4 cursor-pointer hover:bg-tier-navy/5 transition-colors"
    >
      {/* Status indicator */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusConfig.bgColor}`}>
        <StatusIcon size={20} className={statusConfig.color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-tier-navy truncate">{round.courseName}</span>
          {round.sgTotal !== undefined && (
            <span className={`text-sm font-bold ${round.sgTotal >= 0 ? 'text-tier-success' : 'text-tier-error'}`}>
              {round.sgTotal >= 0 ? '+' : ''}{round.sgTotal.toFixed(1)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-tier-navy/60">{round.date}</span>
          <span className="text-xs text-tier-navy/40">·</span>
          <span className="text-xs text-tier-navy/60">
            {round.totalScore ? `${round.totalScore} (${round.totalScore - round.totalPar >= 0 ? '+' : ''}${round.totalScore - round.totalPar})` : `${round.holesPlayed} holes`}
          </span>
          <Badge variant="secondary" className={`text-xs ${statusConfig.bgColor} ${statusConfig.color}`}>
            {statusConfig.label}
          </Badge>
        </div>

        {/* Review indicator */}
        {round.pendingReviewCount && round.pendingReviewCount > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-tier-warning">
            <AlertCircle size={12} />
            <span>{round.pendingReviewCount} fields need review</span>
          </div>
        )}
      </div>

      <ChevronRight size={18} className="text-tier-navy/40" />
    </div>
  );
};

/**
 * Rounds List Card
 */
const RoundsListCard: React.FC<{
  title: string;
  rounds: GolfRound[];
  emptyMessage: string;
  icon: React.ReactNode;
  onRoundClick: (id: string) => void;
  onViewAll?: () => void;
}> = ({ title, rounds, emptyMessage, icon, onRoundClick, onViewAll }) => (
  <Card>
    <div className="flex justify-between items-center p-4 border-b border-tier-navy/10">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-base font-semibold text-tier-navy">{title}</h3>
        {rounds.length > 0 && (
          <Badge variant="secondary">{rounds.length}</Badge>
        )}
      </div>
      {onViewAll && (
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View all
        </Button>
      )}
    </div>

    {rounds.length === 0 ? (
      <div className="flex flex-col items-center gap-3 p-6">
        <Flag size={40} className="text-tier-navy/20" />
        <p className="text-sm text-tier-navy/60">{emptyMessage}</p>
      </div>
    ) : (
      <div className="divide-y divide-tier-navy/10">
        {rounds.map((round) => (
          <RoundCard
            key={round.id}
            round={round}
            onClick={() => onRoundClick(round.id)}
          />
        ))}
      </div>
    )}
  </Card>
);

/**
 * Image Upload Modal
 */
const ImageUploadModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => void;
}> = ({ isOpen, onClose, onUpload }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  }, []);

  const handleSubmit = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles);
      setSelectedFiles([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-tier-navy/10">
          <h3 className="text-base font-semibold text-tier-navy">Upload Scorecard Photos</h3>
          <button onClick={onClose} className="p-2 hover:bg-tier-navy/10 rounded-lg transition-colors">
            <Trash2 size={20} className="text-tier-navy/60" />
          </button>
        </div>

        <div className="p-4">
          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`
              flex flex-col items-center gap-4 p-8 rounded-xl border-2 border-dashed transition-all
              ${dragOver
                ? 'border-tier-gold bg-tier-gold/5'
                : 'border-tier-navy/20 hover:border-tier-navy/40'
              }
            `}
          >
            <div className="w-16 h-16 rounded-full bg-tier-navy/10 flex items-center justify-center">
              <Upload size={32} className="text-tier-navy/60" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-tier-navy">Drag photos here</p>
              <p className="text-xs text-tier-navy/60 mt-1">or click to browse</p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-tier-navy/5 rounded-lg">
                  <FileImage size={16} className="text-tier-navy/60" />
                  <span className="text-xs text-tier-navy truncate max-w-[120px]">{file.name}</span>
                  <button
                    onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                    className="p-1 hover:bg-tier-navy/10 rounded"
                  >
                    <Trash2 size={12} className="text-tier-navy/40" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={selectedFiles.length === 0}
              leftIcon={<Camera size={16} />}
            >
              Extract Data ({selectedFiles.length})
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * Extraction Progress Modal
 */
const ExtractionProgressModal: React.FC<{
  isOpen: boolean;
  progress: number;
  status: string;
  currentStep?: string;
  onClose: () => void;
  onViewResults: () => void;
}> = ({ isOpen, progress, status, currentStep, onClose, onViewResults }) => {
  if (!isOpen) return null;

  const isComplete = status === 'COMPLETED' || status === 'REQUIRES_REVIEW';
  const isFailed = status === 'FAILED';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-tier-navy/10">
          <h3 className="text-base font-semibold text-tier-navy">
            {isComplete ? 'Extraction Complete' : isFailed ? 'Extraction Failed' : 'Processing Scorecard'}
          </h3>
          {(isComplete || isFailed) && (
            <button onClick={onClose} className="p-2 hover:bg-tier-navy/10 rounded-lg">
              <X size={20} className="text-tier-navy/60" />
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Progress indicator */}
          <div className="flex flex-col items-center gap-4">
            {!isComplete && !isFailed && (
              <div className="w-20 h-20 rounded-full bg-tier-gold/10 flex items-center justify-center">
                <Loader2 size={40} className="text-tier-gold animate-spin" />
              </div>
            )}
            {isComplete && (
              <div className="w-20 h-20 rounded-full bg-tier-success/10 flex items-center justify-center">
                <CheckCircle2 size={40} className="text-tier-success" />
              </div>
            )}
            {isFailed && (
              <div className="w-20 h-20 rounded-full bg-tier-error/10 flex items-center justify-center">
                <AlertCircle size={40} className="text-tier-error" />
              </div>
            )}

            {/* Progress bar */}
            {!isComplete && !isFailed && (
              <div className="w-full">
                <div className="h-2 bg-tier-navy/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-tier-gold rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-tier-navy/60 text-center mt-2">
                  {currentStep || 'Processing...'}
                </p>
              </div>
            )}

            {/* Status message */}
            {isComplete && (
              <div className="text-center">
                <p className="text-sm font-semibold text-tier-navy">
                  {status === 'REQUIRES_REVIEW' ? 'Review Required' : 'Ready to Review'}
                </p>
                <p className="text-xs text-tier-navy/60 mt-1">
                  {status === 'REQUIRES_REVIEW'
                    ? 'Some fields need your attention before finalizing.'
                    : 'Your scorecard has been processed successfully.'}
                </p>
              </div>
            )}

            {isFailed && (
              <div className="text-center">
                <p className="text-sm font-semibold text-tier-error">Processing Failed</p>
                <p className="text-xs text-tier-navy/60 mt-1">
                  We could not process your scorecard. Please try again or enter data manually.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3 mt-6">
            {isComplete && (
              <Button variant="primary" onClick={onViewResults}>
                Review & Finalize
              </Button>
            )}
            {isFailed && (
              <>
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={onClose}>Try Again</Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ManualStatsPageV5() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const playerId = (user as { playerId?: string })?.playerId;

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);

  // Fetch real data from API
  const { data: allRounds, isLoading: isLoadingRounds } = usePlayerRounds(playerId);
  const { summary: sgSummary, isLoading: isLoadingSG } = useStrokesGainedDashboard(playerId);

  // Image extraction hook
  const {
    state: extractionState,
    roundId: extractionRoundId,
    progress: extractionProgress,
    uploadImages,
    reset: resetExtraction,
    isComplete: extractionComplete,
  } = useImageExtraction({
    onComplete: (roundId) => {
      // Navigate to review when complete
    },
    onError: (error) => {
      console.error('Extraction error:', error);
    },
  });

  const isLoading = isLoadingRounds || isLoadingSG;

  // Transform API data to component format
  const pendingRounds: GolfRound[] = useMemo(() => {
    if (!allRounds) return [];
    return allRounds
      .filter(r => r.status === 'PENDING_REVIEW' || r.status === 'PENDING_EXTRACTION')
      .map(r => ({
        id: r.id,
        date: new Date(r.roundDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        courseName: r.courseName || 'Unknown Course',
        totalScore: r.totalScore,
        totalPar: r.totalPar,
        holesPlayed: r.holesPlayed,
        status: r.status.toLowerCase().replace('_', '_') as RoundStatus,
        inputMethod: r.inputMethod as InputMode,
        dataQuality: r.dataQuality,
      }));
  }, [allRounds]);

  const completedRounds: GolfRound[] = useMemo(() => {
    if (!allRounds) return [];
    return allRounds
      .filter(r => r.status === 'FINALIZED')
      .slice(0, 5) // Show last 5 completed rounds
      .map(r => ({
        id: r.id,
        date: new Date(r.roundDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        courseName: r.courseName || 'Unknown Course',
        totalScore: r.totalScore,
        totalPar: r.totalPar,
        holesPlayed: r.holesPlayed,
        status: 'finalized' as RoundStatus,
        inputMethod: r.inputMethod as InputMode,
        dataQuality: r.dataQuality,
      }));
  }, [allRounds]);

  // Build quick stats from SG summary
  const quickStats: QuickStat[] = useMemo(() => {
    if (!sgSummary) {
      return [
        { id: '1', label: 'Total SG', value: '—' },
        { id: '2', label: 'Rounds (30d)', value: '0' },
        { id: '3', label: 'Best Category', value: '—' },
        { id: '4', label: 'Focus Area', value: '—' },
      ];
    }

    // Determine best and worst categories
    const categories = [
      { name: 'Tee', value: sgSummary.sgTee, trend: sgSummary.trends?.sgTee },
      { name: 'Approach', value: sgSummary.sgApproach, trend: sgSummary.trends?.sgApproach },
      { name: 'Short Game', value: sgSummary.sgShortGame, trend: sgSummary.trends?.sgShortGame },
      { name: 'Putting', value: sgSummary.sgPutting, trend: sgSummary.trends?.sgPutting },
    ];

    const best = categories.reduce((a, b) => (a.value ?? -Infinity) > (b.value ?? -Infinity) ? a : b);
    const worst = categories.reduce((a, b) => (a.value ?? Infinity) < (b.value ?? Infinity) ? a : b);

    return [
      {
        id: '1',
        label: 'Total SG',
        value: sgSummary.sgTotal?.toFixed(1) ?? '—',
        trend: sgSummary.trends?.sgTotal,
      },
      {
        id: '2',
        label: 'Rounds (30d)',
        value: sgSummary.roundCount ?? 0,
      },
      {
        id: '3',
        label: 'Best Category',
        value: best.name,
        trend: best.trend,
        change: best.value?.toFixed(1),
      },
      {
        id: '4',
        label: 'Focus Area',
        value: worst.name,
        trend: worst.trend,
        change: worst.value?.toFixed(1),
      },
    ];
  }, [sgSummary]);

  // Handlers
  const handleNewRound = () => {
    // Scroll to input mode selection
  };

  const handleSelectMode = (mode: InputMode) => {
    if (mode === 'ai') {
      setShowUploadModal(true);
    } else {
      navigate('/rounds/new');
    }
  };

  const handleImageUpload = async (files: File[]) => {
    if (!playerId) return;

    setShowUploadModal(false);
    setShowProgressModal(true);

    // Upload images and start extraction
    await uploadImages(
      playerId,
      new Date().toISOString().split('T')[0],
      undefined, // Course name will be extracted
      files
    );
  };

  const handleCloseProgressModal = () => {
    setShowProgressModal(false);
    resetExtraction();
  };

  const handleViewExtractionResults = () => {
    if (extractionRoundId) {
      setShowProgressModal(false);
      navigate(`/rounds/${extractionRoundId}/review`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 p-4 w-full">
        <StateCard variant="loading" title="Loading rounds..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4 w-full">
      {/* Header */}
      <PageHeader onNewRound={handleNewRound} />

      {/* AI Coach Guide */}
      <AICoachGuide config={GUIDE_PRESETS.manualStats} />

      {/* Quick Stats */}
      <section className="flex flex-col gap-3">
        <QuickStatsGrid stats={quickStats} />
      </section>

      {/* Input Mode Selection */}
      <section className="flex flex-col gap-3">
        <InputModeCard onSelectMode={handleSelectMode} />
      </section>

      {/* Pending Reviews */}
      {pendingRounds.length > 0 && (
        <section className="flex flex-col gap-3">
          <RoundsListCard
            title="Needs Attention"
            rounds={pendingRounds}
            emptyMessage="No rounds pending"
            icon={<AlertCircle size={20} className="text-tier-warning" />}
            onRoundClick={(id) => navigate(`/rounds/${id}/review`)}
          />
        </section>
      )}

      {/* Completed Rounds */}
      <section className="flex flex-col gap-3">
        <RoundsListCard
          title="Recent Rounds"
          rounds={completedRounds}
          emptyMessage="No rounds logged yet"
          icon={<Calendar size={20} className="text-tier-gold" />}
          onRoundClick={(id) => navigate(`/rounds/${id}`)}
          onViewAll={() => navigate('/rounds')}
        />
      </section>

      {/* Info Card */}
      <Card className="p-4 bg-tier-navy/5 border-tier-navy/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-tier-navy/10 flex items-center justify-center flex-shrink-0">
            <BarChart3 size={20} className="text-tier-navy" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-tier-navy mb-1">About Strokes Gained</h3>
            <p className="text-xs text-tier-navy/60 leading-relaxed">
              Log detailed round data to calculate your Strokes Gained in four categories:
              Off the Tee, Approach, Short Game, and Putting. Compare your performance
              against tour averages and track improvement over time.
            </p>
          </div>
        </div>
      </Card>

      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleImageUpload}
      />

      {/* Extraction Progress Modal */}
      <ExtractionProgressModal
        isOpen={showProgressModal}
        progress={extractionProgress?.progress ?? 0}
        status={extractionProgress?.status ?? 'PENDING'}
        currentStep={extractionProgress?.currentStep}
        onClose={handleCloseProgressModal}
        onViewResults={handleViewExtractionResults}
      />
    </div>
  );
}

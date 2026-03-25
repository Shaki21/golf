/**
 * Round Review Component - TIER Golf
 *
 * Review and correct AI-extracted scorecard data before finalizing.
 * Mobile-first responsive design using TIER design system.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Edit3,
  X,
  Eye,
  Flag,
  Target,
  CircleDot,
  Activity,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

// Hooks
import { useExtractionReview, useRound } from '../../hooks/useManualStats';

// UI Components
import Button from '../../ui/primitives/Button';
import { Card } from '../../ui/primitives/Card';
import StateCard from '../../ui/composites/StateCard';
import { Badge } from '../../components/shadcn/badge';

// Types
import type { ExtractionHoleData } from '../../services/manualStatsApi';

// ============================================================================
// TYPES
// ============================================================================

interface FieldCorrection {
  holeNumber: number;
  field: string;
  originalValue: string | number | boolean | undefined;
  newValue: string | number | boolean;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Confidence Badge
 */
const ConfidenceBadge: React.FC<{ confidence: number }> = ({ confidence }) => {
  const getColor = () => {
    if (confidence >= 0.9) return 'bg-tier-success/10 text-tier-success';
    if (confidence >= 0.7) return 'bg-tier-warning/10 text-tier-warning';
    return 'bg-tier-error/10 text-tier-error';
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getColor()}`}>
      {(confidence * 100).toFixed(0)}%
    </span>
  );
};

/**
 * Editable Field Component
 */
const EditableField: React.FC<{
  label: string;
  value: string | number | undefined;
  confidence?: number;
  requiresReview?: boolean;
  onEdit: (newValue: string | number) => void;
}> = ({ label, value, confidence, requiresReview, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value ?? ''));

  const handleSave = () => {
    const numValue = Number(editValue);
    onEdit(isNaN(numValue) ? editValue : numValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(String(value ?? ''));
    setIsEditing(false);
  };

  return (
    <div className={`
      flex items-center justify-between p-3 rounded-lg
      ${requiresReview ? 'bg-tier-warning/5 border border-tier-warning/30' : 'bg-tier-navy/5'}
    `}>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="text-xs text-tier-navy/60">{label}</span>
          {requiresReview && (
            <AlertTriangle size={12} className="text-tier-warning" />
          )}
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-20 px-2 py-1 text-sm border border-tier-navy/20 rounded focus:outline-none focus:ring-2 focus:ring-tier-gold/50"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="p-1 hover:bg-tier-success/10 rounded"
            >
              <Check size={16} className="text-tier-success" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-tier-error/10 rounded"
            >
              <X size={16} className="text-tier-error" />
            </button>
          </div>
        ) : (
          <span className="text-sm font-semibold text-tier-navy">
            {value ?? '—'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {confidence !== undefined && (
          <ConfidenceBadge confidence={confidence} />
        )}
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-tier-navy/10 rounded"
          >
            <Edit3 size={14} className="text-tier-navy/40" />
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Hole Review Card
 */
const HoleReviewCard: React.FC<{
  hole: ExtractionHoleData;
  isExpanded: boolean;
  onToggle: () => void;
  onFieldEdit: (field: string, value: string | number | boolean) => void;
}> = ({ hole, isExpanded, onToggle, onFieldEdit }) => {
  const hasIssues = hole.requiresReview || (hole.overallConfidence ?? 1) < 0.8;

  return (
    <Card className={hasIssues ? 'border-tier-warning/50' : ''}>
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold
            ${hasIssues
              ? 'bg-tier-warning/10 text-tier-warning'
              : 'bg-tier-success/10 text-tier-success'
            }
          `}>
            {hole.holeNumber}
          </div>
          <div>
            <span className="text-sm font-semibold text-tier-navy">
              Hole {hole.holeNumber}
            </span>
            <span className="text-xs text-tier-navy/60 ml-2">
              Par {hole.holePar} · {hole.holeLengthM}m · Score {hole.holeScore}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasIssues && (
            <Badge variant="destructive" className="text-xs">
              <AlertTriangle size={12} className="mr-1" />
              Review
            </Badge>
          )}
          <ChevronRight
            size={18}
            className={`text-tier-navy/40 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          />
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-tier-navy/10 pt-4">
          {/* Basic Info */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <EditableField
              label="Par"
              value={hole.holePar}
              onEdit={(v) => onFieldEdit('holePar', v)}
            />
            <EditableField
              label="Length (m)"
              value={hole.holeLengthM}
              onEdit={(v) => onFieldEdit('holeLengthM', v)}
            />
            <EditableField
              label="Score"
              value={hole.holeScore}
              requiresReview={hole.reviewFields?.includes('holeScore')}
              onEdit={(v) => onFieldEdit('holeScore', v)}
            />
          </div>

          {/* Tee Shot */}
          {hole.tee && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={14} className="text-tier-navy" />
                <span className="text-xs font-medium text-tier-navy">Tee Shot</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <EditableField
                  label="Club"
                  value={hole.tee.club}
                  confidence={hole.tee.confidence}
                  requiresReview={hole.reviewFields?.includes('tee.club')}
                  onEdit={(v) => onFieldEdit('tee.club', v)}
                />
                <EditableField
                  label="Distance (m)"
                  value={hole.tee.distanceM}
                  confidence={hole.tee.confidence}
                  requiresReview={hole.reviewFields?.includes('tee.distanceM')}
                  onEdit={(v) => onFieldEdit('tee.distanceM', v)}
                />
              </div>
            </div>
          )}

          {/* Approach */}
          {hole.approach && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Target size={14} className="text-tier-success" />
                <span className="text-xs font-medium text-tier-navy">Approach</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <EditableField
                  label="Start (m)"
                  value={hole.approach.startDistanceM}
                  confidence={hole.approach.confidence}
                  requiresReview={hole.reviewFields?.includes('approach.startDistanceM')}
                  onEdit={(v) => onFieldEdit('approach.startDistanceM', v)}
                />
                <EditableField
                  label="Lie"
                  value={hole.approach.lie}
                  requiresReview={hole.reviewFields?.includes('approach.lie')}
                  onEdit={(v) => onFieldEdit('approach.lie', v)}
                />
              </div>
            </div>
          )}

          {/* Short Game */}
          {hole.shortGame && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Flag size={14} className="text-tier-gold" />
                <span className="text-xs font-medium text-tier-navy">Short Game</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <EditableField
                  label="Start (m)"
                  value={hole.shortGame.startDistanceM}
                  confidence={hole.shortGame.confidence}
                  requiresReview={hole.reviewFields?.includes('shortGame.startDistanceM')}
                  onEdit={(v) => onFieldEdit('shortGame.startDistanceM', v)}
                />
                <EditableField
                  label="Lie"
                  value={hole.shortGame.lie}
                  requiresReview={hole.reviewFields?.includes('shortGame.lie')}
                  onEdit={(v) => onFieldEdit('shortGame.lie', v)}
                />
              </div>
            </div>
          )}

          {/* Putting */}
          {hole.putting && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CircleDot size={14} className="text-purple-600" />
                <span className="text-xs font-medium text-tier-navy">Putting</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <EditableField
                  label="First Putt (m)"
                  value={hole.putting.firstPuttM}
                  confidence={hole.putting.confidence}
                  requiresReview={hole.reviewFields?.includes('putting.firstPuttM')}
                  onEdit={(v) => onFieldEdit('putting.firstPuttM', v)}
                />
                <EditableField
                  label="Putts"
                  value={hole.putting.puttsCount}
                  confidence={hole.putting.confidence}
                  requiresReview={hole.reviewFields?.includes('putting.puttsCount')}
                  onEdit={(v) => onFieldEdit('putting.puttsCount', v)}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

/**
 * Review Summary Card
 */
const ReviewSummaryCard: React.FC<{
  totalHoles: number;
  reviewedHoles: number;
  fieldsRequiringReview: number;
  overallConfidence?: number;
}> = ({ totalHoles, reviewedHoles, fieldsRequiringReview, overallConfidence }) => (
  <Card className="p-4 bg-tier-navy/5">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-semibold text-tier-navy">Extraction Summary</h3>
        <p className="text-xs text-tier-navy/60 mt-1">
          {reviewedHoles} of {totalHoles} holes · {fieldsRequiringReview} fields need review
        </p>
      </div>
      {overallConfidence !== undefined && (
        <div className="text-right">
          <span className="text-xs text-tier-navy/60">Confidence</span>
          <ConfidenceBadge confidence={overallConfidence} />
        </div>
      )}
    </div>

    {/* Progress bar */}
    <div className="mt-3 h-2 bg-tier-navy/10 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${
          fieldsRequiringReview === 0 ? 'bg-tier-success' : 'bg-tier-warning'
        }`}
        style={{ width: `${(reviewedHoles / totalHoles) * 100}%` }}
      />
    </div>
  </Card>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function RoundReviewComponent() {
  const navigate = useNavigate();
  const { roundId } = useParams<{ roundId: string }>();

  // Fetch round and extraction data
  const { data: round, isLoading: isLoadingRound } = useRound(roundId);
  const {
    extraction,
    corrections,
    isLoading: isLoadingExtraction,
    isPending,
    addCorrection,
    approveAndFinalize,
  } = useExtractionReview(roundId);

  // Local state
  const [expandedHole, setExpandedHole] = useState<number | null>(null);

  // Computed values
  const isLoading = isLoadingRound || isLoadingExtraction;
  const holeData = extraction?.holeData ?? [];
  const holesRequiringReview = holeData.filter(h => h.requiresReview).length;

  // Handle field edit
  const handleFieldEdit = useCallback((holeNumber: number, field: string, value: string | number | boolean) => {
    addCorrection(holeNumber, field, value, 'User correction');
  }, [addCorrection]);

  // Handle approve and finalize
  const handleApprove = async () => {
    try {
      await approveAndFinalize();
      navigate(`/rounds/${roundId}`);
    } catch (err) {
      console.error('Failed to finalize:', err);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-5 p-4 w-full">
        <StateCard variant="loading" title="Loading extraction data..." />
      </div>
    );
  }

  // No extraction data
  if (!extraction || holeData.length === 0) {
    return (
      <div className="flex flex-col gap-5 p-4 w-full">
        <StateCard
          variant="empty"
          title="No extraction data"
          description="This round doesn't have AI-extracted data to review."
          action={
            <Button variant="primary" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-tier-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-tier-navy/10 bg-white">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-tier-navy/5 rounded-lg"
        >
          <ChevronLeft size={24} className="text-tier-navy" />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-tier-navy">Review Extraction</h1>
          <span className="text-xs text-tier-navy/60">{round?.courseName}</span>
        </div>
        <Badge variant="secondary">
          <Eye size={14} className="mr-1" />
          Review
        </Badge>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-4 p-4 pb-24">
        {/* Summary Card */}
        <ReviewSummaryCard
          totalHoles={holeData.length}
          reviewedHoles={holeData.filter(h => !h.requiresReview).length}
          fieldsRequiringReview={extraction.fieldsRequiringReview}
          overallConfidence={extraction.overallConfidence}
        />

        {/* Instructions */}
        {holesRequiringReview > 0 && (
          <Card className="p-4 border-tier-warning/30 bg-tier-warning/5">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-tier-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-tier-navy">
                  {holesRequiringReview} holes need your attention
                </p>
                <p className="text-xs text-tier-navy/60 mt-1">
                  Tap on holes marked with &quot;Review&quot; to verify and correct extracted data.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Correction count */}
        {corrections.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-tier-gold/10 rounded-lg">
            <span className="text-sm text-tier-navy">
              {corrections.length} correction{corrections.length > 1 ? 's' : ''} made
            </span>
            <CheckCircle2 size={16} className="text-tier-gold" />
          </div>
        )}

        {/* Hole Cards */}
        <div className="flex flex-col gap-3">
          {holeData.map((hole) => (
            <HoleReviewCard
              key={hole.holeNumber}
              hole={hole}
              isExpanded={expandedHole === hole.holeNumber}
              onToggle={() => setExpandedHole(
                expandedHole === hole.holeNumber ? null : hole.holeNumber
              )}
              onFieldEdit={(field, value) => handleFieldEdit(hole.holeNumber, field, value)}
            />
          ))}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-tier-navy/10 p-4 safe-area-pb">
        <Button
          variant="primary"
          onClick={handleApprove}
          disabled={isPending}
          leftIcon={isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          className="w-full"
        >
          {isPending ? 'Finalizing...' : 'Approve & Calculate SG'}
        </Button>

        <p className="text-xs text-tier-navy/60 text-center mt-2">
          This will finalize the round and calculate Strokes Gained
        </p>
      </div>
    </div>
  );
}

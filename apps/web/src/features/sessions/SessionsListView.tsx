/**
 * SessionsListView - Training sessions overview with filtering
 *
 * Uses shadcn/ui components for a premium look and feel.
 */
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import {
  Calendar, Clock, Target, Filter, ChevronRight,
  CheckCircle, AlertCircle, XCircle, Play, Search, X
} from 'lucide-react';
import { AICoachGuide, GUIDE_PRESETS } from '../ai-coach';

// ============================================================================
// TYPES
// ============================================================================

interface Session {
  id: string;
  sessionType: string;
  sessionDate: string;
  duration: number;
  completionStatus: string;
  focusArea?: string;
  evaluationFocus?: number;
  evaluationTechnical?: number;
}

interface SessionFilters {
  search?: string;
  completionStatus?: string | null;
  sessionType?: string | null;
  period?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
}

interface StatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: LucideIcon;
}
import {
  Card,
  CardContent,
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Skeleton,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../components/shadcn';
import { TrainingCategoryBadge } from '../../components/shadcn/golf';
import { cn } from 'lib/utils';
import { PageTitle, SectionTitle, SubSectionTitle, CardTitle } from '../../components/typography/Headings';

// Session type labels
const SESSION_TYPE_LABELS: Record<string, string> = {
  driving_range: 'Driving Range',
  putting: 'Putting',
  chipping: 'Chipping',
  pitching: 'Pitching',
  bunker: 'Bunker',
  course_play: 'Course Play',
  physical: 'Physical',
  mental: 'Mental',
};

// Status config
const STATUS_CONFIG: Record<string, StatusConfig> = {
  in_progress: {
    label: 'In Progress',
    variant: 'secondary',
    icon: Play,
  },
  completed: {
    label: 'Completed',
    variant: 'default',
    icon: CheckCircle,
  },
  auto_completed: {
    label: 'Auto-completed',
    variant: 'outline',
    icon: AlertCircle,
  },
  abandoned: {
    label: 'Abandoned',
    variant: 'destructive',
    icon: XCircle,
  },
};

// Period labels
const PERIOD_LABELS: Record<string, string> = {
  E: 'Evaluation',
  G: 'Foundation',
  S: 'Specialization',
  T: 'Tournament',
};

// Map session type to training category for badge
// Valid categories: 'fysisk' | 'teknikk' | 'slag' | 'spill' | 'turnering'
const SESSION_TYPE_TO_CATEGORY: Record<string, string> = {
  driving_range: 'slag',
  putting: 'teknikk',
  chipping: 'teknikk',
  pitching: 'teknikk',
  bunker: 'teknikk',
  course_play: 'spill',
  physical: 'fysisk',
  mental: 'teknikk', // Mental training uses 'teknikk' badge
};

// ============================================================================
// FILTER BAR
// ============================================================================

interface FilterBarProps {
  filters: SessionFilters;
  onFilterChange: (key: keyof SessionFilters, value: string | null) => void;
  onSearch: (value: string) => void;
}

function FilterBar({ filters, onFilterChange, onSearch }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters = filters.completionStatus || filters.sessionType || filters.period || filters.fromDate || filters.toDate;

  const clearFilters = () => {
    onFilterChange('completionStatus', null);
    onFilterChange('sessionType', null);
    onFilterChange('period', null);
    onFilterChange('fromDate', null);
    onFilterChange('toDate', null);
  };

  return (
    <div className="mb-6 space-y-3">
      {/* Search and filter toggle */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <Input
            type="text"
            placeholder="Search sessions..."
            value={filters.search || ''}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant={isOpen || hasActiveFilters ? 'default' : 'outline'}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-white" />
              )}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      </div>

      {/* Expanded filters */}
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Status filter */}
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-medium">Status</label>
                  <Select
                    value={filters.completionStatus || 'all'}
                    onValueChange={(val) => onFilterChange('completionStatus', val === 'all' ? null : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="auto_completed">Auto-completed</SelectItem>
                      <SelectItem value="abandoned">Abandoned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Session type filter */}
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-medium">Type</label>
                  <Select
                    value={filters.sessionType || 'all'}
                    onValueChange={(val) => onFilterChange('sessionType', val === 'all' ? null : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      {Object.entries(SESSION_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Period filter */}
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-medium">Period</label>
                  <Select
                    value={filters.period || 'all'}
                    onValueChange={(val) => onFilterChange('period', val === 'all' ? null : val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All periods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All periods</SelectItem>
                      {Object.entries(PERIOD_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date from */}
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-medium">From date</label>
                  <Input
                    type="date"
                    value={filters.fromDate || ''}
                    onChange={(e) => onFilterChange('fromDate', e.target.value || null)}
                  />
                </div>

                {/* Date to */}
                <div className="space-y-1.5">
                  <label className="text-xs text-text-secondary font-medium">To date</label>
                  <Input
                    type="date"
                    value={filters.toDate || ''}
                    onChange={(e) => onFilterChange('toDate', e.target.value || null)}
                  />
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-border-subtle">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="gap-2 text-text-secondary"
                  >
                    <X className="h-4 w-4" />
                    Clear all filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// ============================================================================
// SESSION CARD
// ============================================================================

interface SessionCardProps {
  session: Session;
  onClick: () => void;
}

function SessionCard({ session, onClick }: SessionCardProps) {
  const statusConfig = STATUS_CONFIG[session.completionStatus] || STATUS_CONFIG.in_progress;
  const StatusIcon = statusConfig.icon;
  const sessionDate = new Date(session.sessionDate);
  const category = SESSION_TYPE_TO_CATEGORY[session.sessionType] || 'teknikk';

  return (
    <Card
      className="mb-3 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-2">
            {/* Session type and status */}
            <div className="flex items-center gap-2 flex-wrap">
              <TrainingCategoryBadge
                category={(['teknikk', 'slag', 'spill', 'fysisk', 'turnering'].includes(category) ? category : 'teknikk') as 'teknikk' | 'slag' | 'spill' | 'fysisk' | 'turnering'}
                size="sm"
              />
              <span className="text-lg font-semibold text-text-primary capitalize">
                {SESSION_TYPE_LABELS[session.sessionType] || session.sessionType}
              </span>
              <Badge variant={statusConfig.variant} className="gap-1">
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>

            {/* Date and duration */}
            <div className="flex items-center gap-4 text-sm text-text-secondary">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {sessionDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{session.duration} min</span>
              </div>
            </div>

            {/* Focus area */}
            {session.focusArea && (
              <div className="flex items-center gap-1.5 text-sm">
                <Target className="h-3.5 w-3.5 text-tier-navy" />
                <span className="text-text-primary capitalize">{session.focusArea}</span>
              </div>
            )}

            {/* Evaluation ratings (if completed) */}
            {session.completionStatus === 'completed' && session.evaluationFocus && (
              <div className="flex gap-4 text-xs text-text-secondary">
                <span>Focus: {session.evaluationFocus}/10</span>
                <span>Technique: {session.evaluationTechnical}/10</span>
              </div>
            )}
          </div>

          <ChevronRight className="h-5 w-5 text-text-tertiary mt-1" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function SessionCardSkeleton() {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  onCreateNew: () => void;
}

function EmptyState({ onCreateNew }: EmptyStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-12) var(--spacing-4)',
      textAlign: 'center'
    }}>
      <Calendar style={{ width: '48px', height: '48px', color: 'var(--text-muted)', marginBottom: 'var(--spacing-4)' }} />
      <SubSectionTitle style={{ marginBottom: 'var(--spacing-2)' }}>
        No sessions found
      </SubSectionTitle>
      <p style={{ fontSize: 'var(--font-size-footnote)', color: 'var(--text-tertiary)', marginBottom: 'var(--spacing-4)', maxWidth: '320px' }}>
        You have no training sessions that match your filters. Create a new session to get started.
      </p>
      <Button variant="default" onClick={onCreateNew}>
        Create new session
      </Button>
    </div>
  );
}

// ============================================================================
// PAGINATION COMPONENT
// ============================================================================

interface SessionPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function SessionPagination({ page, totalPages, onPageChange }: SessionPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-6">
      <PaginationContent>
        <PaginationItem>
          <button
            onClick={() => page > 1 && onPageChange(page - 1)}
            disabled={page <= 1}
            className={cn("cursor-pointer", page <= 1 && 'pointer-events-none opacity-50')}
            aria-label="Previous page"
          >
            <PaginationPrevious />
          </button>
        </PaginationItem>

        {/* Page numbers */}
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum: number;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (page <= 3) {
            pageNum = i + 1;
          } else if (page >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = page - 2 + i;
          }

          return (
            <PaginationItem key={pageNum}>
              <button
                onClick={() => onPageChange(pageNum)}
                className="cursor-pointer"
                aria-label={`Page ${pageNum}`}
              >
                <PaginationLink isActive={page === pageNum}>
                  {pageNum}
                </PaginationLink>
              </button>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <button
            onClick={() => page < totalPages && onPageChange(page + 1)}
            disabled={page >= totalPages}
            className={cn("cursor-pointer", page >= totalPages && 'pointer-events-none opacity-50')}
            aria-label="Next page"
          >
            <PaginationNext />
          </button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface SessionsListViewProps {
  sessions?: Session[];
  pagination?: { page: number; totalPages: number; total: number };
  filters?: SessionFilters;
  isLoading?: boolean;
  onFilterChange: (key: keyof SessionFilters, value: string | null) => void;
  onSearch: (value: string) => void;
  onPageChange: (page: number) => void;
}

export default function SessionsListView({
  sessions = [],
  pagination = { page: 1, totalPages: 1, total: 0 },
  filters = {},
  isLoading = false,
  onFilterChange,
  onSearch,
  onPageChange,
}: SessionsListViewProps) {
  const navigate = useNavigate();

  const handleSessionClick = useCallback((session: Session) => {
    if (session.completionStatus === 'in_progress') {
      navigate(`/session/${session.id}/evaluate`);
    } else {
      navigate(`/session/${session.id}`);
    }
  }, [navigate]);

  const handleCreateNew = useCallback(() => {
    navigate('/session/new');
  }, [navigate]);

  return (
    <div className="max-w-4xl mx-auto">
      {/* AI Coach contextual guide */}
      <div className="mb-8">
        <AICoachGuide config={GUIDE_PRESETS.sessions} variant="compact" />
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        onFilterChange={onFilterChange}
        onSearch={onSearch}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <SessionCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Sessions list */}
      {!isLoading && sessions.length > 0 && (
        <>
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onClick={() => handleSessionClick(session)}
              />
            ))}
          </div>
          <SessionPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </>
      )}

      {/* Empty state */}
      {!isLoading && sessions.length === 0 && (
        <EmptyState onCreateNew={handleCreateNew} />
      )}
    </div>
  );
}

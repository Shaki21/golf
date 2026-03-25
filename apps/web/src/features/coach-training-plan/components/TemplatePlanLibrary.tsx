/**
 * TemplatePlanLibrary Component
 * Displays and filters available training plan templates
 */

import React, { useState, useMemo } from 'react';
import { Search, Calendar, Users, Tag, Clock, TrendingUp, ArrowUpDown } from 'lucide-react';
import { Card } from '../../../ui/primitives/Card';
import { Badge } from '../../../components/shadcn/badge';
import { Button } from '../../../components/shadcn/button';
import { Input } from '../../../components/shadcn/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/shadcn/select';
import {
  TrainingPlanTemplate,
  TemplateCategory,
  TemplateLevel,
  TemplateFilters,
  TemplateSession
} from '../types/template.types';
import { PREBUILT_TEMPLATES } from '../data/prebuiltTemplates';

interface TemplatePlanLibraryProps {
  onSelectTemplate: (template: TrainingPlanTemplate) => void;
  customTemplates?: TrainingPlanTemplate[];
}

const CATEGORY_LABELS: Record<TemplateCategory, string> = {
  technique: 'Technique',
  fitness: 'Fitness',
  mental: 'Mental',
  'competition-prep': 'Competition Prep',
  recovery: 'Recovery',
  custom: 'Custom'
};

const LEVEL_LABELS: Record<TemplateLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  all: 'All Levels'
};

type SortOption = 'name' | 'duration-asc' | 'duration-desc' | 'sessions' | 'recent';

export function TemplatePlanLibrary({
  onSelectTemplate,
  customTemplates = []
}: TemplatePlanLibraryProps) {
  const [filters, setFilters] = useState<TemplateFilters>({
    searchTerm: '',
    category: undefined,
    level: undefined,
    isPublic: undefined,
    minWeeks: undefined,
    maxWeeks: undefined
  });
  const [activeTab, setActiveTab] = useState<'prebuilt' | 'custom'>('prebuilt');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  // Combine prebuilt and custom templates
  const allTemplates = useMemo(() => {
    const prebuilt = PREBUILT_TEMPLATES.map(template => ({
      ...template,
      id: `prebuilt-${template.name.toLowerCase().replace(/\s+/g, '-')}`,
      createdBy: 'system',
      isPublic: true,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    return [...prebuilt, ...customTemplates];
  }, [customTemplates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    let filtered = activeTab === 'prebuilt'
      ? allTemplates.filter(t => t.createdBy === 'system')
      : allTemplates.filter(t => t.createdBy !== 'system');

    // Search filter
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        t =>
          t.name.toLowerCase().includes(search) ||
          t.description.toLowerCase().includes(search) ||
          t.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    // Level filter - handle both targetLevel (TrainingPlanTemplate) and level (PrebuiltTemplate)
    if (filters.level && filters.level !== 'all') {
      filtered = filtered.filter(t => {
        const level = 'targetLevel' in t ? t.targetLevel : (t as any).level;
        return level === filters.level || level === 'all';
      });
    }

    // Duration filter
    if (filters.minWeeks !== undefined) {
      filtered = filtered.filter(t => t.durationWeeks >= filters.minWeeks!);
    }
    if (filters.maxWeeks !== undefined) {
      filtered = filtered.filter(t => t.durationWeeks <= filters.maxWeeks!);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'duration-asc':
          return a.durationWeeks - b.durationWeeks;
        case 'duration-desc':
          return b.durationWeeks - a.durationWeeks;
        case 'sessions':
          return b.sessions.length - a.sessions.length;
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [allTemplates, activeTab, filters, sortBy]);

  const handleCategoryFilter = (category: TemplateCategory | undefined) => {
    setFilters(prev => ({ ...prev, category }));
  };

  const handleLevelFilter = (level: TemplateLevel | undefined) => {
    setFilters(prev => ({ ...prev, level }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-tier-navy">Training Plan Templates</h2>
        <p className="text-tier-navy/70 mt-1">
          Choose a pre-built template or create your own
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-tier-navy/10">
        <button
          onClick={() => setActiveTab('prebuilt')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'prebuilt'
              ? 'border-tier-gold text-tier-navy'
              : 'border-transparent text-tier-navy/60 hover:text-tier-navy'
          }`}
        >
          Pre-built Templates
          <Badge variant="secondary" className="ml-2">
            {allTemplates.filter(t => t.createdBy === 'system').length}
          </Badge>
        </button>
        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === 'custom'
              ? 'border-tier-gold text-tier-navy'
              : 'border-transparent text-tier-navy/60 hover:text-tier-navy'
          }`}
        >
          My Templates
          <Badge variant="secondary" className="ml-2">
            {customTemplates.length}
          </Badge>
        </button>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-navy/40" size={20} />
          <Input
            type="text"
            placeholder="Search templates..."
            value={filters.searchTerm}
            onChange={e => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
            className="pl-10"
          />
        </div>

        {/* Category filters */}
        <div>
          <label className="text-sm font-medium text-tier-navy mb-2 block">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.category === undefined ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilter(undefined)}
            >
              All
            </Button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <Button
                key={key}
                variant={filters.category === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryFilter(key as TemplateCategory)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Level filters */}
        <div>
          <label className="text-sm font-medium text-tier-navy mb-2 block">
            Level
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filters.level === undefined ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleLevelFilter(undefined)}
            >
              All
            </Button>
            {Object.entries(LEVEL_LABELS).map(([key, label]) => (
              <Button
                key={key}
                variant={filters.level === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleLevelFilter(key as TemplateLevel)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Duration and Sort */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Duration Range */}
          <div>
            <label className="text-sm font-medium text-tier-navy mb-2 block">
              Min Duration (weeks)
            </label>
            <Input
              type="number"
              min={1}
              max={52}
              placeholder="Any"
              value={filters.minWeeks || ''}
              onChange={e => setFilters(prev => ({
                ...prev,
                minWeeks: e.target.value ? parseInt(e.target.value) : undefined
              }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-tier-navy mb-2 block">
              Max Duration (weeks)
            </label>
            <Input
              type="number"
              min={1}
              max={52}
              placeholder="Any"
              value={filters.maxWeeks || ''}
              onChange={e => setFilters(prev => ({
                ...prev,
                maxWeeks: e.target.value ? parseInt(e.target.value) : undefined
              }))}
            />
          </div>

          {/* Sort */}
          <div>
            <label className="text-sm font-medium text-tier-navy mb-2 block flex items-center gap-2">
              <ArrowUpDown size={16} />
              Sort By
            </label>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="duration-asc">Duration (Shortest)</SelectItem>
                <SelectItem value="duration-desc">Duration (Longest)</SelectItem>
                <SelectItem value="sessions">Most Sessions</SelectItem>
                <SelectItem value="recent">Most Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results count & Clear filters */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-tier-navy/60">
          {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'} found
        </div>
        {(filters.searchTerm || filters.category || filters.level || filters.minWeeks || filters.maxWeeks) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFilters({
              searchTerm: '',
              category: undefined,
              level: undefined,
              isPublic: undefined,
              minWeeks: undefined,
              maxWeeks: undefined
            })}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Template grid */}
      {filteredTemplates.length === 0 ? (
        <Card className="p-12 text-center">
          <Search className="mx-auto text-tier-navy/30 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-tier-navy mb-2">
            No templates found
          </h3>
          <p className="text-tier-navy/60">
            Try adjusting your filters or search query
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => (
            <TemplateCard
              key={template.id}
              template={template as GenericTemplate}
              onSelect={(t) => onSelectTemplate(t as TrainingPlanTemplate)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Generic template type that works with both TrainingPlanTemplate and prebuilt templates
interface GenericTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  durationWeeks: number;
  sessions: Array<{ id?: string } & Omit<TemplateSession, 'id'>>;
  tags: string[];
  targetLevel?: TemplateLevel;
  level?: TemplateLevel;
  createdBy?: string;
  isPublic?: boolean;
  usageCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface TemplateCardProps {
  template: GenericTemplate;
  onSelect: (template: GenericTemplate) => void;
}

function TemplateCard({ template, onSelect }: TemplateCardProps) {
  // Handle both targetLevel (TrainingPlanTemplate) and level (PrebuiltTemplate)
  const level = 'targetLevel' in template ? template.targetLevel : (template as any).level;
  return (
    <Card className="hover:shadow-md transition-shadow border-tier-navy/10 hover:border-tier-gold/50">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-tier-navy line-clamp-1">
              {template.name}
            </h3>
            <Badge variant="secondary">
              {CATEGORY_LABELS[template.category]}
            </Badge>
          </div>
          <p className="text-sm text-tier-navy/70 line-clamp-2">
            {template.description}
          </p>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-3 text-xs text-tier-navy/60">
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{template.durationWeeks} {template.durationWeeks === 1 ? 'week' : 'weeks'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{template.sessions.length} {template.sessions.length === 1 ? 'session' : 'sessions'}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp size={14} />
            <span>{LEVEL_LABELS[level]}</span>
          </div>
        </div>

        {/* Tags */}
        {template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="outline">
                <Tag size={10} className="mr-1" />
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Usage count (if available) */}
        {template.usageCount !== undefined && template.usageCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-tier-navy/60">
            <Users size={12} />
            <span>Used {template.usageCount} {template.usageCount === 1 ? 'time' : 'times'}</span>
          </div>
        )}

        {/* Action button */}
        <Button
          variant="default"
          size="sm"
          className="w-full"
          onClick={() => onSelect(template)}
        >
          Use Template
        </Button>
      </div>
    </Card>
  );
}

export default TemplatePlanLibrary;

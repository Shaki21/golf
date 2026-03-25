/**
 * TIER Golf - Ressurser Container
 * Design System v3.0 - Premium Light
 *
 * Knowledge resources with videos, articles, documents and links.
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React, { useState } from 'react';
import {
  BookMarked, Play, FileText, Video, Link as LinkIcon, Download,
  Search, ChevronRight, Clock, Star, BookOpen, ExternalLink,
  Bookmark, BookmarkCheck, Eye
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import Button from '../../ui/primitives/Button';
import { SectionTitle, SubSectionTitle } from '../../components/typography';
import StateCard from '../../ui/composites/StateCard';

// ============================================================================
// MOCK DATA - Will be replaced with API data
// ============================================================================

const MOCK_RESOURCES = [
  // Videos
  {
    id: 'v1',
    type: 'video',
    title: 'Perfect Swing Technique',
    description: 'Learn basic swing technique with focus on rotation and balance.',
    category: 'teknikk',
    duration: '12:45',
    thumbnail: null,
    author: 'Thomas Berg',
    views: 1234,
    rating: 4.8,
    isSaved: true,
    isNew: false,
    url: '#',
  },
  {
    id: 'v2',
    type: 'video',
    title: 'Putting Masterclass',
    description: 'Improve your putting game with these professional tips.',
    category: 'teknikk',
    duration: '18:30',
    thumbnail: null,
    author: 'Maria Hansen',
    views: 892,
    rating: 4.9,
    isSaved: false,
    isNew: true,
    url: '#',
  },
  {
    id: 'v3',
    type: 'video',
    title: 'Mental Preparation Before Tournament',
    description: 'How to mentally prepare for important competitions.',
    category: 'mental',
    duration: '22:15',
    thumbnail: null,
    author: 'Erik Larsen',
    views: 567,
    rating: 4.7,
    isSaved: false,
    isNew: false,
    url: '#',
  },
  // Articles
  {
    id: 'a1',
    type: 'article',
    title: 'Nutrition for Golfers',
    description: 'Optimal nutrition for better performance on the course.',
    category: 'fysisk',
    readTime: '8 min',
    author: 'Dr. Anne Nilsen',
    views: 2341,
    rating: 4.6,
    isSaved: true,
    isNew: false,
    url: '#',
  },
  {
    id: 'a2',
    type: 'article',
    title: 'Rule Changes 2025',
    description: 'Overview of new golf rules effective from 2025.',
    category: 'regler',
    readTime: '5 min',
    author: 'NGF',
    views: 4521,
    rating: 4.5,
    isSaved: false,
    isNew: true,
    url: '#',
  },
  {
    id: 'a3',
    type: 'article',
    title: 'Training Planning for Juniors',
    description: 'How to structure training for young golfers.',
    category: 'trening',
    readTime: '12 min',
    author: 'Thomas Berg',
    views: 1876,
    rating: 4.8,
    isSaved: false,
    isNew: false,
    url: '#',
  },
  // Documents
  {
    id: 'd1',
    type: 'document',
    title: 'Training Diary Template',
    description: 'Template for keeping a training diary throughout the season.',
    category: 'trening',
    fileType: 'PDF',
    fileSize: '245 KB',
    downloads: 892,
    isSaved: false,
    isNew: false,
    url: '#',
  },
  {
    id: 'd2',
    type: 'document',
    title: 'Category B Requirements',
    description: 'Complete overview of requirements to reach Category B.',
    category: 'mål',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    downloads: 1543,
    isSaved: true,
    isNew: false,
    url: '#',
  },
  // Links
  {
    id: 'l1',
    type: 'link',
    title: 'NGF Official Rules',
    description: 'Official golf rules from the Norwegian Golf Federation.',
    category: 'regler',
    domain: 'golf.no',
    isSaved: false,
    isNew: false,
    url: 'https://golf.no',
  },
  {
    id: 'l2',
    type: 'link',
    title: 'TrackMan University',
    description: 'Learning resources for TrackMan analysis.',
    category: 'teknikk',
    domain: 'trackmangolf.com',
    isSaved: false,
    isNew: true,
    url: 'https://trackmangolf.com',
  },
];

const CATEGORIES = [
  { key: 'all', label: 'All', icon: BookMarked },
  { key: 'teknikk', label: 'Technical', icon: Play },
  { key: 'mental', label: 'Mental', icon: BookOpen },
  { key: 'fysisk', label: 'Physical', icon: Star },
  { key: 'trening', label: 'Training', icon: Clock },
  { key: 'regler', label: 'Rules', icon: FileText },
  { key: 'mål', label: 'Goals', icon: Star },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getTypeConfig = (type) => {
  switch (type) {
    case 'video':
      return { icon: Video, colorClasses: { bg: 'bg-tier-error/10', text: 'text-tier-error' }, label: 'Video' };
    case 'article':
      return { icon: FileText, colorClasses: { bg: 'bg-tier-navy/10', text: 'text-tier-navy' }, label: 'Article' };
    case 'document':
      return { icon: Download, colorClasses: { bg: 'bg-tier-success/10', text: 'text-tier-success' }, label: 'Document' };
    case 'link':
      return { icon: LinkIcon, colorClasses: { bg: 'bg-amber-500/10', text: 'text-amber-500' }, label: 'Link' };
    default:
      return { icon: BookMarked, colorClasses: { bg: 'bg-tier-surface-base', text: 'text-tier-text-secondary' }, label: type };
  }
};

// ============================================================================
// RESOURCE CARD COMPONENT
// ============================================================================

const ResourceCard = ({ resource, onToggleSave, onOpen }) => {
  const typeConfig = getTypeConfig(resource.type);
  const TypeIcon = typeConfig.icon;

  return (
    <div
      onClick={() => onOpen(resource)}
      className="bg-tier-white rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-all flex flex-col hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Thumbnail/Preview */}
      <div className={`h-[120px] ${typeConfig.colorClasses.bg} flex items-center justify-center relative`}>
        <TypeIcon size={40} className={typeConfig.colorClasses.text} />

        {/* Type Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 py-1 px-2.5 rounded-md bg-tier-white shadow-sm">
          <TypeIcon size={12} className={typeConfig.colorClasses.text} />
          <span className="text-[11px] font-medium text-tier-navy">
            {typeConfig.label}
          </span>
        </div>

        {/* New Badge */}
        {resource.isNew && (
          <div className="absolute top-3 right-3 py-1 px-2 rounded-md bg-tier-success text-white text-[10px] font-semibold">
            NEW
          </div>
        )}

        {/* Duration/Read Time */}
        {(resource.duration || resource.readTime) && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 py-1 px-2 rounded-md bg-black/70 text-white">
            <Clock size={12} />
            <span className="text-[11px] font-medium">
              {resource.duration || resource.readTime}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <SubSectionTitle className="text-[15px] font-semibold text-tier-navy m-0 mb-2 leading-tight">
          {resource.title}
        </SubSectionTitle>

        <p className="text-[13px] text-tier-text-secondary m-0 mb-3 leading-normal flex-1 line-clamp-2">
          {resource.description}
        </p>

        {/* Meta */}
        <div className="flex items-center justify-between pt-3 border-t border-tier-border-default">
          <div className="flex items-center gap-3">
            {resource.rating && (
              <div className="flex items-center gap-1">
                <Star size={12} fill="rgb(var(--tier-gold))" className="text-tier-gold" />
                <span className="text-xs text-tier-navy font-medium">
                  {resource.rating}
                </span>
              </div>
            )}
            {resource.views && (
              <div className="flex items-center gap-1">
                <Eye size={12} className="text-tier-text-secondary" />
                <span className="text-xs text-tier-text-secondary">
                  {resource.views.toLocaleString()}
                </span>
              </div>
            )}
            {resource.downloads && (
              <div className="flex items-center gap-1">
                <Download size={12} className="text-tier-text-secondary" />
                <span className="text-xs text-tier-text-secondary">
                  {resource.downloads.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Save Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(resource.id);
            }}
            className={`flex items-center justify-center w-8 h-8 rounded-lg border-none cursor-pointer transition-all ${
              resource.isSaved ? 'bg-tier-navy/15' : 'bg-tier-surface-base'
            }`}
          >
            {resource.isSaved ? (
              <BookmarkCheck size={16} className="text-tier-navy" />
            ) : (
              <Bookmark size={16} className="text-tier-text-secondary" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// FEATURED RESOURCE COMPONENT
// ============================================================================

const FeaturedResource = ({ resource, onOpen }) => {
  const typeConfig = getTypeConfig(resource.type);
  const TypeIcon = typeConfig.icon;

  return (
    <div
      onClick={() => onOpen(resource)}
      className="bg-tier-navy rounded-[20px] p-6 text-white cursor-pointer transition-all flex gap-5 items-center hover:scale-[1.01]"
    >
      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
        <TypeIcon size={36} className="text-white" />
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="inline-block py-1 px-2.5 rounded-md bg-white/20 text-[11px] font-semibold mb-2">
          RECOMMENDED
        </div>
        <SectionTitle className="text-xl font-bold m-0 mb-2 text-white">
          {resource.title}
        </SectionTitle>
        <p className="text-sm opacity-85 m-0 leading-normal">
          {resource.description}
        </p>
      </div>

      {/* Arrow */}
      <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
        <ChevronRight size={24} />
      </div>
    </div>
  );
};

// ============================================================================
// CATEGORY FILTER COMPONENT
// ============================================================================

const CategoryFilter = ({ activeCategory, onCategoryChange, resources }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {CATEGORIES.map((category) => {
        const Icon = category.icon;
        const count = category.key === 'all'
          ? resources.length
          : resources.filter(r => r.category === category.key).length;

        return (
          <button
            key={category.key}
            onClick={() => onCategoryChange(category.key)}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-xl border-none text-[13px] font-medium cursor-pointer transition-all whitespace-nowrap ${
              activeCategory === category.key
                ? 'bg-tier-navy text-white shadow-none'
                : 'bg-tier-white text-tier-navy shadow-sm'
            }`}
          >
            <Icon size={16} />
            {category.label}
            <span className={`text-[11px] py-0.5 px-1.5 rounded-md ${
              activeCategory === category.key
                ? 'bg-white/20'
                : 'bg-tier-surface-base'
            }`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ============================================================================
// SEARCH BAR COMPONENT
// ============================================================================

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="relative mb-5">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-tier-text-secondary"
      />
      <input
        type="text"
        placeholder="Search resources..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full py-3.5 pr-4 pl-12 rounded-xl border border-tier-border-default bg-tier-white text-sm text-tier-navy outline-none focus:border-tier-navy transition-colors"
      />
    </div>
  );
};

// ============================================================================
// RESOURCE DETAIL MODAL
// ============================================================================

const ResourceDetailModal = ({ resource, onClose }) => {
  if (!resource) return null;

  const typeConfig = getTypeConfig(resource.type);
  const TypeIcon = typeConfig.icon;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-5"
      onClick={onClose}
    >
      <div
        className="bg-tier-white rounded-[20px] max-w-[600px] w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`h-[180px] ${typeConfig.colorClasses.bg} flex items-center justify-center relative`}>
          <TypeIcon size={64} className={typeConfig.colorClasses.text} />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-[10px] border-none bg-tier-white cursor-pointer text-xl text-tier-text-secondary shadow-md flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`py-1 px-2.5 rounded-md ${typeConfig.colorClasses.bg} ${typeConfig.colorClasses.text} text-xs font-medium`}>
              {typeConfig.label}
            </span>
            {resource.isNew && (
              <span className="py-1 px-2 rounded-md bg-tier-success text-white text-[10px] font-semibold">
                NY
              </span>
            )}
          </div>

          <SectionTitle className="text-[22px] font-bold text-tier-navy m-0 mb-3">
            {resource.title}
          </SectionTitle>

          <p className="text-[15px] text-tier-text-secondary leading-relaxed m-0 mb-5">
            {resource.description}
          </p>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {resource.author && (
              <div className="p-3 bg-tier-surface-base rounded-[10px]">
                <div className="text-[11px] text-tier-text-secondary mb-1">
                  Author
                </div>
                <div className="text-sm font-medium text-tier-navy">
                  {resource.author}
                </div>
              </div>
            )}
            {(resource.duration || resource.readTime) && (
              <div className="p-3 bg-tier-surface-base rounded-[10px]">
                <div className="text-[11px] text-tier-text-secondary mb-1">
                  {resource.type === 'video' ? 'Duration' : 'Read time'}
                </div>
                <div className="text-sm font-medium text-tier-navy">
                  {resource.duration || resource.readTime}
                </div>
              </div>
            )}
            {resource.fileType && (
              <div className="p-3 bg-tier-surface-base rounded-[10px]">
                <div className="text-[11px] text-tier-text-secondary mb-1">
                  File type
                </div>
                <div className="text-sm font-medium text-tier-navy">
                  {resource.fileType} ({resource.fileSize})
                </div>
              </div>
            )}
            {resource.domain && (
              <div className="p-3 bg-tier-surface-base rounded-[10px]">
                <div className="text-[11px] text-tier-text-secondary mb-1">
                  Source
                </div>
                <div className="text-sm font-medium text-tier-navy">
                  {resource.domain}
                </div>
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            onClick={() => window.open(resource.url, '_blank')}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-none bg-tier-navy text-white text-[15px] font-semibold cursor-pointer transition-colors hover:bg-tier-navy/90"
          >
            {resource.type === 'video' && <><Play size={18} /> Watch video</>}
            {resource.type === 'article' && <><BookOpen size={18} /> Read article</>}
            {resource.type === 'document' && <><Download size={18} /> Download</>}
            {resource.type === 'link' && <><ExternalLink size={18} /> Open link</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const RessurserContainer = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [resources, setResources] = useState(MOCK_RESOURCES);
  const [selectedResource, setSelectedResource] = useState(null);

  const filteredResources = resources.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || r.category === category;
    return matchesSearch && matchesCategory;
  });

  const savedResources = resources.filter(r => r.isSaved);
  const featuredResource = resources.find(r => r.rating >= 4.8 && r.type === 'video');

  const handleToggleSave = (resourceId) => {
    setResources((prev) =>
      prev.map((r) =>
        r.id === resourceId ? { ...r, isSaved: !r.isSaved } : r
      )
    );
  };

  const unreadCount = resources.filter(r => r.isNew && !r.isSaved).length;

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Resources"
      />

      <div className="p-6 w-full">
        {/* Stats Row */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3 mb-6">
          <div className="bg-tier-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-tier-navy">
              {resources.length}
            </div>
            <div className="text-xs text-tier-text-secondary">Total</div>
          </div>
          <div className="bg-tier-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-tier-success">
              {unreadCount}
            </div>
            <div className="text-xs text-tier-text-secondary">New</div>
          </div>
          <div className="bg-tier-white rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-tier-navy">
              {savedResources.length}
            </div>
            <div className="text-xs text-tier-text-secondary">My resources</div>
          </div>
        </div>

        {/* Featured Resource */}
        {featuredResource && (
          <div className="mb-6">
            <FeaturedResource
              resource={featuredResource}
              onOpen={setSelectedResource}
            />
          </div>
        )}

        {/* Search */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {/* Category Filter */}
        <div className="mb-6">
          <CategoryFilter
            activeCategory={category}
            onCategoryChange={setCategory}
            resources={resources}
          />
        </div>

        {/* Mine Resources Section */}
        {savedResources.length > 0 && category === 'all' && !searchQuery && (
          <div className="mb-8">
            <SectionTitle className="text-lg font-semibold text-tier-navy m-0 mb-4 flex items-center gap-2">
              <BookmarkCheck size={20} className="text-tier-navy" />
              My resources
            </SectionTitle>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
              {savedResources.slice(0, 3).map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onToggleSave={handleToggleSave}
                  onOpen={setSelectedResource}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Resources */}
        <div>
          <SectionTitle className="text-lg font-semibold text-tier-navy m-0 mb-4">
            {category === 'all' ? 'All resources' : CATEGORIES.find(c => c.key === category)?.label}
            <span className="text-sm font-normal text-tier-text-secondary ml-2">
              ({filteredResources.length})
            </span>
          </SectionTitle>

          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onToggleSave={handleToggleSave}
                  onOpen={setSelectedResource}
                />
              ))}
            </div>
          ) : (
            <StateCard
              variant="empty"
              icon={Search}
              title="No resources found"
              description="Try adjusting the search or category."
            />
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <ResourceDetailModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
      />
    </div>
  );
};

export default RessurserContainer;

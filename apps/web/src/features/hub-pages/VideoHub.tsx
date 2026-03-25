/**
 * Video Hub Page - Decision-First Dashboard
 * Design System v3.1 - McKinsey-grade operating dashboard
 *
 * PRIMARY JOB-TO-BE-DONE (visible in <5 seconds):
 * "What video analysis action should I take NOW to improve my technique?"
 *
 * INFORMATION ARCHITECTURE (3-layer model):
 * Layer 1 (30%) — Decision Layer: Hero card with next critical action
 * Layer 2 (40%) — Control & Progress: Recent videos + Video stats
 * Layer 3 (30%) — Operations & Admin: Video tools and features
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { AreaTabs } from '../../components/navigation/AreaTabs';
import { getAreaTabs } from '../../config/player-navigation-v4';
import { useVideoHubStats } from '../../hooks/useVideoHubStats';
import { VideoLibrary } from '../video-library';
import VideoComparisonPage from '../video-comparison/VideoComparisonPage';
import VideoAnnotationPage from '../video-annotations/VideoAnnotationPage';
import {
  Video,
  GitCompare,
  PenTool,
  Play,
  Upload,
  ChevronRight,
  AlertCircle,
  Eye,
  MessageSquare,
  Clock,
  Film,
} from 'lucide-react';

// =============================================================================
// STATE MACHINE - Determines primary action
// =============================================================================

type VideoState =
  | 'new_video_to_review'   // Coach uploaded a new video
  | 'annotation_feedback'   // New annotation/feedback from coach
  | 'comparison_ready'      // Video comparison ready to view
  | 'technique_analysis'    // Technique needs analysis
  | 'browse_library';       // Default: explore videos

interface PrimaryAction {
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaHref: string;
  urgency: 'high' | 'medium' | 'low';
}

interface VideoStats {
  instructionalVideos: number;
  myVideos: number;
  comparisons: number;
  newVideosToReview?: number;
  pendingAnnotations?: number;
  recentUploads?: number;
}

function computeVideoState(stats: VideoStats): { state: VideoState; action: PrimaryAction } {
  // Priority 1: New video to review from coach
  if ((stats.newVideosToReview || 0) > 0) {
    return {
      state: 'new_video_to_review',
      action: {
        headline: `${stats.newVideosToReview} new video${(stats.newVideosToReview || 0) > 1 ? 's' : ''} to review`,
        subtext: 'Your coach has shared videos for analysis',
        ctaLabel: 'Review Videos',
        ctaHref: '/trening/video/bibliotek?filter=new',
        urgency: 'high',
      },
    };
  }

  // Priority 2: Pending annotation feedback
  if ((stats.pendingAnnotations || 0) > 0) {
    return {
      state: 'annotation_feedback',
      action: {
        headline: `${stats.pendingAnnotations} annotation${(stats.pendingAnnotations || 0) > 1 ? 's' : ''} with feedback`,
        subtext: 'Review coach annotations on your technique videos',
        ctaLabel: 'View Annotations',
        ctaHref: '/trening/video/annotering',
        urgency: 'medium',
      },
    };
  }

  // Priority 3: Recent uploads need comparison
  if ((stats.recentUploads || 0) > 0 && stats.comparisons === 0) {
    return {
      state: 'comparison_ready',
      action: {
        headline: 'Compare your technique',
        subtext: 'Use video comparison to analyze your swing',
        ctaLabel: 'Start Comparison',
        ctaHref: '/trening/video/sammenligning',
        urgency: 'medium',
      },
    };
  }

  // Priority 4: Encourage technique analysis
  if (stats.myVideos > 0) {
    return {
      state: 'technique_analysis',
      action: {
        headline: 'Analyze your technique',
        subtext: `${stats.myVideos} video${stats.myVideos > 1 ? 's' : ''} ready for analysis`,
        ctaLabel: 'Analyze Videos',
        ctaHref: '/trening/video/bibliotek',
        urgency: 'low',
      },
    };
  }

  // Default: Browse library
  return {
    state: 'browse_library',
    action: {
      headline: 'Explore video library',
      subtext: `${stats.instructionalVideos} instructional videos available`,
      ctaLabel: 'Browse Videos',
      ctaHref: '/trening/video/bibliotek',
      urgency: 'low',
    },
  };
}

// =============================================================================
// SKELETON LOADERS
// =============================================================================

function HeroSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-8 w-48 bg-tier-surface-secondary rounded" />
        <div className="h-6 w-24 bg-tier-surface-secondary rounded-full" />
      </div>
      <div className="h-12 w-64 bg-tier-surface-secondary rounded mb-4" />
      <div className="h-5 w-80 bg-tier-surface-secondary rounded mb-6" />
      <div className="h-12 w-40 bg-tier-surface-secondary rounded-lg" />
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
      <div className="h-6 w-32 bg-tier-surface-secondary rounded mb-4" />
      <div className="space-y-3">
        <div className="h-16 w-full bg-tier-surface-secondary rounded" />
        <div className="h-16 w-full bg-tier-surface-secondary rounded" />
      </div>
    </div>
  );
}

// =============================================================================
// HERO DECISION CARD
// =============================================================================

interface VideoHeroCardProps {
  action: PrimaryAction;
  userName: string;
  totalVideos: number;
}

function VideoHeroDecisionCard({ action, userName, totalVideos }: VideoHeroCardProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const urgencyColors = {
    high: 'bg-red-50 border-red-200',
    medium: 'bg-amber-50 border-amber-200',
    low: 'bg-white border-tier-border-default',
  };

  return (
    <div className={`rounded-xl p-6 shadow-sm border ${urgencyColors[action.urgency]}`}>
      {/* Greeting + Badge */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-tier-text-secondary">
          {getGreeting()}, <span className="font-semibold text-tier-navy">{userName}</span>
        </h2>
        {totalVideos > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
            <Film size={14} />
            {totalVideos} videos
          </span>
        )}
      </div>

      {/* Primary Action */}
      <h1 className="text-2xl md:text-3xl font-bold text-tier-navy mb-2">
        {action.headline}
      </h1>
      <p className="text-tier-text-secondary mb-6">
        {action.subtext}
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={action.ctaHref}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-tier-navy text-white font-semibold hover:bg-tier-navy/90 transition-colors shadow-sm"
        >
          <Video size={18} />
          {action.ctaLabel}
        </Link>
        <Link
          to="/trening/video/upload"
          className="inline-flex items-center gap-2 px-4 py-3 rounded-lg border border-tier-border-default text-tier-navy font-medium hover:bg-tier-surface-subtle transition-colors"
        >
          <Upload size={16} />
          Upload Video
        </Link>
      </div>
    </div>
  );
}

// =============================================================================
// VIDEO STATS CARD
// =============================================================================

interface VideoStatsCardProps {
  stats: VideoStats;
  isLoading: boolean;
}

function VideoStatsCard({ stats, isLoading }: VideoStatsCardProps) {
  if (isLoading) {
    return <CardSkeleton />;
  }

  const statItems = [
    { label: 'Instructional', value: stats.instructionalVideos, icon: Play, color: 'text-green-600' },
    { label: 'My Videos', value: stats.myVideos, icon: Film, color: 'text-blue-600' },
    { label: 'Comparisons', value: stats.comparisons, icon: GitCompare, color: 'text-purple-600' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <h3 className="text-lg font-semibold text-tier-navy mb-4">Video Library</h3>
      <div className="grid grid-cols-3 gap-4">
        {statItems.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center bg-tier-surface-subtle ${stat.color} mb-2`}>
              <stat.icon size={20} />
            </div>
            <div className="text-xl font-bold text-tier-navy">{stat.value}</div>
            <div className="text-xs text-tier-text-secondary">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// RECENT VIDEOS CARD
// =============================================================================

interface RecentVideo {
  id: string;
  title: string;
  type: 'instructional' | 'my_video' | 'comparison';
  date: string;
  thumbnail?: string;
}

interface RecentVideosCardProps {
  videos: RecentVideo[];
}

function RecentVideosCard({ videos }: RecentVideosCardProps) {
  const getTypeIcon = (type: RecentVideo['type']) => {
    switch (type) {
      case 'instructional':
        return <Play size={16} className="text-green-600" />;
      case 'comparison':
        return <GitCompare size={16} className="text-purple-600" />;
      default:
        return <Film size={16} className="text-blue-600" />;
    }
  };

  const getTypeBg = (type: RecentVideo['type']) => {
    switch (type) {
      case 'instructional':
        return 'bg-green-50';
      case 'comparison':
        return 'bg-purple-50';
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-tier-border-default">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-tier-navy">Recent Videos</h3>
        <Link
          to="/trening/video/bibliotek"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          View All
        </Link>
      </div>
      <div className="space-y-3">
        {videos.slice(0, 4).map((video) => (
          <Link
            key={video.id}
            to={`/trening/video/${video.id}`}
            className="group flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-tier-surface-subtle transition-colors"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeBg(video.type)}`}>
              {getTypeIcon(video.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-tier-navy group-hover:text-tier-navy-dark truncate">
                {video.title}
              </div>
              <div className="text-xs text-tier-text-secondary">
                {video.date}
              </div>
            </div>
            <ChevronRight size={16} className="text-tier-text-tertiary" />
          </Link>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// OPERATIONS SECTION
// =============================================================================

function VideoOperationsSection() {
  const sections = [
    {
      title: 'Library',
      items: [
        { label: 'All Videos', href: '/trening/video/bibliotek', icon: Video, description: 'Browse video library' },
        { label: 'Instructional', href: '/trening/video/bibliotek?filter=instructional', icon: Play, description: 'Learning videos' },
        { label: 'My Videos', href: '/trening/video/bibliotek?filter=mine', icon: Film, description: 'Your uploads' },
      ],
    },
    {
      title: 'Analysis',
      items: [
        { label: 'Compare', href: '/trening/video/sammenligning', icon: GitCompare, description: 'Side-by-side comparison' },
        { label: 'Annotate', href: '/trening/video/annotering', icon: PenTool, description: 'Draw on videos' },
        { label: 'Feedback', href: '/trening/video/feedback', icon: MessageSquare, description: 'Coach annotations' },
      ],
    },
    {
      title: 'Manage',
      items: [
        { label: 'Upload', href: '/trening/video/upload', icon: Upload, description: 'Add new video' },
        { label: 'Recent', href: '/trening/video/bibliotek?sort=recent', icon: Clock, description: 'Recently viewed' },
        { label: 'Favorites', href: '/trening/video/bibliotek?filter=favorites', icon: Eye, description: 'Saved videos' },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {sections.map((section) => (
        <div key={section.title} className="bg-white rounded-xl border border-tier-border-default overflow-hidden">
          <div className="px-5 py-4 border-b border-tier-border-subtle bg-tier-surface-subtle">
            <h3 className="text-sm font-semibold text-tier-text-secondary uppercase tracking-wide">
              {section.title}
            </h3>
          </div>
          <div className="p-2">
            {section.items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="group flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-tier-surface-subtle transition-colors"
              >
                <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-50 text-green-600">
                  <item.icon size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-tier-body font-medium text-tier-navy group-hover:text-tier-navy-dark">
                    {item.label}
                  </div>
                  <div className="text-tier-footnote text-tier-text-secondary">
                    {item.description}
                  </div>
                </div>
                <ChevronRight size={16} className="text-tier-text-tertiary" />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// TAB CONTENT COMPONENTS
// =============================================================================

function VideoLibraryTab() {
  return <VideoLibrary />;
}

function VideoComparisonTab() {
  return <VideoComparisonPage />;
}

function VideoAnnotationTab() {
  return <VideoAnnotationPage />;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function VideoHub() {
  const { user } = useAuth();
  const location = useLocation();
  const { stats, isLoading } = useVideoHubStats();

  const userName = user?.firstName || 'Player';

  // Determine active tab from URL path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/bibliotek')) return 'bibliotek';
    if (path.includes('/sammenligning')) return 'sammenligning';
    if (path.includes('/annotering')) return 'annotering';
    return 'oversikt';
  };

  const activeTab = getActiveTab();

  // Get video tabs from config
  const tabs = getAreaTabs('video');

  // Default stats if loading or error
  const displayStats: VideoStats = stats || {
    instructionalVideos: 0,
    myVideos: 0,
    comparisons: 0,
    newVideosToReview: 0,
    pendingAnnotations: 0,
    recentUploads: 0,
  };

  const { action } = computeVideoState(displayStats);

  // Mock recent videos data
  const recentVideos: RecentVideo[] = [
    { id: '1', title: 'Driver Swing Analysis', type: 'my_video', date: 'Today' },
    { id: '2', title: 'Proper Grip Technique', type: 'instructional', date: 'Yesterday' },
    { id: '3', title: 'Swing Comparison Jan 2024', type: 'comparison', date: '2 days ago' },
    { id: '4', title: 'Putting Stroke Practice', type: 'my_video', date: '3 days ago' },
  ];

  // Render tab-specific content
  if (activeTab !== 'oversikt') {
    return (
      <div className="min-h-screen bg-tier-surface-base">
        <PageHeader
          title="Video"
          subtitle="Videos, comparison and annotation"
          helpText="Watch instructional videos, compare your technique, and annotate videos with drawings and notes"
        />

        <PageContainer paddingY="lg" background="base">
          {/* Video Tabs */}
          <AreaTabs tabs={tabs} color="green" className="mb-6" />

          {/* Tab Content */}
          {activeTab === 'bibliotek' && <VideoLibraryTab />}
          {activeTab === 'sammenligning' && <VideoComparisonTab />}
          {activeTab === 'annotering' && <VideoAnnotationTab />}
        </PageContainer>
      </div>
    );
  }

  // Overview tab - Decision-First Dashboard
  return (
    <div className="min-h-screen bg-tier-surface-base">
      {/* Compact header */}
      <PageHeader
        title="Video"
        subtitle="Videos, comparison and annotation"
        helpText="Watch instructional videos, compare your technique, and annotate videos with drawings and notes. The dashboard shows the most important video action to take."
      />

      <PageContainer paddingY="lg" background="base">
        {/* Video Tabs */}
        <AreaTabs tabs={tabs} color="green" className="mb-6" />

        {/* ============================================================
            LAYER 1 — DECISION LAYER (top ~30%)
            Hero card with next critical action
            ============================================================ */}
        <section className="mb-8" aria-label="Next action">
          {isLoading ? (
            <HeroSkeleton />
          ) : (
            <VideoHeroDecisionCard
              action={action}
              userName={userName}
              totalVideos={displayStats.instructionalVideos + displayStats.myVideos}
            />
          )}
        </section>

        {/* ============================================================
            LAYER 2 — CONTROL & PROGRESS (middle ~40%)
            Recent videos + Video stats
            ============================================================ */}
        <section className="mb-8" aria-label="Video overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentVideosCard videos={recentVideos} />
            <VideoStatsCard stats={displayStats} isLoading={isLoading} />
          </div>
        </section>

        {/* ============================================================
            LAYER 3 — OPERATIONS & ADMIN (bottom ~30%)
            Video tools and features
            ============================================================ */}
        <section aria-label="Video tools">
          <VideoOperationsSection />
        </section>
      </PageContainer>
    </div>
  );
}

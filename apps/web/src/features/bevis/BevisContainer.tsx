import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Video, Play, Plus, Calendar, Search, Upload,
  CheckCircle, AlertCircle, X, ChevronLeft, ChevronRight,
  MessageSquare, Clock, Tag
} from 'lucide-react';
import { listVideos } from '../../services/videoApi';
import { VideoDTO } from '../../services/api';
import { CardTitle } from '../../components/typography/Headings';
import {
  Card,
  CardContent,
  Badge,
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  AspectRatio,
  Skeleton,
  ScrollArea,
  Tabs,
  TabsList,
  TabsTrigger,
} from '../../components/shadcn';
import { cn } from 'lib/utils';
import { PageHeader } from '../../ui/raw-blocks';

// ============================================================================
// TYPES
// ============================================================================

interface VideoProof {
  id: string;
  title: string;
  type: string;
  category: string;
  date: string;
  duration: string;
  thumbnail: string | null;
  verified: boolean;
  coachNote: string | null;
  tags: string[];
}

// ============================================================================
// MOCK DATA
// ============================================================================

const VIDEO_PROOFS: VideoProof[] = [
  {
    id: 'v1',
    title: 'Driver sving - januar 2025',
    type: 'swing',
    category: 'Driving',
    date: '2025-01-18',
    duration: '0:45',
    thumbnail: null,
    verified: true,
    coachNote: 'Mye bedre tempo enn sist!',
    tags: ['driver', 'tempo', 'forbedring'],
  },
  {
    id: 'v2',
    title: 'Bunkerslag teknikk',
    type: 'drill',
    category: 'Kortspill',
    date: '2025-01-15',
    duration: '1:20',
    thumbnail: null,
    verified: true,
    coachNote: 'God bladåpning. Fortsett slik!',
    tags: ['bunker', 'sand', 'teknikk'],
  },
  {
    id: 'v3',
    title: 'Putting rutine',
    type: 'routine',
    category: 'Putting',
    date: '2025-01-12',
    duration: '0:30',
    thumbnail: null,
    verified: false,
    coachNote: null,
    tags: ['putting', 'rutine', 'mental'],
  },
  {
    id: 'v4',
    title: 'Jernspill - 7 jern',
    type: 'swing',
    category: 'Jernspill',
    date: '2025-01-10',
    duration: '0:38',
    thumbnail: null,
    verified: true,
    coachNote: 'Konsistent impact. Bra jobb!',
    tags: ['jern', 'impact', 'ball-first'],
  },
  {
    id: 'v5',
    title: 'Driver sving - desember 2024',
    type: 'swing',
    category: 'Driving',
    date: '2024-12-20',
    duration: '0:42',
    thumbnail: null,
    verified: true,
    coachNote: 'Referansevideo for fremgang.',
    tags: ['driver', 'baseline'],
  },
  {
    id: 'v6',
    title: 'Chipping gate drill',
    type: 'drill',
    category: 'Kortspill',
    date: '2024-12-15',
    duration: '1:05',
    thumbnail: null,
    verified: true,
    coachNote: null,
    tags: ['chip', 'drill', 'gate'],
  },
];

const CATEGORIES = ['Alle', 'Driving', 'Jernspill', 'Kortspill', 'Putting', 'Fysisk'];

// ============================================================================
// UTILS
// ============================================================================

const mapCategoryToDisplay = (category: string | null | undefined): string => {
  const mapping: Record<string, string> = {
    driving: 'Driving',
    driver: 'Driving',
    ott: 'Driving',
    iron: 'Jernspill',
    approach: 'Jernspill',
    app: 'Jernspill',
    short_game: 'Kortspill',
    arg: 'Kortspill',
    chip: 'Kortspill',
    bunker: 'Kortspill',
    putting: 'Putting',
    putt: 'Putting',
    physical: 'Fysisk',
    fitness: 'Fysisk',
  };
  return mapping[category?.toLowerCase() || ''] || category || 'Driving';
};

const formatDuration = (seconds: number | null | undefined): string => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    Driving: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
    Jernspill: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
    Kortspill: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
    Putting: 'bg-purple-500/15 text-purple-600 border-purple-500/30',
    Fysisk: 'bg-red-500/15 text-red-600 border-red-500/30',
  };
  return colors[category] || 'bg-tier-navy/15 text-tier-navy border-tier-navy/30';
};

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

interface StatCardProps {
  value: number;
  label: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label, color = 'text-tier-navy' }) => (
  <Card className="p-4 text-center">
    <div className={cn("text-2xl font-bold", color)}>{value}</div>
    <div className="text-xs text-text-secondary">{label}</div>
  </Card>
);

// ============================================================================
// VIDEO CARD SKELETON
// ============================================================================

const VideoCardSkeleton: React.FC = () => (
  <Card className="overflow-hidden">
    <AspectRatio ratio={16 / 9}>
      <Skeleton className="w-full h-full" />
    </AspectRatio>
    <CardContent className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-3 w-20" />
    </CardContent>
  </Card>
);

// ============================================================================
// VIDEO CARD COMPONENT
// ============================================================================

interface VideoCardProps {
  video: VideoProof;
  onClick: (video: VideoProof) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => (
  <Card
    className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 group"
    onClick={() => onClick(video)}
  >
    {/* Thumbnail with AspectRatio */}
    <AspectRatio ratio={16 / 9}>
      <div className="w-full h-full bg-background-elevated flex items-center justify-center relative">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Video className="w-10 h-10 text-text-secondary" />
        )}

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-1.5 py-0.5 rounded text-[11px] font-medium">
          {video.duration}
        </div>

        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-text-primary fill-current ml-0.5" />
          </div>
        </div>
      </div>
    </AspectRatio>

    {/* Content */}
    <CardContent className="p-3">
      <div className="flex items-center justify-between mb-1.5">
        <Badge variant="outline" className={cn("text-[10px] font-medium border", getCategoryColor(video.category))}>
          {video.category}
        </Badge>
        {video.verified && (
          <CheckCircle className="w-4 h-4 text-success" />
        )}
      </div>

      <CardTitle className="text-sm font-semibold text-text-primary truncate mb-1">
        {video.title}
      </CardTitle>

      <div className="flex items-center gap-1 text-[11px] text-text-secondary">
        <Calendar className="w-3 h-3" />
        {new Date(video.date).toLocaleDateString('nb-NO', { day: 'numeric', month: 'short' })}
      </div>

      {video.coachNote && (
        <div className="mt-2 p-2 bg-success/10 rounded-md text-[11px] text-success flex items-start gap-1.5">
          <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{video.coachNote}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

// ============================================================================
// UPLOAD CARD COMPONENT
// ============================================================================

const UploadCard: React.FC = () => (
  <Card className="border-2 border-dashed border-border-default h-full min-h-[200px] flex flex-col items-center justify-center cursor-pointer hover:border-tier-navy hover:bg-tier-navy/5 transition-colors group">
    <div className="w-12 h-12 rounded-full bg-tier-navy/15 flex items-center justify-center mb-3 group-hover:bg-tier-navy/25 transition-colors">
      <Upload className="w-6 h-6 text-tier-navy" />
    </div>
    <span className="text-sm font-medium text-text-primary">Last opp video</span>
    <span className="text-xs text-text-secondary mt-1">MP4, MOV (maks 100MB)</span>
  </Card>
);

// ============================================================================
// VIDEO PREVIEW DIALOG
// ============================================================================

interface VideoPreviewDialogProps {
  video: VideoProof | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAnalyze: (video: VideoProof) => void;
  videos: VideoProof[];
  onNavigate: (direction: 'prev' | 'next') => void;
}

const VideoPreviewDialog: React.FC<VideoPreviewDialogProps> = ({
  video,
  open,
  onOpenChange,
  onAnalyze,
  videos,
  onNavigate
}) => {
  if (!video) return null;

  const currentIndex = videos.findIndex(v => v.id === video.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < videos.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        {/* Video Preview */}
        <div className="relative">
          <AspectRatio ratio={16 / 9}>
            <div className="w-full h-full bg-background-elevated flex items-center justify-center">
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Video className="w-16 h-16 text-text-secondary" />
                  <span className="text-sm text-text-secondary">Video forhåndsvisning</span>
                </div>
              )}
            </div>
          </AspectRatio>

          {/* Navigation arrows */}
          {hasPrev && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={(e) => { e.stopPropagation(); onNavigate('prev'); }}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          {hasNext && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={(e) => { e.stopPropagation(); onNavigate('next'); }}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          )}

          {/* Counter */}
          <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            {currentIndex + 1} / {videos.length}
          </div>
        </div>

        {/* Video Info */}
        <div className="p-4 space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <DialogTitle className="text-lg font-semibold">{video.title}</DialogTitle>
              <div className="flex items-center gap-3 text-sm text-text-secondary">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(video.date).toLocaleDateString('nb-NO', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {video.duration}
                </span>
              </div>
            </div>
            <Badge variant="outline" className={cn("border", getCategoryColor(video.category))}>
              {video.category}
            </Badge>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            {video.verified ? (
              <Badge className="bg-success/15 text-success border-success/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verifisert av trener
              </Badge>
            ) : (
              <Badge variant="outline" className="text-text-secondary">
                Venter på verifisering
              </Badge>
            )}
          </div>

          {/* Coach Note */}
          {video.coachNote && (
            <Card className="bg-success/5 border-success/20">
              <CardContent className="p-3">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-success mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-success mb-1">Trener-tilbakemelding</p>
                    <p className="text-sm text-text-primary">{video.coachNote}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-3.5 h-3.5 text-text-secondary" />
              {video.tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={() => onAnalyze(video)}>
              <Play className="w-4 h-4 mr-2" />
              Analyser video
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Lukk
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const BevisContainer: React.FC = () => {
  const navigate = useNavigate();
  const [categoryFilter, setCategoryFilter] = useState('Alle');
  const [searchQuery, setSearchQuery] = useState('');
  const [videos, setVideos] = useState<VideoProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoProof | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleVideoClick = (video: VideoProof) => {
    setSelectedVideo(video);
    setDialogOpen(true);
  };

  const handleAnalyze = (video: VideoProof) => {
    navigate(`/videos/${video.id}/analyze`, { state: { video } });
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!selectedVideo) return;
    const currentIndex = filteredVideos.findIndex(v => v.id === selectedVideo.id);
    const newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < filteredVideos.length) {
      setSelectedVideo(filteredVideos[newIndex]);
    }
  };

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await listVideos({ status: 'ready', sortBy: 'createdAt', sortOrder: 'desc' });
      const apiVideos = result.videos || [];

      const transformedVideos: VideoProof[] = apiVideos.map((v: VideoDTO) => ({
        id: v.id,
        title: v.title || v.fileName || 'Untitled',
        type: v.category || 'swing',
        category: mapCategoryToDisplay(v.category),
        date: v.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        duration: formatDuration(v.duration),
        thumbnail: v.thumbnailUrl || null,
        verified: v.status === 'reviewed',
        coachNote: v.coachNotes || null,
        tags: v.tags || [],
      }));

      setVideos(transformedVideos.length > 0 ? transformedVideos : VIDEO_PROOFS);
    } catch (err) {
      console.error('Error fetching videos:', err);
      const errorMessage = err instanceof Error ? err.message : 'Kunne ikke laste videoer';
      setError(errorMessage);
      setVideos(VIDEO_PROOFS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const filteredVideos = videos.filter((v) => {
    const matchesCategory = categoryFilter === 'Alle' || v.category === categoryFilter;
    const matchesSearch = searchQuery === '' ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const verifiedCount = videos.filter((v) => v.verified).length;
  const feedbackCount = videos.filter((v) => v.coachNote).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background-default">
        <div className="px-6 pb-6 max-w-7xl mx-auto">
          {/* Skeleton stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-4 text-center">
                <Skeleton className="h-7 w-10 mx-auto mb-1" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </Card>
            ))}
          </div>
          {/* Skeleton search */}
          <Skeleton className="h-10 w-full mb-4" />
          {/* Skeleton grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-default">
      <div className="px-6 pb-6 max-w-7xl mx-auto space-y-5">
        <PageHeader
          title="Videobevis"
          subtitle="Dokumenter og verifiser ferdighetsfremgang"
          helpText="Oversikt over alle videobevis for ferdighetsdokumentasjon. Filtrer på kategori (putting, chipping, pitching, bunker, driver, jern, hybrid), søk etter tittel eller tags. Se verifiserte videoer med trenerfeedback, last opp nye bevis og få veiledning fra trener."
        />
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard value={videos.length} label="Totalt" color="text-tier-navy" />
          <StatCard value={verifiedCount} label="Verifisert" color="text-success" />
          <StatCard value={feedbackCount} label="Med feedback" color="text-achievement" />
        </div>

        {/* Error alert */}
        {error && (
          <Card className="bg-error/10 border-error/30">
            <CardContent className="p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-error" />
              <span className="text-sm text-error">{error} (viser demo-data)</span>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <Input
            placeholder="Søk i videoer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Tabs value={categoryFilter} onValueChange={setCategoryFilter}>
            <TabsList className="bg-background-elevated">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="text-xs px-3"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Last opp
          </Button>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <UploadCard />
          {filteredVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onClick={handleVideoClick}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredVideos.length === 0 && (
          <Card className="p-10 text-center">
            <Video className="w-12 h-12 text-text-secondary mx-auto mb-3" />
            <p className="text-sm text-text-secondary">Ingen videoer funnet</p>
            {searchQuery && (
              <Button
                variant="link"
                className="mt-2"
                onClick={() => setSearchQuery('')}
              >
                Nullstill søk
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Video Preview Dialog */}
      <VideoPreviewDialog
        video={selectedVideo}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onAnalyze={handleAnalyze}
        videos={filteredVideos}
        onNavigate={handleNavigate}
      />
    </div>
  );
};

export default BevisContainer;

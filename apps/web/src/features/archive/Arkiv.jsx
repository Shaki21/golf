import React, { useState } from 'react';
import {
  Search, Folder, FolderOpen, FileText, Calendar, BarChart3,
  Target, ChevronRight, ChevronDown, Download, Eye, Clock, Trophy
} from 'lucide-react';
// UiCanon: Using CSS variables
import { PageHeader } from '../../components/layout/PageHeader';
import {
  GolfScorecard, ChartIcon, TrophyIcon, GolfTarget, DocumentIcon, FolderIcon
} from '../../components/icons';
import { SectionTitle, SubSectionTitle, CardTitle } from '../../components/typography';

// Icons wrapper for backwards compatibility
const Icons = {
  Search: () => <Search size={16} />,
  Folder: () => <Folder size={20} />,
  FolderOpen: () => <FolderOpen size={20} />,
  FileText: () => <FileText size={20} />,
  Calendar: () => <Calendar size={20} />,
  BarChart: () => <BarChart3 size={20} />,
  Target: () => <Target size={20} />,
  ChevronRight: () => <ChevronRight size={16} />,
  ChevronDown: () => <ChevronDown size={16} />,
  Download: () => <Download size={16} />,
  Eye: () => <Eye size={16} />,
  Clock: () => <Clock size={14} />,
  Trophy: () => <Trophy size={20} />,
};

// ===== UI COMPONENTS =====
const Card = ({ children, className = '', padding = true }) => (
  <div className={`bg-white border border-tier-surface-base rounded-xl ${padding ? 'p-4' : ''} ${className}`}
       style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'neutral', size = 'sm' }) => {
  const variants = {
    neutral: 'bg-gray-100 text-gray-600',
    accent: 'bg-blue-50 text-blue-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    achievement: 'bg-yellow-50 text-yellow-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-[12px]',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
};

// ===== MAIN COMPONENT =====
// eslint-disable-next-line no-unused-vars
const TIERGolfArkiv = ({ player: apiPlayer = null, archiveData: apiArchiveData = null }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [expandedFolders, setExpandedFolders] = useState(['planer', 'tester']);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  const [_selectedDocument, setSelectedDocument] = useState(null);

  // Default player (fallback if no API data)
  const defaultPlayer = {
    name: 'Ola Nordmann',
    category: 'B',
  };

  // Use API data if available, otherwise use default
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  const player = apiPlayer || defaultPlayer;

  // Years available
  const years = ['2025', '2024', '2023'];

  // Default archive structure (fallback if no API data)
  const defaultArchiveData = {
    2025: {
      planer: {
        label: 'Annual Plans',
        icon: <Icons.Calendar />,
        color: 'var(--accent)',
        documents: [
          { id: 1, name: 'Årsplan 2025', type: 'plan', date: '2025-01-15', size: '2.4 MB', status: 'active' },
          { id: 2, name: 'Sommersesong Plan', type: 'plan', date: '2025-04-01', size: '1.8 MB', status: 'completed' },
          { id: 3, name: 'NM Kvalik Prep', type: 'plan', date: '2025-06-15', size: '890 KB', status: 'completed' },
        ],
      },
      tester: {
        label: 'Test Results',
        icon: <Icons.BarChart />,
        color: 'var(--status-success)',
        documents: [
          { id: 4, name: 'Benchmark Q1', type: 'test', date: '2025-03-15', size: '1.2 MB', score: '14/20' },
          { id: 5, name: 'Benchmark Q2', type: 'test', date: '2025-06-15', size: '1.4 MB', score: '16/20' },
          { id: 6, name: 'Benchmark Q3', type: 'test', date: '2025-09-15', size: '1.5 MB', score: '17/20' },
          { id: 7, name: 'Benchmark Q4 (Siste)', type: 'test', date: '2025-12-01', size: '1.6 MB', score: '18/20' },
        ],
      },
      turneringer: {
        label: 'Tournament Results',
        icon: <Icons.Trophy />,
        color: 'var(--achievement)',
        documents: [
          { id: 8, name: 'NM Kvalik', type: 'tournament', date: '2025-07-20', result: '74 (+2)', position: '12.' },
          { id: 9, name: 'Østlandsmesterskapet', type: 'tournament', date: '2025-08-10', result: '71 (-1)', position: '5.' },
          { id: 10, name: 'Klubbmesterskap', type: 'tournament', date: '2025-09-05', result: '69 (-3)', position: '1.' },
        ],
      },
      mål: {
        label: 'Goals',
        icon: <Icons.Target />,
        color: 'var(--status-warning)',
        documents: [
          { id: 11, name: 'Mål 2025', type: 'goals', date: '2025-01-01', achieved: '7/10' },
          { id: 12, name: 'Q1 Delmål', type: 'goals', date: '2025-04-01', achieved: '3/3' },
          { id: 13, name: 'Q2 Delmål', type: 'goals', date: '2025-07-01', achieved: '2/3' },
        ],
      },
    },
    2024: {
      planer: {
        label: 'Annual Plans',
        icon: <Icons.Calendar />,
        color: 'var(--accent)',
        documents: [
          { id: 14, name: 'Årsplan 2024', type: 'plan', date: '2024-01-10', size: '2.1 MB', status: 'completed' },
        ],
      },
      tester: {
        label: 'Test Results',
        icon: <Icons.BarChart />,
        color: 'var(--status-success)',
        documents: [
          { id: 15, name: 'Benchmark Q4 2024', type: 'test', date: '2024-12-01', size: '1.3 MB', score: '12/20' },
          { id: 16, name: 'Benchmark Q3 2024', type: 'test', date: '2024-09-15', size: '1.2 MB', score: '11/20' },
        ],
      },
      turneringer: {
        label: 'Tournament Results',
        icon: <Icons.Trophy />,
        color: 'var(--achievement)',
        documents: [
          { id: 17, name: 'Klubbmesterskap 2024', type: 'tournament', date: '2024-09-10', result: '73 (+1)', position: '4.' },
        ],
      },
      mål: {
        label: 'Goals',
        icon: <Icons.Target />,
        color: 'var(--status-warning)',
        documents: [
          { id: 18, name: 'Mål 2024', type: 'goals', date: '2024-01-01', achieved: '6/8' },
        ],
      },
    },
    2023: {
      planer: {
        label: 'Annual Plans',
        icon: <Icons.Calendar />,
        color: 'var(--accent)',
        documents: [
          { id: 19, name: 'Årsplan 2023', type: 'plan', date: '2023-01-15', size: '1.9 MB', status: 'completed' },
        ],
      },
      tester: {
        label: 'Test Results',
        icon: <Icons.BarChart />,
        color: 'var(--status-success)',
        documents: [
          { id: 20, name: 'Benchmark Q4 2023', type: 'test', date: '2023-12-01', size: '1.1 MB', score: '9/20' },
        ],
      },
      turneringer: {
        label: 'Tournament Results',
        icon: <Icons.Trophy />,
        color: 'var(--achievement)',
        documents: [],
      },
      mål: {
        label: 'Goals',
        icon: <Icons.Target />,
        color: 'var(--status-warning)',
        documents: [
          { id: 21, name: 'Mål 2023', type: 'goals', date: '2023-01-01', achieved: '5/6' },
        ],
      },
    },
  };

  // Use API data if available, otherwise use default
  const archiveData = apiArchiveData || defaultArchiveData;

  // Toggle folder expansion
  const toggleFolder = (folderId) => {
    setExpandedFolders(prev =>
      prev.includes(folderId)
        ? prev.filter(f => f !== folderId)
        : [...prev, folderId]
    );
  };

  // Get current year data
  const currentYearData = archiveData[selectedYear] || {};

  // Filter documents
  const filterDocuments = (docs) => {
    if (!searchQuery) return docs;
    return docs.filter(doc =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Get document icon
  const documentIconMap = {
    plan: GolfScorecard,
    test: ChartIcon,
    tournament: TrophyIcon,
    goals: GolfTarget,
    default: DocumentIcon,
  };

  const getDocumentIcon = (type, size = 20) => {
    const IconComponent = documentIconMap[type] || documentIconMap.default;
    return <IconComponent size={size} />;
  };

  // Calculate stats
  const getStats = () => {
    let totalDocs = 0;
    let totalTests = 0;
    let totalTournaments = 0;

    Object.values(archiveData).forEach(yearData => {
      Object.values(yearData).forEach(folder => {
        totalDocs += folder.documents.length;
        if (folder.label === 'Testresultater') totalTests += folder.documents.length;
        if (folder.label === 'Turneringsresultater') totalTournaments += folder.documents.length;
      });
    });

    return { totalDocs, totalTests, totalTournaments };
  };

  const stats = getStats();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', fontFamily: 'Inter, -apple-system, system-ui, sans-serif' }}>
      {/* Header */}
      <PageHeader
        title="Archive"
        subtitle="Historical documents"
        helpText="Archived data from previous seasons and activities. Search and retrieve historical information."
      />

      <div style={{ padding: '24px', width: '100%' }}>
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="text-center">
            <p className="text-[11px] text-tier-text-secondary uppercase tracking-wide mb-1">Total documents</p>
            <p className="text-[28px] font-bold text-tier-navy">{stats.totalDocs}</p>
          </Card>
          <Card className="text-center">
            <p className="text-[11px] text-tier-text-secondary uppercase tracking-wide mb-1">Benchmarks</p>
            <p className="text-[28px] font-bold text-tier-success">{stats.totalTests}</p>
          </Card>
          <Card className="text-center">
            <p className="text-[11px] text-tier-text-secondary uppercase tracking-wide mb-1">Tournaments</p>
            <p className="text-[28px] font-bold text-tier-gold">{stats.totalTournaments}</p>
          </Card>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0 space-y-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-tier-text-secondary">
                <Icons.Search />
              </div>
              <input
                type="text"
                placeholder="Search archive..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-tier-surface-base rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-tier-navy/20"
              />
            </div>

            {/* Year Selector */}
            <Card padding={false}>
              <div className="p-4 border-b border-tier-surface-base">
                <SubSectionTitle className="text-[13px] font-semibold text-tier-navy">Select year</SubSectionTitle>
              </div>
              <div className="py-2">
                {years.map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
                      selectedYear === year
                        ? 'bg-tier-navy/5 text-tier-navy border-l-2 border-tier-navy'
                        : 'text-tier-navy hover:bg-tier-white'
                    }`}
                  >
                    <span className="text-[14px] font-medium">{year}</span>
                    {year === '2025' && (
                      <Badge variant="accent" size="sm">Active</Badge>
                    )}
                  </button>
                ))}
              </div>
            </Card>

            {/* Quick Info */}
            <Card className="bg-tier-navy/5 border-tier-navy/10">
              <CardTitle className="text-[12px] font-semibold text-tier-navy mb-2">Progress summary</CardTitle>
              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-tier-text-secondary">Benchmark 2023:</span>
                  <span className="font-medium text-tier-navy">9/20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tier-text-secondary">Benchmark 2024:</span>
                  <span className="font-medium text-tier-navy">12/20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tier-text-secondary">Benchmark 2025:</span>
                  <span className="font-medium text-tier-success">18/20</span>
                </div>
                <div className="pt-2 border-t border-tier-navy/10">
                  <span className="text-tier-success font-semibold">+100% improvement</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Year Selector */}
            <div className="lg:hidden flex gap-2 mb-4 overflow-x-auto pb-2">
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                    selectedYear === year
                      ? 'bg-tier-navy text-white'
                      : 'bg-white text-tier-navy border border-tier-surface-base'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Year Title */}
            <div className="flex items-center justify-between mb-4">
              <SectionTitle className="text-[20px] font-bold text-tier-navy">Archive {selectedYear}</SectionTitle>
              <Badge variant={selectedYear === '2025' ? 'success' : 'neutral'} size="md">
                {selectedYear === '2025' ? 'Active year' : 'Historical'}
              </Badge>
            </div>

            {/* Folders */}
            <div className="space-y-4">
              {Object.entries(currentYearData).map(([folderId, folder]) => {
                const isExpanded = expandedFolders.includes(folderId);
                const filteredDocs = filterDocuments(folder.documents);

                return (
                  <Card key={folderId} padding={false}>
                    {/* Folder Header */}
                    <button
                      onClick={() => toggleFolder(folderId)}
                      className="w-full flex items-center justify-between p-4 hover:bg-tier-white transition-colors rounded-t-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${folder.color}15`, color: folder.color }}
                        >
                          {isExpanded ? <Icons.FolderOpen /> : <Icons.Folder />}
                        </div>
                        <div className="text-left">
                          <SubSectionTitle className="text-[14px] font-semibold text-tier-navy">{folder.label}</SubSectionTitle>
                          <p className="text-[12px] text-tier-text-secondary">{folder.documents.length} documents</p>
                        </div>
                      </div>
                      <span className="text-tier-text-secondary">
                        {isExpanded ? <Icons.ChevronDown /> : <Icons.ChevronRight />}
                      </span>
                    </button>

                    {/* Documents List */}
                    {isExpanded && filteredDocs.length > 0 && (
                      <div className="border-t border-tier-surface-base">
                        {filteredDocs.map((doc, idx) => (
                          <div
                            key={doc.id}
                            className={`flex items-center justify-between p-4 hover:bg-tier-white cursor-pointer transition-colors ${
                              idx !== filteredDocs.length - 1 ? 'border-b border-tier-surface-base' : ''
                            }`}
                            onClick={() => setSelectedDocument(doc)}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-tier-navy">{getDocumentIcon(doc.type)}</span>
                              <div>
                                <CardTitle className="text-[13px] font-medium text-tier-navy">{doc.name}</CardTitle>
                                <div className="flex items-center gap-2 text-[11px] text-tier-text-secondary">
                                  <Icons.Clock />
                                  <span>{formatDate(doc.date)}</span>
                                  {doc.size && (
                                    <>
                                      <span>·</span>
                                      <span>{doc.size}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Document-specific badges */}
                              {doc.score && (
                                <Badge variant="success" size="sm">{doc.score}</Badge>
                              )}
                              {doc.result && (
                                <Badge variant="achievement" size="sm">{doc.result}</Badge>
                              )}
                              {doc.position && (
                                <Badge variant="warning" size="sm">{doc.position} place</Badge>
                              )}
                              {doc.achieved && (
                                <Badge variant="success" size="sm">{doc.achieved}</Badge>
                              )}
                              {doc.status === 'active' && (
                                <Badge variant="accent" size="sm">Active</Badge>
                              )}

                              {/* Actions */}
                              <div className="flex items-center gap-1">
                                <button className="p-1.5 rounded-lg hover:bg-tier-surface-base text-tier-text-secondary transition-colors">
                                  <Icons.Eye />
                                </button>
                                <button className="p-1.5 rounded-lg hover:bg-tier-surface-base text-tier-text-secondary transition-colors">
                                  <Icons.Download />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Empty State */}
                    {isExpanded && filteredDocs.length === 0 && (
                      <div className="p-8 text-center border-t border-tier-surface-base">
                        <span className="mb-2 block text-tier-text-secondary"><FolderIcon size={32} /></span>
                        <p className="text-[13px] text-tier-text-secondary">
                          {searchQuery ? 'No documents match the search' : 'No documents in this folder'}
                        </p>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {/* Timeline View */}
            <Card className="mt-6">
              <SubSectionTitle className="text-[15px] font-semibold text-tier-navy mb-4">Timeline {selectedYear}</SubSectionTitle>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-tier-surface-base" />

                <div className="space-y-4">
                  {Object.values(currentYearData)
                    .flatMap((folder) => folder.documents)
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 6)
                    .map((doc) => (
                      <div key={doc.id} className="flex gap-4 relative">
                        {/* Timeline dot */}
                        <div className="w-8 h-8 rounded-full bg-white border-2 border-tier-navy flex items-center justify-center z-10 flex-shrink-0 text-tier-navy">
                          {getDocumentIcon(doc.type, 14)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-4">
                          <p className="text-[11px] text-tier-text-secondary mb-1">{formatDate(doc.date)}</p>
                          <p className="text-[13px] font-medium text-tier-navy">{doc.name}</p>
                          <div className="flex gap-2 mt-1">
                            {doc.score && <Badge variant="success" size="sm">{doc.score}</Badge>}
                            {doc.result && <Badge variant="achievement" size="sm">{doc.result}</Badge>}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

    </div>
  );
};

export default TIERGolfArkiv;

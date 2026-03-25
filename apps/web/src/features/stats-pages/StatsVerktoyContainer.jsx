/**
 * StatsVerktoyContainer.jsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator, Target, TrendingUp, BarChart2, PieChart, ChevronRight,
  Activity, Info
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { SectionTitle, SubSectionTitle } from '../../components/typography/Headings';

// Color class mapping for tools
const COLOR_CLASSES = {
  brand: { text: 'text-tier-navy', bg: 'bg-tier-navy/15' },
  success: { text: 'text-tier-success', bg: 'bg-tier-success/15' },
  warning: { text: 'text-tier-warning', bg: 'bg-tier-warning/15' },
  error: { text: 'text-tier-error', bg: 'bg-tier-error/15' },
};

// ============================================================================
// MOCK DATA
// ============================================================================

const TOOLS = [
  {
    id: 'handicap',
    name: 'Handicap-kalkulator',
    description: 'Beregn forventet handicap basert pa dine siste runder',
    icon: Calculator,
    colorKey: 'brand',
    category: 'calculators',
  },
  {
    id: 'strokes_gained',
    name: 'Strokes Gained analyse',
    description: 'Se hvor du vinner og taper slag mot feltet',
    icon: TrendingUp,
    colorKey: 'success',
    category: 'analysis',
  },
  {
    id: 'course_strategy',
    name: 'Banestrategi',
    description: 'Planlegg strategi for kommende baner',
    icon: Target,
    colorKey: 'warning',
    category: 'planning',
  },
  {
    id: 'performance_trends',
    name: 'Ytelsestrender',
    description: 'Se utvikling over tid i alle kategorier',
    icon: Activity,
    colorKey: 'error',
    category: 'analysis',
  },
  {
    id: 'club_distances',
    name: 'Kollelengder',
    description: 'Dine gjennomsnittlige avstander per kolle',
    icon: BarChart2,
    colorKey: 'brand',
    category: 'reference',
  },
  {
    id: 'score_distribution',
    name: 'Scorefordeling',
    description: 'Analyser dine scorer pa ulike hulltyper',
    icon: PieChart,
    colorKey: 'warning',
    category: 'analysis',
  },
];

const QUICK_STATS = {
  currentHandicap: 4.2,
  avgScore: 76.3,
  bestRound: 68,
  roundsThisYear: 24,
};

const CLUB_DISTANCES = [
  { club: 'Driver', avgCarry: 265, avgTotal: 285 },
  { club: '3-Wood', avgCarry: 235, avgTotal: 250 },
  { club: '5-Wood', avgCarry: 220, avgTotal: 232 },
  { club: '4-Hybrid', avgCarry: 205, avgTotal: 215 },
  { club: '5-Iron', avgCarry: 190, avgTotal: 198 },
  { club: '6-Iron', avgCarry: 178, avgTotal: 185 },
  { club: '7-Iron', avgCarry: 165, avgTotal: 172 },
  { club: '8-Iron', avgCarry: 152, avgTotal: 158 },
  { club: '9-Iron', avgCarry: 140, avgTotal: 145 },
  { club: 'PW', avgCarry: 128, avgTotal: 132 },
  { club: 'GW', avgCarry: 115, avgTotal: 118 },
  { club: 'SW', avgCarry: 100, avgTotal: 102 },
  { club: 'LW', avgCarry: 85, avgTotal: 87 },
];

const STROKES_GAINED = {
  total: +1.2,
  categories: [
    { name: 'Off the Tee', value: +0.5, trend: 'up' },
    { name: 'Approach', value: +0.8, trend: 'up' },
    { name: 'Around the Green', value: -0.3, trend: 'down' },
    { name: 'Putting', value: +0.2, trend: 'neutral' },
  ],
};

// ============================================================================
// TOOL CARD COMPONENT
// ============================================================================

const ToolCard = ({ tool, onClick }) => {
  const Icon = tool.icon;
  const colors = COLOR_CLASSES[tool.colorKey] || COLOR_CLASSES.brand;

  return (
    <div
      onClick={() => onClick(tool)}
      className="bg-tier-white rounded-2xl p-5 cursor-pointer transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center shrink-0`}>
          <Icon size={24} className={colors.text} />
        </div>
        <div className="flex-1">
          <SubSectionTitle className="text-[15px] m-0 mb-1">
            {tool.name}
          </SubSectionTitle>
          <p className="text-[13px] text-tier-text-secondary m-0 leading-[1.4]">
            {tool.description}
          </p>
        </div>
        <ChevronRight size={20} className="text-tier-text-secondary" />
      </div>
    </div>
  );
};

// ============================================================================
// CLUB DISTANCES WIDGET
// ============================================================================

const ClubDistancesWidget = () => {
  const [showAll, setShowAll] = useState(false);
  const displayedClubs = showAll ? CLUB_DISTANCES : CLUB_DISTANCES.slice(0, 6);

  return (
    <div className="bg-tier-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <BarChart2 size={18} className="text-tier-navy" />
          <SubSectionTitle className="text-[15px] m-0">
            Mine kollelengder
          </SubSectionTitle>
        </div>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-tier-navy bg-transparent border-none cursor-pointer font-medium"
        >
          {showAll ? 'Vis mindre' : 'Vis alle'}
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        {/* Header */}
        <div className="grid grid-cols-[80px_1fr_1fr] gap-2 py-2 border-b border-tier-border-default">
          <span className="text-[11px] text-tier-text-secondary font-medium">Kolle</span>
          <span className="text-[11px] text-tier-text-secondary font-medium text-center">Carry</span>
          <span className="text-[11px] text-tier-text-secondary font-medium text-center">Total</span>
        </div>

        {displayedClubs.map((club, idx) => (
          <div
            key={idx}
            className={`grid grid-cols-[80px_1fr_1fr] gap-2 py-2 ${
              idx < displayedClubs.length - 1 ? 'border-b border-tier-border-default' : ''
            }`}
          >
            <span className="text-[13px] font-medium text-tier-navy">
              {club.club}
            </span>
            <span className="text-[13px] text-tier-navy text-center">
              {club.avgCarry}m
            </span>
            <span className="text-[13px] text-tier-navy text-center">
              {club.avgTotal}m
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// STROKES GAINED WIDGET
// ============================================================================

const StrokesGainedWidget = () => {
  return (
    <div className="bg-tier-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <TrendingUp size={18} className="text-tier-success" />
        <SubSectionTitle className="text-[15px] m-0">
          Strokes Gained
        </SubSectionTitle>
        <div className={`ml-auto py-1 px-2.5 rounded-md ${
          STROKES_GAINED.total >= 0 ? 'bg-tier-success/15' : 'bg-tier-error/15'
        }`}>
          <span className={`text-sm font-semibold ${
            STROKES_GAINED.total >= 0 ? 'text-tier-success' : 'text-tier-error'
          }`}>
            {STROKES_GAINED.total >= 0 ? '+' : ''}{STROKES_GAINED.total}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {STROKES_GAINED.categories.map((cat, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="text-[13px] text-tier-navy flex-1">
              {cat.name}
            </span>
            <div className="w-[100px] h-2 bg-tier-surface-base rounded overflow-hidden relative">
              <div
                className={`absolute top-0 h-full rounded ${
                  cat.value >= 0 ? 'bg-tier-success left-1/2' : 'bg-tier-error right-1/2'
                }`}
                style={{
                  width: `${Math.abs(cat.value) * 25}%`,
                  transform: cat.value >= 0 ? 'translateX(0)' : 'translateX(0)',
                }}
              />
            </div>
            <span className={`text-[13px] font-semibold w-10 text-right ${
              cat.value >= 0 ? 'text-tier-success' : 'text-tier-error'
            }`}>
              {cat.value >= 0 ? '+' : ''}{cat.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-2.5 bg-tier-navy/5 rounded-lg flex items-center gap-2">
        <Info size={14} className="text-tier-navy" />
        <span className="text-xs text-tier-navy">
          Basert pa dine siste 10 turneringsrunder
        </span>
      </div>
    </div>
  );
};

// ============================================================================
// QUICK STATS WIDGET
// ============================================================================

const QuickStatsWidget = ({ stats }) => {
  return (
    <div className="bg-tier-white rounded-2xl p-5 shadow-sm">
      <SubSectionTitle className="text-[15px] m-0 mb-4">
        Hurtigstatistikk
      </SubSectionTitle>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 bg-tier-navy/10 rounded-xl text-center">
          <div className="text-[22px] font-bold text-tier-navy">
            {stats.currentHandicap}
          </div>
          <div className="text-[11px] text-tier-text-secondary">Handicap</div>
        </div>
        <div className="p-3.5 bg-tier-success/10 rounded-xl text-center">
          <div className="text-[22px] font-bold text-tier-success">
            {stats.avgScore}
          </div>
          <div className="text-[11px] text-tier-text-secondary">Gj.sn. score</div>
        </div>
        <div className="p-3.5 bg-tier-warning/10 rounded-xl text-center">
          <div className="text-[22px] font-bold text-tier-warning">
            {stats.bestRound}
          </div>
          <div className="text-[11px] text-tier-text-secondary">Beste runde</div>
        </div>
        <div className="p-3.5 bg-tier-surface-base rounded-xl text-center">
          <div className="text-[22px] font-bold text-tier-navy">
            {stats.roundsThisYear}
          </div>
          <div className="text-[11px] text-tier-text-secondary">Runder i ar</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const StatsVerktoyContainer = () => {
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState(null);

  const handleToolClick = (tool) => {
    // Navigate to tool-specific page or show modal
    const toolRoutes = {
      'handicap': '/stats/handicap-kalkulator',
      'strokes_gained': '/stats/strokes-gained',
      'course_strategy': '/stats/banestrategi',
      'performance_trends': '/stats/ytelsestrender',
      'club_distances': '/stats/kollelengder',
      'score_distribution': '/stats/scorefordeling',
    };

    const route = toolRoutes[tool.id];
    if (route) {
      navigate(route);
    } else {
      // Fallback: show tool in modal/expanded view
      setSelectedTool(tool);
    }
  };

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Stats verktoy"
        subtitle="Analyser og forbedre spillet ditt"
        helpText="Verktøy for å analysere din spillstatistikk i detalj. Identifiser styrker og svakheter, sammenlign prestasjoner og få innsikt i forbedringsområder."
      />

      <div className="p-6 w-full">
        {/* Main Content */}
        <div className="grid grid-cols-[1fr_380px] gap-6">
          {/* Left: Tools */}
          <div>
            <SectionTitle className="text-base m-0 mb-4">
              Verktoy
            </SectionTitle>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3">
              {TOOLS.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool}
                  onClick={handleToolClick}
                />
              ))}
            </div>
          </div>

          {/* Right: Widgets */}
          <div className="flex flex-col gap-4">
            <QuickStatsWidget stats={QUICK_STATS} />
            <StrokesGainedWidget />
            <ClubDistancesWidget />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsVerktoyContainer;

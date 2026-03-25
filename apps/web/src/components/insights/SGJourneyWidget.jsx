/**
 * SG Journey Widget
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 * Visualizes player's progression toward PGA Elite level as a mountain climb
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Mountain, Award } from 'lucide-react';
import { DashboardCard, WidgetHeader } from '../../ui/widgets';
import StateCard from '../../ui/composites/StateCard';

// Journey level colors - using semantic SG tokens
const LEVEL_COLORS = {
  pga_elite: 'var(--sg-pga-elite)',
  pga_top50: 'var(--sg-pga-top50)',
  pga_average: 'var(--sg-pga-average)',
  mini_tour: 'var(--sg-mini-tour)',
  scratch: 'var(--sg-scratch)',
  single_digit: 'var(--sg-single-digit)',
  mid_handicap: 'var(--sg-mid-handicap)',
  beginner: 'var(--sg-beginner)',
};

const LEVEL_LABELS = {
  pga_elite: 'PGA Elite',
  pga_top50: 'PGA Topp 50',
  pga_average: 'PGA Snitt',
  mini_tour: 'Mini Tour',
  scratch: 'Scratch',
  single_digit: 'Ensifret',
  mid_handicap: 'Midthandicap',
  beginner: 'Nybegynner',
};

/**
 * Mountain visualization component
 */
const MountainVisualization = ({ position, levels }) => {
  const { altitudeMeters, currentLevel, nextLevel, progressToNext } = position;

  // Calculate visual position (0-100%)
  const maxAltitude = 8848; // Everest
  const visualPosition = Math.min(100, (altitudeMeters / maxAltitude) * 100);

  return (
    <div style={{
      position: 'relative',
      height: '200px',
      background: 'linear-gradient(to bottom, var(--sg-gradient-top) 0%, var(--sg-gradient-mid1) 30%, var(--sg-gradient-mid2) 70%, var(--sg-gradient-bottom) 100%)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      marginBottom: '16px',
    }}>
      {/* Mountain shape */}
      <svg
        viewBox="0 0 400 200"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
        preserveAspectRatio="none"
      >
        {/* Mountain silhouette */}
        <polygon
          points="0,200 50,150 100,120 150,80 200,40 250,60 300,90 350,130 400,200"
          fill="rgba(255,255,255,0.1)"
        />
        <polygon
          points="0,200 80,160 140,130 200,60 260,100 320,140 400,200"
          fill="rgba(255,255,255,0.15)"
        />

        {/* Snow cap */}
        <polygon
          points="180,60 200,40 220,55 210,65 190,62"
          fill="white"
          opacity="0.8"
        />
      </svg>

      {/* Level markers */}
      {levels && levels.slice(0, 5).map((level, idx) => {
        const yPos = 180 - (level.altitude / maxAltitude * 160);
        return (
          <div
            key={level.id}
            style={{
              position: 'absolute',
              right: '12px',
              top: `${yPos}px`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '10px',
              color: 'white',
              opacity: 0.8,
            }}
          >
            <div style={{
              width: '8px',
              height: '2px',
              backgroundColor: LEVEL_COLORS[level.id] || 'white',
            }} />
            <span>{LEVEL_LABELS[level.id] || level.name}</span>
          </div>
        );
      })}

      {/* Player position marker */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: `${visualPosition}%`,
          transform: 'translate(-50%, 50%)',
          transition: 'bottom 0.5s ease-out',
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          {/* Climber icon */}
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            border: '2px solid white',
          }}>
            <span style={{ fontSize: '16px' }}>Climber</span>
          </div>

          {/* Current level label */}
          <div style={{
            marginTop: '4px',
            padding: '2px 8px',
            backgroundColor: 'rgba(0,0,0,0.6)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '10px',
            color: 'white',
            whiteSpace: 'nowrap',
          }}>
            {LEVEL_LABELS[currentLevel?.id] || 'Loading...'}
          </div>
        </div>
      </div>

      {/* Altitude display */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        padding: '8px 12px',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 'var(--radius-md)',
        color: 'white',
      }}>
        <div style={{ fontSize: '10px', opacity: 0.8 }}>HØYDE</div>
        <div style={{ fontSize: '18px', fontWeight: 700 }}>
          {altitudeMeters?.toLocaleString() || 0}m
        </div>
      </div>
    </div>
  );
};

/**
 * Progress to next level bar
 */
const ProgressToNextLevel = ({ position }) => {
  const { nextLevel, progressToNext, sgToNextLevel, estimatedDaysToNext } = position;

  if (!nextLevel) {
    return (
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--achievement-muted)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
      }}>
        <Award size={24} style={{ color: 'var(--medal-gold)', marginBottom: '8px' }} />
        <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Du har nadd toppen!
        </p>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
          PGA Elite-nivå oppnådd
        </p>
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px',
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-md)',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
      }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
          Neste nivå: {LEVEL_LABELS[nextLevel.id] || nextLevel.name}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {sgToNextLevel?.toFixed(2)} SG igjen
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: '8px',
        backgroundColor: 'var(--bg-tertiary)',
        borderRadius: '4px',
        overflow: 'hidden',
        marginBottom: '8px',
      }}>
        <div style={{
          height: '100%',
          width: `${progressToNext || 0}%`,
          backgroundColor: LEVEL_COLORS[nextLevel.id] || 'var(--accent)',
          borderRadius: '4px',
          transition: 'width 0.5s ease-out',
        }} />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: 'var(--text-tertiary)',
      }}>
        <span>{Math.round(progressToNext || 0)}% fullført</span>
        {estimatedDaysToNext && (
          <span>~{estimatedDaysToNext} dager gjenstår</span>
        )}
      </div>
    </div>
  );
};

/**
 * Stats summary row
 */
const StatsSummary = ({ position }) => {
  const { currentSG, trend30Days, totalClimbed, estimatedScore } = position;

  const getTrendIcon = () => {
    if (trend30Days > 0.05) return <TrendingUp size={14} style={{ color: 'var(--success)' }} />;
    if (trend30Days < -0.05) return <TrendingDown size={14} style={{ color: 'var(--error)' }} />;
    return <Minus size={14} style={{ color: 'var(--text-secondary)' }} />;
  };

  const getTrendColor = () => {
    if (trend30Days > 0.05) return 'var(--success)';
    if (trend30Days < -0.05) return 'var(--error)';
    return 'var(--text-secondary)';
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px',
      marginBottom: '16px',
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: '20px',
          fontWeight: 700,
          color: currentSG >= 0 ? 'var(--success)' : 'var(--text-primary)',
          margin: 0,
        }}>
          {currentSG >= 0 ? '+' : ''}{currentSG?.toFixed(2) || '0.00'}
        </p>
        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: 0 }}>
          Total SG
        </p>
      </div>

      <div style={{ textAlign: 'center' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
        }}>
          {getTrendIcon()}
          <span style={{
            fontSize: '20px',
            fontWeight: 700,
            color: getTrendColor(),
          }}>
            {trend30Days >= 0 ? '+' : ''}{trend30Days?.toFixed(2) || '0.00'}
          </span>
        </div>
        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: 0 }}>
          30 dager
        </p>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--accent)',
          margin: 0,
        }}>
          +{totalClimbed?.toFixed(2) || '0.00'}
        </p>
        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: 0 }}>
          Total klatret
        </p>
      </div>

      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          {estimatedScore || '--'}
        </p>
        <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: 0 }}>
          Est. score
        </p>
      </div>
    </div>
  );
};

/**
 * Category breakdown
 */
const CategoryBreakdown = ({ breakdown }) => {
  const categories = [
    { id: 'approach', label: 'Innspill', icon: 'Target' },
    { id: 'aroundGreen', label: 'Kortspill', icon: 'Flag' },
    { id: 'putting', label: 'Putting', icon: 'Golfer' },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '8px',
      padding: '12px',
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-md)',
    }}>
      {categories.map(cat => {
        const value = breakdown?.[cat.id] || 0;
        return (
          <div key={cat.id} style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '16px' }}>{cat.icon}</span>
            <p style={{
              fontSize: '14px',
              fontWeight: 600,
              color: value >= 0 ? 'var(--success)' : 'var(--error)',
              margin: '4px 0 0 0',
            }}>
              {value >= 0 ? '+' : ''}{value.toFixed(2)}
            </p>
            <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: 0 }}>
              {cat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Main SG Journey Widget
 */
const SGJourneyWidget = ({ data, loading, error, onViewDetails }) => {
  if (loading) {
    return (
      <DashboardCard padding="lg">
        <WidgetHeader title="SG Journey" icon={Mountain} />
        <div style={{
          height: '300px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border-default)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        </div>
      </DashboardCard>
    );
  }

  if (error) {
    return (
      <DashboardCard padding="lg">
        <WidgetHeader title="SG Journey" icon={Mountain} />
        <StateCard
          variant="error"
          title="Kunne ikke laste SG Journey"
          description="Prøv igjen senere"
          compact
        />
      </DashboardCard>
    );
  }

  // Use demo data if no real data
  const journeyData = data || getDemoData();

  return (
    <DashboardCard padding="lg">
      <WidgetHeader
        title="SG Journey"
        icon={Mountain}
        action={onViewDetails}
        actionLabel="Se mer"
      />

      {/* Demo indicator */}
      {!data && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          backgroundColor: 'var(--info-muted)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          fontSize: '12px',
          color: 'var(--accent)',
        }}>
          <Mountain size={14} />
          <span>Eksempeldata – fullfør tester for å se din reise</span>
        </div>
      )}

      {/* Mountain visualization */}
      <MountainVisualization
        position={journeyData.position}
        levels={journeyData.levels || []}
      />

      {/* Stats summary */}
      <StatsSummary position={journeyData.position} />

      {/* Progress to next level */}
      <ProgressToNextLevel position={journeyData.position} />

      {/* Category breakdown */}
      <div style={{ marginTop: '16px' }}>
        <p style={{
          fontSize: '12px',
          fontWeight: 500,
          color: 'var(--text-secondary)',
          marginBottom: '8px',
        }}>
          SG per kategori
        </p>
        <CategoryBreakdown breakdown={journeyData.categoryBreakdown} />
      </div>
    </DashboardCard>
  );
};

/**
 * Demo data for when no real data exists
 */
function getDemoData() {
  return {
    position: {
      currentSG: 0.35,
      currentLevel: { id: 'mini_tour', name: 'Mini Tour' },
      nextLevel: { id: 'pga_average', name: 'PGA Snitt' },
      previousLevel: { id: 'scratch', name: 'Scratch' },
      progressToNext: 35,
      sgToNextLevel: 0.65,
      altitudeMeters: 4350,
      startSG: -1.2,
      totalClimbed: 1.55,
      trend30Days: 0.12,
      trend90Days: 0.28,
      estimatedDaysToNext: 45,
      estimatedScore: 71.2,
    },
    categoryBreakdown: {
      approach: 0.15,
      aroundGreen: 0.08,
      putting: 0.12,
    },
    milestones: [],
    history: [],
  };
}

export default SGJourneyWidget;

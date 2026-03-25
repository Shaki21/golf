/**
 * Skill DNA Widget
 * Displays player's unique skill profile as a radar chart with pro matching
 */

import React from 'react';
import { Dna, Minus, User, Star } from 'lucide-react';
import { DashboardCard, WidgetHeader } from '../../ui/widgets';
import Badge from '../../ui/primitives/Badge.primitive';
import StateCard from '../../ui/composites/StateCard';

// Dimension configuration
const DIMENSIONS = [
  { id: 'distance', label: 'Lengde', labelEn: 'Distance', angle: 0 },
  { id: 'speed', label: 'Hastighet', labelEn: 'Speed', angle: 60 },
  { id: 'accuracy', label: 'Presisjon', labelEn: 'Accuracy', angle: 120 },
  { id: 'shortGame', label: 'Kortspill', labelEn: 'Short Game', angle: 180 },
  { id: 'putting', label: 'Putting', labelEn: 'Putting', angle: 240 },
  { id: 'physical', label: 'Fysisk', labelEn: 'Physical', angle: 300 },
];

/**
 * SVG Radar Chart Component
 */
const RadarChart = ({ dimensions, proMatch }) => {
  const size = 220;
  const center = size / 2;
  const maxRadius = 85;

  // Calculate point position on radar
  const getPoint = (angle, value) => {
    const radians = (angle - 90) * (Math.PI / 180);
    const radius = (value / 100) * maxRadius;
    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
    };
  };

  // Generate polygon points for a data set
  const generatePolygon = (data) => {
    return DIMENSIONS.map(dim => {
      const value = data[dim.id]?.score || data[dim.id] || 50;
      const point = getPoint(dim.angle, value);
      return `${point.x},${point.y}`;
    }).join(' ');
  };

  // Grid circles
  const gridCircles = [20, 40, 60, 80, 100];

  // Player polygon
  const playerPolygon = generatePolygon(dimensions);

  // Pro match polygon (if available)
  const proPolygon = proMatch?.dimensions
    ? generatePolygon(proMatch.dimensions)
    : null;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid circles */}
      {gridCircles.map(value => (
        <circle
          key={value}
          cx={center}
          cy={center}
          r={(value / 100) * maxRadius}
          fill="none"
          stroke="var(--border-default)"
          strokeWidth="1"
          opacity={value === 100 ? 0.5 : 0.3}
        />
      ))}

      {/* Axis lines */}
      {DIMENSIONS.map(dim => {
        const point = getPoint(dim.angle, 100);
        return (
          <line
            key={dim.id}
            x1={center}
            y1={center}
            x2={point.x}
            y2={point.y}
            stroke="var(--border-default)"
            strokeWidth="1"
            opacity="0.3"
          />
        );
      })}

      {/* Pro match polygon (background) */}
      {proPolygon && (
        <polygon
          points={proPolygon}
          fill="var(--achievement-muted)"
          stroke="var(--medal-gold)"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          opacity="0.6"
        />
      )}

      {/* Player polygon */}
      <polygon
        points={playerPolygon}
        fill="rgba(59, 130, 246, 0.2)"
        stroke="var(--accent)"
        strokeWidth="2"
      />

      {/* Data points */}
      {DIMENSIONS.map(dim => {
        const value = dimensions[dim.id]?.score || 50;
        const point = getPoint(dim.angle, value);
        return (
          <circle
            key={`point-${dim.id}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="var(--accent)"
            stroke="white"
            strokeWidth="2"
          />
        );
      })}

      {/* Labels */}
      {DIMENSIONS.map(dim => {
        const point = getPoint(dim.angle, 115);
        const value = dimensions[dim.id]?.score || 50;
        return (
          <g key={`label-${dim.id}`}>
            <text
              x={point.x}
              y={point.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fontWeight="500"
              fill="var(--text-secondary)"
            >
              {dim.label}
            </text>
            <text
              x={point.x}
              y={point.y + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fontWeight="600"
              fill="var(--text-primary)"
            >
              {value}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/**
 * Strengths and Weaknesses display
 */
const StrengthsWeaknesses = ({ strengths, weaknesses }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '16px',
    }}>
      {/* Strengths */}
      <div style={{
        padding: '12px',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: 'var(--radius-md)',
        borderLeft: '3px solid var(--success)',
      }}>
        <p style={{
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--success)',
          marginBottom: '6px',
          textTransform: 'uppercase',
        }}>
          Styrker
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {(strengths || []).map((s, i) => (
            <span key={i} style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}>
              ✓ {s}
            </span>
          ))}
        </div>
      </div>

      {/* Weaknesses */}
      <div style={{
        padding: '12px',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 'var(--radius-md)',
        borderLeft: '3px solid var(--error)',
      }}>
        <p style={{
          fontSize: '11px',
          fontWeight: 500,
          color: 'var(--error)',
          marginBottom: '6px',
          textTransform: 'uppercase',
        }}>
          Utviklingsområder
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {(weaknesses || []).map((w, i) => (
            <span key={i} style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}>
              → {w}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Pro Match Card
 */
const ProMatchCard = ({ match, rank }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      backgroundColor: rank === 1 ? 'rgba(255, 215, 0, 0.1)' : 'var(--bg-secondary)',
      borderRadius: 'var(--radius-md)',
      border: rank === 1 ? '1px solid rgba(255, 215, 0, 0.3)' : 'none',
    }}>
      {/* Rank indicator */}
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        backgroundColor: rank === 1 ? 'var(--medal-gold)' : rank === 2 ? 'var(--medal-silver)' : 'var(--medal-bronze)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 700,
        color: 'white',
      }}>
        {rank}
      </div>

      {/* Pro info */}
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          {match.proName}
        </p>
        <p style={{
          fontSize: '11px',
          color: 'var(--text-secondary)',
          margin: '2px 0 0 0',
          lineHeight: '1.4',
        }}>
          {match.insight}
        </p>
      </div>

      {/* Similarity badge */}
      <Badge
        variant={match.similarity >= 75 ? 'success' : match.similarity >= 60 ? 'accent' : 'neutral'}
        size="sm"
      >
        {match.similarity}% match
      </Badge>
    </div>
  );
};

/**
 * Balance Score Display
 */
const BalanceScore = ({ score, overall }) => {
  const getBalanceLabel = (score) => {
    if (score >= 80) return 'Velbalansert';
    if (score >= 60) return 'God balanse';
    if (score >= 40) return 'Noe ubalansert';
    return 'Spesialist';
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 16px',
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: 'var(--radius-md)',
      marginBottom: '16px',
    }}>
      <div>
        <p style={{
          fontSize: '11px',
          color: 'var(--text-secondary)',
          margin: 0,
          textTransform: 'uppercase',
        }}>
          Samlet score
        </p>
        <p style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '4px 0 0 0',
        }}>
          {overall || 50}
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p style={{
          fontSize: '11px',
          color: 'var(--text-secondary)',
          margin: 0,
          textTransform: 'uppercase',
        }}>
          Balanse
        </p>
        <p style={{
          fontSize: '14px',
          fontWeight: 600,
          color: score >= 60 ? 'var(--success)' : 'var(--warning)',
          margin: '4px 0 0 0',
        }}>
          {getBalanceLabel(score)} ({score})
        </p>
      </div>
    </div>
  );
};

/**
 * Main Skill DNA Widget
 */
const SkillDNAWidget = ({ data, loading, error, onViewDetails }) => {
  if (loading) {
    return (
      <DashboardCard padding="lg">
        <WidgetHeader title="Skill DNA" icon={Dna} />
        <div style={{
          height: '350px',
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
        <WidgetHeader title="Skill DNA" icon={Dna} />
        <StateCard
          variant="error"
          title="Kunne ikke laste Skill DNA"
          description="Prøv igjen senere"
          compact
        />
      </DashboardCard>
    );
  }

  // Use demo data if no real data
  const dnaData = data || getDemoData();
  const topMatch = dnaData.proMatches?.[0];

  return (
    <DashboardCard padding="lg">
      <WidgetHeader
        title="Skill DNA"
        icon={Dna}
        action={onViewDetails}
        actionLabel="Detaljer"
      />

      {/* Demo indicator */}
      {!data && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          fontSize: '12px',
          color: 'var(--accent)',
        }}>
          <Dna size={14} />
          <span>Eksempeldata – fullfør tester for å se din profil</span>
        </div>
      )}

      {/* Balance and overall score */}
      <BalanceScore
        score={dnaData.balanceScore}
        overall={dnaData.overallScore}
      />

      {/* Radar chart */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '16px',
      }}>
        <RadarChart
          dimensions={dnaData.dimensions}
          proMatch={topMatch}
        />
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '16px',
        fontSize: '11px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '12px',
            height: '3px',
            backgroundColor: 'var(--accent)',
            borderRadius: '2px',
          }} />
          <span style={{ color: 'var(--text-secondary)' }}>Din profil</span>
        </div>
        {topMatch && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '12px',
              height: '3px',
              backgroundColor: 'var(--medal-gold)',
              borderRadius: '2px',
            }} />
            <span style={{ color: 'var(--text-secondary)' }}>{topMatch.proName}</span>
          </div>
        )}
      </div>

      {/* Strengths and Weaknesses */}
      <StrengthsWeaknesses
        strengths={dnaData.strengths}
        weaknesses={dnaData.weaknesses}
      />

      {/* Pro Matches */}
      {dnaData.proMatches && dnaData.proMatches.length > 0 && (
        <div>
          <p style={{
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            marginBottom: '8px',
          }}>
            Lignende pro-spillere
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {dnaData.proMatches.slice(0, 3).map((match, idx) => (
              <ProMatchCard key={match.proName} match={match} rank={idx + 1} />
            ))}
          </div>
        </div>
      )}
    </DashboardCard>
  );
};

/**
 * Demo data for when no real data exists
 */
function getDemoData() {
  return {
    dimensions: {
      distance: { id: 'distance', score: 72, trend: 'improving' },
      speed: { id: 'speed', score: 68, trend: 'stable' },
      accuracy: { id: 'accuracy', score: 78, trend: 'improving' },
      shortGame: { id: 'shortGame', score: 65, trend: 'stable' },
      putting: { id: 'putting', score: 80, trend: 'improving' },
      physical: { id: 'physical', score: 70, trend: 'stable' },
    },
    overallScore: 72,
    balanceScore: 75,
    strengths: ['Putting', 'Presisjon'],
    weaknesses: ['Kortspill', 'Hastighet'],
    proMatches: [
      {
        proName: 'Viktor Hovland',
        similarity: 78,
        commonStrengths: ['Putting', 'Lengde'],
        developmentAreas: ['Kortspill'],
        insight: 'Sterk på putting og lengde, jobber med kort spill',
        dimensions: { distance: 78, speed: 82, accuracy: 70, shortGame: 65, putting: 75, physical: 80 },
      },
      {
        proName: 'Collin Morikawa',
        similarity: 72,
        commonStrengths: ['Presisjon'],
        developmentAreas: ['Hastighet'],
        insight: 'Eksepsjonell presisjon, utvikler driving distance',
      },
      {
        proName: 'Matt Fitzpatrick',
        similarity: 68,
        commonStrengths: ['Putting'],
        developmentAreas: ['Lengde'],
        insight: 'Teknisk presis, har jobbet mye med speed',
      },
    ],
  };
}

export default SkillDNAWidget;

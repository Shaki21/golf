import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Target, Award, ChevronRight, Star,
  Zap, ArrowUp, ArrowDown, Minus, Loader
} from 'lucide-react';
import { SectionTitle, SubSectionTitle } from '../../components/typography';
import Card from '../../ui/primitives/Card';
import Badge from '../../ui/primitives/Badge.primitive';
import { useUtviklingsData } from '../../hooks/useUtviklingsData';

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const TrendIcon = ({ trend }) => {
  if (trend === 'up') return <ArrowUp size={14} style={{ color: 'var(--status-success)' }} />;
  if (trend === 'down') return <ArrowDown size={14} style={{ color: 'var(--status-error)' }} />;
  return <Minus size={14} style={{ color: 'var(--text-tertiary)' }} />;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'improving': return 'var(--status-success)';
    case 'stable': return 'var(--accent)';
    case 'needs_attention': return 'var(--status-error)';
    default: return 'var(--text-secondary)';
  }
};

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case 'improving': return 'success';
    case 'stable': return 'accent';
    case 'needs_attention': return 'error';
    default: return 'neutral';
  }
};

// ============================================================================
// CATEGORY PROGRESS CARD
// ============================================================================

const CategoryProgressCard = ({ category }) => (
  <Card variant="default" padding="lg">
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 'var(--spacing-4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-accent-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Award size={24} style={{ color: 'var(--accent)' }} />
        </div>
        <div>
          <div style={{ fontSize: 'var(--font-size-footnote)', color: 'var(--text-secondary)' }}>Current category</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Category {category.level}
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--accent)' }}>
          {category.points}
        </div>
        <div style={{ fontSize: 'var(--font-size-footnote)', color: 'var(--text-secondary)' }}>points</div>
      </div>
    </div>

    <div style={{ marginBottom: 'var(--spacing-2)' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        marginBottom: 'var(--spacing-1)',
      }}>
        <span>Progress towards Category {category.nextLevel}</span>
        <span>{category.pointsNeeded} points remaining</span>
      </div>
      <div style={{
        height: '8px',
        backgroundColor: 'var(--bg-neutral-subtle)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${category.percentToNext}%`,
          backgroundColor: 'var(--accent)',
          borderRadius: '4px',
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  </Card>
);

// ============================================================================
// DEVELOPMENT AREA CARD
// ============================================================================

const DevelopmentAreaCard = ({ area, onClick }) => (
  <Card
    variant="default"
    padding="md"
    onClick={onClick}
    style={{ cursor: 'pointer' }}
  >
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: `${getStatusColor(area.status)}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Target size={20} style={{ color: getStatusColor(area.status) }} />
        </div>
        <div>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            {area.name}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '2px',
          }}>
            <TrendIcon trend={area.trend} />
            <span style={{
              fontSize: '12px',
              color: area.trend === 'up' ? 'var(--status-success)' :
                     area.trend === 'down' ? 'var(--status-error)' : 'var(--text-tertiary)',
            }}>
              {area.change}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 700,
          color: getStatusColor(area.status),
        }}>
          {area.score}
        </div>
        <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
      </div>
    </div>
  </Card>
);

// ============================================================================
// QUICK LINKS SECTION
// ============================================================================

const QuickLinkCard = ({ icon: Icon, title, description, href, color }) => (
  <a href={href} style={{ textDecoration: 'none' }}>
    <Card variant="default" padding="md" style={{ cursor: 'pointer' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-3)',
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Icon size={22} style={{ color }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
          }}>
            {title}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            marginTop: '2px',
          }}>
            {description}
          </div>
        </div>
        <ChevronRight size={18} style={{ color: 'var(--text-tertiary)' }} />
      </div>
    </Card>
  </a>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const UtviklingsOversiktContainer = () => {
  const navigate = useNavigate();
  const { data, loading, error } = useUtviklingsData();

  const handleAreaClick = (areaId) => {
    // Navigate to benchmark page with area filter
    navigate(`/utvikling/benchmark?area=${areaId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        color: 'var(--text-secondary)',
      }}>
        <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ marginLeft: 'var(--spacing-2)' }}>Loading data...</span>
      </div>
    );
  }

  // Error state (still show UI with fallback data)
  if (error) {
    console.warn('UtviklingsOversikt error:', error);
  }

  // Extract data from hook
  const category = data?.category || { level: 'C', points: 0, nextLevel: 'B', pointsNeeded: 1000, percentToNext: 0 };
  const developmentAreas = data?.developmentAreas || [];
  const achievements = data?.achievements || [];
  const breakingPointsCount = data?.breakingPointsCount || 0;

  return (
    <div style={{ width: '100%' }}>
        {/* Category Progress */}
        <CategoryProgressCard category={category} />

        {/* Quick Links */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--spacing-3)',
          margin: 'var(--spacing-6) 0',
        }}>
          <QuickLinkCard
            icon={Zap}
            title="Breaking Points"
            description={`${breakingPointsCount} active focus areas`}
            href="/utvikling/breaking-points"
            color="var(--status-error)"
          />
          <QuickLinkCard
            icon={TrendingUp}
            title="Category Progress"
            description="View detailed progress per category"
            href="/utvikling/kategori"
            color="var(--status-success)"
          />
          <QuickLinkCard
            icon={Target}
            title="Benchmark History"
            description="Compare with previous results"
            href="/utvikling/benchmark"
            color="var(--accent)"
          />
        </div>

        {/* Development Areas */}
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <SectionTitle style={{ marginBottom: 'var(--spacing-3)' }}>
            Development Areas
          </SectionTitle>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--spacing-2)',
          }}>
            {developmentAreas.map((area) => (
              <DevelopmentAreaCard
                key={area.id}
                area={area}
                onClick={() => handleAreaClick(area.id)}
              />
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <Card variant="default" padding="md">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--spacing-3)',
          }}>
            <SubSectionTitle>
              Recent achievements
            </SubSectionTitle>
            <a href="/achievements" style={{
              fontSize: '13px',
              color: 'var(--accent)',
              textDecoration: 'none',
            }}>
              View all
            </a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {achievements.length > 0 ? (
              achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-3)',
                    padding: 'var(--spacing-2)',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'color-mix(in srgb, var(--status-warning) 15%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Star size={16} style={{ color: 'var(--status-warning)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {achievement.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {achievement.date ? new Date(achievement.date).toLocaleDateString('en-US') : ''}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                padding: 'var(--spacing-4)',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '13px',
              }}>
                No achievements yet
              </div>
            )}
          </div>
        </Card>
    </div>
  );
};

export default UtviklingsOversiktContainer;

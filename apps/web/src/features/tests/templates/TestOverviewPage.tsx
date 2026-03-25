/**
 * TestOverviewPage Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState } from 'react';
import { Clock, CheckCircle, AlertCircle, Play, ChevronRight, Info, MapPin, Target } from 'lucide-react';
import { SectionTitle, SubSectionTitle } from '../../../components/typography';
import Button from '../../../ui/primitives/Button';
import { TestDefinition, ScoringThresholds } from '../config/testDefinitions';

// Lazy load form components
import SimpleAttemptsForm from './SimpleAttemptsForm';
import PercentageForm from './PercentageForm';
import TableDataForm from './TableDataForm';
import RoundScoringForm from './RoundScoringForm';

// ============================================================================
// PROPS
// ============================================================================

interface TestOverviewPageProps {
  test: TestDefinition;
  player?: {
    id: string;
    name: string;
    category: string;
  };
  onSubmit?: (data: any) => Promise<void>;
  onClose?: () => void;
}

// ============================================================================
// INFO CARD COMPONENT
// ============================================================================

interface InfoCardProps {
  icon: React.ComponentType<{ size?: number | string; color?: string }>;
  title: string;
  children: React.ReactNode;
  color?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon: Icon, title, children, color = 'var(--tier-navy)' }) => (
  <div style={{
    backgroundColor: 'var(--surface-card)',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        backgroundColor: `${color}15`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Icon size={18} color={color} />
      </div>
      <SubSectionTitle style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>
        {title}
      </SubSectionTitle>
    </div>
    {children}
  </div>
);

// ============================================================================
// SCORING LEGEND
// ============================================================================

interface ScoringLegendProps {
  scoring: ScoringThresholds;
  lowerIsBetter: boolean;
  unit: string;
}

const ScoringLegend: React.FC<ScoringLegendProps> = ({ scoring, lowerIsBetter, unit }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
    {Object.entries(scoring).map(([key, threshold]) => (
      <div
        key={key}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: `${threshold.color}10`,
          borderRadius: '8px',
          border: `1px solid ${threshold.color}30`,
        }}
      >
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: threshold.color,
        }} />
        <span style={{ fontSize: '13px', color: 'var(--tier-navy)', fontWeight: 500 }}>
          {threshold.label}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {lowerIsBetter ? '≤' : '≥'} {threshold.max}{unit}
        </span>
      </div>
    ))}
  </div>
);

// ============================================================================
// FORM RENDERER
// ============================================================================

interface FormRendererProps {
  test: TestDefinition;
  player?: TestOverviewPageProps['player'];
  onSubmit?: (data: any) => Promise<void>;
  onClose: () => void;
}

const FormRenderer: React.FC<FormRendererProps> = ({ test, player, onSubmit, onClose }) => {
  const commonProps = {
    test,
    player,
    onSubmit,
    onClose,
  };

  switch (test.formType) {
    case 'simple':
      return <SimpleAttemptsForm {...commonProps} />;
    case 'percentage':
      return <PercentageForm {...commonProps} />;
    case 'table':
      return <TableDataForm {...commonProps} />;
    case 'round':
      return <RoundScoringForm {...commonProps} />;
    default:
      return <SimpleAttemptsForm {...commonProps} />;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const TestOverviewPage: React.FC<TestOverviewPageProps> = ({
  test,
  player,
  onSubmit,
  onClose,
}) => {
  const [showTestForm, setShowTestForm] = useState(false);

  if (showTestForm) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <FormRenderer
          test={test}
          player={player}
          onSubmit={async (data) => {
            if (onSubmit) await onSubmit(data);
            setShowTestForm(false);
          }}
          onClose={() => setShowTestForm(false)}
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Hero Section */}
      <div style={{
        backgroundColor: 'var(--surface-card)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        background: `linear-gradient(135deg, rgb(var(--tier-white)) 0%, rgba(26, 61, 46, 0.05) 100%)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: `rgba(26, 61, 46, 0.09)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '32px',
          }}>
            {test.icon}
          </div>
          <div style={{ flex: 1 }}>
            <SectionTitle style={{ margin: 0, fontSize: '24px', marginBottom: '8px' }}>
              {test.name}
            </SectionTitle>
            <p style={{
              margin: 0,
              fontSize: '15px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxWidth: '600px',
            }}>
              {test.description}
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          padding: '16px 20px',
          backgroundColor: 'rgb(var(--gray-100))',
          borderRadius: '12px',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--text-secondary)" />
            <span style={{ fontSize: '14px', color: 'var(--tier-navy)' }}>
              <strong>{test.duration}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={18} color="var(--text-secondary)" />
            <span style={{ fontSize: '14px', color: 'var(--tier-navy)' }}>
              <strong>{test.attempts}</strong> {test.attempts === 1 ? 'forsøk' : 'forsøk'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} color="var(--text-secondary)" />
            <span style={{ fontSize: '14px', color: 'var(--tier-navy)' }}>
              Enhet: <strong>{test.unit}</strong>
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowTestForm(true)}
          leftIcon={<Play size={20} />}
          rightIcon={<ChevronRight size={20} />}
          style={{
            width: '100%',
            maxWidth: '300px',
            height: '56px',
            fontSize: '16px',
            fontWeight: 600,
          }}
        >
          Ta test
        </Button>
      </div>

      {/* Info Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {/* Purpose */}
        <InfoCard icon={Info} title="Formål" color="var(--tier-navy)">
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: 'var(--tier-navy)',
            lineHeight: 1.6
          }}>
            {test.purpose}
          </p>
        </InfoCard>

        {/* Equipment */}
        <InfoCard icon={CheckCircle} title="Utstyr" color="rgb(var(--status-success))">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {test.equipment.map((item, i) => (
              <span
                key={i}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'rgb(var(--gray-100))',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: 'var(--tier-navy)',
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </InfoCard>
      </div>

      {/* Methodology */}
      <InfoCard icon={MapPin} title="Gjennomføring" color="rgb(var(--status-warning))">
        <ol style={{
          margin: 0,
          paddingLeft: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          {test.methodology.map((step, i) => (
            <li key={i} style={{
              fontSize: '14px',
              color: 'var(--tier-navy)',
              lineHeight: 1.5,
            }}>
              {step}
            </li>
          ))}
        </ol>
      </InfoCard>

      {/* Scoring */}
      <div style={{ marginTop: '16px' }}>
        <InfoCard icon={Target} title="Scoring" color="var(--tier-navy)">
          <p style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}>
            {test.lowerIsBetter
              ? 'Lavere verdi er bedre for denne testen.'
              : 'Høyere verdi er bedre for denne testen.'}
          </p>
          <ScoringLegend
            scoring={test.scoring}
            lowerIsBetter={test.lowerIsBetter}
            unit={test.unit}
          />
        </InfoCard>
      </div>

      {/* Tips */}
      <div style={{ marginTop: '16px' }}>
        <InfoCard icon={AlertCircle} title="Tips" color="rgb(var(--status-warning))">
          <ul style={{
            margin: 0,
            paddingLeft: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            {test.tips.map((tip, i) => (
              <li key={i} style={{
                fontSize: '14px',
                color: 'var(--tier-navy)',
                lineHeight: 1.5,
              }}>
                {tip}
              </li>
            ))}
          </ul>
        </InfoCard>
      </div>

      {/* Bottom CTA */}
      <div style={{
        marginTop: '32px',
        padding: '24px',
        backgroundColor: 'var(--surface-card)',
        borderRadius: '12px',
        textAlign: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      }}>
        <p style={{
          margin: '0 0 16px 0',
          fontSize: '15px',
          color: 'var(--tier-navy)',
        }}>
          Klar til å teste?
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowTestForm(true)}
          leftIcon={<Play size={20} />}
          style={{ minWidth: '200px' }}
        >
          Start {test.shortName} Test
        </Button>
      </div>
    </div>
  );
};

export default TestOverviewPage;

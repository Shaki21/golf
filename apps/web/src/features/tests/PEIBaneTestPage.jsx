/**
 * PEIBaneTestPage Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState } from 'react';
import { Target, Clock, MapPin, CheckCircle, AlertCircle, Play, ChevronRight, Info } from 'lucide-react';
import { SectionTitle, SubSectionTitle } from '../../components/typography';
import Button from '../../ui/primitives/Button';
import PEIBaneTestForm from './PEIBaneTestForm';
import { PageHeader } from '../../ui/raw-blocks';

// ============================================================================
// TEST INFO
// ============================================================================

const TEST_INFO = {
  name: 'PEI Test - Bane',
  description: 'Test din evne til å komme nær flagget fra ulike posisjoner på banen. PEI (Precision Error Index) måler hvor presist du treffer i forhold til slaglengden.',
  purpose: 'Formålet med denne testen er å inkludere en test der spillerne kan teste sin evne til å komme nær flagget. Testen kan gjøres på treningsfeltet, på rangen eller på banen.',
  methodology: [
    'Spilleren eller treneren setter et antall slag som skal slås (18 slag anbefalt)',
    'Angi avstand til mål og plassering (Fairway, Rough, Tee, Bunker)',
    'Slå slaget og mål avstanden fra ballen til hullet',
    'PEI beregnes automatisk for hvert slag og totalt',
  ],
  equipment: ['Alle køller', 'Laseravstandsmåler', 'Scoreark eller app'],
  duration: '30-45 minutter',
  scoring: {
    excellent: { max: 5, label: 'Utmerket', color: 'rgb(var(--status-success))' },
    good: { max: 10, label: 'Bra', color: 'rgb(var(--status-warning))' },
    average: { max: 15, label: 'Gjennomsnitt', color: 'var(--text-secondary)' },
    needsWork: { max: 100, label: 'Trenger arbeid', color: 'rgb(var(--status-error))' },
  },
  tips: [
    'Velg varierte avstander og underlag for et realistisk bilde',
    'Noter værforhold for å sammenligne resultater',
    'Gjør testen jevnlig (hver 4-6 uke) for å spore fremgang',
  ],
};

// ============================================================================
// INFO CARD COMPONENT
// ============================================================================

const InfoCard = ({ icon: Icon, title, children, color = 'var(--tier-navy)' }) => (
  <div className="bg-tier-white rounded-xl p-5 shadow-sm">
    <div className="flex items-center gap-3 mb-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${color}15` }}
      >
        <Icon size={18} color={color} />
      </div>
      <SubSectionTitle className="m-0 text-[15px] font-semibold">
        {title}
      </SubSectionTitle>
    </div>
    {children}
  </div>
);

// ============================================================================
// SCORING LEGEND
// ============================================================================

const ScoringLegend = ({ scoring }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
    {Object.entries(scoring).map(([key, { max, label, color }]) => (
      <div
        key={key}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: `${color}10`,
          borderRadius: '8px',
          border: `1px solid ${color}30`,
        }}
      >
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: color,
        }} />
        <span style={{ fontSize: '13px', color: 'var(--tier-navy)', fontWeight: 500 }}>
          {label}
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          ≤ {max}%
        </span>
      </div>
    ))}
  </div>
);

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

const PEIBaneTestPage = () => {
  const [showTestForm, setShowTestForm] = useState(false);

  if (showTestForm) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <PEIBaneTestForm
          onClose={() => setShowTestForm(false)}
          onSubmit={async () => {
            // TODO: Handle test submission
            setShowTestForm(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title={TEST_INFO.name}
        subtitle={TEST_INFO.description}
        helpText="PEI (Precision Error Index) test for å måle presisjon fra ulike posisjoner. Test din evne til å komme nær flagget ved å slå 18 slag fra varierte avstander og underlag (Fairway, Rough, Tee, Bunker). Mål avstanden fra ball til hull og få beregnet PEI automatisk. Lavere PEI = bedre presisjon. Varighet: 30-45 minutter. Klikk 'Ta test' for å starte."
        actions={
          <Button
            variant="primary"
            size="lg"
            onClick={() => setShowTestForm(true)}
            leftIcon={<Play size={20} />}
          >
            Ta test
          </Button>
        }
      />

      {/* Quick stats */}
      <div className="flex gap-6 flex-wrap p-4 bg-tier-surface-base rounded-xl mb-6">
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-tier-text-secondary" />
          <span className="text-sm text-tier-navy">
            <strong>{TEST_INFO.duration}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={18} className="text-tier-text-secondary" />
          <span className="text-sm text-tier-navy">
            <strong>18 slag</strong> fra ulike posisjoner
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Target size={18} className="text-tier-text-secondary" />
          <span className="text-sm text-tier-navy">
            <strong>PEI</strong> = Avstand til hull / Slaglengde
          </span>
        </div>
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
            {TEST_INFO.purpose}
          </p>
        </InfoCard>

        {/* Equipment */}
        <InfoCard icon={CheckCircle} title="Utstyr" color="rgb(var(--status-success))">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {TEST_INFO.equipment.map((item, i) => (
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
          {TEST_INFO.methodology.map((step, i) => (
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
        <InfoCard icon={Target} title="Scoring (PEI)" color="var(--tier-navy)">
          <p style={{
            margin: '0 0 16px 0',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
          }}>
            PEI beregnes som forholdet mellom avstand til hull og slaglengde.
            Lavere PEI = bedre presisjon. En PEI på 5% betyr at ballen landet 5 meter
            fra hullet på et slag på 100 meter.
          </p>
          <ScoringLegend scoring={TEST_INFO.scoring} />
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
            {TEST_INFO.tips.map((tip, i) => (
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
          Klar til å teste din presisjon?
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={() => setShowTestForm(true)}
          leftIcon={<Play size={20} />}
          style={{ minWidth: '200px' }}
        >
          Start PEI Test
        </Button>
      </div>
    </div>
  );
};

export default PEIBaneTestPage;

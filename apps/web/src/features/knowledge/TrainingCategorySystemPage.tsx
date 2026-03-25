/**
 * Treningskategorisystem - Forklaringsside
 *
 * Nøytral forklaring av kategorihierarkiet for golftrening.
 * Beskriver systemet, hvordan det fungerer, og hvordan det påvirker treningen.
 *
 * Bruker Midnight Blue (primary action) for konsistent design.
 * Grønn/emerald er KUN for progress/success indikatorer.
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  ChevronRight,
  Target,
  Layers,
  Activity,
  Zap,
  Brain,
  Trophy,
  MapPin,
  Gauge,
  Crosshair,
  ArrowLeft,
  Lightbulb,
  BookOpen,
  GraduationCap,
  PlayCircle,
  Video,
} from 'lucide-react';
import { PageHeader } from '../../ui/raw-blocks';
import { SectionTitle, CardTitle } from '../../components/typography';

// Colors - Using TIER Golf Design System tokens
const COLORS = {
  primary: 'rgb(var(--tier-navy))',        // TIER Navy - primary action
  primaryLight: 'rgb(var(--tier-navy-light))',   // Lighter navy
  primaryDark: 'rgb(var(--tier-navy-dark))',    // Darker navy
  surface: 'rgb(var(--tier-surface-base))',        // Surface background
  surfaceHover: 'rgb(var(--tier-surface-hover))',   // Hover state
  text: 'rgb(var(--tier-navy))',           // Text on light surfaces
  textMuted: 'rgb(var(--text-tertiary))',      // Muted text
  textDark: 'rgb(var(--text-primary))',       // Dark text
  white: 'rgb(var(--tier-white))',
  border: 'rgb(var(--border-default))',         // Border color
  gold: 'rgb(var(--tier-gold))',           // Gold for prestige
};

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  color?: string;
}

function CollapsibleSection({ title, icon, children, defaultOpen = false, color = COLORS.primary }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 24,
        border: `1px solid ${COLORS.border}`,
        marginBottom: 16,
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '18px 24px',
          backgroundColor: isOpen ? COLORS.surface : 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background-color 0.2s',
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: COLORS.white,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <span style={{ flex: 1, fontSize: 17, fontWeight: 600, color: COLORS.textDark }}>{title}</span>
        {isOpen ? (
          <ChevronDown size={22} style={{ color: COLORS.textMuted }} />
        ) : (
          <ChevronRight size={22} style={{ color: COLORS.textMuted }} />
        )}
      </button>
      {isOpen && (
        <div style={{ padding: '0 24px 24px', borderTop: `1px solid ${COLORS.border}` }}>
          <div style={{ paddingTop: 20 }}>{children}</div>
        </div>
      )}
    </div>
  );
}

interface TableProps {
  headers: string[];
  rows: string[][];
}

function DataTable({ headers, rows }: TableProps) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 20, border: `1px solid ${COLORS.border}` }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 14,
        }}
      >
        <thead>
          <tr>
            {headers.map((header, i) => (
              <th
                key={i}
                style={{
                  textAlign: 'left',
                  padding: '14px 16px',
                  backgroundColor: COLORS.surface,
                  borderBottom: `1px solid ${COLORS.border}`,
                  fontWeight: 600,
                  color: COLORS.text,
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? COLORS.white : COLORS.surface }}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: '14px 16px',
                    borderBottom: i < rows.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                    color: j === 0 ? COLORS.primary : COLORS.textMuted,
                    fontWeight: j === 0 ? 600 : 400,
                    fontFamily: j === 0 ? 'ui-monospace, monospace' : 'inherit',
                    fontSize: j === 0 ? 13 : 14,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeBlock({ children, centered = false }: { children: string; centered?: boolean }) {
  return (
    <pre
      style={{
        backgroundColor: COLORS.text,
        color: COLORS.surfaceHover,
        padding: 24,
        borderRadius: 20,
        fontSize: 13,
        fontFamily: 'ui-monospace, monospace',
        overflowX: 'auto',
        margin: '16px 0',
        lineHeight: 1.6,
        textAlign: centered ? 'center' : 'left',
      }}
    >
      {children}
    </pre>
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 15, lineHeight: 1.8, color: COLORS.textMuted, margin: '0 0 16px' }}>
      {children}
    </p>
  );
}

// Pyramid visualization component
// Uses design system colors from tokens.css
// Correct pyramid: FYSISK (foundation) at bottom, TURNERING (peak) at top
function PyramidVisualization() {
  // Ordered from TOP (narrowest) to BOTTOM (widest) for correct visual pyramid
  const levels = [
    { name: 'TURNERING', abbr: '(TURN)', description: 'Prestasjon under press', color: 'rgb(var(--tier-gold))' },
    { name: 'SPILL', abbr: '(SPILL)', description: 'Strategi, banehåndtering', color: 'rgb(var(--status-info))' },
    { name: 'GOLFSLAG', abbr: '(SLAG)', description: 'Slagkvalitet, resultat', color: 'rgb(var(--tier-navy))' },
    { name: 'TEKNIKK', abbr: '(TEK)', description: 'Bevegelsesmønster', color: 'rgb(var(--tier-navy-dark))' },
    { name: 'FYSISK', abbr: '(FYS)', description: 'Styrke, power, mobilitet', color: 'rgb(var(--status-success))' },
  ];

  return (
    <div style={{ margin: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {levels.map((level, index) => {
        // Width INCREASES as we go down: 40%, 55%, 70%, 85%, 100%
        const width = 40 + (index * 15);
        const isTop = index === 0;
        const isBottom = index === levels.length - 1;

        return (
          <div
            key={level.name}
            style={{
              width: `${width}%`,
              backgroundColor: level.color,
              padding: '16px 20px',
              margin: index === 0 ? '0 0 2px 0' : '2px 0',
              borderRadius: isTop ? '12px 12px 0 0' : isBottom ? '0 0 12px 12px' : '0',
              color: 'white',
              textAlign: 'center',
              position: 'relative',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
              {level.name} {level.abbr}
            </div>
            <div style={{ fontSize: 13, opacity: 0.95 }}>
              {level.description}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: COLORS.surface,
        border: `1px solid ${COLORS.primaryLight}`,
        borderRadius: 20,
        padding: 20,
        marginTop: 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            backgroundColor: COLORS.primaryLight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Lightbulb size={18} color={COLORS.white} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.text, marginBottom: 6 }}>
            {title}
          </div>
          <div style={{ fontSize: 14, color: COLORS.textMuted, lineHeight: 1.6 }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrainingCategorySystemPage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader
        title="Treningskategorisystem"
        subtitle="Forstå hvordan treningsøkter kategoriseres og hvordan dette påvirker din utvikling"
        helpText="Complete guide to the training category system with the pyramid structure (FYS, TEK, SLAG, SPILL, TURN), 16 training areas (TEE, INN200-50, CHIP/PITCH/LOB/BUNKER, PUTT), learning phases (L-BODY to L-AUTO), Club Speed levels (CS0-100), environment (M0-M5), pressure (PR1-PR5), P-positions and formulas. Includes explanation videos, tables, examples and guidance for systematic progression."
      />

      {/* Intro Card */}
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
          borderRadius: 28,
          padding: 28,
          marginBottom: 28,
          color: COLORS.white,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              backgroundColor: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <BookOpen size={26} />
          </div>
          <div>
            <SectionTitle style={{ fontSize: 20, fontWeight: 600, margin: '0 0 10px', marginBottom: 10, color: 'inherit' }}>Hva er dette?</SectionTitle>
            <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0, opacity: 0.95 }}>
              Treningskategorisystemet er et rammeverk for å beskrive, planlegge og analysere
              golftrening på en presis og systematisk måte. Hver treningsøkt får en unik kode som
              forteller nøyaktig hva du trener, hvordan du trener, og under hvilke forhold.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 32,
        }}
      >
        {[
          { icon: <Target size={22} />, title: 'Presis beskrivelse', desc: 'Hver økt har en unik, søkbar ID' },
          { icon: <Activity size={22} />, title: 'Progressiv trening', desc: 'Systemet styrer naturlig progresjon' },
          { icon: <Gauge size={22} />, title: 'Breaking Point', desc: 'Identifiser når teknikk bryter sammen' },
          { icon: <Trophy size={22} />, title: 'Tilpassede programmer', desc: 'Generere planer basert på nivå' },
        ].map((benefit, i) => (
          <div
            key={i}
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 24,
              padding: 20,
              border: `1px solid ${COLORS.border}`,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 11,
                backgroundColor: COLORS.surface,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
                color: COLORS.primary,
              }}
            >
              {benefit.icon}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.textDark, marginBottom: 6 }}>
              {benefit.title}
            </div>
            <div style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 1.5 }}>{benefit.desc}</div>
          </div>
        ))}
      </div>

      {/* Sections */}
      <CollapsibleSection title="Pyramidestrukturen" icon={<Layers size={20} />} defaultOpen>
        <Paragraph>
          Pyramiden viser de fem nivåene av golftrening, fra grunnleggende fysikk til
          turneringsprestasjon. Hvert nivå bygger på det forrige.
        </Paragraph>

        <PyramidVisualization />

        <DataTable
          headers={['Kode', 'Nivå', 'Fokus']}
          rows={[
            ['FYS', 'Fysisk', 'Styrke, power, mobilitet, stabilitet, kondisjon'],
            ['TEK', 'Teknikk', 'Bevegelsesmønster, posisjoner, sekvens'],
            ['SLAG', 'Golfslag', 'Slagkvalitet, avstand, nøyaktighet, konsistens'],
            ['SPILL', 'Spill', 'Strategi, banehåndtering, scoring, beslutninger'],
            ['TURN', 'Turnering', 'Mental prestasjon, konkurransefokus'],
          ]}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Treningsområder" icon={<MapPin size={20} />}>
        <Paragraph>
          Treningen er delt inn i 16 spesifikke områder som dekker alt fra driving til putting.
          Dette gjør det mulig å fokusere treningen på akkurat det du trenger å jobbe med.
        </Paragraph>

        {/* Video boxes for training areas */}
        <CardTitle style={{ fontSize: 14, fontWeight: 600, color: COLORS.textDark, marginBottom: 14, marginTop: 20 }}>
          Forklaringsvideoer for treningsområder
        </CardTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 28 }}>
          {[
            { code: 'TEE', name: 'Tee Total', color: 'rgb(var(--tier-navy))' },
            { code: 'INN200', name: 'Innspill 200+', color: 'rgb(var(--tier-navy-light))' },
            { code: 'INN150', name: 'Innspill 150-200m', color: 'rgb(var(--status-info))' },
            { code: 'INN100', name: 'Innspill 100-150m', color: 'rgb(var(--status-info))' },
            { code: 'INN50', name: 'Innspill 50-100m', color: 'rgb(var(--status-success))' },
            { code: 'NÆRSPILL', name: 'Naerspill & Putting', color: 'rgb(var(--tier-gold))' },
          ].map((area) => (
            <button
              key={area.code}
              onClick={() => window.open(`/videos/areas/${area.code.toLowerCase()}`, '_blank')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                padding: 16,
                backgroundColor: COLORS.white,
                border: `2px solid ${area.color}20`,
                borderRadius: 20,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${area.color}10`;
                e.currentTarget.style.borderColor = area.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.white;
                e.currentTarget.style.borderColor = `${area.color}20`;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: area.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PlayCircle size={22} color={COLORS.white} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textDark }}>
                {area.name}
              </div>
              <div style={{ fontSize: 10, color: COLORS.primary, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Video size={10} />
                Se video
              </div>
            </button>
          ))}
        </div>

        <CardTitle style={{ fontSize: 14, fontWeight: 600, color: COLORS.textDark, marginBottom: 14, marginTop: 20 }}>
          Full Swing (5 områder)
        </CardTitle>
        <DataTable
          headers={['Kode', 'Område', 'Typisk klubb']}
          rows={[
            ['TEE', 'Tee Total', 'Driver, 3-wood'],
            ['INN200', 'Innspill 200+ m', '3-wood, hybrid, long iron'],
            ['INN150', 'Innspill 150–200 m', '5-7 iron'],
            ['INN100', 'Innspill 100–150 m', '8-PW'],
            ['INN50', 'Innspill 50–100 m', 'Wedges (full swing)'],
          ]}
        />

        <CardTitle style={{ fontSize: 14, fontWeight: 600, color: COLORS.textDark, margin: '24px 0 14px' }}>
          Kortspill (4 områder)
        </CardTitle>
        <DataTable
          headers={['Kode', 'Område', 'Beskrivelse']}
          rows={[
            ['CHIP', 'Chip', 'Lav bue, mye rulle'],
            ['PITCH', 'Pitch', 'Middels bue, middels rulle'],
            ['LOB', 'Lob', 'Høy bue, lite rulle'],
            ['BUNKER', 'Bunker', 'Sand, greenside'],
          ]}
        />

        <CardTitle style={{ fontSize: 14, fontWeight: 600, color: COLORS.textDark, margin: '24px 0 14px' }}>
          Putting (7 avstander)
        </CardTitle>
        <DataTable
          headers={['Kode', 'Avstand', 'Beskrivelse']}
          rows={[
            ['PUTT0-3', '0–3 ft', 'Makk-putts, tapp-ins'],
            ['PUTT3-5', '3–5 ft', 'Korte putts, må gjøre'],
            ['PUTT5-10', '5–10 ft', 'Mellom putts, scoring zone'],
            ['PUTT10-15', '10–15 ft', 'Mellom-lange putts, birdie muligheter'],
            ['PUTT15-25', '15–25 ft', 'Lange putts, to-putt fokus'],
            ['PUTT25-40', '25–40 ft', 'Lag putts, distance control'],
            ['PUTT40+', '40+ ft', 'Ekstra lange putts, unngå tre-putt'],
          ]}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Læringsfaser" icon={<Brain size={20} />}>
        <Paragraph>
          L-fasene beskriver progressiv motorisk læring – fra isolert bevegelse til automatisert
          ferdighet. Når du lærer noe nytt, starter du alltid på en lav L-fase og jobber deg oppover.
        </Paragraph>

        <DataTable
          headers={['Code', 'Name', 'Description', 'Equipment']}
          rows={[
            ['L-BODY', 'Body', 'Body movement only', 'None'],
            ['L-ARM', 'Arm', 'Body + arms', 'No club/ball'],
            ['L-CLUB', 'Club', 'Body + arms + club', 'No ball'],
            ['L-BALL', 'Ball', 'Everything included, low speed', 'CS40-60'],
            ['L-AUTO', 'Auto', 'Full speed, automated', 'CS70-100'],
          ]}
        />

        <CodeBlock centered>{`L-BODY → L-ARM → L-CLUB → L-BALL → L-AUTO
   │         │         │         │         │
   ▼         ▼         ▼         ▼         ▼
 Isolate  Integrate  Tool     Result   Performance
 movement   arms      in      visible  under pressure`}</CodeBlock>

        <InfoBox title="Example: Learning new hip rotation">
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li style={{ marginBottom: 4 }}>L-BODY: Practice rotation, tilt, plane – body only</li>
            <li style={{ marginBottom: 4 }}>L-ARM: Add arm movement, feel sequence</li>
            <li style={{ marginBottom: 4 }}>L-CLUB: Hold club, check positions in mirror/video</li>
            <li style={{ marginBottom: 4 }}>L-BALL: Hit balls at CS50, focus on feel</li>
            <li>L-AUTO: Gradually increase to CS80+, varying conditions</li>
          </ol>
        </InfoBox>

        {/* Video explanation boxes for each L-phase */}
        <CardTitle style={{ fontSize: 14, fontWeight: 600, color: COLORS.textDark, margin: '28px 0 16px' }}>
          Explanation videos for L-phases
        </CardTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {[
            { code: 'L-BODY', name: 'Body', desc: 'Isolated movement', color: 'rgb(var(--status-success))' },
            { code: 'L-ARM', name: 'Arm', desc: 'Integrate arms', color: 'rgb(var(--tier-navy))' },
            { code: 'L-CLUB', name: 'Club', desc: 'Tool in', color: 'rgb(var(--status-info))' },
            { code: 'L-BALL', name: 'Ball', desc: 'Result visible', color: 'rgb(var(--status-info))' },
            { code: 'L-AUTO', name: 'Auto', desc: 'Full speed', color: 'rgb(var(--tier-gold))' },
          ].map((phase) => (
            <button
              key={phase.code}
              onClick={() => window.open(`/videos/l-phases/${phase.code.toLowerCase()}`, '_blank')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                padding: 20,
                backgroundColor: COLORS.white,
                border: `2px solid ${phase.color}20`,
                borderRadius: 20,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${phase.color}10`;
                e.currentTarget.style.borderColor = phase.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = COLORS.white;
                e.currentTarget.style.borderColor = `${phase.color}20`;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: phase.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PlayCircle size={24} color={COLORS.white} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: phase.color, fontFamily: 'ui-monospace, monospace' }}>
                  {phase.code}
                </div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
                  {phase.desc}
                </div>
              </div>
              <div style={{ fontSize: 11, color: COLORS.primary, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Video size={12} />
                Se video
              </div>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Club Speed nivå" icon={<Zap size={20} />}>
        <Paragraph>
          CS (Clubspeed) angir prosentandel av din maksimale klubbhastighet. Dette brukes for å
          kontrollere intensiteten i treningen og sikre at du trener på riktig nivå for det du
          jobber med.
        </Paragraph>

        <DataTable
          headers={['Nivå', '% av maks', 'Bruksområde']}
          rows={[
            ['CS0', '0%', 'Fysisk trening (off-course)'],
            ['CS20', '20%', 'Ekstrem sakte, kun posisjon'],
            ['CS30', '30%', 'Veldig sakte, bevegelsesflyt'],
            ['CS40', '40%', 'Langsom, fokus på mønster'],
            ['CS50', '50%', 'Moderat, komfortsone'],
            ['CS60', '60%', 'Økt hastighet, begynner utfordre'],
            ['CS70', '70%', 'Konkurranselignende'],
            ['CS80', '80%', 'Høy intensitet'],
            ['CS90', '90%', 'Nær-maksimal'],
            ['CS100', '100%', 'Maksimal innsats'],
          ]}
        />

        <InfoBox title="Viktig å vite">
          CS brukes kun for full swing-områder (TEE, INN200, INN150, INN100, INN50). Kortspill og putting bruker ikke CS.
        </InfoBox>
      </CollapsibleSection>

      <CollapsibleSection title="Miljø" icon={<MapPin size={20} />}>
        <Paragraph>
          Miljøet beskriver hvor treningen foregår, fra innendørs simulator til turneringsrunde.
          Progresjon gjennom miljøene hjelper med å overføre ferdigheter til banen.
        </Paragraph>

        <DataTable
          headers={['Kode', 'Miljø', 'Beskrivelse']}
          rows={[
            ['M0', 'Off-course', 'Gym, hjemme, ikke golf-spesifikt'],
            ['M1', 'Innendørs', 'Nett, simulator, Trackman'],
            ['M2', 'Range', 'Utendørs, matte eller gress'],
            ['M3', 'Øvingsfelt', 'Kortbane, chipping green, putting green'],
            ['M4', 'Bane trening', 'Treningsrunde på bane'],
            ['M5', 'Bane turnering', 'Turneringsrunde'],
          ]}
        />

        <CodeBlock centered>{`M0 → M1 → M2 → M3 → M4 → M5
│     │     │     │     │     │
▼     ▼     ▼     ▼     ▼     ▼
Gym  Sim  Range Øving Trening Turn`}</CodeBlock>
      </CollapsibleSection>

      <CollapsibleSection title="Belastning" icon={<Activity size={20} />}>
        <Paragraph>
          Pressnivået beskriver den psykologiske belastningen i treningssituasjonen. Gradvis økning
          av press hjelper deg med å prestere under turneringsforhold.
        </Paragraph>

        <DataTable
          headers={['Kode', 'Pressnivå', 'Beskrivelse']}
          rows={[
            ['PR1', 'Ingen', 'Utforskende, ingen konsekvens'],
            ['PR2', 'Selvmonitorering', 'Måltall, tracking, men ingen sosial'],
            ['PR3', 'Sosial', 'Med andre, observert'],
            ['PR4', 'Konkurranse', 'Innsats, spill mot andre'],
            ['PR5', 'Turnering', 'Resultat teller, ranking'],
          ]}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Posisjoner" icon={<Crosshair size={20} />}>
        <Paragraph>
          P-posisjonssystemet definerer nøkkelposisjoner i golfsvingen. Dette gjør det mulig å
          fokusere på spesifikke deler av svingen under trening.
        </Paragraph>

        <DataTable
          headers={['Posisjon', 'Navn', 'Definisjon']}
          rows={[
            ['P1.0', 'Address', 'Statisk startposisjon'],
            ['P2.0', 'Takeaway', 'Skaft parallelt med bakken (backswing)'],
            ['P3.0', 'Mid-Backswing', 'Lead arm parallelt med bakken'],
            ['P4.0', 'Topp', 'Maksimal rotasjon, svingens apex'],
            ['P5.0', 'Transition', 'Lead arm parallelt (downswing start)'],
            ['P6.0', 'Delivery', 'Skaft parallelt med bakken (downswing)'],
            ['P7.0', 'Impact', 'Treff, moment of truth'],
            ['P8.0', 'Release', 'Skaft parallelt post-impact'],
            ['P9.0', 'Follow-through', 'Trail arm parallelt'],
            ['P10.0', 'Finish', 'Fullført rotasjon, balanse'],
          ]}
        />

        <CodeBlock centered>{`Backswing:    P1.0 → P2.0 → P3.0 → P4.0
                                    │
Transition:                       P4.5
                                    │
Downswing:              P5.0 → P5.5 → P6.0 → P6.5
                                              │
Impact:                                     P7.0
                                              │
Follow-through:               P8.0 → P9.0 → P10.0`}</CodeBlock>
      </CollapsibleSection>

      <CollapsibleSection title="Struktur" icon={<Target size={20} />}>
        <Paragraph>
          Alle disse elementene kombineres til en komplett formel som beskriver økten. Formelen
          følger et fast mønster avhengig av type trening.
        </Paragraph>

        <CardTitle style={{ fontSize: 14, fontWeight: 600, color: COLORS.textDark, marginBottom: 12 }}>
          Full Swing (med CS)
        </CardTitle>
        <CodeBlock>[Pyramide]_[Område]_L-[fase]_CS[nivå]_M[miljø]_PR[press]_[P-posisjon]</CodeBlock>

        <CardTitle style={{ fontSize: 14, fontWeight: 600, color: COLORS.textDark, margin: '20px 0 12px' }}>
          Kortspill (uten CS)
        </CardTitle>
        <CodeBlock>[Pyramide]_[Område]_L-[fase]_M[miljø]_PR[press]_[P-posisjon]</CodeBlock>

        <CardTitle style={{ fontSize: 14, fontWeight: 600, color: COLORS.textDark, margin: '20px 0 12px' }}>
          Putting
        </CardTitle>
        <CodeBlock>[Pyramide]_[Område]_L-[fase]_M[miljø]_PR[press]_[Fokus]_[Faser]</CodeBlock>

        <CardTitle style={{ fontSize: 14, fontWeight: 600, color: COLORS.textDark, margin: '24px 0 14px' }}>
          Eksempler
        </CardTitle>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            {
              code: 'TEK_TEE_L-BALL_CS50_M2_PR2_P6.0-P7.0',
              desc: 'Teknikktrening med driver, med ball, 50% hastighet, på range, selvmonitorering, fokus på delivery til impact',
            },
            {
              code: 'SLAG_PUTT5-10_L-AUTO_M3_PR3_SIKTE_S-F',
              desc: 'Golfslagtrening, putting 5-10 ft, automatisert, øvingsfelt, sosial, fokus på sikte, hele stroke',
            },
            {
              code: 'TURN_RES_M5_PR5',
              desc: 'Turneringsrunde med resultatfokus',
            },
          ].map((example, i) => (
            <div
              key={i}
              style={{
                backgroundColor: COLORS.surface,
                borderRadius: 20,
                padding: 18,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <code
                style={{
                  display: 'block',
                  fontFamily: 'ui-monospace, monospace',
                  fontSize: 14,
                  color: COLORS.primary,
                  marginBottom: 10,
                  fontWeight: 600,
                }}
              >
                {example.code}
              </code>
              <p style={{ fontSize: 14, color: COLORS.textMuted, margin: 0, lineHeight: 1.5 }}>
                {example.desc}
              </p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Hvordan påvirker dette treningen?" icon={<Trophy size={20} />} color={COLORS.gold}>
        <Paragraph>
          Kategorisystemet gir flere konkrete fordeler for din treningsutvikling:
        </Paragraph>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {[
            {
              title: '1. Systematisk progresjon',
              text: 'L-fasene sikrer at du bygger ferdigheter steg for steg. Du går ikke videre til neste fase før du mestrer den forrige. Dette forhindrer at du utvikler dårlige vaner ved å trene for fort.',
            },
            {
              title: '2. Breaking Point-identifikasjon',
              text: 'Ved å logge økter med CS og PR, kan systemet identifisere hvor teknikken din bryter sammen. For eksempel: "Teknikken holder til CS60, men bryter ved CS70+". Dette gir konkrete mål for treningen.',
            },
            {
              title: '3. Miljøtilpasning',
              text: 'M-nivåene sikrer at du trener på riktig sted til riktig tid. Ny teknikk bør øves i M1 (simulator) før du tar den til M2 (range) og til slutt M4 (banen).',
            },
            {
              title: '4. Presshåndtering',
              text: 'PR-nivåene hjelper deg med å gradvis bygge opp evnen til å prestere under press. Start med PR1 (ingen press), og jobb deg opp til PR5 (turnering) for å forberede deg mentalt.',
            },
            {
              title: '5. Spesifikk feedback',
              text: 'P-posisjonene lar deg og treneren din kommunisere presist om hvilke deler av svingen som trenger arbeid. "Vi jobber med P5.0-P6.0" er mye klarere enn "vi jobber med nedsvingen".',
            },
          ].map((item, i) => (
            <div key={i}>
              <CardTitle style={{ fontSize: 15, fontWeight: 600, color: COLORS.textDark, margin: '0 0 8px' }}>
                {item.title}
              </CardTitle>
              <p style={{ fontSize: 14, color: COLORS.textMuted, margin: 0, lineHeight: 1.6 }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Footer */}
      <div
        style={{
          textAlign: 'center',
          padding: '40px 0 20px',
          color: COLORS.textMuted,
          fontSize: 13,
        }}
      >
        <p style={{ margin: 0 }}>
          Treningskategorisystem v2.0 • Oppdatert desember 2025
        </p>
      </div>
    </div>
  );
}

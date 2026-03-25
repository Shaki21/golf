/**
 * Utviklingsplan B-nivå
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState } from 'react';
import { PageTitle, SectionTitle, SubSectionTitle, CardTitle } from '../typography';

// Design token values (hex for inline styles)
const tokenColors = {
  forest: '#10456A',
  forestLight: '#2C5F7F',
  primaryLight: '#2C5F7F',
  primaryDark: '#10456A',
  info: '#2C5F7F',
  error: '#C45B4E',
  gold: 'rgb(var(--tier-gold))',
  success: '#4A7C59',
  warning: '#D4A84B',
  foam: '#EDF0F2',
  charcoal: '#1C1C1E',
  steel: '#8E8E93',
  white: 'rgb(var(--tier-white))',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
};

const UtviklingsplanApp = () => {
  const [activeView, setActiveView] = useState('årsplan');
  const [selectedPeriod, setSelectedPeriod] = useState('grunn');
  const [selectedWeek, setSelectedWeek] = useState(45);
  const [selectedDay, setSelectedDay] = useState(null);

  // Spillerdata - B-nivå (snittscore 75)
  const player = {
    name: "SPILLERNAVN",
    club: "Golfklubb Norge",
    age: 17,
    avgScore: 75,
    level: "B",
    levelRange: "74-76",
    handicap: "+1.2",
    clubSpeed: "105 mph",
    season: "2025/2026"
  };

  // Fargepalett - Design System v3.0
  const colors = {
    primary: tokenColors.forest,       // #10456A (Forest)
    secondary: tokenColors.error,      // #C45B4E (Error red)
    accent: tokenColors.gold,          // rgb(var(--tier-gold)) (Gold)
    success: tokenColors.success,      // #4A7C59 (Success)
    warning: tokenColors.warning,      // #D4A84B (Warning)
    light: tokenColors.foam,           // #EDF0F2 (Foam)
    dark: tokenColors.charcoal,        // #1C1C1E (Charcoal)
    grunn: tokenColors.primaryLight,    // #2C5F7F (Forest Light for grunn)
    spesial: tokenColors.warning,      // #D4A84B (Warning for spesial)
    turnering: tokenColors.error,      // #C45B4E (Error for turnering)
    evaluering: tokenColors.steel,     // #8E8E93 (Steel for evaluering)
    forest: tokenColors.forest,
    forestLight: tokenColors.forestLight,
    // Session type colors for badges
    sessionTypes: {
      teknikk: tokenColors.primaryLight,
      golfslag: tokenColors.success,
      spill: tokenColors.forest,
      kompetanse: tokenColors.gold,
      fysisk: tokenColors.info,
      funksjonell: tokenColors.warning,
      hjemme: tokenColors.steel,
      test: tokenColors.error,
    }
  };

  // Periodedata
  const periods = {
    evaluering: { weeks: [40, 41], color: colors.evaluering, label: 'E', name: 'Evaluering' },
    grunn: { weeks: [42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 1, 2], color: colors.grunn, label: 'G', name: 'Grunnperiode' },
    spesial: { weeks: [5, 6, 7, 8, 9, 10, 11, 12, 13], color: colors.spesial, label: 'S', name: 'Spesialisering' },
    turnering: { weeks: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38], color: colors.turnering, label: 'T', name: 'Turnering' }
  };

  // B-nivå prioriteringer per periode
  const priorities = {
    grunn: {
      konkurranse: 1, spill: 2, golfslag: 2, teknikk: 3, fysisk: 3,
      focus: "Teknikk og fysisk utvikling",
      læringsfase: "L2-L3",
      clubSpeed: "CS40-CS60",
      setting: "S1-S4"
    },
    spesial: {
      konkurranse: 1, spill: 2, golfslag: 3, teknikk: 2, fysisk: 2,
      focus: "Golfslag og ferdighetsbygging",
      læringsfase: "L3-L4",
      clubSpeed: "CS60-CS80",
      setting: "S4-S7"
    },
    turnering: {
      konkurranse: 3, spill: 3, golfslag: 2, teknikk: 1, fysisk: 1,
      focus: "Konkurranse og spill",
      læringsfase: "L4-L5",
      clubSpeed: "CS80-CS100",
      setting: "S7-S10"
    }
  };

  // Ukeplan mal for B-nivå i grunnperiode
  const weekPlanGrunn = {
    mandag: [
      { time: '07:00', duration: 30, type: 'Fs', name: 'Styrke morgentrim', phase: 'L1', cs: 'CS0', setting: 'S1' },
      { time: '16:00', duration: 90, type: 'T', name: 'Teknisk økt - Sving', phase: 'L2', cs: 'CS40', setting: 'S2' }
    ],
    tirsdag: [
      { time: '07:00', duration: 30, type: 'L1-2', name: 'Hjemmetrening bevegelse', phase: 'L1', cs: 'CS20', setting: 'S1' },
      { time: '16:00', duration: 90, type: 'G', name: 'Golfslag - Innspill', phase: 'L3', cs: 'CS60', setting: 'S3' }
    ],
    onsdag: [
      { time: '07:00', duration: 45, type: 'Fu', name: 'Utholdenhet/cardio', phase: 'L1', cs: 'CS0', setting: 'S1' },
      { time: '16:00', duration: 60, type: 'T', name: 'Naerspill teknikk', phase: 'L2', cs: 'CS40', setting: 'S2' }
    ],
    torsdag: [
      { time: '07:00', duration: 30, type: 'L1-2', name: 'Hjemmetrening bevegelse', phase: 'L1', cs: 'CS20', setting: 'S1' },
      { time: '16:00', duration: 90, type: 'G', name: 'Golfslag - Wedge', phase: 'L3', cs: 'CS60', setting: 'S4' }
    ],
    fredag: [
      { time: '07:00', duration: 30, type: 'Fs', name: 'Styrke fokus', phase: 'L1', cs: 'CS0', setting: 'S1' },
      { time: '16:00', duration: 60, type: 'T', name: 'Putting teknikk', phase: 'L2', cs: 'CS30', setting: 'S2' }
    ],
    lørdag: [
      { time: '10:00', duration: 120, type: 'S', name: 'Spilltrening 9 hull', phase: 'L4', cs: 'CS80', setting: 'S5' }
    ],
    søndag: [
      { time: '10:00', duration: 60, type: 'Test', name: 'Progresjonstest', phase: 'L3-L5', cs: 'CS40-80', setting: 'S4' }
    ]
  };

  // Treningsøkt detaljer
  const sessionDetails = {
    'Teknisk økt - Sving': {
      type: 'T',
      mål: ['Utvikle svingplane', 'Bedre ballkontakt', 'Øke konsistens'],
      øvelser: [
        { nr: 1, navn: 'Oppvarming', beskrivelse: 'Dynamisk strekk + rotasjon', reps: '5 min', pyramide: 'Teknikk' },
        { nr: 2, navn: 'Alignment drill', beskrivelse: 'Stance og siktelinje', reps: '10 slag', pyramide: 'Teknikk' },
        { nr: 3, navn: 'L2 halvsvinger', beskrivelse: 'Jern 7, fokus på kontakt', reps: '20 slag', pyramide: 'Golfslag' },
        { nr: 4, navn: 'L3 3/4 svinger', beskrivelse: 'Jern 7, økt fart', reps: '20 slag', pyramide: 'Golfslag' },
        { nr: 5, navn: 'Gate drill', beskrivelse: 'Sving mellom pinnene', reps: '15 slag', pyramide: 'Teknikk' },
        { nr: 6, navn: 'Full swing', beskrivelse: 'Varierende køller', reps: '20 slag', pyramide: 'Golfslag' },
        { nr: 7, navn: 'Video analyse', beskrivelse: 'Sammenlign med referanse', reps: '5 min', pyramide: 'Teknikk' },
        { nr: 8, navn: 'Cool down', beskrivelse: 'Lette slag + stretch', reps: '10 min', pyramide: 'Teknikk' }
      ],
      utstyr: ['TrackMan/Garmin', 'Alignment sticks', 'Video/telefon', 'Gatetrener'],
      suksesskriterier: 'Minst 70% av slag med ønsket ballflukt på CS60'
    }
  };

  // Prioritet visning
  const PriorityBadge = ({ value }) => {
    const labels = { 3: 'UTVIKLE', 2: 'BEHOLDE', 1: 'VEDLIKEHOLD' };
    const bgColors = { 3: colors.success, 2: colors.warning, 1: colors.evaluering };
    return (
      <span style={{
        background: bgColors[value],
        color: 'white',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: 'bold'
      }}>
        {labels[value]}
      </span>
    );
  };

  // Session type badge
  const TypeBadge = ({ type }) => {
    const typeColors = {
      'T': colors.sessionTypes.teknikk,
      'G': colors.sessionTypes.golfslag,
      'S': colors.sessionTypes.spill,
      'K': colors.sessionTypes.kompetanse,
      'Fs': colors.sessionTypes.fysisk,
      'Fu': colors.sessionTypes.funksjonell,
      'L1-2': colors.sessionTypes.hjemme,
      'Test': colors.sessionTypes.test
    };
    return (
      <span style={{
        background: typeColors[type] || colors.primary,
        color: 'white',
        padding: '2px 6px',
        borderRadius: '4px',
        fontSize: '10px',
        fontWeight: 'bold'
      }}>
        {type}
      </span>
    );
  };

  // ============== HOVEDVISNINGER ==============

  // 1. ÅRSPLAN OVERSIKT
  const ÅrsplanView = () => (
    <div style={{ padding: '24px' }}>
      <SectionTitle style={{ color: colors.primary, marginBottom: '20px', borderBottom: `3px solid ${colors.secondary}`, paddingBottom: '10px' }}>
        ARSPLAN 2025/2026
      </SectionTitle>

      {/* Periodeoversikt */}
      <div style={{ marginBottom: '30px' }}>
        <SubSectionTitle style={{ color: colors.primary, fontSize: '14px', marginBottom: '12px' }}>PERIODER</SubSectionTitle>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {Object.entries(periods).map(([key, period]) => (
            <div key={key} style={{
              background: period.color,
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              transform: selectedPeriod === key ? 'scale(1.05)' : 'scale(1)',
              boxShadow: selectedPeriod === key ? '0 4px 15px rgba(0,0,0,0.3)' : '0 2px 5px rgba(0,0,0,0.1)',
              transition: 'all 0.2s'
            }} onClick={() => setSelectedPeriod(key)}>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{period.label}</div>
              <div style={{ fontSize: '11px', opacity: 0.9 }}>{period.name}</div>
              <div style={{ fontSize: '10px', opacity: 0.7 }}>Uke {period.weeks[0]}-{period.weeks[period.weeks.length-1]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ukekalender */}
      <div style={{ marginBottom: '30px' }}>
        <SubSectionTitle style={{ color: colors.primary, fontSize: '14px', marginBottom: '12px' }}>ARSHJUL (UKE 40 - 39)</SubSectionTitle>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(26, 1fr)',
          gap: '2px',
          background: tokenColors.gray300,
          padding: '2px',
          borderRadius: '8px'
        }}>
          {/* Første halvår: uke 40-52 + 1-4 */}
          {[40,41,42,43,44,45,46,47,48,49,50,51,52,1,2,3,4,5,6,7,8,9,10,11,12,13].map(week => {
            const periodColor = Object.values(periods).find(p => p.weeks.includes(week))?.color || tokenColors.gray400;
            return (
              <div key={week} style={{
                background: periodColor,
                color: 'white',
                padding: '8px 2px',
                textAlign: 'center',
                fontSize: '10px',
                fontWeight: selectedWeek === week ? 'bold' : 'normal',
                cursor: 'pointer',
                opacity: selectedWeek === week ? 1 : 0.7,
                borderRadius: '4px'
              }} onClick={() => setSelectedWeek(week)}>
                {week}
              </div>
            );
          })}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(26, 1fr)',
          gap: '2px',
          background: tokenColors.gray300,
          padding: '2px',
          borderRadius: '8px',
          marginTop: '2px'
        }}>
          {/* Andre halvår: uke 14-39 */}
          {[14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39].map(week => {
            const periodColor = Object.values(periods).find(p => p.weeks.includes(week))?.color || tokenColors.gray400;
            return (
              <div key={week} style={{
                background: periodColor,
                color: 'white',
                padding: '8px 2px',
                textAlign: 'center',
                fontSize: '10px',
                fontWeight: selectedWeek === week ? 'bold' : 'normal',
                cursor: 'pointer',
                opacity: selectedWeek === week ? 1 : 0.7,
                borderRadius: '4px'
              }} onClick={() => setSelectedWeek(week)}>
                {week}
              </div>
            );
          })}
        </div>
      </div>

      {/* Prioriteringstabell for B-nivå */}
      <div style={{ marginBottom: '30px' }}>
        <SubSectionTitle style={{ color: colors.primary, fontSize: '14px', marginBottom: '12px' }}>
          PRIORITERINGER PR PERIODE - B-NIVA (Snitt: {player.avgScore})
        </SubSectionTitle>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: colors.primary, color: 'white' }}>
              <th style={{ padding: '10px', textAlign: 'left' }}>Kategori</th>
              <th style={{ padding: '10px', textAlign: 'center', background: colors.evaluering }}>Evaluering</th>
              <th style={{ padding: '10px', textAlign: 'center', background: colors.grunn }}>Grunn</th>
              <th style={{ padding: '10px', textAlign: 'center', background: colors.spesial }}>Spesial</th>
              <th style={{ padding: '10px', textAlign: 'center', background: colors.turnering }}>Turnering</th>
            </tr>
          </thead>
          <tbody>
            {['konkurranse', 'spill', 'golfslag', 'teknikk', 'fysisk'].map(cat => (
              <tr key={cat} style={{ borderBottom: `1px solid ${tokenColors.gray200}` }}>
                <td style={{ padding: '10px', fontWeight: 'bold', textTransform: 'capitalize' }}>{cat}</td>
                <td style={{ padding: '10px', textAlign: 'center' }}><PriorityBadge value={1} /></td>
                <td style={{ padding: '10px', textAlign: 'center' }}><PriorityBadge value={priorities.grunn[cat]} /></td>
                <td style={{ padding: '10px', textAlign: 'center' }}><PriorityBadge value={priorities.spesial[cat]} /></td>
                <td style={{ padding: '10px', textAlign: 'center' }}><PriorityBadge value={priorities.turnering[cat]} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TIER Golf parametre */}
      <div style={{
        background: `linear-gradient(135deg, ${colors.forest} 0%, ${colors.forestLight} 100%)`,
        padding: '20px',
        borderRadius: '12px',
        color: 'white'
      }}>
        <SubSectionTitle style={{ fontSize: '14px', marginBottom: '15px', color: colors.accent }}>
          TIER GOLF PROGRESJON - B-NIVA
        </SubSectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
          {Object.entries(priorities).map(([period, data]) => (
            <div key={period} style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '15px',
              borderRadius: '8px',
              borderLeft: `4px solid ${periods[period]?.color || colors.primary}`
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px', textTransform: 'capitalize' }}>{period}</div>
              <div style={{ fontSize: '11px', lineHeight: '1.6' }}>
                <div>Laeringsfase: <strong>{data.læringsfase}</strong></div>
                <div>Clubspeed: <strong>{data.clubSpeed}</strong></div>
                <div>Setting: <strong>{data.setting}</strong></div>
                <div style={{ marginTop: '8px', color: colors.accent }}>Fokus: {data.focus}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 2. PERIODEPLAN VIEW
  const PeriodeplanView = () => {
    const currentPriorities = priorities[selectedPeriod] || priorities.grunn;
    const currentPeriod = periods[selectedPeriod] || periods.grunn;

    return (
      <div style={{ padding: '24px' }}>
        <SectionTitle style={{ color: colors.primary, marginBottom: '20px', borderBottom: `3px solid ${currentPeriod.color}`, paddingBottom: '10px' }}>
          PERIODEPLAN: {currentPeriod.name.toUpperCase()}
        </SectionTitle>

        {/* Periode header */}
        <div style={{
          background: `linear-gradient(135deg, ${currentPeriod.color} 0%, ${colors.dark} 100%)`,
          color: 'white',
          padding: '25px',
          borderRadius: '12px',
          marginBottom: '25px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>PERIODE</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{currentPeriod.label}</div>
              <div style={{ fontSize: '14px' }}>{currentPeriod.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>VARIGHET</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                Uke {currentPeriod.weeks[0]} - {currentPeriod.weeks[currentPeriod.weeks.length-1]}
              </div>
              <div style={{ fontSize: '14px' }}>{currentPeriod.weeks.length} uker</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.7 }}>HOVEDFOKUS</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: colors.accent }}>
                {currentPriorities.focus}
              </div>
            </div>
          </div>
        </div>

        {/* 3-ukers syklus */}
        <div style={{ marginBottom: '25px' }}>
          <SubSectionTitle style={{ color: colors.primary, fontSize: '14px', marginBottom: '12px' }}>3-UKERS SYKLUS</SubSectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
            {['Uke 1: Innlæring', 'Uke 2: Utvikling', 'Uke 3: Testing'].map((week, i) => (
              <div key={i} style={{
                background: colors.light,
                border: `2px solid ${currentPeriod.color}`,
                padding: '15px',
                borderRadius: '8px'
              }}>
                <div style={{ fontWeight: 'bold', color: currentPeriod.color, marginBottom: '8px' }}>{week}</div>
                <div style={{ fontSize: '11px', color: tokenColors.gray600 }}>
                  {i === 0 && 'Fokus på teknikk og bevegelse. Lav hastighet, høy kvalitet.'}
                  {i === 1 && 'Økt hastighet og kompleksitet. Bygge mot bruddpunkt.'}
                  {i === 2 && 'Progresjonstester. Identifiser neste nivå.'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Treningskategorier */}
        <div style={{ marginBottom: '25px' }}>
          <SubSectionTitle style={{ color: colors.primary, fontSize: '14px', marginBottom: '12px' }}>TRENINGSKATEGORIER</SubSectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {[
              { key: 'konkurranse', icon: 'Trophy', label: 'Konkurranse' },
              { key: 'spill', icon: 'Flag', label: 'Spill' },
              { key: 'golfslag', icon: 'Target', label: 'Golfslag' },
              { key: 'teknikk', icon: 'Wrench', label: 'Teknikk' },
              { key: 'fysisk', icon: 'Strength', label: 'Fysisk' }
            ].map(cat => (
              <div key={cat.key} style={{
                background: currentPriorities[cat.key] === 3 ? colors.success :
                           currentPriorities[cat.key] === 2 ? colors.warning : colors.evaluering,
                color: 'white',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '24px' }}>{cat.icon}</div>
                <div style={{ fontWeight: 'bold', fontSize: '12px', marginTop: '5px' }}>{cat.label}</div>
                <div style={{ fontSize: '10px', marginTop: '5px' }}>
                  {currentPriorities[cat.key] === 3 ? 'UTVIKLE' :
                   currentPriorities[cat.key] === 2 ? 'BEHOLDE' : 'VEDLIKEHOLD'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ukentlig fordeling */}
        <div style={{
          background: colors.light,
          padding: '20px',
          borderRadius: '12px',
          border: `1px solid ${currentPeriod.color}`
        }}>
          <SubSectionTitle style={{ color: colors.primary, fontSize: '14px', marginBottom: '15px' }}>
            ANBEFALT UKENTLIG FORDELING - {selectedPeriod.toUpperCase()}
          </SubSectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
            <div>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: currentPeriod.color, color: 'white' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Type</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Økter/uke</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Timer</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPeriod === 'grunn' && (
                    <>
                      <tr><td style={{padding:'6px'}}>Teknikk (T)</td><td style={{textAlign:'center'}}>3</td><td style={{textAlign:'center'}}>4.5t</td></tr>
                      <tr><td style={{padding:'6px'}}>Golfslag (G)</td><td style={{textAlign:'center'}}>2</td><td style={{textAlign:'center'}}>3t</td></tr>
                      <tr><td style={{padding:'6px'}}>Styrke (Fs)</td><td style={{textAlign:'center'}}>2</td><td style={{textAlign:'center'}}>2t</td></tr>
                      <tr><td style={{padding:'6px'}}>Utholdenhet (Fu)</td><td style={{textAlign:'center'}}>1</td><td style={{textAlign:'center'}}>45m</td></tr>
                      <tr><td style={{padding:'6px'}}>Spill (S)</td><td style={{textAlign:'center'}}>1</td><td style={{textAlign:'center'}}>2t</td></tr>
                      <tr><td style={{padding:'6px'}}>Hjemme (L1-2)</td><td style={{textAlign:'center'}}>2</td><td style={{textAlign:'center'}}>1t</td></tr>
                      <tr style={{fontWeight:'bold', background: tokenColors.gray200}}><td style={{padding:'6px'}}>TOTALT</td><td style={{textAlign:'center'}}>11</td><td style={{textAlign:'center'}}>~13t</td></tr>
                    </>
                  )}
                  {selectedPeriod === 'spesial' && (
                    <>
                      <tr><td style={{padding:'6px'}}>Golfslag (G)</td><td style={{textAlign:'center'}}>3</td><td style={{textAlign:'center'}}>4.5t</td></tr>
                      <tr><td style={{padding:'6px'}}>Teknikk (T)</td><td style={{textAlign:'center'}}>2</td><td style={{textAlign:'center'}}>2t</td></tr>
                      <tr><td style={{padding:'6px'}}>Styrke (Fs)</td><td style={{textAlign:'center'}}>2</td><td style={{textAlign:'center'}}>2t</td></tr>
                      <tr><td style={{padding:'6px'}}>Spill (S)</td><td style={{textAlign:'center'}}>2</td><td style={{textAlign:'center'}}>4t</td></tr>
                      <tr><td style={{padding:'6px'}}>Hjemme (L1-2)</td><td style={{textAlign:'center'}}>2</td><td style={{textAlign:'center'}}>1t</td></tr>
                      <tr style={{fontWeight:'bold', background: tokenColors.gray200}}><td style={{padding:'6px'}}>TOTALT</td><td style={{textAlign:'center'}}>11</td><td style={{textAlign:'center'}}>~13.5t</td></tr>
                    </>
                  )}
                  {selectedPeriod === 'turnering' && (
                    <>
                      <tr><td style={{padding:'6px'}}>Konkurranse (K)</td><td style={{textAlign:'center'}}>1-2</td><td style={{textAlign:'center'}}>5-8t</td></tr>
                      <tr><td style={{padding:'6px'}}>Spill (S)</td><td style={{textAlign:'center'}}>2</td><td style={{textAlign:'center'}}>4t</td></tr>
                      <tr><td style={{padding:'6px'}}>Golfslag (G)</td><td style={{textAlign:'center'}}>2</td><td style={{textAlign:'center'}}>2t</td></tr>
                      <tr><td style={{padding:'6px'}}>Styrke (Fs)</td><td style={{textAlign:'center'}}>1</td><td style={{textAlign:'center'}}>1t</td></tr>
                      <tr><td style={{padding:'6px'}}>Teknikk (T)</td><td style={{textAlign:'center'}}>1</td><td style={{textAlign:'center'}}>1t</td></tr>
                      <tr style={{fontWeight:'bold', background: tokenColors.gray200}}><td style={{padding:'6px'}}>TOTALT</td><td style={{textAlign:'center'}}>7-8</td><td style={{textAlign:'center'}}>~13-16t</td></tr>
                    </>
                  )}
                  {selectedPeriod === 'evaluering' && (
                    <>
                      <tr><td style={{padding:'6px'}}>Testing</td><td style={{textAlign:'center'}}>3-4</td><td style={{textAlign:'center'}}>6t</td></tr>
                      <tr><td style={{padding:'6px'}}>Planlegging</td><td style={{textAlign:'center'}}>2</td><td style={{textAlign:'center'}}>3t</td></tr>
                      <tr><td style={{padding:'6px'}}>Lett trening</td><td style={{textAlign:'center'}}>2</td><td style={{textAlign:'center'}}>2t</td></tr>
                      <tr style={{fontWeight:'bold', background: tokenColors.gray200}}><td style={{padding:'6px'}}>TOTALT</td><td style={{textAlign:'center'}}>7-8</td><td style={{textAlign:'center'}}>~11t</td></tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <div style={{ background: 'white', padding: '15px', borderRadius: '8px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px', color: currentPeriod.color }}>
                TIER Golf Parametre - {currentPeriod.name}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                <div style={{ background: tokenColors.gray100, padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 'bold' }}>Læringsfase</div>
                  <div style={{ fontSize: '18px', color: currentPeriod.color }}>{currentPriorities.læringsfase}</div>
                </div>
                <div style={{ background: tokenColors.gray100, padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 'bold' }}>Clubspeed</div>
                  <div style={{ fontSize: '18px', color: currentPeriod.color }}>{currentPriorities.clubSpeed}</div>
                </div>
                <div style={{ background: tokenColors.gray100, padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 'bold' }}>Setting</div>
                  <div style={{ fontSize: '18px', color: currentPeriod.color }}>{currentPriorities.setting}</div>
                </div>
                <div style={{ background: tokenColors.gray100, padding: '10px', borderRadius: '6px' }}>
                  <div style={{ fontWeight: 'bold' }}>Suksesskriterium</div>
                  <div style={{ fontSize: '12px', color: tokenColors.gray600 }}>8-10 reps @ 80% kvalitet</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 3. MÅNEDSKALENDER VIEW
  const MånedskalenderView = () => {
    // November 2025 eksempel
    const daysInMonth = 30;
    const firstDayOfWeek = 5; // Lørdag
    const weekDays = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

    const monthEvents = {
      4: [{ type: 'T', name: 'Teknisk' }, { type: 'Fs', name: 'Styrke' }],
      5: [{ type: 'G', name: 'Golfslag' }],
      6: [{ type: 'T', name: 'Naerspill' }, { type: 'Fu', name: 'Cardio' }],
      7: [{ type: 'G', name: 'Wedge' }],
      8: [{ type: 'T', name: 'Putting' }, { type: 'Fs', name: 'Styrke' }],
      9: [{ type: 'S', name: '9 hull spill' }],
      10: [{ type: 'Test', name: 'Progresjonstest' }],
      11: [{ type: 'T', name: 'Sving' }, { type: 'Fs', name: 'Styrke' }],
      12: [{ type: 'G', name: 'Innspill' }],
      13: [{ type: 'T', name: 'Chip' }, { type: 'Fu', name: 'Cardio' }],
      14: [{ type: 'G', name: 'Driver' }],
      15: [{ type: 'T', name: 'Bunker' }, { type: 'Fs', name: 'Styrke' }],
      16: [{ type: 'S', name: '18 hull spill' }],
      17: [{ type: 'L1-2', name: 'Hjemmetrening' }]
    };

    return (
      <div style={{ padding: '24px' }}>
        <SectionTitle style={{ color: colors.primary, marginBottom: '20px', borderBottom: `3px solid ${colors.secondary}`, paddingBottom: '10px' }}>
          MANEDSKALENDER: NOVEMBER 2025
        </SectionTitle>

        {/* Månedsoversikt */}
        <div style={{
          background: colors.light,
          borderRadius: '12px',
          overflow: 'hidden',
          border: `1px solid ${colors.grunn}`
        }}>
          {/* Header */}
          <div style={{
            background: colors.grunn,
            color: 'white',
            padding: '15px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '14px' }}>◀ Oktober</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>November 2025</span>
            <span style={{ fontSize: '14px' }}>Desember ▶</span>
          </div>

          {/* Periode info */}
          <div style={{
            background: colors.grunn,
            color: 'white',
            padding: '10px 15px',
            fontSize: '12px',
            opacity: 0.9
          }}>
            <strong>GRUNNPERIODE</strong> | Uke 44-48 | Fokus: Teknikk & Fysisk utvikling | L2-L3 | CS40-CS60 | S1-S4
          </div>

          {/* Ukedager header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            background: tokenColors.gray300
          }}>
            {weekDays.map(day => (
              <div key={day} style={{
                padding: '10px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '12px',
                color: colors.primary
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Kalender grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '1px',
            background: tokenColors.gray300
          }}>
            {/* Tomme celler før måneden starter */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} style={{ background: tokenColors.gray100, minHeight: '100px' }} />
            ))}

            {/* Dager i måneden */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const events = monthEvents[day] || [];
              const isSelected = selectedDay === day;

              return (
                <div key={day} style={{
                  background: isSelected ? 'rgba(2, 132, 199, 0.08)' : tokenColors.white,
                  minHeight: '100px',
                  padding: '5px',
                  cursor: 'pointer',
                  border: isSelected ? `2px solid ${colors.primary}` : 'none'
                }} onClick={() => setSelectedDay(day)}>
                  <div style={{
                    fontWeight: 'bold',
                    fontSize: '14px',
                    color: colors.primary,
                    marginBottom: '5px'
                  }}>
                    {day}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {events.map((event, j) => (
                      <div key={j} style={{
                        fontSize: '9px',
                        padding: '2px 4px',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <TypeBadge type={event.type} />
                        <span style={{ color: tokenColors.gray600 }}>{event.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Månedlig oppsummering */}
        <div style={{
          marginTop: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '15px'
        }}>
          <div style={{ background: colors.sessionTypes.teknikk, color: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>12</div>
            <div style={{ fontSize: '11px' }}>Teknikk økter</div>
          </div>
          <div style={{ background: colors.sessionTypes.golfslag, color: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>8</div>
            <div style={{ fontSize: '11px' }}>Golfslag økter</div>
          </div>
          <div style={{ background: colors.sessionTypes.fysisk, color: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>8</div>
            <div style={{ fontSize: '11px' }}>Fysiske økter</div>
          </div>
          <div style={{ background: colors.sessionTypes.spill, color: 'white', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>4</div>
            <div style={{ fontSize: '11px' }}>Spill økter</div>
          </div>
        </div>
      </div>
    );
  };

  // 4. UKEPLAN VIEW
  const UkeplanView = () => {
    const days = ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag', 'søndag'];
    const dayLabels = ['MAN', 'TIR', 'ONS', 'TOR', 'FRE', 'LØR', 'SØN'];

    return (
      <div style={{ padding: '24px' }}>
        <SectionTitle style={{ color: colors.primary, marginBottom: '20px', borderBottom: `3px solid ${colors.secondary}`, paddingBottom: '10px' }}>
          UKEPLAN: UKE {selectedWeek}
        </SectionTitle>

        {/* Uke info header */}
        <div style={{
          background: `linear-gradient(135deg, ${colors.grunn} 0%, ${colors.dark} 100%)`,
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '15px'
        }}>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>UKE</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{selectedWeek}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>PERIODE</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>GRUNNLEGGENDE</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>PARAMETRE</div>
            <div style={{ fontSize: '14px' }}>L2-L3 | CS40-60 | S1-S4</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.7 }}>FOKUS</div>
            <div style={{ fontSize: '14px', color: colors.accent }}>Teknikk & Fysisk</div>
          </div>
        </div>

        {/* Ukeplan grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '10px'
        }}>
          {days.map((day, i) => {
            const sessions = weekPlanGrunn[day] || [];
            const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);

            return (
              <div key={day} style={{
                background: colors.light,
                borderRadius: '10px',
                overflow: 'hidden',
                border: `1px solid ${tokenColors.gray300}`
              }}>
                {/* Dag header */}
                <div style={{
                  background: colors.primary,
                  color: 'white',
                  padding: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{dayLabels[i]}</div>
                  <div style={{ fontSize: '10px', opacity: 0.7 }}>{totalTime} min</div>
                </div>

                {/* Økter */}
                <div style={{ padding: '10px', minHeight: '200px' }}>
                  {sessions.length === 0 ? (
                    <div style={{ color: tokenColors.gray500, fontSize: '11px', textAlign: 'center', paddingTop: '20px' }}>
                      Hviledag
                    </div>
                  ) : (
                    sessions.map((session, j) => (
                      <div key={j} style={{
                        background: 'white',
                        padding: '8px',
                        borderRadius: '6px',
                        marginBottom: '8px',
                        borderLeft: `3px solid ${
                          session.type === 'T' ? colors.sessionTypes.teknikk :
                          session.type === 'G' ? colors.sessionTypes.golfslag :
                          session.type === 'S' ? colors.sessionTypes.spill :
                          session.type === 'Fs' ? colors.sessionTypes.fysisk :
                          session.type === 'Fu' ? colors.sessionTypes.funksjonell :
                          colors.sessionTypes.hjemme
                        }`,
                        cursor: 'pointer'
                      }} onClick={() => setSelectedDay(day)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <TypeBadge type={session.type} />
                          <span style={{ fontSize: '9px', color: tokenColors.gray600 }}>{session.time}</span>
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: colors.primary }}>
                          {session.name}
                        </div>
                        <div style={{ fontSize: '9px', color: tokenColors.gray600, marginTop: '4px' }}>
                          {session.duration} min | {session.phase} | {session.cs}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ukens oppsummering */}
        <div style={{
          marginTop: '20px',
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: `1px solid ${tokenColors.gray300}`
        }}>
          <SubSectionTitle style={{ color: colors.primary, fontSize: '14px', marginBottom: '15px' }}>UKENS OPPSUMMERING</SubSectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
            {[
              { label: 'Teknikk', count: 3, time: '4.5t', color: colors.sessionTypes.teknikk },
              { label: 'Golfslag', count: 2, time: '3t', color: colors.sessionTypes.golfslag },
              { label: 'Spill', count: 1, time: '2t', color: colors.sessionTypes.spill },
              { label: 'Styrke', count: 2, time: '1t', color: colors.sessionTypes.fysisk },
              { label: 'Cardio', count: 1, time: '45m', color: colors.sessionTypes.funksjonell },
              { label: 'Hjemme', count: 2, time: '1t', color: colors.sessionTypes.hjemme }
            ].map((item, i) => (
              <div key={i} style={{
                background: item.color,
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{item.count}</div>
                <div style={{ fontSize: '10px' }}>{item.label}</div>
                <div style={{ fontSize: '9px', opacity: 0.8 }}>{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 5. TRENINGSØKT VIEW
  const TreningsøktView = () => {
    const session = sessionDetails['Teknisk økt - Sving'];

    return (
      <div style={{ padding: '24px' }}>
        <SectionTitle style={{ color: colors.primary, marginBottom: '20px', borderBottom: `3px solid ${colors.secondary}`, paddingBottom: '10px' }}>
          TRENINGSOKT: TEKNISK OKT - SVING
        </SectionTitle>

        {/* Økt header */}
        <div style={{
          background: `linear-gradient(135deg, ${tokenColors.primaryLight} 0%, ${tokenColors.primaryDark} 100%)`,
          color: 'white',
          padding: '25px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>ØKT TYPE</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>T</div>
              <div style={{ fontSize: '12px' }}>Teknikk</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>VARIGHET</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>90 min</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>PARAMETRE</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold' }}>L2-L3</div>
              <div style={{ fontSize: '12px' }}>CS40-CS60 | S2</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', opacity: 0.7 }}>PYRAMIDE</div>
              <div style={{ fontSize: '16px' }}>Teknikk + Golfslag</div>
            </div>
          </div>
        </div>

        {/* Beskrivelse format */}
        <div style={{
          background: colors.light,
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: `2px dashed ${tokenColors.primaryLight}`
        }}>
          <div style={{ fontSize: '12px', color: tokenColors.gray600, marginBottom: '5px' }}>ØKTBESKRIVELSE (Læringsfase + Clubspeed + Setting + Underlag + Område)</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: colors.primary, fontFamily: 'monospace' }}>
            L2-L3 — CS40-60 — S2 — flat matte — Full swing jern
          </div>
        </div>

        {/* Mål */}
        <div style={{ marginBottom: '20px' }}>
          <SubSectionTitle style={{ color: colors.primary, fontSize: '14px', marginBottom: '10px' }}>MAL FOR OKTEN</SubSectionTitle>
          <div style={{ display: 'flex', gap: '10px' }}>
            {session.mål.map((mål, i) => (
              <div key={i} style={{
                background: 'white',
                padding: '10px 15px',
                borderRadius: '20px',
                fontSize: '12px',
                border: `1px solid ${tokenColors.gray300}`
              }}>
                {mål}
              </div>
            ))}
          </div>
        </div>

        {/* Øvelser tabell */}
        <div style={{ marginBottom: '20px' }}>
          <SubSectionTitle style={{ color: colors.primary, fontSize: '14px', marginBottom: '10px' }}>OVELSER</SubSectionTitle>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: tokenColors.primaryLight, color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'center', width: '50px' }}>Nr</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Øvelse</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Beskrivelse</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Reps/Tid</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Pyramide</th>
              </tr>
            </thead>
            <tbody>
              {session.øvelser.map((øvelse, i) => (
                <tr key={i} style={{
                  background: i % 2 === 0 ? 'white' : colors.light,
                  borderBottom: `1px solid ${tokenColors.gray200}`
                }}>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{øvelse.nr}</td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{øvelse.navn}</td>
                  <td style={{ padding: '12px', color: tokenColors.gray600 }}>{øvelse.beskrivelse}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{øvelse.reps}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      background: øvelse.pyramide === 'Teknikk' ? tokenColors.primaryLight : tokenColors.info,
                      color: 'white',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '10px'
                    }}>
                      {øvelse.pyramide}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Utstyr og suksesskriterier */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div style={{
            background: colors.light,
            padding: '15px',
            borderRadius: '8px'
          }}>
            <CardTitle style={{ color: colors.primary, fontSize: '12px', marginBottom: '10px' }}>UTSTYR</CardTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {session.utstyr.map((item, i) => (
                <span key={i} style={{
                  background: 'white',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  border: `1px solid ${tokenColors.gray300}`
                }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div style={{
            background: colors.success,
            color: 'white',
            padding: '15px',
            borderRadius: '8px'
          }}>
            <CardTitle style={{ fontSize: '12px', marginBottom: '10px' }}>SUKSESSKRITERIUM</CardTitle>
            <div style={{ fontSize: '14px' }}>{session.suksesskriterier}</div>
          </div>
        </div>

        {/* Evaluering */}
        <div style={{
          marginTop: '20px',
          background: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: `2px solid ${tokenColors.primaryLight}`
        }}>
          <SubSectionTitle style={{ color: colors.primary, fontSize: '14px', marginBottom: '15px' }}>EVALUERING ETTER OKT</SubSectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {['Fokus', 'Kvalitet', 'Energi', 'Progresjon', 'Total'].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: tokenColors.gray600, marginBottom: '5px' }}>{item}</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: `2px solid ${tokenColors.primaryLight}`,
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}>
                      {n}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '15px' }}>
            <div style={{ fontSize: '11px', color: tokenColors.gray600, marginBottom: '5px' }}>Notater / Bruddpunkt observasjoner:</div>
            <div style={{
              background: colors.light,
              padding: '10px',
              borderRadius: '6px',
              minHeight: '60px',
              fontSize: '12px',
              color: tokenColors.gray500
            }}>
              Skriv notater her...
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ============== HOVEDKOMPONENT ==============
  return (
    <div style={{
      fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
      background: tokenColors.gray100,
      minHeight: '100vh'
    }}>
      {/* Header */}
      <header style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.dark} 100%)`,
        color: 'white',
        padding: '20px 30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                background: colors.secondary,
                padding: '8px 12px',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '12px'
              }}>
                TEAM NORWAY GOLF
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px'
              }}>
                TIER GOLF
              </div>
            </div>
            <PageTitle style={{ margin: '15px 0 5px', fontSize: '28px' }}>
              INDIVIDUELL UTVIKLINGSPLAN (IUP)
            </PageTitle>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>
              Sesong {player.season}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{player.name}</div>
            <div style={{
              display: 'flex',
              gap: '10px',
              marginTop: '10px',
              justifyContent: 'flex-end'
            }}>
              <span style={{
                background: colors.accent,
                color: colors.dark,
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                Nivå {player.level} ({player.levelRange})
              </span>
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                Snitt: {player.avgScore}
              </span>
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 12px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                HCP: {player.handicap}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={{
        background: 'white',
        padding: '10px 30px',
        borderBottom: `2px solid ${tokenColors.gray300}`,
        display: 'flex',
        gap: '5px'
      }}>
        {[
          { id: 'årsplan', label: 'Aarsplan', desc: 'Helhetsoversikt' },
          { id: 'periodeplan', label: 'Periodeplan', desc: 'Periodespesifikt' },
          { id: 'månedskalender', label: 'Maaned', desc: 'Kalendervisning' },
          { id: 'ukeplan', label: 'Ukeplan', desc: 'Ukentlig struktur' },
          { id: 'treningsøkt', label: 'Treningsokt', desc: 'Oktdetaljer' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            style={{
              padding: '12px 20px',
              border: 'none',
              borderRadius: '8px',
              background: activeView === item.id ? colors.primary : 'transparent',
              color: activeView === item.id ? 'white' : colors.primary,
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeView === item.id ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            <div>{item.label}</div>
            <div style={{ fontSize: '10px', opacity: 0.7 }}>{item.desc}</div>
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {activeView === 'årsplan' && <ÅrsplanView />}
        {activeView === 'periodeplan' && <PeriodeplanView />}
        {activeView === 'månedskalender' && <MånedskalenderView />}
        {activeView === 'ukeplan' && <UkeplanView />}
        {activeView === 'treningsøkt' && <TreningsøktView />}
      </main>

      {/* Footer */}
      <footer style={{
        background: colors.dark,
        color: 'white',
        padding: '15px 30px',
        marginTop: '30px',
        fontSize: '11px',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <div>
          <strong>TIER Golf</strong> | Metodikk basert på Team Norway Golf & WANG 6-årsplan
        </div>
        <div>
          Øktformel: <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '3px' }}>
            Læringsfase + Clubspeed + Setting + Underlag + Område
          </span>
        </div>
      </footer>
    </div>
  );
};

export default UtviklingsplanApp;

import React, { useState } from 'react';
import {
  AppShell,
  StatsGrid,
  StatsTrend,
  CalendarWeek,
  CardSimple,
  CardHeader,
  PageHeader,
} from '../../ui/raw-blocks';
import { GolfDashboardExample } from '../../components/shadcn/examples/GolfDashboardExample';
import { SectionTitle } from '../../components/typography';

/**
 * UI Lab - Component Showcase
 * Displays all raw UI components in their default state
 */
const UILabContainer = () => {
  const [showShadcn, setShowShadcn] = useState(true);

  // Sample data for components
  const sampleStats = [
    { id: '1', label: 'Økter', value: '12', change: 5, trend: 'up' },
    { id: '2', label: 'Timer', value: '18.5t', change: 2, trend: 'up' },
    { id: '3', label: 'Fullført', value: '85%', change: -3, trend: 'down' },
    { id: '4', label: 'Merker', value: '4', trend: 'neutral' },
  ];

  const sampleTrendData = [
    { date: '2025-01-01', value: 75 },
    { date: '2025-01-08', value: 78 },
    { date: '2025-01-15', value: 82 },
    { date: '2025-01-22', value: 85 },
  ];

  const sampleCalendarEvents = [
    {
      id: '1',
      title: 'Teknikk',
      time: '08:00',
      duration: 90,
      type: 'teknikk',
      status: 'completed',
    },
    {
      id: '2',
      title: 'Fysikk',
      time: '14:00',
      duration: 60,
      type: 'fysikk',
      status: 'upcoming',
    },
  ];

  return (
    <div style={styles.container}>
      <PageHeader
        title="UI Lab"
        subtitle="Komponentutstilling"
        helpText="Utviklerverktøy for testing og demonstrasjon av alle UI-komponenter i designsystemet. Se shadcn/ui komponenter og eksempler på implementasjon."
      />

      {/* Toggle between views */}
      <div style={styles.toggleContainer}>
        <button
          style={{
            ...styles.toggleButton,
            ...(showShadcn ? styles.toggleButtonActive : {}),
          }}
          onClick={() => setShowShadcn(true)}
        >
          shadcn/ui Golf Dashboard
        </button>
        <button
          style={{
            ...styles.toggleButton,
            ...(!showShadcn ? styles.toggleButtonActive : {}),
          }}
          onClick={() => setShowShadcn(false)}
        >
          Raw Blocks
        </button>
      </div>

      {/* shadcn Dashboard Example */}
      {showShadcn && <GolfDashboardExample />}

      {/* Original Raw Blocks */}
      {!showShadcn && <div style={styles.content}>
        {/* Section: StatsGrid */}
        <section style={styles.section}>
          <SectionTitle style={styles.sectionTitle}>StatsGrid</SectionTitle>
          <StatsGrid stats={sampleStats} showTrend={true} />
        </section>

        {/* Section: StatsGrid Compact */}
        <section style={styles.section}>
          <SectionTitle style={styles.sectionTitle}>StatsGrid (Compact)</SectionTitle>
          <StatsGrid stats={sampleStats} compact={true} columns={4} />
        </section>

        {/* Section: StatsTrend */}
        <section style={styles.section}>
          <SectionTitle style={styles.sectionTitle}>StatsTrend</SectionTitle>
          <StatsTrend
            title="Utviklingskurve"
            data={sampleTrendData}
            color="var(--accent)"
          />
        </section>

        {/* Section: CalendarWeek */}
        <section style={styles.section}>
          <SectionTitle style={styles.sectionTitle}>CalendarWeek</SectionTitle>
          <CalendarWeek
            weekNumber={1}
            year={2025}
            events={sampleCalendarEvents}
          />
        </section>

        {/* Section: CardSimple */}
        <section style={styles.section}>
          <SectionTitle style={styles.sectionTitle}>CardSimple</SectionTitle>
          <div style={styles.cardGrid}>
            <CardSimple
              title="Enkel Card"
              subtitle="Med ikon og subtitle"
              icon={<span style={{ fontSize: '24px' }}>[chart]</span>}
            />
            <CardSimple
              title="Uten Ikon"
              subtitle="Minimal variant"
            />
            <CardSimple
              title="Med Badge"
              badge="Nytt"
            />
          </div>
        </section>

        {/* Section: CardHeader */}
        <section style={styles.section}>
          <SectionTitle style={styles.sectionTitle}>CardHeader</SectionTitle>
          <div style={styles.card}>
            <CardHeader
              title="Card med Header"
              icon={<span style={{ fontSize: '20px' }}>[target]</span>}
              action={{
                label: 'Se alle',
                onClick: () => console.log('Action clicked'),
              }}
            />
            <div style={styles.cardContent}>
              <p style={styles.cardText}>Dette er innhold under headeren</p>
            </div>
          </div>
        </section>

        {/* Section: PageHeader */}
        <section style={styles.section}>
          <SectionTitle style={styles.sectionTitle}>PageHeader</SectionTitle>
          <PageHeader
            title="Side Tittel"
            subtitle="Med undertittel og tilbake-knapp"
            onBackClick={() => console.log('Back clicked')}
          />
        </section>

        {/* Section: PageHeader with Action */}
        <section style={styles.section}>
          <SectionTitle style={styles.sectionTitle}>PageHeader (Med Action)</SectionTitle>
          <PageHeader
            title="Side med Handling"
            action={{
              label: 'Ny',
              onClick: () => console.log('Action clicked'),
              icon: <span>+</span>,
            }}
          />
        </section>
      </div>}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: 'var(--background-default)',
  },
  toggleContainer: {
    display: 'flex',
    gap: '8px',
    padding: '16px 24px',
    backgroundColor: 'var(--background-white)',
    borderBottom: '1px solid var(--border-subtle)',
  },
  toggleButton: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--background-default)',
    color: 'var(--text-secondary)',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  toggleButtonActive: {
    backgroundColor: 'var(--tier-navy)',
    color: 'white',
    borderColor: 'var(--tier-navy)',
  },
  content: {
    maxWidth: '1536px',
    margin: '0 auto',
    padding: 'var(--spacing-6)',
  },
  section: {
    marginBottom: 'var(--spacing-12)',
  },
  sectionTitle: {
    fontSize: 'var(--font-size-title2)',
    fontWeight: 600,
    color: 'var(--text-primary)',
    marginBottom: 'var(--spacing-4)',
    paddingBottom: 'var(--spacing-2)',
    borderBottom: '2px solid var(--border-subtle)',
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: 'var(--spacing-4)',
  },
  card: {
    backgroundColor: 'var(--background-white)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-card)',
    overflow: 'hidden',
  },
  cardContent: {
    padding: 'var(--spacing-4)',
  },
  cardText: {
    fontSize: 'var(--font-size-body)',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
  },
};

export default UILabContainer;

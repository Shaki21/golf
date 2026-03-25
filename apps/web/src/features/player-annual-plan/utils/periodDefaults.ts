/**
 * Period Defaults and Colors
 * Standard values for period types (E/G/S/T)
 */

export const PERIOD_COLORS = {
  E: {
    primary: '#10B981',
    light: '#D1FAE5',
    dark: '#047857',
    text: '#065F46',
  },
  G: {
    primary: '#3B82F6',
    light: '#DBEAFE',
    dark: '#1E40AF',
    text: '#1E3A8A',
  },
  S: {
    primary: '#F59E0B',
    light: '#FEF3C7',
    dark: '#D97706',
    text: '#92400E',
  },
  T: {
    primary: '#EF4444',
    light: '#FEE2E2',
    dark: '#DC2626',
    text: '#991B1B',
  },
};

export const PERIOD_LABELS = {
  E: 'Evaluering og testperiode',
  G: 'Grunnperiode',
  S: 'Spesialiseringsperiode',
  T: 'Turneringsperiode',
};

export const PERIOD_DESCRIPTIONS = {
  E: 'Evaluering av nåværende nivå og testing av fysisk og teknisk grunnlag',
  G: 'Bygge grunnleggende treningsfundament og øke treningsvolum',
  S: 'Golf-spesifikk trening og fokusert forberedelse til konkurransesesong',
  T: 'Konkurransesesong med vedlikeholdstrening og toppprestasjoner',
};

export const PERIOD_DEFAULTS = {
  E: {
    name: 'Evaluering og testperiode',
    description: 'Evaluering av nåværende nivå',
    weeklyFrequency: 3,
    defaultWeeks: 6,
    goals: ['Baseline testing', 'Nivåevaluering', 'Identifisere styrker og svakheter'],
  },
  G: {
    name: 'Grunnperiode',
    description: 'Bygge treningsfundament',
    weeklyFrequency: 5,
    defaultWeeks: 16,
    goals: ['Øke treningsvolum', 'Teknisk utvikling', 'Bygge fysisk kapasitet'],
  },
  S: {
    name: 'Spesialiseringsperiode',
    description: 'Golf-spesifikk forberedelse',
    weeklyFrequency: 4,
    defaultWeeks: 10,
    goals: ['Pre-sesong forberedelse', 'Short game fokus', 'Mental trening'],
  },
  T: {
    name: 'Turneringsperiode',
    description: 'Konkurransesesong',
    weeklyFrequency: 4,
    defaultWeeks: 16,
    goals: ['Toppprestasjoner', 'Vedlikeholde form', 'Turnering analyse'],
  },
};

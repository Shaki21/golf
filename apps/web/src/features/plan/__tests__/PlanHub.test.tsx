/**
 * PlanHub Component Tests
 * Tests for the decision-first Plan dashboard UI
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PlanHub from '../../hub-pages/PlanHub';

// Mock the usePlanDashboard hook
jest.mock('../hooks/usePlanDashboard', () => ({
  usePlanDashboard: jest.fn(),
}));

// Mock AuthContext
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
    },
  }),
}));

// Mock the plan components to simplify testing
jest.mock('../components', () => ({
  PlanHeroDecisionCard: ({ data, userName }: { data: unknown; userName: string }) => (
    <div data-testid="hero-decision-card">
      <span data-testid="user-name">{userName}</span>
      <span data-testid="primary-action-type">{(data as { primaryAction: { type: string } }).primaryAction?.type}</span>
    </div>
  ),
  GoalsControlPanel: ({ goals }: { goals: unknown[] }) => (
    <div data-testid="goals-panel">
      <span data-testid="goals-count">{goals?.length || 0}</span>
    </div>
  ),
  LoadAndReadinessCard: ({ loadStats, attentionItems, missingLogs }: {
    loadStats: { planned: number; completed: number };
    attentionItems: unknown[];
    missingLogs: number;
  }) => (
    <div data-testid="load-readiness-card">
      <span data-testid="planned">{loadStats?.planned}</span>
      <span data-testid="completed">{loadStats?.completed}</span>
      <span data-testid="attention-count">{attentionItems?.length || 0}</span>
      <span data-testid="missing-logs">{missingLogs}</span>
    </div>
  ),
  OperationsSection: () => <div data-testid="operations-section">Operations</div>,
}));

// Mock PageHeader and PageContainer
jest.mock('../../../ui/raw-blocks/PageHeader.raw', () => ({
  __esModule: true,
  default: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <header data-testid="page-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  ),
}));

jest.mock('../../../ui/raw-blocks/PageContainer.raw', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="page-container">{children}</div>
  ),
}));

import { usePlanDashboard } from '../hooks/usePlanDashboard';

const mockUsePlanDashboard = usePlanDashboard as jest.MockedFunction<typeof usePlanDashboard>;

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('PlanHub', () => {
  const mockDashboardData = {
    state: 'session_upcoming' as const,
    primaryAction: {
      type: 'start_session' as const,
      label: 'See Next Session',
      href: '/trening/okter/1',
      context: 'Today at 14:00',
    },
    nextSession: {
      id: '1',
      title: 'Technique Training',
      date: new Date('2024-01-15T14:00:00Z'),
      time: '14:00',
      duration: 60,
      focus: 'Putting',
      type: 'coaching' as const,
      confirmed: true,
    },
    goals: [
      {
        id: '1',
        title: 'Improve Putting',
        outcome: '85% hole rate',
        leadingIndicator: {
          label: 'Sessions',
          target: 3,
          current: 1,
          unit: 'sessions',
        },
        status: 'at_risk' as const,
        statusReason: 'Behind schedule',
      },
    ],
    loadStats: {
      planned: 8,
      completed: 5,
      missingPurpose: 2,
    },
    upcomingTournament: {
      id: '1',
      name: 'NGF Tour',
      date: new Date('2024-01-25T00:00:00Z'),
      daysUntil: 10,
      hasPlan: false,
      location: 'Miklagard',
    },
    attentionItems: [
      {
        type: 'at_risk_goal' as const,
        message: 'Goal at risk',
        severity: 'warning' as const,
      },
    ],
    missingLogs: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    it('displays loading skeletons while loading', () => {
      mockUsePlanDashboard.mockReturnValue({
        data: mockDashboardData,
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      });

      renderWithRouter(<PlanHub />);

      // Check for skeleton elements (animate-pulse class)
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      mockUsePlanDashboard.mockReturnValue({
        data: mockDashboardData,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });
    });

    it('renders page header with correct title', () => {
      renderWithRouter(<PlanHub />);

      expect(screen.getByText('Plan')).toBeInTheDocument();
    });

    it('renders hero decision card with user name', () => {
      renderWithRouter(<PlanHub />);

      expect(screen.getByTestId('hero-decision-card')).toBeInTheDocument();
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test');
    });

    it('renders goals panel with goals count', () => {
      renderWithRouter(<PlanHub />);

      expect(screen.getByTestId('goals-panel')).toBeInTheDocument();
      expect(screen.getByTestId('goals-count')).toHaveTextContent('1');
    });

    it('renders load and readiness card with stats', () => {
      renderWithRouter(<PlanHub />);

      expect(screen.getByTestId('load-readiness-card')).toBeInTheDocument();
      expect(screen.getByTestId('planned')).toHaveTextContent('8');
      expect(screen.getByTestId('completed')).toHaveTextContent('5');
    });

    it('renders operations section', () => {
      renderWithRouter(<PlanHub />);

      expect(screen.getByTestId('operations-section')).toBeInTheDocument();
    });

    it('displays correct primary action type', () => {
      renderWithRouter(<PlanHub />);

      expect(screen.getByTestId('primary-action-type')).toHaveTextContent('start_session');
    });
  });

  describe('Error State', () => {
    it('shows error banner when there is an error but has fallback data', () => {
      mockUsePlanDashboard.mockReturnValue({
        data: mockDashboardData,
        isLoading: false,
        error: 'Network error',
        refetch: jest.fn(),
      });

      renderWithRouter(<PlanHub />);

      expect(screen.getByText(/Kunne ikke laste live data/i)).toBeInTheDocument();
    });

    it('shows retry button in error banner', () => {
      mockUsePlanDashboard.mockReturnValue({
        data: mockDashboardData,
        isLoading: false,
        error: 'Network error',
        refetch: jest.fn(),
      });

      renderWithRouter(<PlanHub />);

      expect(screen.getByText(/Prøv igjen/i)).toBeInTheDocument();
    });
  });

  describe('Attention Items', () => {
    it('displays attention count from data', () => {
      mockUsePlanDashboard.mockReturnValue({
        data: mockDashboardData,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      renderWithRouter(<PlanHub />);

      expect(screen.getByTestId('attention-count')).toHaveTextContent('1');
    });

    it('displays missing logs count', () => {
      mockUsePlanDashboard.mockReturnValue({
        data: { ...mockDashboardData, missingLogs: 3 },
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      renderWithRouter(<PlanHub />);

      expect(screen.getByTestId('missing-logs')).toHaveTextContent('3');
    });
  });

  describe('Information Architecture', () => {
    beforeEach(() => {
      mockUsePlanDashboard.mockReturnValue({
        data: mockDashboardData,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });
    });

    it('renders Layer 1 (Decision Layer) with hero card', () => {
      renderWithRouter(<PlanHub />);

      const layer1 = screen.getByLabelText('Neste handling');
      expect(layer1).toBeInTheDocument();
      expect(layer1.querySelector('[data-testid="hero-decision-card"]')).toBeInTheDocument();
    });

    it('renders Layer 2 (Control & Progress) with goals and load cards', () => {
      renderWithRouter(<PlanHub />);

      const layer2 = screen.getByLabelText('Mål og status');
      expect(layer2).toBeInTheDocument();
      expect(layer2.querySelector('[data-testid="goals-panel"]')).toBeInTheDocument();
      expect(layer2.querySelector('[data-testid="load-readiness-card"]')).toBeInTheDocument();
    });

    it('renders Layer 3 (Operations) with operations section', () => {
      renderWithRouter(<PlanHub />);

      const layer3 = screen.getByLabelText('Verktøy og administrasjon');
      expect(layer3).toBeInTheDocument();
      expect(layer3.querySelector('[data-testid="operations-section"]')).toBeInTheDocument();
    });
  });

  describe('ARIA Accessibility', () => {
    beforeEach(() => {
      mockUsePlanDashboard.mockReturnValue({
        data: mockDashboardData,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });
    });

    it('has labeled sections for screen readers', () => {
      renderWithRouter(<PlanHub />);

      expect(screen.getByLabelText('Neste handling')).toBeInTheDocument();
      expect(screen.getByLabelText('Mål og status')).toBeInTheDocument();
      expect(screen.getByLabelText('Verktøy og administrasjon')).toBeInTheDocument();
    });
  });
});

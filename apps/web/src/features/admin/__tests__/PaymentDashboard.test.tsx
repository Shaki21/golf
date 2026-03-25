import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import PaymentDashboard from '../PaymentDashboard';

// Mock fetch
global.fetch = jest.fn();

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock auth context with admin user
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'admin-id',
      email: 'admin@iup-golf.com',
      role: { name: 'admin' },
    },
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('PaymentDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    localStorageMock.clear();
    localStorageMock.setItem('accessToken', 'test-token-123');
  });

  describe('Loading State', () => {
    it('displays loading spinner initially', () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

      renderWithRouter(<PaymentDashboard />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Overview Tab', () => {
    const mockStats = {
      revenue: {
        mrr: 1250000,
        arr: 15000000,
        totalRevenue: 25000000,
        revenueGrowth: 12.5,
      },
      subscriptions: {
        total: 100,
        active: 84,
        trialing: 10,
        canceled: 6,
        churnRate: 4.5,
      },
      customers: {
        total: 120,
        newThisMonth: 15,
        averageLifetimeValue: 450000,
      },
      paymentMethods: {
        total: 95,
        byType: {
          card: 85,
          bank: 10,
        },
      },
    };

    const mockTransactions = [
      {
        id: 'tx_1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        amount: 14900,
        currency: 'NOK',
        status: 'succeeded',
        planType: 'Player Premium',
        createdAt: '2024-01-15T10:30:00Z',
      },
    ];

    const mockWebhooks = [
      {
        id: 'evt_1',
        eventType: 'invoice.paid',
        processed: true,
        error: null,
        createdAt: '2024-01-15T10:30:00Z',
      },
    ];

    const mockFailedPayments: any[] = [];

    beforeEach(() => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockStats }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockTransactions }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockWebhooks }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockFailedPayments }),
        });
    });

    it('displays MRR metric', async () => {
      renderWithRouter(<PaymentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Monthly Recurring Revenue/i)).toBeInTheDocument();
        expect(screen.getByText(/12 500,00/)).toBeInTheDocument();
      });
    });

    it('displays ARR metric', async () => {
      renderWithRouter(<PaymentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/ARR:/)).toBeInTheDocument();
        expect(screen.getByText(/150 000,00/)).toBeInTheDocument();
      });
    });

    it('displays total customers', async () => {
      renderWithRouter(<PaymentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Total Customers/i)).toBeInTheDocument();
        expect(screen.getByText('120')).toBeInTheDocument();
      });
    });

    it('displays new customers this month', async () => {
      renderWithRouter(<PaymentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/\+15 this month/i)).toBeInTheDocument();
      });
    });

    it('displays active subscriptions', async () => {
      renderWithRouter(<PaymentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Active Subscriptions/i)).toBeInTheDocument();
        const elements84 = screen.queryAllByText('84');
        expect(elements84.length).toBeGreaterThan(0);
      });
    });

    it('displays trialing and canceled subscriptions', async () => {
      renderWithRouter(<PaymentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/10 trialing, 6 canceled/i)).toBeInTheDocument();
      });
    });

    it('displays churn rate', async () => {
      renderWithRouter(<PaymentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/4\.50% churn/i)).toBeInTheDocument();
      });
    });

    it('displays subscription breakdown', async () => {
      renderWithRouter(<PaymentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Subscription Overview/i)).toBeInTheDocument();
        const activeElements = screen.getAllByText('Active');
        expect(activeElements.length).toBeGreaterThan(0);
        expect(screen.getByText('Trialing')).toBeInTheDocument();
        expect(screen.getByText('Canceled')).toBeInTheDocument();
      });
    });

    it('displays recent transactions preview', async () => {
      renderWithRouter(<PaymentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Recent Transactions/i)).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText(/Player Premium/i)).toBeInTheDocument();
      });
    });

    it('displays webhook events preview', async () => {
      renderWithRouter(<PaymentDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Webhook Events/i)).toBeInTheDocument();
        expect(screen.getByText('invoice.paid')).toBeInTheDocument();
      });
    });
  });

  describe('Transactions Tab', () => {
    const mockStats = {
      revenue: { mrr: 100000, arr: 1200000, totalRevenue: 2000000, revenueGrowth: 5 },
      subscriptions: { total: 50, active: 40, trialing: 5, canceled: 5, churnRate: 3 },
      customers: { total: 60, newThisMonth: 10, averageLifetimeValue: 300000 },
      paymentMethods: { total: 50, byType: { card: 50 } },
    };

    const mockTransactions = [
      {
        id: 'tx_1',
        customerName: 'John Doe',
        customerEmail: 'john@example.com',
        amount: 14900,
        currency: 'NOK',
        status: 'succeeded',
        planType: 'Player Premium',
        createdAt: '2024-01-15T10:30:00Z',
      },
      {
        id: 'tx_2',
        customerName: 'Jane Smith',
        customerEmail: 'jane@example.com',
        amount: 29900,
        currency: 'NOK',
        status: 'pending',
        planType: 'Player Elite',
        createdAt: '2024-01-14T15:20:00Z',
      },
    ];

    beforeEach(() => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockStats }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockTransactions }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        });
    });

    it('switches to transactions tab', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PaymentDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
      });

      const transactionsTab = screen.getByText('Transactions');
      await user.click(transactionsTab);

      await waitFor(() => {
        expect(screen.getByText(/All Transactions/i)).toBeInTheDocument();
      });
    });

    it('displays transaction customer names and emails', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PaymentDashboard />);

      const transactionsTab = await screen.findByText('Transactions');
      await user.click(transactionsTab);

      await waitFor(() => {
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      });
    });

    it('displays transaction amounts', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PaymentDashboard />);

      const transactionsTab = await screen.findByText('Transactions');
      await user.click(transactionsTab);

      await waitFor(() => {
        expect(screen.getByText(/149,00/)).toBeInTheDocument();
        expect(screen.getByText(/299,00/)).toBeInTheDocument();
      });
    });

    it('displays transaction status badges', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PaymentDashboard />);

      const transactionsTab = await screen.findByText('Transactions');
      await user.click(transactionsTab);

      await waitFor(() => {
        expect(screen.getByText('SUCCEEDED')).toBeInTheDocument();
        expect(screen.getByText('PENDING')).toBeInTheDocument();
      });
    });
  });

  describe('Webhooks Tab', () => {
    const mockStats = {
      revenue: { mrr: 100000, arr: 1200000, totalRevenue: 2000000, revenueGrowth: 5 },
      subscriptions: { total: 50, active: 40, trialing: 5, canceled: 5, churnRate: 3 },
      customers: { total: 60, newThisMonth: 10, averageLifetimeValue: 300000 },
      paymentMethods: { total: 50, byType: { card: 50 } },
    };

    const mockWebhooks = [
      {
        id: 'evt_1',
        eventType: 'invoice.paid',
        processed: true,
        error: null,
        createdAt: '2024-01-15T10:30:00Z',
      },
      {
        id: 'evt_2',
        eventType: 'invoice.payment_failed',
        processed: false,
        error: 'Signature verification failed',
        createdAt: '2024-01-15T09:00:00Z',
      },
    ];

    beforeEach(() => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockStats }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockWebhooks }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        });
    });

    it('displays webhook event log', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PaymentDashboard />);

      const webhooksTab = await screen.findByText('Webhooks');
      await user.click(webhooksTab);

      await waitFor(() => {
        expect(screen.getByText(/Webhook Event Log/i)).toBeInTheDocument();
        expect(screen.getByText('invoice.paid')).toBeInTheDocument();
        expect(screen.getByText('invoice.payment_failed')).toBeInTheDocument();
      });
    });

    it('shows webhook processing status', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PaymentDashboard />);

      const webhooksTab = await screen.findByText('Webhooks');
      await user.click(webhooksTab);

      await waitFor(() => {
        expect(screen.getByText('Processed')).toBeInTheDocument();
        expect(screen.getByText('Failed')).toBeInTheDocument();
      });
    });

    it('displays error messages for failed events', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PaymentDashboard />);

      const webhooksTab = await screen.findByText('Webhooks');
      await user.click(webhooksTab);

      await waitFor(() => {
        expect(screen.getByText(/Signature verification failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Failed Payments Tab', () => {
    const mockStats = {
      revenue: { mrr: 100000, arr: 1200000, totalRevenue: 2000000, revenueGrowth: 5 },
      subscriptions: { total: 50, active: 40, trialing: 5, canceled: 5, churnRate: 3 },
      customers: { total: 60, newThisMonth: 10, averageLifetimeValue: 300000 },
      paymentMethods: { total: 50, byType: { card: 50 } },
    };

    const mockFailedPayments = [
      {
        id: 'fp_1',
        customerName: 'Failed Customer',
        customerEmail: 'failed@example.com',
        amount: 14900,
        currency: 'NOK',
        failureReason: 'card_declined',
        attemptedAt: '2024-01-15T10:30:00Z',
      },
      {
        id: 'fp_2',
        customerName: 'Another Failed',
        customerEmail: 'another@example.com',
        amount: 29900,
        currency: 'NOK',
        failureReason: 'insufficient_funds',
        attemptedAt: '2024-01-14T15:20:00Z',
      },
    ];

    beforeEach(() => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockStats }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockFailedPayments }),
        });
    });

    it('displays failed payment list', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PaymentDashboard />);

      const failedTab = await screen.findByText('Failed Payments');
      await user.click(failedTab);

      await waitFor(() => {
        expect(screen.getByText('failed@example.com')).toBeInTheDocument();
        expect(screen.getByText('another@example.com')).toBeInTheDocument();
      });
    });

    it('shows failure reasons', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PaymentDashboard />);

      const failedTab = await screen.findByText('Failed Payments');
      await user.click(failedTab);

      await waitFor(() => {
        expect(screen.getByText('card_declined')).toBeInTheDocument();
        expect(screen.getByText('insufficient_funds')).toBeInTheDocument();
      });
    });

    it('displays failed payment count badge', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PaymentDashboard />);

      await waitFor(() => {
        const failedTab = screen.getByText('Failed Payments');
        expect(failedTab).toBeInTheDocument();
      });

      const user2 = userEvent.setup();
      const failedTab = screen.getByText('Failed Payments');
      await user2.click(failedTab);

      await waitFor(() => {
        expect(screen.getByText(/2 Failed Payments/i)).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    const mockStats = {
      revenue: { mrr: 100000, arr: 1200000, totalRevenue: 2000000, revenueGrowth: 5 },
      subscriptions: { total: 50, active: 40, trialing: 5, canceled: 5, churnRate: 3 },
      customers: { total: 60, newThisMonth: 10, averageLifetimeValue: 300000 },
      paymentMethods: { total: 50, byType: { card: 50 } },
    };

    beforeEach(() => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockStats }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        });
    });

    it('fetches from all admin endpoints on mount', async () => {
      renderWithRouter(<PaymentDashboard />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/admin/payment-stats'),
          expect.objectContaining({
            headers: { Authorization: 'Bearer test-token-123' },
          })
        );
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/admin/recent-transactions'),
          expect.any(Object)
        );
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/admin/webhook-events'),
          expect.any(Object)
        );
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/admin/failed-payments'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Tab Navigation', () => {
    const mockStats = {
      revenue: { mrr: 100000, arr: 1200000, totalRevenue: 2000000, revenueGrowth: 5 },
      subscriptions: { total: 50, active: 40, trialing: 5, canceled: 5, churnRate: 3 },
      customers: { total: 60, newThisMonth: 10, averageLifetimeValue: 300000 },
      paymentMethods: { total: 50, byType: { card: 50 } },
    };

    beforeEach(() => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockStats }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        });
    });

    it('displays all four tabs', async () => {
      renderWithRouter(<PaymentDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Transactions')).toBeInTheDocument();
        expect(screen.getByText('Webhooks')).toBeInTheDocument();
        expect(screen.getByText('Failed Payments')).toBeInTheDocument();
      });
    });

    it('highlights active tab', async () => {
      renderWithRouter(<PaymentDashboard />);

      await waitFor(() => {
        const overviewTab = screen.getByText('Overview');
        expect(overviewTab).toHaveClass('border-tier-navy');
      });
    });

    it('changes active tab on click', async () => {
      const user = userEvent.setup();
      renderWithRouter(<PaymentDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
      });

      const transactionsTab = screen.getByText('Transactions');
      await user.click(transactionsTab);

      expect(transactionsTab).toHaveClass('border-tier-navy');
    });
  });
});

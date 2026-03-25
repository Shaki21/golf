import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import SubscriptionManagement from '../SubscriptionManagement';

// Mock fetch
global.fetch = jest.fn();

// Mock window.confirm
global.confirm = jest.fn();

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

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('SubscriptionManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    (global.confirm as jest.Mock).mockClear();
    localStorageMock.clear();
    localStorageMock.setItem('accessToken', 'test-token-123');
  });

  describe('Loading State', () => {
    it('displays loading spinner initially', () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

      renderWithRouter(<SubscriptionManagement />);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('No Subscription State', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        });
    });

    it('displays no subscription message', async () => {
      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        expect(screen.getByText('No Active Subscription')).toBeInTheDocument();
      });
    });

    it('shows view plans button', async () => {
      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        expect(screen.getByText('View Plans')).toBeInTheDocument();
      });
    });
  });

  describe('Current Subscription Display', () => {
    const mockSubscription = {
      id: 'sub_123',
      planType: 'premium',
      billingInterval: 'monthly',
      status: 'active',
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2024-02-01T00:00:00Z',
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: 'sub_stripe_123',
    };

    const mockPaymentMethods = [
      {
        id: 'pm_123',
        type: 'card',
        brand: 'Visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
      },
    ];

    beforeEach(() => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [mockSubscription] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockPaymentMethods }),
        });
    });

    it('displays current plan name', async () => {
      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        expect(screen.getByText(/Current Plan: Premium/i)).toBeInTheDocument();
      });
    });

    it('displays billing interval', async () => {
      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        expect(screen.getByText(/Monthly billing/i)).toBeInTheDocument();
      });
    });

    it('displays current price', async () => {
      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        expect(screen.getByText('149 NOK')).toBeInTheDocument();
      });
    });

    it('shows active status', async () => {
      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });
    });

    it('displays next billing date', async () => {
      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        expect(screen.getByText(/Next billing date/i)).toBeInTheDocument();
      });
    });

    it('displays payment method', async () => {
      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        expect(screen.getByText(/Visa ending in 4242/i)).toBeInTheDocument();
      });
    });

    it('shows change plan button', async () => {
      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        expect(screen.getByText('Change Plan')).toBeInTheDocument();
      });
    });

    it('shows update payment button', async () => {
      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        expect(screen.getByText('Update Payment')).toBeInTheDocument();
      });
    });

    it('shows cancel plan button', async () => {
      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        expect(screen.getByText('Cancel Plan')).toBeInTheDocument();
      });
    });
  });

  describe('Yearly Subscription', () => {
    const mockYearlySubscription = {
      id: 'sub_456',
      planType: 'elite',
      billingInterval: 'yearly',
      status: 'active',
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2025-01-01T00:00:00Z',
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: 'sub_stripe_456',
    };

    beforeEach(() => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [mockYearlySubscription] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        });
    });

    it('displays annual billing', async () => {
      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        expect(screen.getByText(/Annual billing/i)).toBeInTheDocument();
      });
    });

    it('displays yearly price', async () => {
      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        expect(screen.getByText('2999 NOK')).toBeInTheDocument();
        expect(screen.getByText(/per year/i)).toBeInTheDocument();
      });
    });
  });

  describe('Subscription Cancellation', () => {
    const mockActiveSubscription = {
      id: 'sub_123',
      planType: 'premium',
      billingInterval: 'monthly',
      status: 'active',
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2024-02-01T00:00:00Z',
      cancelAtPeriodEnd: false,
      stripeSubscriptionId: 'sub_stripe_123',
    };

    beforeEach(() => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [mockActiveSubscription] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        });
    });

    it('shows confirmation dialog when canceling', async () => {
      const user = userEvent.setup();
      (global.confirm as jest.Mock).mockReturnValue(false);

      renderWithRouter(<SubscriptionManagement />);

      const cancelButton = await screen.findByText('Cancel Plan');
      await user.click(cancelButton);

      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('Are you sure you want to cancel')
      );
    });

    it('cancels subscription when confirmed', async () => {
      const user = userEvent.setup();
      (global.confirm as jest.Mock).mockReturnValue(true);

      const canceledSubscription = {
        ...mockActiveSubscription,
        cancelAtPeriodEnd: true,
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [mockActiveSubscription] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [canceledSubscription] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        });

      renderWithRouter(<SubscriptionManagement />);

      const cancelButton = await screen.findByText('Cancel Plan');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/payments/subscriptions/sub_123/cancel'),
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    it('does not cancel if user declines confirmation', async () => {
      const user = userEvent.setup();
      (global.confirm as jest.Mock).mockReturnValue(false);

      renderWithRouter(<SubscriptionManagement />);

      const cancelButton = await screen.findByText('Cancel Plan');
      await user.click(cancelButton);

      // Should not make the cancel API call
      const cancelCalls = (global.fetch as jest.Mock).mock.calls.filter((call) =>
        call[0].includes('/cancel')
      );
      expect(cancelCalls.length).toBe(0);
    });
  });

  describe('Canceled Subscription', () => {
    const mockCanceledSubscription = {
      id: 'sub_123',
      planType: 'premium',
      billingInterval: 'monthly',
      status: 'active',
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2024-02-01T00:00:00Z',
      cancelAtPeriodEnd: true,
      stripeSubscriptionId: 'sub_stripe_123',
    };

    beforeEach(() => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [mockCanceledSubscription] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        });
    });

    it('displays cancellation notice', async () => {
      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        expect(screen.getByText(/Your subscription will be cancelled/i)).toBeInTheDocument();
      });
    });

    it('shows access until date', async () => {
      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        expect(screen.getByText(/Access until/i)).toBeInTheDocument();
      });
    });

    it('disables change plan button', async () => {
      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        const changePlanButton = screen.getByText('Change Plan');
        expect(changePlanButton).toBeDisabled();
      });
    });

    it('hides cancel plan button', async () => {
      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        expect(screen.queryByText('Cancel Plan')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('displays no subscription message on fetch failure', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        expect(screen.getByText('No Active Subscription')).toBeInTheDocument();
      });
    });

    it('handles cancellation errors', async () => {
      const user = userEvent.setup();
      (global.confirm as jest.Mock).mockReturnValue(true);

      const mockSubscription = {
        id: 'sub_123',
        planType: 'premium',
        billingInterval: 'monthly',
        status: 'active',
        currentPeriodStart: '2024-01-01T00:00:00Z',
        currentPeriodEnd: '2024-02-01T00:00:00Z',
        cancelAtPeriodEnd: false,
        stripeSubscriptionId: 'sub_stripe_123',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [mockSubscription] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({ message: 'Cancellation failed' }),
        });

      renderWithRouter(<SubscriptionManagement />);

      const cancelButton = await screen.findByText('Cancel Plan');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        });
    });

    it('fetches subscription on mount', async () => {
      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/payments/subscriptions'),
          expect.objectContaining({
            headers: {
              Authorization: 'Bearer test-token-123',
            },
          })
        );
      });
    });

    it('fetches payment methods on mount', async () => {
      renderWithRouter(<SubscriptionManagement />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/payments/methods'),
          expect.any(Object)
        );
      });
    });
  });
});

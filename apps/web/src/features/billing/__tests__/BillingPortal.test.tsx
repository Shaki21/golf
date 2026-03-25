import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import BillingPortal from '../BillingPortal';

// Mock fetch globally
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

// Mock auth context
jest.mock('../../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
    },
  }),
}));

// Helper to wrap component with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('BillingPortal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
    localStorageMock.clear();
    localStorageMock.setItem('accessToken', 'test-token-123');
  });

  describe('Loading State', () => {
    it('displays loading spinner while fetching data', () => {
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

      renderWithRouter(<BillingPortal />);

      // Component shows spinner with specific classes
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Subscription Overview Tab', () => {
    const mockSubscription = {
      id: 'sub_123',
      planType: 'player_premium',
      billingInterval: 'monthly',
      status: 'active',
      currentPeriodStart: '2024-01-01T00:00:00Z',
      currentPeriodEnd: '2024-02-01T00:00:00Z',
      cancelAtPeriodEnd: false,
    };

    const mockPaymentMethods = [
      {
        id: 'pm_123',
        type: 'card',
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
      },
    ];

    const mockInvoices = [
      {
        id: 'inv_123',
        invoiceNumber: 'INV-001',
        amount: 149.0,
        currency: 'nok',
        status: 'paid',
        dueDate: '2024-01-15T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
      },
    ];

    beforeEach(() => {
      (global.fetch as jest.Mock)
        // First call: /payments/subscriptions
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [mockSubscription] }),
        })
        // Second call: /payments/methods
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockPaymentMethods }),
        })
        // Third call: /payments/invoices
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockInvoices }),
        });
    });

    it('renders subscription overview tab by default', async () => {
      renderWithRouter(<BillingPortal />);

      await waitFor(() => {
        expect(screen.getByText(/PLAYER_PREMIUM/i)).toBeInTheDocument();
      });
    });

    it('displays current subscription details', async () => {
      renderWithRouter(<BillingPortal />);

      await waitFor(() => {
        expect(screen.getByText(/PLAYER_PREMIUM/i)).toBeInTheDocument();
        expect(screen.getByText(/Monthly/i)).toBeInTheDocument();
        expect(screen.getByText('ACTIVE')).toBeInTheDocument();
      });
    });

    it('displays payment methods count', async () => {
      renderWithRouter(<BillingPortal />);

      await waitFor(() => {
        expect(screen.getByText(/1 saved/i)).toBeInTheDocument();
      });
    });

    it('displays invoices count', async () => {
      renderWithRouter(<BillingPortal />);

      await waitFor(() => {
        expect(screen.getByText(/1 total/i)).toBeInTheDocument();
      });
    });

    it('shows renew date', async () => {
      renderWithRouter(<BillingPortal />);

      await waitFor(() => {
        expect(screen.getByText(/Renews on/i)).toBeInTheDocument();
      });
    });

    it('shows manage subscription button', async () => {
      renderWithRouter(<BillingPortal />);

      await waitFor(() => {
        expect(screen.getByText('Manage Subscription')).toBeInTheDocument();
      });
    });

    it('shows change plan button', async () => {
      renderWithRouter(<BillingPortal />);

      await waitFor(() => {
        expect(screen.getByText('Change Plan')).toBeInTheDocument();
      });
    });
  });

  describe('Payment Methods Tab', () => {
    const mockPaymentMethods = [
      {
        id: 'pm_1',
        type: 'card',
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025,
        isDefault: true,
      },
      {
        id: 'pm_2',
        type: 'card',
        brand: 'mastercard',
        last4: '5555',
        expiryMonth: 6,
        expiryYear: 2026,
        isDefault: false,
      },
    ];

    beforeEach(() => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: mockPaymentMethods }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        });
    });

    it('switches to payment methods tab when clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<BillingPortal />);

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
      });

      // Get all "Payment Methods" elements and click the first one (the tab button)
      const paymentMethodsElements = screen.getAllByText('Payment Methods');
      await user.click(paymentMethodsElements[0]);

      await waitFor(() => {
        expect(screen.getByText(/visa/i)).toBeInTheDocument();
        expect(screen.getByText(/mastercard/i)).toBeInTheDocument();
      });
    });

    it('displays all payment methods', async () => {
      const user = userEvent.setup();
      renderWithRouter(<BillingPortal />);

      const paymentMethodsElements = await screen.findAllByText('Payment Methods');
      await user.click(paymentMethodsElements[0]);

      await waitFor(() => {
        expect(screen.getByText('visa')).toBeInTheDocument();
        expect(screen.getByText(/4242/)).toBeInTheDocument();
        expect(screen.getByText('mastercard')).toBeInTheDocument();
        expect(screen.getByText(/5555/)).toBeInTheDocument();
      });
    });

    it('marks default payment method', async () => {
      const user = userEvent.setup();
      renderWithRouter(<BillingPortal />);

      const paymentMethodsElements = await screen.findAllByText('Payment Methods');
      await user.click(paymentMethodsElements[0]);

      await waitFor(() => {
        expect(screen.getByText('Default')).toBeInTheDocument();
      });
    });

    it('shows add payment method button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<BillingPortal />);

      const paymentMethodsElements = await screen.findAllByText('Payment Methods');
      await user.click(paymentMethodsElements[0]);

      await waitFor(() => {
        expect(screen.getByText('Add Payment Method')).toBeInTheDocument();
      });
    });

    it('shows expiry dates', async () => {
      const user = userEvent.setup();
      renderWithRouter(<BillingPortal />);

      const paymentMethodsElements = await screen.findAllByText('Payment Methods');
      await user.click(paymentMethodsElements[0]);

      await waitFor(() => {
        expect(screen.getByText(/12\/2025/)).toBeInTheDocument();
        expect(screen.getByText(/6\/2026/)).toBeInTheDocument();
      });
    });
  });

  describe('Invoices Tab', () => {
    const mockInvoices = [
      {
        id: 'inv_1',
        invoiceNumber: 'INV-001',
        amount: 149.0,
        currency: 'nok',
        status: 'paid',
        dueDate: '2024-01-15T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'inv_2',
        invoiceNumber: 'INV-002',
        amount: 149.0,
        currency: 'nok',
        status: 'paid',
        dueDate: '2023-12-15T00:00:00Z',
        createdAt: '2023-12-01T00:00:00Z',
      },
    ];

    beforeEach(() => {
      (global.fetch as jest.Mock)
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
          json: async () => ({ data: mockInvoices }),
        });
    });

    it('displays invoice history', async () => {
      const user = userEvent.setup();
      renderWithRouter(<BillingPortal />);

      const invoicesTab = await screen.findByText('Invoices');
      await user.click(invoicesTab);

      await waitFor(() => {
        expect(screen.getByText('INV-001')).toBeInTheDocument();
        expect(screen.getByText('INV-002')).toBeInTheDocument();
      });
    });

    it('shows invoice amounts', async () => {
      const user = userEvent.setup();
      renderWithRouter(<BillingPortal />);

      const invoicesTab = await screen.findByText('Invoices');
      await user.click(invoicesTab);

      await waitFor(() => {
        const amounts = screen.getAllByText(/149 NOK/i);
        expect(amounts.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('shows invoice status', async () => {
      const user = userEvent.setup();
      renderWithRouter(<BillingPortal />);

      const invoicesTab = await screen.findByText('Invoices');
      await user.click(invoicesTab);

      await waitFor(() => {
        const statuses = screen.getAllByText('PAID');
        expect(statuses.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('displays invoice table headers', async () => {
      const user = userEvent.setup();
      renderWithRouter(<BillingPortal />);

      const invoicesTab = await screen.findByText('Invoices');
      await user.click(invoicesTab);

      await waitFor(() => {
        expect(screen.getByText('Invoice Number')).toBeInTheDocument();
        expect(screen.getByText('Date')).toBeInTheDocument();
        expect(screen.getByText('Amount')).toBeInTheDocument();
        expect(screen.getByText('Status')).toBeInTheDocument();
      });
    });
  });

  describe('Empty States', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock)
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

    it('shows empty state for no payment methods', async () => {
      const user = userEvent.setup();
      renderWithRouter(<BillingPortal />);

      const paymentMethodsElements = await screen.findAllByText('Payment Methods');
      await user.click(paymentMethodsElements[0]);

      await waitFor(() => {
        expect(screen.getByText(/No payment methods/i)).toBeInTheDocument();
      });
    });

    it('shows empty state for no invoices', async () => {
      const user = userEvent.setup();
      renderWithRouter(<BillingPortal />);

      const invoicesTab = await screen.findByText('Invoices');
      await user.click(invoicesTab);

      await waitFor(() => {
        expect(screen.getByText(/No invoices yet/i)).toBeInTheDocument();
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
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ data: [] }),
        });
    });

    it('calls subscription API on mount', async () => {
      renderWithRouter(<BillingPortal />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/payments/subscriptions'),
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token-123',
            }),
          })
        );
      });
    });

    it('calls payment methods API on mount', async () => {
      renderWithRouter(<BillingPortal />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/payments/methods'),
          expect.any(Object)
        );
      });
    });

    it('calls invoices API on mount', async () => {
      renderWithRouter(<BillingPortal />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/payments/invoices'),
          expect.any(Object)
        );
      });
    });

    it('includes auth token in all API requests', async () => {
      renderWithRouter(<BillingPortal />);

      await waitFor(() => {
        const calls = (global.fetch as jest.Mock).mock.calls;
        calls.forEach((call) => {
          expect(call[1]).toMatchObject({
            headers: {
              Authorization: 'Bearer test-token-123',
            },
          });
        });
      });
    });
  });

  describe('Navigation', () => {
    beforeEach(() => {
      (global.fetch as jest.Mock)
        .mockResolvedValue({
          ok: true,
          json: async () => ({ data: [] }),
        });
    });

    it('displays all three tabs', async () => {
      renderWithRouter(<BillingPortal />);

      await waitFor(() => {
        expect(screen.getByText('Overview')).toBeInTheDocument();
        // Use getAllByText since "Payment Methods" appears both as tab and as heading
        expect(screen.getAllByText('Payment Methods').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Invoices')).toBeInTheDocument();
      });
    });

    it('highlights active tab', async () => {
      const user = userEvent.setup();
      renderWithRouter(<BillingPortal />);

      await waitFor(() => {
        const overviewTab = screen.getByText('Overview');
        expect(overviewTab).toHaveClass('border-tier-navy');
      });

      const paymentTabElements = screen.getAllByText('Payment Methods');
      await user.click(paymentTabElements[0]);

      expect(paymentTabElements[0]).toHaveClass('border-tier-navy');
    });
  });
});

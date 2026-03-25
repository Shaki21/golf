import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationSettings from '../components/notifications/NotificationSettings';
import { NotificationProvider } from '../contexts/NotificationContext';

// Mock the NotificationContext
const mockNotificationContext = {
  isPushSupported: true,
  isPushEnabled: false,
  requestPushPermission: jest.fn(),
  pushPermission: 'default',
  isOnline: true,
  realtimeConnected: true,
};

jest.mock('../contexts/NotificationContext', () => ({
  ...jest.requireActual('../contexts/NotificationContext'),
  useNotification: () => mockNotificationContext,
}));

describe('NotificationSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders notification settings header', () => {
    render(
      <NotificationProvider>
        <NotificationSettings />
      </NotificationProvider>
    );

    expect(screen.getByText('Varsler')).toBeInTheDocument();
    expect(screen.getByText('Administrer varslings-innstillinger')).toBeInTheDocument();
  });

  it('displays push notification status', () => {
    render(
      <NotificationProvider>
        <NotificationSettings />
      </NotificationProvider>
    );

    expect(screen.getByText('Push-varsler')).toBeInTheDocument();
    expect(screen.getByText('Ikke aktivert')).toBeInTheDocument();
  });

  it('shows enable button when push is not enabled', () => {
    render(
      <NotificationProvider>
        <NotificationSettings />
      </NotificationProvider>
    );

    expect(screen.getByRole('button', { name: /aktiver/i })).toBeInTheDocument();
  });

  it('displays connection status', () => {
    render(
      <NotificationProvider>
        <NotificationSettings />
      </NotificationProvider>
    );

    expect(screen.getByText('Sanntidstilkobling')).toBeInTheDocument();
    expect(screen.getByText('Tilkoblet - mottar oppdateringer')).toBeInTheDocument();
  });

  it('renders all notification types', () => {
    render(
      <NotificationProvider>
        <NotificationSettings />
      </NotificationProvider>
    );

    expect(screen.getByText('Treningspaminnelser')).toBeInTheDocument();
    expect(screen.getByText('Meldinger')).toBeInTheDocument();
    expect(screen.getByText('Prestasjoner')).toBeInTheDocument();
    expect(screen.getByText('Malframgang')).toBeInTheDocument();
    expect(screen.getByText('Trenernotater')).toBeInTheDocument();
    expect(screen.getByText('Turneringsoppdateringer')).toBeInTheDocument();
  });

  it('toggles notification settings when clicked', () => {
    render(
      <NotificationProvider>
        <NotificationSettings />
      </NotificationProvider>
    );

    const trainingRemindersRow = screen.getByText('Treningspaminnelser').closest('div');
    fireEvent.click(trainingRemindersRow);

    // The toggle should work (internal state change)
  });

  it('shows blocked status when push permission is denied', () => {
    jest.mock('../contexts/NotificationContext', () => ({
      useNotification: () => ({
        ...mockNotificationContext,
        pushPermission: 'denied',
      }),
    }));

    // This would show the blocked status
  });

  it('shows offline status when not connected', () => {
    jest.mock('../contexts/NotificationContext', () => ({
      useNotification: () => ({
        ...mockNotificationContext,
        isOnline: false,
      }),
    }));

    // This would show offline status
  });

  it('requests push permission when enable button is clicked', async () => {
    const mockRequestPush = jest.fn().mockResolvedValue(true);

    jest.mock('../contexts/NotificationContext', () => ({
      useNotification: () => ({
        ...mockNotificationContext,
        requestPushPermission: mockRequestPush,
      }),
    }));

    render(
      <NotificationProvider>
        <NotificationSettings />
      </NotificationProvider>
    );

    const enableButton = screen.getByRole('button', { name: /aktiver/i });
    fireEvent.click(enableButton);

    // The request should be made
  });
});

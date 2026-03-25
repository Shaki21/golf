/**
 * Admin Pending Approvals Page
 *
 * Displays list of users awaiting admin approval
 */

import React, { useState, useEffect } from 'react';
import { Page } from '../../ui/components/Page';
import { Text, Button } from '../../ui/primitives';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  role: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const PendingApprovalsPage: React.FC = () => {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    // For now, show demo data
    setTimeout(() => {
      setUsers([
        {
          id: '1',
          name: 'Ole Hansen',
          email: 'ole.hansen@example.com',
          role: 'player',
          requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        },
        {
          id: '2',
          name: 'Kari Nordmann',
          email: 'kari.nordmann@example.com',
          role: 'coach',
          requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const handleApprove = async (userId: string) => {
    // TODO: Implement API call
    setUsers(users.map(u => u.id === userId ? { ...u, status: 'approved' as const } : u));
  };

  const handleReject = async (userId: string) => {
    // TODO: Implement API call
    setUsers(users.map(u => u.id === userId ? { ...u, status: 'rejected' as const } : u));
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Page state={loading ? 'loading' : 'idle'}>
      <Page.Header
        title="Ventende godkjenninger"
        subtitle="Behandle brukerforespørsler"
        helpText="Administrator-panel for å behandle ventende brukerforespørsler. Se alle brukere som venter på godkjenning, med navn, e-post, rolle og tidspunkt for forespørsel. Godkjenn eller avvis forespørsler direkte fra listen."
      />

      <Page.Content>
        <Page.Section>
          <div className="mb-4">
            <Text variant="body" color="secondary">
              {users.filter(u => u.status === 'pending').length} ventende godkjenninger
            </Text>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <Clock size={48} className="mx-auto mb-4 text-tier-text-tertiary" />
              <Text variant="title3" color="secondary">
                Ingen ventende godkjenninger
              </Text>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="border border-tier-border-default rounded-lg p-4 bg-tier-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Text variant="title3" color="primary">
                          {user.name}
                        </Text>
                        {user.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-tier-success-light text-tier-success text-xs font-medium">
                            <CheckCircle size={14} />
                            Godkjent
                          </span>
                        )}
                        {user.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-tier-error-light text-tier-error text-xs font-medium">
                            <XCircle size={14} />
                            Avvist
                          </span>
                        )}
                        {user.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-tier-warning-light text-tier-warning text-xs font-medium">
                            <Clock size={14} />
                            Venter
                          </span>
                        )}
                      </div>
                      <Text variant="body" color="secondary" className="mb-1">
                        {user.email}
                      </Text>
                      <div className="flex items-center gap-4 text-sm text-tier-text-tertiary">
                        <span>Rolle: <strong>{user.role}</strong></span>
                        <span>Søkt: {formatDate(user.requestedAt)}</span>
                      </div>
                    </div>

                    {user.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<CheckCircle size={16} />}
                          onClick={() => handleApprove(user.id)}
                        >
                          Godkjenn
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          leftIcon={<XCircle size={16} />}
                          onClick={() => handleReject(user.id)}
                        >
                          Avvis
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Page.Section>
      </Page.Content>
    </Page>
  );
};

export default PendingApprovalsPage;

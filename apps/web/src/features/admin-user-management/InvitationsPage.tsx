/**
 * Admin Invitations Management Page
 */

import React, { useState } from 'react';
import { Page } from '../../ui/components/Page';
import { Text, Button, Input } from '../../ui/primitives';
import { Mail, Send, Copy } from 'lucide-react';

export const InvitationsPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('player');

  const handleSendInvitation = () => {
    // TODO: Implement API call
    setEmail('');
  };

  return (
    <Page state="idle">
      <Page.Header
        title="Invitasjonshåndtering"
        subtitle="Send invitasjoner til nye brukere"
        helpText="Administrator-panel for brukerinvitasjoner. Send e-postinvitasjoner til nye spillere, trenere eller administratorer. Se status på sendte invitasjoner, resend eller trekk tilbake invitasjoner. Administrer tilgangsnivå per rolle."
      />

      <Page.Content>
        <Page.Section card={true}>
          <div className="max-w-2xl">
            <Text variant="title3" color="primary" className="mb-4">
              Send ny invitasjon
            </Text>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tier-navy mb-2">
                  E-postadresse
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="bruker@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-tier-navy mb-2">
                  Rolle
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-navy"
                >
                  <option value="player">Spiller</option>
                  <option value="coach">Trener</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <Button
                variant="primary"
                leftIcon={<Send size={16} />}
                onClick={handleSendInvitation}
                disabled={!email}
              >
                Send invitasjon
              </Button>
            </div>
          </div>
        </Page.Section>

        <Page.Section card={true}>
          <Text variant="title3" color="primary" className="mb-4">
            Sendte invitasjoner
          </Text>
          <div className="text-center py-8">
            <Mail size={48} className="mx-auto mb-4 text-tier-text-tertiary" />
            <Text variant="body" color="secondary">
              Ingen sendte invitasjoner ennå
            </Text>
          </div>
        </Page.Section>
      </Page.Content>
    </Page>
  );
};

export default InvitationsPage;

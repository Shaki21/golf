/**
 * Admin Notification Settings
 */

import React from 'react';
import { Page } from '../../ui/components/Page';
import { Text } from '../../ui/primitives';
import { Bell } from 'lucide-react';

export const NotificationSettingsPage: React.FC = () => {
  return (
    <Page state="idle">
      <Page.Header
        title="Varselinnstillinger"
        subtitle="Konfigurer systemvarsler"
        helpText="Administrator-side for konfigurasjon av varselsystem. Administrer e-post-varsler, push-varsler og in-app varsler. Sett opp varselmaler for ulike hendelser (ny booking, testresultat, påminnelse, oppnåelse). Konfigurer varseltidspunkt, frekvens og prioritet. Angi globale innstillinger og brukerpreferanser. Velg varselkanaler per hendelsetype. Bruk for å sikre riktig kommunikasjon med spillere og trenere."
      />

      <Page.Content>
        <Page.Section card={true}>
          <div className="text-center py-12">
            <Bell size={48} className="mx-auto mb-4 text-tier-text-tertiary" />
            <Text variant="title3" color="secondary" className="mb-2">
              Varselinnstillinger
            </Text>
            <Text variant="body" color="tertiary">
              Administrer e-post, push og in-app varsler
            </Text>
          </div>
        </Page.Section>
      </Page.Content>
    </Page>
  );
};

export default NotificationSettingsPage;

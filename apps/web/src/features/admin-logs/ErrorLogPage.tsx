/**
 * Admin Error Log Viewer
 */

import React from 'react';
import { Page } from '../../ui/components/Page';
import { Text } from '../../ui/primitives';
import { AlertCircle } from 'lucide-react';

export const ErrorLogPage: React.FC = () => {
  return (
    <Page state="idle">
      <Page.Header
        title="Feillogg"
        subtitle="Systemfeil og advarsler"
        helpText="Administrator-side for systemfeillogg. Se alle registrerte feil og advarsler fra backend med tidspunkt, alvorlighetsgrad (error/warning/info), melding, stack trace, kontekst (request URL, user, session). Filtrer etter dato, alvorlighetsgrad, feiltype. Søk i feilmeldinger. Eksporter logg for analyse. Bruk for debugging, feilsøking og overvåking av systemhelse."
      />

      <Page.Content>
        <Page.Section card={true}>
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto mb-4 text-tier-text-tertiary" />
            <Text variant="title3" color="secondary" className="mb-2">
              Feillogg
            </Text>
            <Text variant="body" color="tertiary">
              Oversikt over systemfeil og advarsler
            </Text>
          </div>
        </Page.Section>
      </Page.Content>
    </Page>
  );
};

export default ErrorLogPage;

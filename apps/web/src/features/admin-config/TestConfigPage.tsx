/**
 * Admin Test Configuration
 */

import React from 'react';
import { Page } from '../../ui/components/Page';
import { Text } from '../../ui/primitives';
import { Target } from 'lucide-react';

export const TestConfigPage: React.FC = () => {
  return (
    <Page state="idle">
      <Page.Header
        title="Testkonfigurasjon"
        subtitle="Administrer testtyper og parametre"
        helpText="Administrator-side for testsystem-konfigurasjon. Administrer alle testtyper som er tilgjengelige i systemet. Sett opp testparametre: navn, kategori (Approach/Putting/Rundt green), måletype og enhet (meter/prosent/SG), krav for bestått, om lavere er bedre, og beskrivelse. Konfigurer grenseverdier for ulike nivåer (begynner/mellomnivå/avansert). Legg til/rediger/deaktiver tester. Definer teststrukturer for nivåkrav og merker. Bruk for å tilpasse testsystemet til akademiets behov."
      />

      <Page.Content>
        <Page.Section card={true}>
          <div className="text-center py-12">
            <Target size={48} className="mx-auto mb-4 text-tier-text-tertiary" />
            <Text variant="title3" color="secondary" className="mb-2">
              Testkonfigurasjon
            </Text>
            <Text variant="body" color="tertiary">
              Sett opp testtyper, målinger og grenseverdier
            </Text>
          </div>
        </Page.Section>
      </Page.Content>
    </Page>
  );
};

export default TestConfigPage;

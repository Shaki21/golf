/**
 * Admin Category Management (A-K Categories)
 */

import React from 'react';
import { Page } from '../../ui/components/Page';
import { Text } from '../../ui/primitives';
import { Layers } from 'lucide-react';

export const CategoryManagementPage: React.FC = () => {
  return (
    <Page state="idle">
      <Page.Header
        title="Kategorihåndtering"
        subtitle="Administrer A-K kategorier"
        helpText="Administrator-panel for spillerkategorisystemet (A-K kategorier). Konfigurer krav og grenser for hver kategori, sett opp progresjonskriterier og administrer kategoriopprykning for spillere."
      />

      <Page.Content>
        <Page.Section card={true}>
          <div className="text-center py-12">
            <Layers size={48} className="mx-auto mb-4 text-tier-text-tertiary" />
            <Text variant="title3" color="secondary" className="mb-2">
              Kategorisystem (A-K)
            </Text>
            <Text variant="body" color="tertiary">
              Konfigurasjon av spillerkategorier og krav
            </Text>
          </div>
        </Page.Section>
      </Page.Content>
    </Page>
  );
};

export default CategoryManagementPage;

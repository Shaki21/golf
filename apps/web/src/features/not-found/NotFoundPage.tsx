/**
 * TIER Golf - 404 Not Found Page
 *
 * Archetype: Special (Error State)
 * Purpose: Display friendly 404 error for non-existent routes
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Page } from '../../ui/components/Page';
import { Text, Button } from '../../ui/primitives';
import { useAuth } from '../../contexts/AuthContext';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getHomePath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'coach':
        return '/coach';
      default:
        return '/dashboard';
    }
  };

  return (
    <Page state="idle" maxWidth="sm">
      <Page.Content>
        <Page.Section card={true}>
          <div className="flex flex-col items-center text-center py-8">
            {/* Icon */}
            <div className="w-16 h-16 mb-6 rounded-full bg-tier-surface-base flex items-center justify-center">
              <Search size={32} className="text-tier-text-secondary" />
            </div>

            {/* Title */}
            <Text variant="title1" color="primary" className="mb-2">
              Fant ikke siden
            </Text>

            {/* Description */}
            <Text variant="body" color="secondary" className="mb-8 max-w-sm">
              Siden du leter etter kan ha blitt flyttet, slettet, eller finnes ikke.
            </Text>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ArrowLeft size={18} />}
                onClick={() => navigate(-1)}
              >
                Tilbake
              </Button>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Home size={18} />}
                onClick={() => navigate(getHomePath())}
              >
                Til Dashboard
              </Button>
            </div>

            {/* Error Code */}
            <div className="mt-8 pt-4 border-t border-tier-border-default w-full">
              <Text variant="caption1" color="tertiary">
                Feilkode: 404
              </Text>
            </div>
          </div>
        </Page.Section>
      </Page.Content>
    </Page>
  );
};

export default NotFoundPage;

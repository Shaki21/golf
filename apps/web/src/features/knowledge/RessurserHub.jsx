/**
 * TIER Golf - Ressurser Hub
 * Navigation hub for resources
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookmarkCheck, BookOpen } from 'lucide-react';
import PageHeader from '../../ui/raw-blocks/PageHeader.raw';
import PageContainer from '../../ui/raw-blocks/PageContainer.raw';
import { Card } from '../../components/shadcn/card';
import { SubSectionTitle } from '../../components/typography';

const RessurserHub = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-tier-surface-base">
      <PageHeader
        title="Resources"
        subtitle="Access to learning resources and knowledge"
      />
      <PageContainer paddingY="md" background="base">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Mine ressurser */}
          <Card
            className="p-8 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
            onClick={() => navigate('/mer/ressurser/mine')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-tier-navy/10 flex items-center justify-center">
                <BookmarkCheck size={32} className="text-tier-navy" />
              </div>
              <div>
                <SubSectionTitle className="text-xl font-semibold text-tier-navy mb-2">
                  My resources
                </SubSectionTitle>
                <p className="text-sm text-tier-text-secondary">
                  Saved by you or sent from coaching team
                </p>
              </div>
            </div>
          </Card>

          {/* Alle ressurser */}
          <Card
            className="p-8 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
            onClick={() => navigate('/mer/ressurser/alle')}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-tier-success/10 flex items-center justify-center">
                <BookOpen size={32} className="text-tier-success" />
              </div>
              <div>
                <SubSectionTitle className="text-xl font-semibold text-tier-navy mb-2">
                  All resources
                </SubSectionTitle>
                <p className="text-sm text-tier-text-secondary">
                  Knowledge library and resources
                </p>
              </div>
            </div>
          </Card>
        </div>
      </PageContainer>
    </div>
  );
};

export default RessurserHub;

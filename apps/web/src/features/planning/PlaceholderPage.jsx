import React from 'react';
import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';
import { PageTitle } from '../../components/typography';

const PlaceholderPage = ({ title }) => {
  const location = useLocation();
  const pageName = title || location.pathname.replace(/\//g, ' ').trim() || 'Side';

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 rounded-full bg-tier-navy/10 flex items-center justify-center mb-4">
        <Construction size={32} className="text-tier-navy" />
      </div>
      <PageTitle className="text-2xl font-bold text-tier-navy mb-2">
        {pageName.charAt(0).toUpperCase() + pageName.slice(1)}
      </PageTitle>
      <p className="text-tier-text-secondary max-w-md">
        Denne siden er under utvikling og vil snart være tilgjengelig.
      </p>
      <div className="mt-6 px-4 py-2 bg-tier-white rounded-lg">
        <code className="text-sm text-tier-text-secondary">{location.pathname}</code>
      </div>
    </div>
  );
};

export default PlaceholderPage;

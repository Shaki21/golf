/**
 * CoachPlaceholder - Reusable placeholder for unimplemented coach pages
 *
 * Usage: <CoachPlaceholder title="Page Title" />
 */

import React from 'react';
import { ArrowLeft, Construction } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../../components/typography/Headings';

interface CoachPlaceholderProps {
  title: string;
  description?: string;
}

export default function CoachPlaceholder({ title, description }: CoachPlaceholderProps) {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-tier-text-secondary hover:text-tier-navy transition-colors mb-8 mx-auto"
      >
        <ArrowLeft size={18} />
        <span>Tilbake</span>
      </button>

      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-tier-surface-base flex items-center justify-center mx-auto mb-6">
        <Construction size={40} className="text-tier-text-tertiary" />
      </div>

      {/* Title */}
      <PageTitle className="!mb-3">{title}</PageTitle>

      {/* Description */}
      <p className="text-tier-text-secondary mb-6">
        {description || 'Denne siden er under utvikling og vil være tilgjengelig snart.'}
      </p>

      {/* TODO badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-800 rounded-full text-sm font-medium">
        <Construction size={16} />
        TODO: Implementer {title}
      </div>
    </div>
  );
}

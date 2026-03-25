/**
 * Support Ticket Form Component
 * Form for creating new support tickets
 */

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '../../../ui/primitives/Button';
import Input from '../../../ui/primitives/Input';
import { SectionTitle } from '../../../components/typography';

type Priority = 'low' | 'normal' | 'high' | 'urgent';

interface Props {
  onSubmit: (data: {
    title: string;
    description: string;
    priority: Priority;
    category?: string;
  }) => Promise<void>;
  isSubmitting?: boolean;
  className?: string;
}

const PRIORITIES: { value: Priority; label: string; description: string }[] = [
  { value: 'low', label: 'Lav', description: 'Kan vente' },
  { value: 'normal', label: 'Normal', description: 'Standard henvendelse' },
  { value: 'high', label: 'Høy', description: 'Viktig sak' },
  { value: 'urgent', label: 'Kritisk', description: 'Må løses raskt' },
];

const CATEGORIES = [
  { value: 'technical', label: 'Teknisk problem' },
  { value: 'account', label: 'Konto/innlogging' },
  { value: 'billing', label: 'Fakturering' },
  { value: 'feature', label: 'Funksjonalitet' },
  { value: 'other', label: 'Annet' },
];

const SupportTicketForm: React.FC<Props> = ({ onSubmit, isSubmitting = false, className = '' }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [category, setCategory] = useState('other');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Vennligst skriv inn en tittel');
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setPriority('normal');
      setCategory('other');
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-xl border border-tier-border-default p-6 ${className}`}>
      <SectionTitle style={{ marginBottom: '1rem' }}>Ny supporthenvendelse</SectionTitle>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Tittel <span className="text-tier-error">*</span>
        </label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Beskriv problemet kort..."
          required
          maxLength={255}
          disabled={isSubmitting}
          className="w-full"
        />
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Beskrivelse
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Gi en mer detaljert beskrivelse av problemet..."
          rows={5}
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-tier-border-default rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-tier-info focus:border-transparent text-sm"
        />
      </div>

      {/* Priority */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Prioritet
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PRIORITIES.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPriority(p.value)}
              disabled={isSubmitting}
              className={`p-3 rounded-lg border-2 transition-all text-left ${
                priority === p.value
                  ? 'border-tier-info bg-tier-info-light'
                  : 'border-tier-border-default hover:border-tier-info'
              }`}
            >
              <div className="font-medium text-sm text-tier-navy">{p.label}</div>
              <div className="text-xs text-tier-text-secondary mt-1">{p.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-tier-navy mb-2">
          Kategori
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          disabled={isSubmitting}
          className="w-full px-4 py-3 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-info focus:border-transparent text-sm"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={!title.trim() || isSubmitting}
        loading={isSubmitting}
        leftIcon={<Send size={18} />}
      >
        Send henvendelse
      </Button>
    </form>
  );
};

export default SupportTicketForm;

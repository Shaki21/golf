/**
 * Frequency Selector Component
 * Select weekly training frequency (1-7 sessions per week)
 */

import React from 'react';
import { Button } from '../../../components/shadcn/button';

interface FrequencySelectorProps {
  value: number;
  onChange: (frequency: number) => void;
  min?: number;
  max?: number;
}

export function FrequencySelector({
  value,
  onChange,
  min = 1,
  max = 7,
}: FrequencySelectorProps) {
  const frequencies = Array.from({ length: max - min + 1 }, (_, i) => i + min);

  return (
    <div className="flex flex-wrap gap-2">
      {frequencies.map((freq) => (
        <Button
          key={freq}
          variant={value === freq ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(freq)}
          className={`w-12 h-12 ${
            value === freq
              ? 'bg-tier-navy hover:bg-tier-navy/90'
              : 'hover:bg-gray-100'
          }`}
        >
          {freq}
        </Button>
      ))}
    </div>
  );
}

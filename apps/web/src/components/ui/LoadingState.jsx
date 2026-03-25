import React from 'react';
import StateCard from '../../ui/composites/StateCard';

/**
 * Loading state component - UI Canon compliant
 * Uses StateCard with loading variant
 */
export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        minHeight: '200px',
      }}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <StateCard variant="loading" title={message} />
    </div>
  );
}

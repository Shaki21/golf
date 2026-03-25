import React from 'react';
import { FileQuestion } from 'lucide-react';
import StateCard from '../../ui/composites/StateCard';
import Button from '../../ui/primitives/Button';

/**
 * Empty state component - UI Canon compliant
 * Uses StateCard with empty variant
 */
export default function EmptyState({
  title = 'Ingen data',
  message,
  actionLabel,
  onAction,
  icon: Icon = FileQuestion
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      minHeight: '300px',
    }}>
      <StateCard
        variant="empty"
        icon={Icon}
        title={title}
        description={message}
        action={
          actionLabel && onAction && (
            <Button variant="primary" size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )
        }
      />
    </div>
  );
}

import React from 'react';
import { CheckCircle } from 'lucide-react';
import StateCard from '../../ui/composites/StateCard';
import Button from '../../ui/primitives/Button';

/**
 * Success state component - UI Canon compliant
 * Uses StateCard with success styling
 */
export default function SuccessState({ message = 'Fullført!', onDismiss }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
    }}>
      <StateCard
        variant="empty"
        icon={CheckCircle}
        title={message}
        action={
          onDismiss && (
            <Button variant="primary" size="sm" onClick={onDismiss}>
              OK
            </Button>
          )
        }
      />
    </div>
  );
}

import React from 'react';
import { AlertCircle, RefreshCw, Lock, ShieldX, AlertTriangle } from 'lucide-react';
import StateCard from '../../ui/composites/StateCard';
import Button from '../../ui/primitives/Button';

const errorConfig = {
  validation_error: {
    icon: AlertTriangle,
    title: 'Ugyldig input',
    message: 'Vennligst sjekk feltene og prøv igjen.',
  },
  authentication_error: {
    icon: Lock,
    title: 'Autentiseringsfeil',
    message: 'Du må logge inn på nytt.',
  },
  authorization_error: {
    icon: ShieldX,
    title: 'Ingen tilgang',
    message: 'Du har ikke tilgang til denne ressursen.',
  },
  domain_violation: {
    icon: AlertCircle,
    title: 'Kunne ikke behandle',
    message: 'Forespørselen kunne ikke behandles.',
  },
  system_failure: {
    icon: AlertCircle,
    title: 'Noe gikk galt',
    message: 'Vennligst prøv igjen senere.',
  },
};

export default function ErrorState({ errorType = 'system_failure', message, onRetry }) {
  const config = errorConfig[errorType] || errorConfig.system_failure;
  const displayMessage = message || config.message;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px',
      minHeight: '300px',
    }}>
      <StateCard
        variant="error"
        icon={config.icon}
        title={config.title}
        description={displayMessage}
        action={
          onRetry && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<RefreshCw size={16} />}
              onClick={onRetry}
            >
              Prøv igjen
            </Button>
          )
        }
      />
    </div>
  );
}

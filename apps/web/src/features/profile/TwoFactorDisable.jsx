import React, { useState } from 'react';
import { ShieldOff, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { authAPI } from '../../services/api';
import Button from '../../ui/primitives/Button';
import { SectionTitle, SubSectionTitle } from '../../components/typography';

const TwoFactorDisable = ({ onConfirm, onCancel }) => {
  const [step, setStep] = useState(1); // 1: Warning, 2: Confirm with password, 3: Success
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDisable = async () => {
    if (!password) {
      setError('Passord er påkrevd');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authAPI.disable2FA(password);

      setStep(3); // Show success

      // Auto-close after 2 seconds
      setTimeout(() => {
        if (onConfirm) {
          onConfirm({ enabled: false });
        }
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      if (errorMessage?.includes('password') || errorMessage?.includes('passord')) {
        setError('Feil passord');
      } else {
        setError(errorMessage || 'Kunne ikke deaktivere 2FA. Prøv igjen.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div>
      <div style={{
        width: '80px',
        height: '80px',
        margin: '0 auto 24px',
        borderRadius: '50%',
        backgroundColor: 'rgba(var(--warning-rgb), 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <AlertTriangle size={40} color={'var(--status-warning)'} />
      </div>

      <SectionTitle style={{
        fontSize: '22px', lineHeight: '28px', fontWeight: 700,
        marginBottom: '12px',
        textAlign: 'center',
      }}>
        Deaktiver tofaktorautentisering?
      </SectionTitle>

      <p style={{
        fontSize: '15px', lineHeight: '20px', fontWeight: 600,
        color: 'var(--text-secondary)',
        marginBottom: '24px',
        textAlign: 'center',
        lineHeight: '24px',
      }}>
        Ved å deaktivere 2FA reduserer du sikkerheten på kontoen din betydelig.
      </p>

      <div style={{
        padding: '20px',
        backgroundColor: 'rgba(var(--error-rgb), 0.1)',
        border: '1px solid rgba(var(--error-rgb), 0.3)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
      }}>
        <SubSectionTitle style={{
          fontSize: '17px', lineHeight: '22px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <ShieldOff size={20} color={'var(--status-error)'} />
          Sikkerhetsrisiko
        </SubSectionTitle>
        <ul style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '15px', lineHeight: '20px', fontWeight: 600,
          color: 'var(--text-secondary)',
        }}>
          <li style={{ marginBottom: '8px' }}>Kontoen din vil være mer sårbar for uautorisert tilgang</li>
          <li style={{ marginBottom: '8px' }}>Kun passord vil være nødvendig for å logge inn</li>
          <li style={{ marginBottom: '8px' }}>Du mister et viktig sikkerhetslag</li>
        </ul>
      </div>

      <div style={{
        padding: '16px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
      }}>
        <p style={{
          fontSize: '13px', lineHeight: '18px',
          color: 'var(--text-secondary)',
          margin: 0,
        }}>
          <strong>Anbefaling:</strong> Vi anbefaler sterkt å holde 2FA aktivert for maksimal kontosikkerhet. Hvis du har problemer med 2FA, vurder å oppdatere autentiseringsappen din i stedet for å deaktivere funksjonen.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        {onCancel && (
          <Button
            variant="secondary"
            onClick={onCancel}
            style={{ flex: 1 }}
          >
            Avbryt
          </Button>
        )}
        <Button
          variant="primary"
          onClick={() => setStep(2)}
          style={{ flex: 1, backgroundColor: 'var(--color-status-error)' }}
        >
          Fortsett allikevel
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <div style={{
        width: '80px',
        height: '80px',
        margin: '0 auto 24px',
        borderRadius: '50%',
        backgroundColor: 'rgba(var(--accent-rgb), 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Lock size={40} color={'var(--accent)'} />
      </div>

      <SectionTitle style={{
        fontSize: '22px', lineHeight: '28px', fontWeight: 700,
        marginBottom: '12px',
        textAlign: 'center',
      }}>
        Bekreft med passord
      </SectionTitle>

      <p style={{
        fontSize: '15px', lineHeight: '20px', fontWeight: 600,
        color: 'var(--text-secondary)',
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        Skriv inn passordet ditt for å bekrefte at du vil deaktivere 2FA
      </p>

      {error && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'rgba(var(--error-rgb), 0.1)',
            border: '1px solid rgba(var(--error-rgb), 0.3)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--status-error)',
            marginBottom: '24px',
            fontSize: '15px', lineHeight: '20px', fontWeight: 600,
          }}
        >
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleDisable(); }}>
        <div style={{ marginBottom: '24px' }}>
          <label
            htmlFor="password"
            style={{
              display: 'block',
              fontSize: '17px', lineHeight: '22px', fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            Passord
          </label>
          <div style={{ position: 'relative' }}>
            <Lock
              size={20}
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)',
                pointerEvents: 'none',
              }}
            />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              required
              placeholder="Skriv inn passordet ditt"
              disabled={loading}
              aria-label="Passord"
              autoFocus
              style={{
                width: '100%',
                padding: '14px 16px 14px 48px',
                fontSize: '17px', lineHeight: '22px', fontWeight: 400,
                border: `1px solid ${error ? 'var(--status-error)' : 'var(--border-default)'}`,
                borderRadius: 'var(--radius-md)',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: loading ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
              }}
              onFocus={(e) => {
                if (!error) e.target.style.borderColor = 'var(--accent)';
              }}
              onBlur={(e) => {
                if (!error) e.target.style.borderColor = 'var(--border-default)';
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setStep(1)}
            disabled={loading}
            style={{ flex: 1 }}
          >
            Tilbake
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !password}
            loading={loading}
            style={{ flex: 1, backgroundColor: 'var(--color-status-error)' }}
          >
            {loading ? 'Deaktiverer...' : 'Deaktiver 2FA'}
          </Button>
        </div>
      </form>
    </div>
  );

  const renderStep3 = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '80px',
        height: '80px',
        margin: '0 auto 24px',
        borderRadius: '50%',
        backgroundColor: 'rgba(var(--success-rgb), 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <CheckCircle size={40} color={'var(--status-success)'} />
      </div>

      <SectionTitle style={{
        fontSize: '22px', lineHeight: '28px', fontWeight: 700,
        marginBottom: '12px',
      }}>
        2FA deaktivert
      </SectionTitle>

      <p style={{
        fontSize: '15px', lineHeight: '20px', fontWeight: 600,
        color: 'var(--text-secondary)',
        marginBottom: '24px',
      }}>
        Tofaktorautentisering er nå deaktivert for kontoen din.
      </p>

      <div style={{
        padding: '16px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
      }}>
        <p style={{
          fontSize: '13px', lineHeight: '18px',
          color: 'var(--text-secondary)',
          margin: 0,
        }}>
          Du kan aktivere 2FA igjen når som helst fra sikkerhetsinnstillingene.
        </p>
      </div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: 'var(--text-secondary)',
      }}>
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid var(--status-success)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <span style={{ fontSize: '15px', lineHeight: '20px', fontWeight: 600 }}>Lukker...</span>
      </div>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px',
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
    }}>
      <div style={{
        maxWidth: '500px',
        width: '100%',
        padding: '32px',
        backgroundColor: 'var(--bg-primary)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        position: 'relative',
      }}>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>
    </div>
  );
};

export default TwoFactorDisable;

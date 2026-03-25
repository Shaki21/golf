import React, { useState, useEffect } from 'react';
import { Shield, Smartphone, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { authAPI } from '../../services/api';
import Button from '../../ui/primitives/Button';
import { SectionTitle, SubSectionTitle } from '../../components/typography';

const TwoFactorSetup = ({ onComplete, onCancel }) => {
  const [step, setStep] = useState(1); // 1: Intro, 2: QR Code, 3: Verify
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (step === 2) {
      generateQRCode();
    }
  }, [step]);

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const response = await authAPI.generate2FASecret();
      const { secret, qrCodeUrl } = response.data.data;

      setSecretKey(secret);
      setQrCodeUrl(qrCodeUrl);
    } catch (err) {
      setError(err.response?.data?.message || 'Kunne ikke generere 2FA-kode. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Koden må være 6 sifre');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.verify2FACode(verificationCode);
      const { backupCodes } = response.data.data;

      setBackupCodes(backupCodes);
      setStep(4); // Show backup codes
    } catch (err) {
      setError(err.response?.data?.message || 'Ugyldig kode. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete({ enabled: true, backupCodes });
    }
  };

  const renderStep1 = () => (
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
        <Shield size={40} color={'var(--accent)'} />
      </div>

      <SectionTitle style={{
        fontSize: '22px', lineHeight: '28px', fontWeight: 700,
        marginBottom: '12px',
        textAlign: 'center',
      }}>
        Aktiver tofaktorautentisering
      </SectionTitle>

      <p style={{
        fontSize: '15px', lineHeight: '20px', fontWeight: 600,
        color: 'var(--text-secondary)',
        marginBottom: '24px',
        textAlign: 'center',
        lineHeight: '24px',
      }}>
        Legg til et ekstra sikkerhetslag på kontoen din. Du trenger en autentiseringsapp som Google Authenticator eller Authy.
      </p>

      <div style={{
        padding: '20px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
      }}>
        <SubSectionTitle style={{
          fontSize: '17px', lineHeight: '22px',
          marginBottom: '16px',
        }}>
          Slik fungerer det:
        </SubSectionTitle>
        <ol style={{
          margin: 0,
          paddingLeft: '20px',
          fontSize: '15px', lineHeight: '20px', fontWeight: 600,
          color: 'var(--text-secondary)',
        }}>
          <li style={{ marginBottom: '12px' }}>Skann QR-koden med autentiseringsappen din</li>
          <li style={{ marginBottom: '12px' }}>Skriv inn 6-sifret kode fra appen</li>
          <li style={{ marginBottom: '12px' }}>Lagre backup-kodene dine på et sikkert sted</li>
          <li>Du er nå beskyttet med 2FA</li>
        </ol>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <Button
          variant="primary"
          onClick={() => setStep(2)}
          style={{ flex: 1 }}
        >
          Kom i gang
        </Button>
        {onCancel && (
          <Button
            variant="secondary"
            onClick={onCancel}
            style={{ flex: 1 }}
          >
            Avbryt
          </Button>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div>
      <SectionTitle style={{
        fontSize: '22px', lineHeight: '28px', fontWeight: 700,
        marginBottom: '12px',
        textAlign: 'center',
      }}>
        Skann QR-koden
      </SectionTitle>

      <p style={{
        fontSize: '15px', lineHeight: '20px', fontWeight: 600,
        color: 'var(--text-secondary)',
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        Åpne autentiseringsappen din og skann denne koden
      </p>

      {loading ? (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            margin: '0 auto',
            border: '3px solid var(--accent)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{
            fontSize: '15px', lineHeight: '20px', fontWeight: 600,
            color: 'var(--text-secondary)',
            marginTop: '16px',
          }}>
            Genererer QR-kode...
          </p>
          <style>
            {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
          </style>
        </div>
      ) : (
        <>
          <div style={{
            padding: '24px',
            backgroundColor: 'var(--bg-primary)',
            border: '2px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center',
            marginBottom: '20px',
          }}>
            <img
              src={qrCodeUrl}
              alt="2FA QR Code"
              style={{
                width: '200px',
                height: '200px',
                margin: '0 auto',
                display: 'block',
              }}
            />
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
              marginBottom: '8px',
            }}>
              Kan ikke skanne? Skriv inn denne koden manuelt:
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <code style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '15px', lineHeight: '20px', fontWeight: 600,
                fontFamily: 'monospace',
                color: 'var(--text-primary)',
              }}>
                {secretKey}
              </code>
              <button
                onClick={handleCopySecret}
                aria-label="Kopier nøkkel"
                style={{
                  padding: '12px',
                  backgroundColor: copied ? 'var(--status-success)' : 'var(--bg-primary)',
                  border: `1px solid ${copied ? 'var(--status-success)' : 'var(--border-default)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {copied ? <CheckCircle size={20} color={'var(--bg-primary)'} /> : <Copy size={20} color={'var(--text-secondary)'} />}
              </button>
            </div>
          </div>
        </>
      )}

      <Button
        variant="primary"
        onClick={() => setStep(3)}
        disabled={loading}
        style={{ width: '100%' }}
      >
        Neste: Verifiser
      </Button>
    </div>
  );

  const renderStep3 = () => (
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
        <Smartphone size={40} color={'var(--accent)'} />
      </div>

      <SectionTitle style={{
        fontSize: '22px', lineHeight: '28px', fontWeight: 700,
        marginBottom: '12px',
        textAlign: 'center',
      }}>
        Verifiser koden
      </SectionTitle>

      <p style={{
        fontSize: '15px', lineHeight: '20px', fontWeight: 600,
        color: 'var(--text-secondary)',
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        Skriv inn 6-sifret kode fra autentiseringsappen din
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
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
            setVerificationCode(value);
            setError(null);
          }}
          placeholder="000000"
          maxLength={6}
          disabled={loading}
          aria-label="Verifiseringskode"
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '32px',
            fontFamily: 'monospace',
            textAlign: 'center',
            letterSpacing: '8px',
            border: `2px solid ${error ? 'var(--status-error)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-md)',
            outline: 'none',
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

      <div style={{ display: 'flex', gap: '12px' }}>
        <Button
          variant="secondary"
          onClick={() => setStep(2)}
          disabled={loading}
          style={{ flex: 1 }}
        >
          Tilbake
        </Button>
        <Button
          variant="primary"
          onClick={handleVerify}
          disabled={loading || verificationCode.length !== 6}
          loading={loading}
          style={{ flex: 1 }}
        >
          {loading ? 'Verifiserer...' : 'Verifiser'}
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div>
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
        textAlign: 'center',
      }}>
        2FA aktivert!
      </SectionTitle>

      <p style={{
        fontSize: '15px', lineHeight: '20px', fontWeight: 600,
        color: 'var(--text-secondary)',
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        Lagre disse backup-kodene på et sikkert sted. Du kan bruke dem til å logge inn hvis du mister tilgang til autentiseringsappen.
      </p>

      <div style={{
        padding: '20px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}>
          {backupCodes.map((code, index) => (
            <div
              key={index}
              style={{
                padding: '12px',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
                fontFamily: 'monospace',
                fontSize: '15px', lineHeight: '20px', fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              {code}
            </div>
          ))}
        </div>
      </div>

      <div style={{
        padding: '16px',
        backgroundColor: 'rgba(var(--warning-rgb), 0.15)',
        border: '1px solid rgba(var(--warning-rgb), 0.3)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '24px',
      }}>
        <p style={{
          fontSize: '13px', lineHeight: '18px',
          color: 'var(--text-primary)',
          margin: 0,
        }}>
          <strong>Viktig:</strong> Hver backup-kode kan kun brukes én gang. Last ned eller skriv ut kodene og lagre dem sikkert.
        </p>
      </div>

      <Button
        variant="primary"
        onClick={handleComplete}
        style={{ width: '100%' }}
      >
        Fullfør
      </Button>
    </div>
  );

  return (
    <div style={{
      maxWidth: '500px',
      margin: '0 auto',
      padding: '32px',
      backgroundColor: 'var(--bg-primary)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      fontFamily: 'Inter, -apple-system, system-ui, sans-serif',
    }}>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
};

export default TwoFactorSetup;

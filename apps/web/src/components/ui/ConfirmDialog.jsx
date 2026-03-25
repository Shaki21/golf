import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X, AlertCircle, Info } from 'lucide-react';
import Button from '../../ui/primitives/Button';
import Card from '../../ui/primitives/Card';
import { SectionTitle } from '../typography';

/**
 * Confirm dialog component - UI Canon compliant
 * Uses Button and Card primitives with semantic tokens
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm action',
  message = 'Are you sure you want to continue?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'warning', // 'warning', 'danger', 'info'
}) {
  const dialogRef = useRef(null);
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      confirmButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getVariantConfig = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: AlertCircle,
          iconColor: 'var(--error)',
          iconBg: 'rgba(220, 38, 38, 0.1)',
          buttonVariant: 'primary',
        };
      case 'info':
        return {
          icon: Info,
          iconColor: 'var(--accent)',
          iconBg: 'rgba(59, 130, 246, 0.1)',
          buttonVariant: 'primary',
        };
      default: // warning
        return {
          icon: AlertTriangle,
          iconColor: 'var(--warning)',
          iconBg: 'rgba(245, 158, 11, 0.1)',
          buttonVariant: 'primary',
        };
    }
  };

  const config = getVariantConfig();
  const IconComponent = config.icon;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
    >
      <Card
        ref={dialogRef}
        variant="default"
        padding="lg"
        style={{
          maxWidth: '400px',
          width: '90%',
          animation: 'dialogFadeIn 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: config.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <IconComponent size={24} style={{ color: config.iconColor }} />
          </div>
          <div style={{ flex: 1 }}>
            <SectionTitle
              id="dialog-title"
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
                marginBottom: '8px',
              }}
            >
              {title}
            </SectionTitle>
            <p
              id="dialog-description"
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--text-tertiary)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '24px',
            justifyContent: 'flex-end',
          }}
        >
          <Button variant="ghost" size="sm" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmButtonRef}
            variant={config.buttonVariant}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </Card>

      <style>{`
        @keyframes dialogFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

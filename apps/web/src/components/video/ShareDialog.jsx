/**
 * ShareDialog Component
 * Modal dialog for sharing videos with coaches, players, or via link
 *
 * Features:
 * - Share with coach/player within app
 * - Generate shareable link (time-limited)
 * - Privacy controls (private, coach-only, public)
 * - Copy link to clipboard
 * - WhatsApp/Email share integration
 * - Expiration settings for links
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import apiClient from '../../services/apiClient';
import { SectionTitle, SubSectionTitle } from '../typography';

// Visibility options
export const VISIBILITY_OPTIONS = {
  PRIVATE: 'private',
  COACH_ONLY: 'coach_only',
  SHARED: 'shared',
  PUBLIC: 'public',
};

// Expiration options (in hours)
export const EXPIRATION_OPTIONS = [
  { value: 1, label: '1 time' },
  { value: 24, label: '24 timer' },
  { value: 168, label: '7 dager' },
  { value: 720, label: '30 dager' },
  { value: null, label: 'Aldri' },
];

// Styles
const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'var(--video-bg-light)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 'var(--spacing-4)',
  },
  dialog: {
    width: '100%',
    maxWidth: '480px',
    backgroundColor: 'var(--tier-toast-bg)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--video-border)',
    boxShadow: 'var(--video-shadow-xl)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--spacing-4)',
    borderBottom: '1px solid var(--video-border)',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-inverse)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  closeButton: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    color: 'var(--video-text-tertiary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
  },
  content: {
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--video-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  visibilityOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  visibilityOption: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3)',
    backgroundColor: 'var(--tier-surface-dark-elevated)',
    borderRadius: 'var(--radius-md)',
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  visibilityOptionSelected: {
    borderColor: 'var(--accent)',
    backgroundColor: 'var(--accent-muted)',
  },
  radioCircle: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '2px solid var(--video-border-strong)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  radioCircleSelected: {
    borderColor: 'var(--accent)',
  },
  radioInner: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-inverse)',
  },
  optionDescription: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: 'var(--video-text-tertiary)',
  },
  linkSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  linkInputContainer: {
    display: 'flex',
    gap: 'var(--spacing-2)',
  },
  linkInput: {
    flex: 1,
    padding: '10px 12px',
    backgroundColor: 'var(--tier-surface-dark-elevated)',
    border: '1px solid var(--video-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-inverse)',
    fontSize: '13px',
    fontFamily: 'var(--font-mono)',
  },
  copyButton: {
    padding: '10px 16px',
    backgroundColor: 'var(--accent)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    color: 'white',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  },
  copyButtonCopied: {
    backgroundColor: 'var(--success)',
  },
  expirationSelect: {
    padding: '10px 12px',
    backgroundColor: 'var(--tier-surface-dark-elevated)',
    border: '1px solid var(--video-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-inverse)',
    fontSize: '14px',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 10px center',
    paddingRight: '36px',
  },
  shareButtons: {
    display: 'flex',
    gap: 'var(--spacing-2)',
  },
  shareButton: {
    flex: 1,
    padding: '12px 16px',
    backgroundColor: 'var(--tier-surface-dark-elevated)',
    border: '1px solid var(--video-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--text-inverse)',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-2)',
    transition: 'all 0.15s ease',
  },
  whatsappButton: {
    backgroundColor: 'var(--share-whatsapp-muted)',
    borderColor: 'var(--share-whatsapp-border)',
    color: 'var(--share-whatsapp)',
  },
  emailButton: {
    backgroundColor: 'var(--share-email-muted)',
    borderColor: 'var(--share-email-border)',
    color: 'var(--share-email)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-4)',
    borderTop: '1px solid var(--video-border)',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    border: '1px solid var(--video-border-strong)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--video-text-secondary)',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '10px 20px',
    backgroundColor: 'var(--accent)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  saveButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  successMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    backgroundColor: 'var(--success-muted)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--success)',
    fontSize: '13px',
  },
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)',
    backgroundColor: 'var(--error-muted)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--error)',
    fontSize: '13px',
  },
};

// Icons
const ShareIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const CloseIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CopyIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const WhatsAppIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const EmailIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const LockIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const UsersIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const GlobeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

// Visibility option configurations
const VISIBILITY_CONFIGS = [
  {
    value: VISIBILITY_OPTIONS.PRIVATE,
    label: 'Privat',
    description: 'Bare du kan se denne videoen',
    icon: LockIcon,
  },
  {
    value: VISIBILITY_OPTIONS.COACH_ONLY,
    label: 'Kun coach',
    description: 'Synlig for deg og din coach',
    icon: UsersIcon,
  },
  {
    value: VISIBILITY_OPTIONS.SHARED,
    label: 'Delt med lenke',
    description: 'Alle med lenken kan se videoen',
    icon: ShareIcon,
  },
  {
    value: VISIBILITY_OPTIONS.PUBLIC,
    label: 'Offentlig',
    description: 'Synlig for alle i klubben',
    icon: GlobeIcon,
  },
];

/**
 * ShareDialog Component
 */
export function ShareDialog({
  video,
  isOpen,
  onClose,
  onShare,
  style,
  className,
}) {
  const [visibility, setVisibility] = useState(video?.visibility || VISIBILITY_OPTIONS.PRIVATE);
  const [expiration, setExpiration] = useState(168); // 7 days default
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const dialogRef = useRef(null);

  // Generate share link when visibility changes to shared
  useEffect(() => {
    if (visibility === VISIBILITY_OPTIONS.SHARED || visibility === VISIBILITY_OPTIONS.PUBLIC) {
      generateShareLink();
    } else {
      setShareLink('');
    }
  }, [visibility]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Generate share link
  const generateShareLink = useCallback(async () => {
    if (!video?.id) return;

    try {
      // In production, this would call the API
      // const response = await apiClient.post(`/videos/${video.id}/share-link`, {
      //   expiresIn: expiration,
      // });
      // setShareLink(response.data.shareUrl);

      // Demo link for now
      const baseUrl = window.location.origin;
      const token = Math.random().toString(36).substring(2, 15);
      setShareLink(`${baseUrl}/video/share/${video.id}?token=${token}`);
    } catch (err) {
      console.error('Failed to generate share link:', err);
    }
  }, [video?.id, expiration]);

  // Copy link to clipboard
  const handleCopyLink = useCallback(async () => {
    if (!shareLink) return;

    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [shareLink]);

  // Share via WhatsApp
  const handleWhatsAppShare = useCallback(() => {
    if (!shareLink) return;

    const text = encodeURIComponent(`Se på denne golfvideoen: ${video?.title || 'Video'}\n${shareLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }, [shareLink, video?.title]);

  // Share via Email
  const handleEmailShare = useCallback(() => {
    if (!shareLink) return;

    const subject = encodeURIComponent(`Golf Video: ${video?.title || 'Video'}`);
    const body = encodeURIComponent(`Hei!\n\nSjekk ut denne golfvideoen:\n${video?.title || ''}\n\n${shareLink}\n\nMvh`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  }, [shareLink, video?.title]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!video?.id) return;

    setLoading(true);
    setError(null);

    try {
      // In production, this would call the API
      // await apiClient.patch(`/videos/${video.id}`, {
      //   visibility,
      //   shareExpiresAt: expiration ? new Date(Date.now() + expiration * 60 * 60 * 1000).toISOString() : null,
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSuccess(true);
      onShare?.({
        visibility,
        shareLink: shareLink || null,
        expiration,
      });

      setTimeout(() => {
        onClose?.();
      }, 1500);
    } catch (err) {
      setError('Kunne ikke oppdatere delingsinnstillinger');
    } finally {
      setLoading(false);
    }
  }, [video?.id, visibility, shareLink, expiration, onShare, onClose]);

  // Handle overlay click
  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  }, [onClose]);

  if (!isOpen) return null;

  const showLinkSection = visibility === VISIBILITY_OPTIONS.SHARED || visibility === VISIBILITY_OPTIONS.PUBLIC;

  return (
    <div
      style={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-dialog-title"
    >
      <div ref={dialogRef} className={className} style={{ ...styles.dialog, ...style }}>
        {/* Header */}
        <div style={styles.header}>
          <SectionTitle id="share-dialog-title" style={styles.title}>
            <ShareIcon />
            Del video
          </SectionTitle>
          <button
            style={styles.closeButton}
            onClick={onClose}
            aria-label="Lukk"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* Success message */}
          {success && (
            <div style={styles.successMessage}>
              <CheckIcon />
              Delingsinnstillinger oppdatert!
            </div>
          )}

          {/* Error message */}
          {error && (
            <div style={styles.errorMessage}>
              {error}
            </div>
          )}

          {/* Visibility options */}
          <div style={styles.section}>
            <SubSectionTitle style={styles.sectionTitle}>Synlighet</SubSectionTitle>
            <div style={styles.visibilityOptions}>
              {VISIBILITY_CONFIGS.map((option) => {
                const Icon = option.icon;
                const isSelected = visibility === option.value;

                return (
                  <div
                    key={option.value}
                    style={{
                      ...styles.visibilityOption,
                      ...(isSelected ? styles.visibilityOptionSelected : {}),
                    }}
                    onClick={() => setVisibility(option.value)}
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={0}
                  >
                    <div
                      style={{
                        ...styles.radioCircle,
                        ...(isSelected ? styles.radioCircleSelected : {}),
                      }}
                    >
                      {isSelected && <div style={styles.radioInner} />}
                    </div>
                    <div style={styles.optionContent}>
                      <p style={styles.optionLabel}>
                        <Icon size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                        {option.label}
                      </p>
                      <p style={styles.optionDescription}>{option.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Link section (when sharing is enabled) */}
          {showLinkSection && (
            <div style={styles.section}>
              <SubSectionTitle style={styles.sectionTitle}>Delingslenke</SubSectionTitle>
              <div style={styles.linkSection}>
                <div style={styles.linkInputContainer}>
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    style={styles.linkInput}
                    onClick={(e) => e.target.select()}
                  />
                  <button
                    style={{
                      ...styles.copyButton,
                      ...(copied ? styles.copyButtonCopied : {}),
                    }}
                    onClick={handleCopyLink}
                  >
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    {copied ? 'Kopiert!' : 'Kopier'}
                  </button>
                </div>

                {/* Expiration */}
                <select
                  value={expiration || ''}
                  onChange={(e) => setExpiration(e.target.value ? Number(e.target.value) : null)}
                  style={styles.expirationSelect}
                >
                  {EXPIRATION_OPTIONS.map((option) => (
                    <option key={option.label} value={option.value || ''}>
                      Utløper: {option.label}
                    </option>
                  ))}
                </select>

                {/* Social share buttons */}
                <div style={styles.shareButtons}>
                  <button
                    style={{ ...styles.shareButton, ...styles.whatsappButton }}
                    onClick={handleWhatsAppShare}
                  >
                    <WhatsAppIcon />
                    WhatsApp
                  </button>
                  <button
                    style={{ ...styles.shareButton, ...styles.emailButton }}
                    onClick={handleEmailShare}
                  >
                    <EmailIcon />
                    E-post
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            style={styles.cancelButton}
            onClick={onClose}
          >
            Avbryt
          </button>
          <button
            style={{
              ...styles.saveButton,
              ...(loading ? styles.saveButtonDisabled : {}),
            }}
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Lagrer...' : 'Lagre endringer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareDialog;

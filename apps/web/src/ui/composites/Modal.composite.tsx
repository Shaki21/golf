import React from 'react';
import { SectionTitle } from '../../components/typography';

/**
 * Modal Composite
 * Modal dialog with overlay, animation, and mobile-optimized bottom sheet
 * Migrated to Tailwind CSS
 */

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  /** Modal open state */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal content */
  children: React.ReactNode;
  /** Footer content (typically buttons) */
  footer?: React.ReactNode;
  /** Size variant */
  size?: ModalSize;
  /** Show close button */
  showCloseButton?: boolean;
  /** Close on overlay click */
  closeOnOverlayClick?: boolean;
  /** Close on escape key */
  closeOnEsc?: boolean;
  /** Use bottom sheet on mobile */
  mobileBottomSheet?: boolean;
  /** Prevent body scroll when open */
  blockScroll?: boolean;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-[400px]',
  md: 'max-w-[600px]',
  lg: 'max-w-[800px]',
  xl: 'max-w-[1000px]',
  full: 'max-w-full h-full rounded-none',
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  mobileBottomSheet = true,
  blockScroll = true,
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEsc, onClose]);

  // Handle body scroll
  React.useEffect(() => {
    if (!blockScroll) return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, blockScroll]);

  // Focus trap
  React.useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    firstElement?.focus();

    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  const mobileClasses = mobileBottomSheet
    ? 'md:relative md:rounded-xl fixed bottom-0 left-0 right-0 rounded-t-xl rounded-b-none max-h-[90vh] md:max-h-[calc(100vh-32px)] md:bottom-auto'
    : '';

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={`relative bg-white rounded-xl shadow-xl flex flex-col w-full transition-all duration-200 ${SIZE_CLASSES[size]} ${mobileClasses} ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-5'}`}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-tier-border-subtle shrink-0">
            {title && (
              <SectionTitle id="modal-title" className="text-lg font-bold text-tier-navy m-0">
                {title}
              </SectionTitle>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="bg-transparent border-none p-2 cursor-pointer text-tier-text-secondary rounded hover:bg-tier-surface-subtle transition-colors duration-150 flex items-center justify-center"
                aria-label="Close modal"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-tier-border-subtle shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

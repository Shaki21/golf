import React from 'react';

/**
 * Toast Composite
 * Toast notification system with queue management
 * Migrated to Tailwind CSS
 */

type ToastVariant = 'info' | 'success' | 'warning' | 'error';
type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

interface Toast {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContainerProps {
  /** Position of toast container */
  position?: ToastPosition;
  /** Maximum number of toasts to show */
  maxToasts?: number;
}

interface ToastItemProps extends Toast {
  onClose: (id: string) => void;
}

// Toast Context
interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const POSITION_CLASSES: Record<ToastPosition, string> = {
  'top-left': 'top-0 left-0',
  'top-center': 'top-0 left-1/2 -translate-x-1/2',
  'top-right': 'top-0 right-0',
  'bottom-left': 'bottom-0 left-0 flex-col-reverse',
  'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2 flex-col-reverse',
  'bottom-right': 'bottom-0 right-0 flex-col-reverse',
};

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  info: 'border-l-4 border-tier-gold',
  success: 'border-l-4 border-green-500',
  warning: 'border-l-4 border-amber-500',
  error: 'border-l-4 border-red-500',
};

// Toast Provider
export const ToastProvider: React.FC<{ children: React.ReactNode } & ToastContainerProps> = ({
  children,
  position = 'top-right',
  maxToasts = 5,
}) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = {
      id,
      variant: 'info',
      duration: 5000,
      ...toast,
    };

    setToasts((prev) => {
      const updated = [...prev, newToast];
      return updated.slice(-maxToasts);
    });

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, [maxToasts]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer toasts={toasts} position={position} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer: React.FC<{
  toasts: Toast[];
  position: ToastPosition;
  onClose: (id: string) => void;
}> = ({ toasts, position, onClose }) => {
  if (toasts.length === 0) return null;

  return (
    <div className={`fixed z-[9999] flex flex-col gap-3 p-4 pointer-events-none ${POSITION_CLASSES[position]}`}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};

// Individual Toast Item
const ToastItem: React.FC<ToastItemProps> = ({
  id,
  message,
  variant = 'info',
  action,
  onClose,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="10" cy="10" r="8" />
            <path d="M6 10l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 2L2 17h16L10 2z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 8v4M10 14h.01" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="10" cy="10" r="8" />
            <path d="M12 8l-4 4M8 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="10" cy="10" r="8" />
            <path d="M10 6v4M10 14h.01" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`flex items-start gap-3 p-4 bg-white rounded-lg shadow-lg min-w-[300px] max-w-[450px] pointer-events-auto animate-slide-in-right ${VARIANT_CLASSES[variant]}`}
      role="alert"
      aria-live="polite"
    >
      <div className="shrink-0 mt-0.5">
        {getIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm text-tier-navy leading-relaxed">{message}</div>
        {action && (
          <button
            onClick={() => {
              action.onClick();
              onClose(id);
            }}
            className="mt-2 px-2 py-1 text-xs font-semibold text-tier-gold bg-transparent border-none cursor-pointer rounded hover:bg-tier-gold/10 transition-colors duration-150"
          >
            {action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => onClose(id)}
        className="shrink-0 p-1 bg-transparent border-none cursor-pointer text-tier-text-secondary rounded flex items-center justify-center hover:bg-tier-surface-subtle transition-colors duration-150"
        aria-label="Close notification"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 4L4 12M4 4l8 8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};

// Add animation styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  .animate-slide-in-right {
    animation: slideInRight 0.3s ease;
  }
`;
if (typeof document !== 'undefined' && !document.querySelector('#toast-styles')) {
  styleSheet.id = 'toast-styles';
  document.head.appendChild(styleSheet);
}

export default ToastProvider;

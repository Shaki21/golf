import React from 'react';
import { useNotification } from '../contexts/NotificationContext';

const Toast = () => {
  const { notifications, removeNotification } = useNotification();

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: 'var(--success)',
          icon: '✓'
        };
      case 'error':
        return {
          backgroundColor: 'var(--error)',
          icon: '✕'
        };
      case 'warning':
        return {
          backgroundColor: 'var(--warning)',
          icon: 'alert-triangle'
        };
      default:
        return {
          backgroundColor: 'var(--accent)',
          icon: 'info'
        };
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxWidth: '400px'
    }}>
      {notifications.map(notification => {
        const styles = getTypeStyles(notification.type);
        return (
          <div
            key={notification.id}
            style={{
              backgroundColor: styles.backgroundColor,
              color: 'white',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: 'slideIn 0.3s ease-out'
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>{styles.icon}</span>
            <span style={{ flex: 1, fontSize: '14px' }}>{notification.message}</span>
            <button
              onClick={() => removeNotification(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0',
                opacity: 0.8,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.opacity = '1'}
              onMouseLeave={(e) => e.target.style.opacity = '0.8'}
            >
              ×
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;

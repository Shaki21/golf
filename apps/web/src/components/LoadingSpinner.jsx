import React from 'react';

const LoadingSpinner = ({ size = 'md', message = '' }) => {
  const sizes = {
    sm: 16,
    md: 32,
    lg: 48
  };

  const spinnerSize = sizes[size] || sizes.md;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      gap: '12px'
    }}>
      <div
        style={{
          width: `${spinnerSize}px`,
          height: `${spinnerSize}px`,
          border: `3px solid ${'var(--border-default)'}`,
          borderTop: `3px solid ${'var(--accent)'}`,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}
      />
      {message && (
        <p style={{
          margin: 0,
          fontSize: '14px',
          color: 'var(--text-secondary)'
        }}>
          {message}
        </p>
      )}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingSpinner;

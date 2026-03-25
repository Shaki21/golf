/**
 * AK Golf Academy - Input Components
 * Design System v3.0 - Blue Palette 01
 */

import React from 'react';

// Text Input
interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  icon,
  fullWidth = false,
  style,
  ...props
}) => {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: fullWidth ? '100%' : 'auto',
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 500,
    color: '#1C1C1E',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  };

  const inputContainerStyles: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: icon ? '12px 12px 12px 44px' : '12px 16px',
    fontSize: '15px',
    lineHeight: '20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    border: `2px solid ${error ? '#C45B4E' : '#E5E5EA'}`,
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    color: '#1C1C1E',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    ...style,
  };

  const iconStyles: React.CSSProperties = {
    position: 'absolute',
    left: '14px',
    color: '#8E8E93',
    pointerEvents: 'none',
  };

  const helperStyles: React.CSSProperties = {
    fontSize: '12px',
    color: error ? '#C45B4E' : '#8E8E93',
  };

  return (
    <div style={containerStyles}>
      {label && <label style={labelStyles}>{label}</label>}
      <div style={inputContainerStyles}>
        {icon && <span style={iconStyles}>{icon}</span>}
        <input
          style={inputStyles}
          onFocus={(e) => {
            e.target.style.borderColor = '#10456A';
            e.target.style.boxShadow = '0 0 0 3px rgba(16, 69, 106, 0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#C45B4E' : '#E5E5EA';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <span style={helperStyles}>{error || helperText}</span>
      )}
    </div>
  );
};

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  style,
  ...props
}) => {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: fullWidth ? '100%' : 'auto',
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 500,
    color: '#1C1C1E',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  };

  const textareaStyles: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    lineHeight: '22px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    border: `2px solid ${error ? '#C45B4E' : '#E5E5EA'}`,
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    color: '#1C1C1E',
    outline: 'none',
    resize: 'vertical',
    minHeight: '100px',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    ...style,
  };

  const helperStyles: React.CSSProperties = {
    fontSize: '12px',
    color: error ? '#C45B4E' : '#8E8E93',
  };

  return (
    <div style={containerStyles}>
      {label && <label style={labelStyles}>{label}</label>}
      <textarea
        style={textareaStyles}
        onFocus={(e) => {
          e.target.style.borderColor = '#10456A';
          e.target.style.boxShadow = '0 0 0 3px rgba(16, 69, 106, 0.15)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#C45B4E' : '#E5E5EA';
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      {(error || helperText) && (
        <span style={helperStyles}>{error || helperText}</span>
      )}
    </div>
  );
};

// Select
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  onChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helperText,
  fullWidth = false,
  onChange,
  style,
  ...props
}) => {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: fullWidth ? '100%' : 'auto',
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '13px',
    fontWeight: 500,
    color: '#1C1C1E',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
  };

  const selectStyles: React.CSSProperties = {
    width: '100%',
    padding: '12px 40px 12px 16px',
    fontSize: '15px',
    lineHeight: '20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif",
    border: `2px solid ${error ? '#C45B4E' : '#E5E5EA'}`,
    borderRadius: '12px',
    backgroundColor: '#FFFFFF',
    color: '#1C1C1E',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%238E8E93' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    ...style,
  };

  const helperStyles: React.CSSProperties = {
    fontSize: '12px',
    color: error ? '#C45B4E' : '#8E8E93',
  };

  return (
    <div style={containerStyles}>
      {label && <label style={labelStyles}>{label}</label>}
      <select
        style={selectStyles}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={(e) => {
          e.target.style.borderColor = '#10456A';
          e.target.style.boxShadow = '0 0 0 3px rgba(16, 69, 106, 0.15)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#C45B4E' : '#E5E5EA';
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {(error || helperText) && (
        <span style={helperStyles}>{error || helperText}</span>
      )}
    </div>
  );
};

export default TextInput;

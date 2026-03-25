import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import {
  ThemeMode,
  getInitialTheme,
  applyTheme,
  subscribeToSystemTheme,
} from '../../theme/theme';

/**
 * ThemeSwitcher
 * Compact theme toggle with Light / Dark / System modes
 * Uses lucide icons and design system tokens
 */

const ThemeSwitcher: React.FC = () => {
  const [mode, setMode] = useState<ThemeMode>(() => getInitialTheme());

  // Initialize theme on mount
  useEffect(() => {
    applyTheme(mode);
  }, []);

  // Subscribe to system preference changes
  useEffect(() => {
    const cleanup = subscribeToSystemTheme(() => {
      // Force re-render when system preference changes
      setMode(getInitialTheme());
    });
    return cleanup;
  }, []);

  const handleModeChange = (newMode: ThemeMode) => {
    setMode(newMode);
    applyTheme(newMode);
  };

  const modes: { value: ThemeMode; icon: React.ReactNode; label: string; ariaLabel: string }[] = [
    { value: 'light', icon: <Sun size={16} />, label: 'Light', ariaLabel: 'Light mode' },
    { value: 'dark', icon: <Moon size={16} />, label: 'Dark', ariaLabel: 'Dark mode' },
    { value: 'system', icon: <Monitor size={16} />, label: 'System', ariaLabel: 'Follow system' },
  ];

  return (
    <div
      className="flex gap-0.5 p-0.5 bg-tier-surface-subtle rounded-lg border border-tier-border-subtle"
      role="group"
      aria-label="Theme selector"
    >
      {modes.map(({ value, icon, label, ariaLabel }) => (
        <button
          key={value}
          onClick={() => handleModeChange(value)}
          className={`flex items-center justify-center w-8 h-8 border-none rounded-md cursor-pointer transition-all duration-150 ${
            mode === value
              ? 'bg-white text-tier-navy shadow-sm'
              : 'bg-transparent text-tier-text-secondary hover:text-tier-navy'
          }`}
          aria-label={ariaLabel}
          aria-pressed={mode === value}
          title={label}
        >
          {icon}
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;

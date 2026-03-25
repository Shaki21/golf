import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * ThemeToggle Component
 * Simple toggle button for switching between themes
 */
export function ThemeToggle({ className = '' }) {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      aria-label={isDark ? 'Bytt til lyst tema' : 'Bytt til mørkt tema'}
      title={isDark ? 'Lyst tema' : 'Mørkt tema'}
    >
      {isDark ? (
        <SunIcon className="w-5 h-5" />
      ) : (
        <MoonIcon className="w-5 h-5" />
      )}
    </button>
  );
}

/**
 * ThemeSelector Component
 * Dropdown for selecting theme mode (light, dark, system)
 */
export function ThemeSelector({ className = '' }) {
  const { theme, setTheme, isDark } = useTheme();

  const themeOptions = [
    { value: 'light', label: 'Lyst', icon: SunIcon },
    { value: 'dark', label: 'Mørkt', icon: MoonIcon },
    { value: 'system', label: 'System', icon: ComputerIcon },
  ];

  return (
    <div className={`theme-selector ${className}`}>
      <label className="text-sm font-medium text-[--text-secondary] mb-2 block">
        Tema
      </label>
      <div className="flex gap-2">
        {themeOptions.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
              theme === value
                ? 'bg-[--tier-primary] text-white border-[--tier-primary]'
                : 'bg-[--background-white] text-[--text-primary] border-[--border-default] hover:border-[--tier-primary]'
            }`}
            aria-pressed={theme === value}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * ThemeSwitch Component
 * iOS-style toggle switch for dark mode
 */
export function ThemeSwitch({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <SunIcon className="w-4 h-4 text-[--text-secondary]" />
      <button
        role="switch"
        aria-checked={isDark}
        onClick={toggleTheme}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isDark ? 'bg-[--tier-primary]' : 'bg-[--border-default]'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            isDark ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <MoonIcon className="w-4 h-4 text-[--text-secondary]" />
    </div>
  );
}

// Icon components
function SunIcon({ className = '' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
      />
    </svg>
  );
}

function MoonIcon({ className = '' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
      />
    </svg>
  );
}

function ComputerIcon({ className = '' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
      />
    </svg>
  );
}

export default ThemeToggle;

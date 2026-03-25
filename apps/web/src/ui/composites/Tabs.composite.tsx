import React from 'react';

/**
 * Tabs Composite
 * Tabbed interface with keyboard navigation
 *
 * UI Canon:
 * - Consistent use of semantic tokens
 * - Three variants: default (underline), pills, underline
 * - Active state uses --color-primary
 */

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
  badge?: number | string;
}

interface TabsProps {
  /** Array of tabs */
  tabs: Tab[];
  /** Currently active tab ID */
  activeTab?: string;
  /** Default active tab ID (uncontrolled) */
  defaultActiveTab?: string;
  /** Change handler */
  onChange?: (tabId: string) => void;
  /** Variant style */
  variant?: 'default' | 'pills' | 'underline';
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Full width tabs */
  fullWidth?: boolean;
  /** Additional className */
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  defaultActiveTab,
  onChange,
  variant = 'default',
  orientation = 'horizontal',
  fullWidth = false,
  className = '',
}) => {
  const [internalActiveTab, setInternalActiveTab] = React.useState(
    defaultActiveTab || tabs[0]?.id || ''
  );

  const isControlled = activeTab !== undefined;
  const currentActiveTab = isControlled ? activeTab : internalActiveTab;

  const handleTabClick = (tabId: string, disabled?: boolean) => {
    if (disabled) return;

    if (!isControlled) {
      setInternalActiveTab(tabId);
    }
    onChange?.(tabId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const enabledTabs = tabs.filter((tab) => !tab.disabled);
    const currentIndex = enabledTabs.findIndex((tab) => tab.id === currentActiveTab);

    let nextIndex = currentIndex;

    if (orientation === 'horizontal') {
      if (e.key === 'ArrowLeft') {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : enabledTabs.length - 1;
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        nextIndex = currentIndex < enabledTabs.length - 1 ? currentIndex + 1 : 0;
        e.preventDefault();
      }
    } else {
      if (e.key === 'ArrowUp') {
        nextIndex = currentIndex > 0 ? currentIndex - 1 : enabledTabs.length - 1;
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        nextIndex = currentIndex < enabledTabs.length - 1 ? currentIndex + 1 : 0;
        e.preventDefault();
      }
    }

    if (nextIndex !== currentIndex) {
      handleTabClick(enabledTabs[nextIndex].id);
    }
  };

  // Variant classes for tab list
  const getTabListClasses = () => {
    const base = 'flex gap-1';
    const orientationClass = orientation === 'vertical'
      ? 'flex-col border-r border-tier-border-default min-w-[200px] border-b-0'
      : 'border-b border-tier-border-default';
    const widthClass = fullWidth ? 'w-full' : '';

    const variantClasses: Record<string, string> = {
      default: '',
      pills: 'bg-tier-surface-subtle rounded-lg p-1 border-none',
      underline: 'gap-4',
    };

    return `${base} ${orientationClass} ${widthClass} ${variantClasses[variant]}`;
  };

  // Variant classes for individual tabs
  const getTabClasses = (isActive: boolean, disabled?: boolean) => {
    const base = 'flex items-center gap-2 px-4 py-3 text-sm font-medium bg-transparent border-none cursor-pointer transition-all duration-150 whitespace-nowrap relative';

    const stateClasses = isActive
      ? 'text-tier-gold font-semibold'
      : 'text-tier-text-tertiary hover:text-tier-text-secondary';

    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
    const widthClass = fullWidth ? 'flex-1 justify-center' : '';

    const variantActiveClasses: Record<string, string> = {
      default: isActive ? 'border-b-2 border-b-tier-gold' : 'border-b-2 border-b-transparent',
      pills: isActive ? 'bg-white rounded shadow-sm' : 'rounded',
      underline: isActive ? 'border-b-2 border-b-tier-gold' : 'border-b-2 border-b-transparent',
    };

    return `${base} ${stateClasses} ${disabledClass} ${widthClass} ${variantActiveClasses[variant]}`;
  };

  return (
    <div className={`flex ${orientation === 'vertical' ? 'flex-row' : 'flex-col'} w-full ${className}`}>
      {/* Tab List */}
      <div
        role="tablist"
        aria-orientation={orientation as 'horizontal' | 'vertical'}
        className={getTabListClasses()}
      >
        {tabs.map((tab, index) => {
          const isActive = tab.id === currentActiveTab;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              aria-disabled={tab.disabled}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleTabClick(tab.id, tab.disabled)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={getTabClasses(isActive, tab.disabled)}
            >
              {tab.icon && <span className="flex items-center justify-center">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 text-[10px] font-semibold bg-tier-gold text-white rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`tabpanel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={tab.id !== currentActiveTab}
          className="py-4"
        >
          {tab.id === currentActiveTab && tab.content}
        </div>
      ))}
    </div>
  );
};

export default Tabs;

import React from 'react';

/**
 * Dropdown Composite
 * Dropdown menu with keyboard navigation and positioning
 * Migrated to Tailwind CSS
 */

interface DropdownItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
  onClick?: () => void;
}

interface DropdownProps {
  /** Trigger element */
  trigger: React.ReactNode;
  /** Menu items */
  items: DropdownItem[];
  /** Placement */
  placement?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  /** Close on item click */
  closeOnClick?: boolean;
  /** Additional className */
  className?: string;
}

type PlacementType = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

const PLACEMENT_CLASSES: Record<PlacementType, string> = {
  'bottom-left': 'top-full left-0 mt-2',
  'bottom-right': 'top-full right-0 mt-2',
  'top-left': 'bottom-full left-0 mb-2',
  'top-right': 'bottom-full right-0 mb-2',
};

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  placement = 'bottom-right',
  closeOnClick = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close on escape
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        setIsOpen(true);
        setFocusedIndex(0);
        e.preventDefault();
      }
      return;
    }

    const enabledItems = items.filter((item) => !item.disabled && !item.divider);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % enabledItems.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + enabledItems.length) % enabledItems.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        const focusedItem = enabledItems[focusedIndex];
        if (focusedItem && !focusedItem.disabled) {
          handleItemClick(focusedItem);
        }
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(enabledItems.length - 1);
        break;
    }
  };

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;

    item.onClick?.();

    if (closeOnClick) {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block ${className}`}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        tabIndex={0}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {/* Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          className={`absolute z-[1000] min-w-[200px] bg-white rounded-lg shadow-lg p-2 transition-all duration-150 ${PLACEMENT_CLASSES[placement]}`}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return <div key={item.id} className="h-px bg-tier-border-subtle my-2" role="separator" />;
            }

            const isFocused = items.filter((i) => !i.disabled && !i.divider).indexOf(item) === focusedIndex;

            return (
              <button
                key={item.id}
                role="menuitem"
                onClick={() => handleItemClick(item)}
                disabled={item.disabled}
                className={`flex items-center gap-3 w-full px-3 py-2 text-sm bg-transparent border-none rounded cursor-pointer transition-colors duration-150 text-left
                  ${isFocused ? 'bg-tier-surface-subtle' : ''}
                  ${item.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                  ${item.danger ? 'text-red-600' : 'text-tier-navy'}
                  hover:bg-tier-surface-subtle
                `}
                onMouseEnter={() => setFocusedIndex(items.filter((i) => !i.disabled && !i.divider).indexOf(item))}
              >
                {item.icon && <span className="flex items-center justify-center shrink-0">{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;

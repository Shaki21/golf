import React from 'react';

/**
 * Accordion Composite
 * Expandable/collapsible sections with animation
 */

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  /** Accordion items */
  items: AccordionItem[];
  /** Allow multiple items open */
  allowMultiple?: boolean;
  /** Default open item IDs */
  defaultOpenItems?: string[];
  /** Controlled open items */
  openItems?: string[];
  /** Change handler */
  onChange?: (openItems: string[]) => void;
  /** Show dividers between items */
  showDividers?: boolean;
  /** Additional className */
  className?: string;
}

const Accordion: React.FC<AccordionProps> = ({
  items,
  allowMultiple = false,
  defaultOpenItems = [],
  openItems,
  onChange,
  showDividers = true,
  className = '',
}) => {
  const [internalOpenItems, setInternalOpenItems] = React.useState<string[]>(defaultOpenItems);

  const isControlled = openItems !== undefined;
  const currentOpenItems = isControlled ? openItems : internalOpenItems;

  const handleToggle = (itemId: string, disabled?: boolean) => {
    if (disabled) return;

    let newOpenItems: string[];

    if (currentOpenItems.includes(itemId)) {
      newOpenItems = currentOpenItems.filter((id) => id !== itemId);
    } else {
      newOpenItems = allowMultiple
        ? [...currentOpenItems, itemId]
        : [itemId];
    }

    if (!isControlled) {
      setInternalOpenItems(newOpenItems);
    }
    onChange?.(newOpenItems);
  };

  return (
    <div className={`w-full ${className}`}>
      {items.map((item, index) => {
        const isOpen = currentOpenItems.includes(item.id);

        return (
          <div key={item.id}>
            {showDividers && index > 0 && <div className="h-px bg-tier-border-subtle my-2" />}

            <AccordionItemComponent
              item={item}
              isOpen={isOpen}
              onToggle={handleToggle}
            />
          </div>
        );
      })}
    </div>
  );
};

const AccordionItemComponent: React.FC<{
  item: AccordionItem;
  isOpen: boolean;
  onToggle: (id: string, disabled?: boolean) => void;
}> = ({ item, isOpen, onToggle }) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div className="w-full">
      {/* Header */}
      <button
        onClick={() => onToggle(item.id, item.disabled)}
        disabled={item.disabled}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${item.id}`}
        className={`flex items-center gap-3 w-full p-4 text-sm font-semibold text-tier-navy bg-transparent border-none rounded cursor-pointer transition-colors duration-150 text-left hover:bg-tier-surface-subtle ${
          item.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
        }`}
      >
        {item.icon && <span className="flex items-center justify-center shrink-0">{item.icon}</span>}
        <span className="flex-1">{item.title}</span>
        <span
          className="flex items-center justify-center shrink-0 text-tier-text-secondary transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 8l4 4 4-4" />
          </svg>
        </span>
      </button>

      {/* Content */}
      <div
        id={`accordion-content-${item.id}`}
        ref={contentRef}
        className="overflow-hidden transition-all duration-300"
        style={{
          height: height !== undefined ? `${height}px` : undefined,
          opacity: isOpen ? 1 : 0,
        }}
        aria-hidden={!isOpen}
      >
        <div className="px-4 pb-4 text-sm text-tier-text-secondary leading-relaxed">
          {item.content}
        </div>
      </div>
    </div>
  );
};

export default Accordion;

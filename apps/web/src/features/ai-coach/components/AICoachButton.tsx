/**
 * AICoachButton.tsx
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Zero inline styles
 *
 * Floating action button that opens the AI Coach panel.
 * Shows unread message badge when there are new messages.
 *
 * Position: Fixed bottom-right corner
 * Visibility: Always visible when panel is closed
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { useAICoach } from '../context/AICoachContext';

// =============================================================================
// Component
// =============================================================================

export function AICoachButton() {
  const { isOpen, unreadCount, togglePanel, markAsRead } = useAICoach();

  // Don't show button when panel is open
  if (isOpen) {
    return null;
  }

  const handleClick = () => {
    markAsRead();
    togglePanel();
  };

  return (
    <button
      onClick={handleClick}
      className="fixed right-4 bottom-4 flex items-center gap-2 py-3 px-4 bg-tier-navy text-white border-none rounded-full cursor-pointer shadow-lg z-[1000] transition-all duration-200 font-inherit hover:scale-105 hover:shadow-xl active:scale-[0.98] max-[480px]:right-3 max-[480px]:bottom-3 max-[480px]:p-3"
      aria-label={`Åpne AI Coach${unreadCount > 0 ? ` (${unreadCount} uleste)` : ''}`}
    >
      <Sparkles size={24} />
      <span className="font-semibold text-base max-[480px]:hidden">AI Coach</span>

      {/* Unread badge */}
      {unreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 flex items-center justify-center bg-tier-error text-white rounded-full text-[11px] font-bold leading-none shadow-sm"
          aria-label={`${unreadCount} uleste meldinger`}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}

export default AICoachButton;

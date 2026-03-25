/**
 * QuickActionMenu Component
 * Dropdown menu for quick player actions from dashboard
 *
 * Provides instant access to common coaching tasks without navigation
 */

import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/shadcn/dropdown-menu';
import { MoreVertical, MessageSquare, Calendar, FileText, TrendingUp, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuickMessageModal } from './QuickMessageModal';

export interface QuickActionMenuProps {
  playerId: string;
  playerName: string;
  playerEmail?: string;
  className?: string;
}

/**
 * Quick action dropdown menu for player cards
 *
 * @example
 * ```tsx
 * <QuickActionMenu
 *   playerId="player-123"
 *   playerName="John Doe"
 *   playerEmail="john@example.com"
 * />
 * ```
 */
export function QuickActionMenu({
  playerId,
  playerName,
  playerEmail,
  className = '',
}: QuickActionMenuProps) {
  const navigate = useNavigate();
  const [messageModalOpen, setMessageModalOpen] = useState(false);

  const handleSendMessage = () => {
    setMessageModalOpen(true);
  };

  const handleScheduleSession = () => {
    // Navigate to booking page with player pre-selected
    navigate(`/coach/booking?playerId=${playerId}`);
  };

  const handleAddNote = () => {
    // Navigate to notes with player context
    navigate(`/coach/notes/new?playerId=${playerId}&playerName=${encodeURIComponent(playerName)}`);
  };

  const handleViewProgress = () => {
    // Navigate to player progress page
    navigate(`/coach/athletes/${playerId}/progress`);
  };

  const handleViewProfile = () => {
    navigate(`/coach/athletes/${playerId}`);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={`p-2 hover:bg-tier-surface-secondary rounded-lg transition-colors
            focus:outline-none focus:ring-2 focus:ring-tier-gold focus:ring-offset-2 ${className}`}
          aria-label={`Quick actions for ${playerName}`}
        >
          <MoreVertical size={16} className="text-tier-text-secondary" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={handleSendMessage}
            className="cursor-pointer"
          >
            <MessageSquare size={16} className="mr-2 text-tier-gold" />
            <span>Send message</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleScheduleSession}
            className="cursor-pointer"
          >
            <Calendar size={16} className="mr-2 text-tier-gold" />
            <span>Schedule session</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleAddNote}
            className="cursor-pointer"
          >
            <FileText size={16} className="mr-2 text-tier-gold" />
            <span>Add note</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleViewProgress}
            className="cursor-pointer"
          >
            <TrendingUp size={16} className="mr-2 text-tier-navy" />
            <span>View progress</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleViewProfile}
            className="cursor-pointer"
          >
            <UserCircle size={16} className="mr-2 text-tier-navy" />
            <span>View full profile</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quick message modal */}
      <QuickMessageModal
        isOpen={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        playerId={playerId}
        playerName={playerName}
      />
    </>
  );
}

export default QuickActionMenu;

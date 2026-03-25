/**
 * InfoTooltip
 *
 * Reusable info icon with tooltip for providing contextual help
 * throughout the application.
 *
 * Usage:
 * <InfoTooltip content="This is a helpful explanation" />
 * <InfoTooltip content="Multi-line explanation" side="right" />
 */

import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from './shadcn/tooltip';

interface InfoTooltipProps {
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  size?: number;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  side = 'top',
  size = 14,
  className = '',
}) => {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center text-ak-text-tertiary hover:text-ak-text-secondary transition-colors cursor-help ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            <HelpCircle size={size} />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          <p className="text-xs leading-relaxed">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InfoTooltip;

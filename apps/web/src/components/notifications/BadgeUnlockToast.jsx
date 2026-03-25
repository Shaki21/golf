import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import {
  Award,
  BookOpen,
  Brain,
  Check,
  Clock,
  Dumbbell,
  Flag,
  Flame,
  Medal,
  Moon,
  Snowflake,
  Star,
  Sun,
  Sunrise,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react';

/**
 * Symbol to icon mapping
 * Matches BadgeSymbol enum from backend types.ts
 */
const SYMBOL_TO_ICON = {
  flame: Flame,
  trophy: Trophy,
  star: Star,
  target: Target,
  clock: Clock,
  check: Check,
  lightning: Zap,
  zap: Zap,
  flag: Flag,
  medal: Medal,
  dumbbell: Dumbbell,
  brain: Brain,
  sunrise: Sunrise,
  moon: Moon,
  snowflake: Snowflake,
  sun: Sun,
  book: BookOpen,
  award: Award,
};

/**
 * Tier styling configuration using semantic tokens
 * CSS variables are used for dynamic glow effects
 */
const TIER_CONFIG = {
  standard: {
    iconBg: 'bg-ak-tier-standard',
    border: 'border-ak-tier-standard',
    labelColor: 'text-ak-tier-standard',
    glowColor: 'var(--tier-standard-glow, rgba(100, 116, 139, 0.4))',
  },
  bronze: {
    iconBg: 'bg-ak-tier-bronze',
    border: 'border-ak-tier-bronze',
    labelColor: 'text-ak-tier-bronze',
    glowColor: 'var(--tier-bronze-glow, rgba(205, 127, 50, 0.4))',
  },
  silver: {
    iconBg: 'bg-ak-tier-silver',
    border: 'border-ak-tier-silver',
    labelColor: 'text-ak-tier-silver',
    glowColor: 'var(--tier-silver-glow, rgba(156, 163, 175, 0.4))',
  },
  gold: {
    iconBg: 'bg-ak-tier-gold',
    border: 'border-ak-tier-gold',
    labelColor: 'text-ak-tier-gold',
    glowColor: 'var(--tier-gold-glow, rgba(245, 158, 11, 0.4))',
  },
  platinum: {
    iconBg: 'bg-ak-tier-platinum',
    border: 'border-ak-tier-platinum',
    labelColor: 'text-ak-tier-platinum',
    glowColor: 'var(--tier-platinum-glow, rgba(139, 92, 246, 0.4))',
  },
};

/**
 * Individual badge unlock toast
 */
const BadgeToast = ({ badge, onClose, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const Icon = SYMBOL_TO_ICON[badge.symbol] || Trophy;
  const tierConfig = TIER_CONFIG[badge.tier] || TIER_CONFIG.standard;

  useEffect(() => {
    // Stagger animation
    const showTimer = setTimeout(() => setIsVisible(true), index * 200);

    // Auto-hide after 5 seconds
    const hideTimer = setTimeout(() => {
      handleClose();
    }, 5000 + index * 200);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(badge.id), 300);
  };

  return (
    <div
      className={clsx(
        'relative bg-ak-toast-bg rounded-2xl p-5 mb-3 flex items-center gap-4 border-2 max-w-[360px] cursor-pointer',
        'transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        tierConfig.border,
        isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
      )}
      style={{
        boxShadow: `0 4px 20px rgba(0,0,0,0.3), 0 0 40px ${tierConfig.glowColor}`,
      }}
      onClick={handleClose}
    >
      {/* Badge icon */}
      <div
        className={clsx(
          'w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse',
          tierConfig.iconBg
        )}
      >
        <Icon size={28} className="text-ak-toast-text" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div
          className={clsx(
            'text-[11px] font-semibold uppercase tracking-widest mb-1',
            tierConfig.labelColor
          )}
        >
          Merke Opptjent!
        </div>
        <div className="text-base font-bold text-ak-toast-text mb-1 truncate">
          {badge.name}
        </div>
        <div className="text-[13px] text-ak-toast-text-muted truncate">
          +{badge.xp} XP
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="absolute top-2 right-2 w-6 h-6 rounded-full border-none bg-white/10 text-ak-toast-text-muted cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-white/20"
      >
        <X size={14} />
      </button>
    </div>
  );
};

/**
 * Level up toast
 */
const LevelUpToast = ({ newLevel, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    const hideTimer = setTimeout(() => handleClose(), 6000);
    return () => clearTimeout(hideTimer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(), 300);
  };

  return (
    <div
      className={clsx(
        'relative bg-ak-toast-bg rounded-2xl p-6 mb-3 text-center border-2 border-ak-tier-gold max-w-[360px] cursor-pointer',
        'transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        isVisible && !isExiting
          ? 'translate-x-0 scale-100 opacity-100'
          : 'translate-x-[120%] scale-[0.8] opacity-0'
      )}
      style={{
        boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 60px var(--tier-gold-glow, rgba(245, 158, 11, 0.5))',
      }}
      onClick={handleClose}
    >
      <div className="text-xs font-semibold uppercase tracking-[0.15em] text-ak-tier-gold mb-2">
        Nivå Opp!
      </div>
      <div className="text-5xl font-extrabold text-ak-toast-text leading-none mb-2">
        {newLevel}
      </div>
      <div className="text-sm text-ak-toast-text-muted">
        Fortsett den gode innsatsen!
      </div>
    </div>
  );
};

/**
 * Badge unlock toast container
 * Shows badge unlock notifications in the bottom-right corner
 */
export const BadgeUnlockToast = ({ badges = [], levelUp = null, onDismiss }) => {
  const [visibleBadges, setVisibleBadges] = useState(badges);
  const [showLevelUp, setShowLevelUp] = useState(!!levelUp);

  useEffect(() => {
    setVisibleBadges(badges);
  }, [badges]);

  useEffect(() => {
    setShowLevelUp(!!levelUp);
  }, [levelUp]);

  const handleBadgeClose = (badgeId) => {
    setVisibleBadges((prev) => prev.filter((b) => b.id !== badgeId));
    onDismiss?.('badge', badgeId);
  };

  const handleLevelUpClose = () => {
    setShowLevelUp(false);
    onDismiss?.('levelUp', levelUp);
  };

  if (visibleBadges.length === 0 && !showLevelUp) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Level up toast (shows first) */}
      {showLevelUp && (
        <LevelUpToast newLevel={levelUp} onClose={handleLevelUpClose} />
      )}

      {/* Badge toasts */}
      {visibleBadges.map((badge, index) => (
        <BadgeToast
          key={badge.id}
          badge={badge}
          index={index}
          onClose={handleBadgeClose}
        />
      ))}
    </div>
  );
};

export default BadgeUnlockToast;

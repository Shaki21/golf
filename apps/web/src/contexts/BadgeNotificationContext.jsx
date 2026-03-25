import React, { createContext, useContext, useState, useCallback } from 'react';
import { BadgeUnlockToast } from '../components/notifications/BadgeUnlockToast';

/**
 * Badge notification context
 */
const BadgeNotificationContext = createContext(null);

/**
 * Badge notification provider
 * Wrap your app with this to enable badge unlock notifications
 */
export const BadgeNotificationProvider = ({ children }) => {
  const [pendingBadges, setPendingBadges] = useState([]);
  const [pendingLevelUp, setPendingLevelUp] = useState(null);

  /**
   * Show badge unlock notification(s)
   * @param {Array} badges - Array of badge objects with { id, name, tier, symbol, xp }
   */
  const showBadgeUnlock = useCallback((badges) => {
    if (!badges || badges.length === 0) return;

    const normalizedBadges = badges.map((b) => ({
      id: b.badgeId || b.id,
      name: b.badge?.name || b.name,
      tier: b.badge?.tier || b.tier,
      symbol: b.badge?.symbol || b.symbol,
      xp: b.xpAwarded || b.xp || 0,
    }));

    setPendingBadges((prev) => [...prev, ...normalizedBadges]);
  }, []);

  /**
   * Show level up notification
   * @param {number} newLevel - The new level reached
   */
  const showLevelUp = useCallback((newLevel) => {
    if (!newLevel) return;
    setPendingLevelUp(newLevel);
  }, []);

  /**
   * Process session completion result and show relevant notifications
   * @param {Object} result - Session completion result from API
   */
  const processSessionResult = useCallback((result) => {
    if (result.badgeUnlocks && result.badgeUnlocks.length > 0) {
      showBadgeUnlock(result.badgeUnlocks);
    }
    if (result.newLevel) {
      showLevelUp(result.newLevel);
    }
  }, [showBadgeUnlock, showLevelUp]);

  /**
   * Handle dismissal of notifications
   */
  const handleDismiss = useCallback((type, id) => {
    if (type === 'badge') {
      setPendingBadges((prev) => prev.filter((b) => b.id !== id));
    } else if (type === 'levelUp') {
      setPendingLevelUp(null);
    }
  }, []);

  /**
   * Clear all pending notifications
   */
  const clearAll = useCallback(() => {
    setPendingBadges([]);
    setPendingLevelUp(null);
  }, []);

  const value = {
    showBadgeUnlock,
    showLevelUp,
    processSessionResult,
    clearAll,
    hasPending: pendingBadges.length > 0 || pendingLevelUp !== null,
  };

  return (
    <BadgeNotificationContext.Provider value={value}>
      {children}
      <BadgeUnlockToast
        badges={pendingBadges}
        levelUp={pendingLevelUp}
        onDismiss={handleDismiss}
      />
    </BadgeNotificationContext.Provider>
  );
};

/**
 * Hook to access badge notifications
 */
export const useBadgeNotifications = () => {
  const context = useContext(BadgeNotificationContext);
  if (!context) {
    throw new Error('useBadgeNotifications must be used within BadgeNotificationProvider');
  }
  return context;
};

export default BadgeNotificationContext;

/**
 * useConfetti
 *
 * Hook for triggering confetti celebrations.
 * Pure CSS/Canvas implementation (no external dependencies).
 *
 * Note: To use canvas-confetti library for better effects, install it:
 * npm install canvas-confetti
 * And uncomment the canvas-confetti code below.
 */

import { useCallback } from 'react';

export function useConfetti() {
  const createConfettiPiece = (colors: string[]) => {
    const confetti = document.createElement('div');
    confetti.style.position = 'fixed';
    confetti.style.width = '10px';
    confetti.style.height = '10px';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * window.innerWidth + 'px';
    confetti.style.top = '-20px';
    confetti.style.opacity = '1';
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
    confetti.style.pointerEvents = 'none';
    confetti.style.zIndex = '9999';
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';

    document.body.appendChild(confetti);

    const animation = confetti.animate(
      [
        {
          transform: `translate(0, 0) rotate(0deg)`,
          opacity: 1,
        },
        {
          transform: `translate(${(Math.random() - 0.5) * 500}px, ${window.innerHeight + 20}px) rotate(${Math.random() * 720}deg)`,
          opacity: 0,
        },
      ],
      {
        duration: 2000 + Math.random() * 1000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }
    );

    animation.onfinish = () => {
      confetti.remove();
    };
  };

  const celebrateGoalReached = useCallback(() => {
    // Check for prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const colors = ['#10B981', '#F59E0B', '#3B82F6', '#C9A227'];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => createConfettiPiece(colors), i * 10);
    }
  }, []);

  const celebrateMilestone = useCallback(() => {
    // Check for prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const colors = ['#10B981', '#F59E0B', '#3B82F6'];
    const duration = 2000;
    const interval = setInterval(() => {
      for (let i = 0; i < 3; i++) {
        createConfettiPiece(colors);
      }
    }, 50);

    setTimeout(() => clearInterval(interval), duration);
  }, []);

  const celebrateBadge = useCallback(() => {
    // Check for prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const colors = ['#C9A227', '#F59E0B', '#FBBF24', '#FCD34D'];
    const particleCount = 150;

    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => createConfettiPiece(colors), i * 5);
    }
  }, []);

  return {
    celebrateGoalReached,
    celebrateMilestone,
    celebrateBadge,
  };
}

export default useConfetti;

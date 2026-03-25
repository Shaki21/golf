import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook for scroll-based animations
 * Triggers animation when element enters viewport
 */
export function useScrollAnimation(options = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    triggerOnce = true,
  } = options;

  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return { ref: elementRef, isVisible };
}

/**
 * Hook for staggered animations
 * Returns animation delay based on index
 */
export function useStaggerAnimation(index, baseDelay = 50) {
  return {
    style: {
      animationDelay: `${index * baseDelay}ms`,
    },
  };
}

/**
 * Hook for page transition animations
 */
export function usePageTransition() {
  const [isEntering, setIsEntering] = useState(true);

  useEffect(() => {
    // Small delay for initial render
    const timer = setTimeout(() => setIsEntering(false), 50);
    return () => clearTimeout(timer);
  }, []);

  return {
    className: isEntering ? 'page-enter' : 'page-enter-active',
    isEntering,
  };
}

/**
 * Hook for animated presence (mount/unmount)
 */
export function useAnimatedPresence(isPresent, duration = 250) {
  const [shouldRender, setShouldRender] = useState(isPresent);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isPresent) {
      setShouldRender(true);
      // Small delay for animation trigger
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), duration);
      return () => clearTimeout(timer);
    }
  }, [isPresent, duration]);

  return {
    shouldRender,
    animationClass: isAnimating ? 'animate-scale-in' : 'animate-scale-out',
  };
}

/**
 * Hook for shake animation (e.g., on error)
 */
export function useShake() {
  const [isShaking, setIsShaking] = useState(false);

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  }, []);

  return {
    isShaking,
    triggerShake,
    className: isShaking ? 'animate-shake' : '',
  };
}

/**
 * Hook for bounce animation (e.g., notification badge)
 */
export function useBounce() {
  const [isBouncing, setIsBouncing] = useState(false);

  const triggerBounce = useCallback(() => {
    setIsBouncing(true);
    setTimeout(() => setIsBouncing(false), 600);
  }, []);

  return {
    isBouncing,
    triggerBounce,
    className: isBouncing ? 'animate-bounce' : '',
  };
}

/**
 * Hook for pulse animation
 */
export function usePulse(continuous = false) {
  const [isPulsing, setIsPulsing] = useState(continuous);

  const startPulse = useCallback(() => setIsPulsing(true), []);
  const stopPulse = useCallback(() => setIsPulsing(false), []);

  return {
    isPulsing,
    startPulse,
    stopPulse,
    className: isPulsing ? 'animate-pulse-scale' : '',
  };
}

export default useScrollAnimation;

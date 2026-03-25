/**
 * AnimatedCounter
 *
 * Animated number counter with count-up effect using easeOutExpo easing.
 * Perfect for displaying statistics that animate on mount.
 */

import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  /** Target value to count up to */
  value: number;
  /** Duration of animation in milliseconds */
  duration?: number;
  /** Optional suffix (e.g., '%', 'kr', 'økter') */
  suffix?: string;
  /** Optional prefix (e.g., '+', '-', '~') */
  prefix?: string;
  /** Number of decimal places to show */
  decimals?: number;
  /** Custom class name for styling */
  className?: string;
  /** Delay before animation starts (ms) */
  delay?: number;
}

// Easing function: easeOutExpo
const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
};

export function AnimatedCounter({
  value,
  duration = 1500,
  suffix = '',
  prefix = '',
  decimals = 0,
  className = '',
  delay = 0,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (hasAnimated) return; // Only animate once

    const startAnimation = () => {
      setHasAnimated(true);
      startTimeRef.current = null;

      const animate = (currentTime: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = currentTime;
        }

        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutExpo(progress);
        const currentValue = easedProgress * value;

        setDisplayValue(currentValue);

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayValue(value); // Ensure we end at exact value
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    };

    const timeoutId = setTimeout(startAnimation, delay);

    return () => {
      clearTimeout(timeoutId);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [value, duration, delay, hasAnimated]);

  // Format the display value
  const formattedValue = displayValue.toFixed(decimals);

  return (
    <span className={className}>
      {prefix}{formattedValue}{suffix}
    </span>
  );
}

export default AnimatedCounter;

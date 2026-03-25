/**
 * BackToTop Component
 * Design System v3.0 - Premium Light
 *
 * MIGRATED TO PAGE ARCHITECTURE - Minimal inline styles (dynamic colors)
 */

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function BackToTop({ scrollThreshold = 300, targetId = 'main-content' }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const scrollContainer = target.querySelector('div') || target;

    const toggleVisibility = () => {
      if (scrollContainer.scrollTop > scrollThreshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    scrollContainer.addEventListener('scroll', toggleVisibility);
    return () => scrollContainer.removeEventListener('scroll', toggleVisibility);
  }, [scrollThreshold, targetId]);

  const scrollToTop = () => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const scrollContainer = target.querySelector('div') || target;
    scrollContainer.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: 'var(--tier-primary)',
        color: 'var(--tier-surface-card)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease',
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? 'visible' : 'hidden',
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        zIndex: 1000,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--tier-primary-light)';
        e.currentTarget.style.transform = isVisible ? 'translateY(-2px)' : 'translateY(20px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--tier-primary)';
        e.currentTarget.style.transform = isVisible ? 'translateY(0)' : 'translateY(20px)';
      }}
      aria-label="Tilbake til toppen"
      title="Tilbake til toppen"
    >
      <ArrowUp size={24} />
    </button>
  );
}

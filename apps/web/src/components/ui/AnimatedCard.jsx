import React from 'react';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

/**
 * AnimatedCard Component
 * A card wrapper with built-in scroll animations
 */
export function AnimatedCard({
  children,
  className = '',
  animation = 'fade-in-up',
  hover = 'lift',
  delay = 0,
  onClick,
  ...props
}) {
  const { ref, isVisible } = useScrollAnimation({
    threshold: 0.1,
    triggerOnce: true,
  });

  const animationClass = isVisible ? `animate-${animation}` : 'opacity-0';
  const hoverClass = hover ? `hover-${hover}` : '';

  return (
    <div
      ref={ref}
      className={`${animationClass} ${hoverClass} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * AnimatedList Component
 * Renders children with staggered animations
 */
export function AnimatedList({
  children,
  className = '',
  staggerDelay = 50,
  animation = 'fade-in-up',
}) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        return React.cloneElement(child, {
          className: `${child.props.className || ''} animate-${animation}`,
          style: {
            ...child.props.style,
            animationDelay: `${index * staggerDelay}ms`,
            opacity: 0,
            animationFillMode: 'forwards',
          },
        });
      })}
    </div>
  );
}

/**
 * FadeIn Component
 * Simple fade-in wrapper
 */
export function FadeIn({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 'normal',
}) {
  const directionMap = {
    up: 'fade-in-up',
    down: 'fade-in-down',
    left: 'fade-in-left',
    right: 'fade-in-right',
    none: 'fade-in',
  };

  return (
    <div
      className={`animate-${directionMap[direction]} duration-${duration} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * ScaleIn Component
 * Scale animation wrapper
 */
export function ScaleIn({
  children,
  className = '',
  delay = 0,
  pop = false,
}) {
  const animationType = pop ? 'pop-in' : 'scale-in';

  return (
    <div
      className={`animate-${animationType} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * SlideIn Component
 * Slide animation wrapper
 */
export function SlideIn({
  children,
  className = '',
  direction = 'right',
  delay = 0,
}) {
  const directionMap = {
    right: 'slide-in-right',
    left: 'slide-in-left',
    up: 'slide-in-up',
    down: 'slide-in-down',
  };

  return (
    <div
      className={`animate-${directionMap[direction]} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Transition Component
 * For controlled show/hide transitions
 */
export function Transition({
  show,
  children,
  enter = 'scale-in',
  exit = 'scale-out',
  duration = 250,
  className = '',
  unmountOnExit = true,
}) {
  const [shouldRender, setShouldRender] = React.useState(show);
  const [animationClass, setAnimationClass] = React.useState(
    show ? `animate-${enter}` : ''
  );

  React.useEffect(() => {
    if (show) {
      setShouldRender(true);
      // Small delay for animation trigger
      requestAnimationFrame(() => {
        setAnimationClass(`animate-${enter}`);
      });
    } else {
      setAnimationClass(`animate-${exit}`);
      if (unmountOnExit) {
        const timer = setTimeout(() => setShouldRender(false), duration);
        return () => clearTimeout(timer);
      }
    }
  }, [show, enter, exit, duration, unmountOnExit]);

  if (!shouldRender && unmountOnExit) {
    return null;
  }

  return (
    <div className={`${animationClass} ${className}`}>
      {children}
    </div>
  );
}

export default AnimatedCard;

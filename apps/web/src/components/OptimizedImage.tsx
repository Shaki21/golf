/**
 * OptimizedImage Component
 *
 * A performance-optimized image component with:
 * - Lazy loading (native browser API)
 * - Responsive srcset
 * - WebP support with fallback
 * - Loading skeleton with tier branding
 * - Error state handling
 */

import React, { useState, useEffect } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Image source URL */
  src: string;
  /** Alt text (required for accessibility) */
  alt: string;
  /** Optional WebP source (will be used if browser supports it) */
  webpSrc?: string;
  /** Responsive image sources for different screen sizes */
  srcSet?: string;
  /** Image sizes for responsive loading */
  sizes?: string;
  /** Whether to lazy load the image (default: true) */
  lazy?: boolean;
  /** Loading skeleton background color (default: tier-navy/10) */
  skeletonColor?: string;
  /** Aspect ratio for skeleton (e.g., "16/9", "1/1") */
  aspectRatio?: string;
  /** Fallback image if loading fails */
  fallbackSrc?: string;
  /** Callback when image loads successfully */
  onLoad?: () => void;
  /** Callback when image fails to load */
  onError?: () => void;
}

/**
 * OptimizedImage - Lazy-loading image with WebP support and loading state
 *
 * @example
 * // Basic usage
 * <OptimizedImage
 *   src="/images/avatar.jpg"
 *   webpSrc="/images/avatar.webp"
 *   alt="User avatar"
 * />
 *
 * @example
 * // Responsive images
 * <OptimizedImage
 *   src="/images/hero.jpg"
 *   srcSet="/images/hero-400.jpg 400w, /images/hero-800.jpg 800w"
 *   sizes="(max-width: 600px) 400px, 800px"
 *   alt="Hero image"
 * />
 *
 * @example
 * // With aspect ratio skeleton
 * <OptimizedImage
 *   src="/images/product.jpg"
 *   alt="Product"
 *   aspectRatio="4/3"
 * />
 */
export function OptimizedImage({
  src,
  webpSrc,
  alt,
  srcSet,
  sizes,
  lazy = true,
  skeletonColor = 'rgb(var(--tier-navy-rgb) / 0.1)',
  aspectRatio,
  fallbackSrc,
  onLoad: onLoadProp,
  onError: onErrorProp,
  className = '',
  style,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Check for WebP support
  useEffect(() => {
    if (!webpSrc) return;

    // Modern browsers support WebP
    const img = new Image();
    img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
    img.onload = () => {
      setCurrentSrc(webpSrc);
    };
    img.onerror = () => {
      // Fallback to original src
      setCurrentSrc(src);
    };
  }, [webpSrc, src]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoadProp?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);

    // Try fallback if available
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false); // Try again with fallback
    } else {
      onErrorProp?.();
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...(aspectRatio && {
      aspectRatio,
      width: '100%',
    }),
    ...style,
  };

  const skeletonStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: skeletonColor,
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoading ? 0 : 1,
  };

  const errorStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(var(--tier-navy-rgb) / 0.05)',
    color: 'rgb(var(--tier-navy-rgb) / 0.4)',
    fontSize: '14px',
  };

  return (
    <div style={containerStyle} className={className}>
      {/* Loading skeleton */}
      {isLoading && !hasError && (
        <div style={skeletonStyle} role="status" aria-label="Loading image" />
      )}

      {/* Error state */}
      {hasError && (
        <div style={errorStyle}>
          <span>Image unavailable</span>
        </div>
      )}

      {/* Actual image */}
      {!hasError && (
        <img
          {...props}
          src={currentSrc}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={lazy ? 'lazy' : 'eager'}
          onLoad={handleLoad}
          onError={handleError}
          style={imageStyle}
        />
      )}
    </div>
  );
}

/**
 * AvatarImage - Optimized component for user avatars
 * Circular with fallback to initials
 */
interface AvatarImageProps {
  src?: string;
  alt: string;
  size?: number;
  initials?: string;
  className?: string;
}

export function AvatarImage({
  src,
  alt,
  size = 40,
  initials,
  className = '',
}: AvatarImageProps) {
  const [hasError, setHasError] = useState(false);

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: 'rgb(var(--tier-navy-rgb))',
    color: 'rgb(var(--tier-white-rgb))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.4,
    fontWeight: 600,
    flexShrink: 0,
  };

  if (!src || hasError) {
    return (
      <div style={containerStyle} className={className} title={alt}>
        {initials || alt.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      lazy={true}
      aspectRatio="1/1"
      onError={() => setHasError(true)}
      style={{ borderRadius: '50%' }}
      className={className}
    />
  );
}

/**
 * ProductImage - Optimized component for product/item images
 * With zoom on hover support
 */
interface ProductImageProps {
  src: string;
  webpSrc?: string;
  alt: string;
  aspectRatio?: string;
  enableZoom?: boolean;
  className?: string;
}

export function ProductImage({
  src,
  webpSrc,
  alt,
  aspectRatio = '4/3',
  enableZoom = false,
  className = '',
}: ProductImageProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  const imageStyle: React.CSSProperties | undefined = enableZoom
    ? {
        transform: isZoomed ? 'scale(1.1)' : 'scale(1)',
        transition: 'transform 0.3s ease',
        cursor: 'zoom-in',
      }
    : undefined;

  return (
    <div
      onMouseEnter={() => enableZoom && setIsZoomed(true)}
      onMouseLeave={() => enableZoom && setIsZoomed(false)}
      className={className}
    >
      <OptimizedImage
        src={src}
        webpSrc={webpSrc}
        alt={alt}
        aspectRatio={aspectRatio}
        style={imageStyle}
      />
    </div>
  );
}

// Add keyframe animation for skeleton pulse
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
  `;
  document.head.appendChild(style);
}

export default OptimizedImage;

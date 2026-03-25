import React from 'react';

/**
 * Text Primitive
 * Typography component following Apple HIG type scale
 */

type TextVariant =
  | 'largeTitle'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'headline'
  | 'body'
  | 'subheadline'
  | 'footnote'
  | 'caption1'
  | 'caption2';

type TextWeight = 300 | 400 | 500 | 600 | 700;
type TextAlign = 'left' | 'center' | 'right';
type TextColor = 'primary' | 'secondary' | 'tertiary' | 'brand' | 'inverse' | 'accent' | 'error' | 'success' | 'warning';

interface TextProps {
  /** Typography variant */
  variant?: TextVariant;
  /** HTML element to render */
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';
  /** Font weight */
  weight?: TextWeight;
  /** Text alignment */
  align?: TextAlign;
  /** Text color from design system */
  color?: TextColor;
  /** Custom color value */
  customColor?: string;
  /** Truncate text with ellipsis */
  truncate?: boolean;
  /** Number of lines before truncation */
  lineClamp?: number;
  /** Text content */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

const Text: React.FC<TextProps> = ({
  variant = 'body',
  as = 'p',
  weight,
  align = 'left',
  color = 'primary',
  customColor,
  truncate = false,
  lineClamp,
  children,
  className = '',
  style = {},
}) => {
  const Component = as as keyof JSX.IntrinsicElements;

  const textStyle: React.CSSProperties = {
    ...styles.base,
    ...styles.variants[variant],
    ...(weight && { fontWeight: weight }),
    textAlign: align,
    color: customColor || colors[color],
    ...(truncate && styles.truncate),
    ...(lineClamp && {
      ...styles.lineClamp,
      WebkitLineClamp: lineClamp,
    }),
    ...style,
  };

  return (
    <Component style={textStyle} className={className}>
      {children}
    </Component>
  );
};

const colors: Record<TextColor, string> = {
  primary: 'var(--text-primary)',
  secondary: 'var(--text-secondary)',
  tertiary: 'var(--text-tertiary)',
  brand: 'var(--text-brand)',
  inverse: 'var(--text-inverse)',
  accent: 'var(--text-accent)',
  error: 'var(--error)',
  success: 'var(--success)',
  warning: 'var(--warning)',
};

const styles: Record<string, React.CSSProperties | Record<string, React.CSSProperties>> = {
  base: {
    fontFamily: 'var(--font-family)',
    margin: 0,
  } as React.CSSProperties,
  variants: {
    largeTitle: {
      fontSize: 'var(--font-size-large-title)',
      lineHeight: 'var(--line-height-large-title)',
      fontWeight: 700,
    },
    title1: {
      fontSize: 'var(--font-size-title1)',
      lineHeight: 'var(--line-height-title1)',
      fontWeight: 700,
    },
    title2: {
      fontSize: 'var(--font-size-title2)',
      lineHeight: 'var(--line-height-title2)',
      fontWeight: 700,
    },
    title3: {
      fontSize: 'var(--font-size-title3)',
      lineHeight: 'var(--line-height-title3)',
      fontWeight: 600,
    },
    headline: {
      fontSize: 'var(--font-size-headline)',
      lineHeight: 'var(--line-height-headline)',
      fontWeight: 600,
    },
    body: {
      fontSize: 'var(--font-size-body)',
      lineHeight: 'var(--line-height-body)',
      fontWeight: 400,
    },
    subheadline: {
      fontSize: 'var(--font-size-subheadline)',
      lineHeight: 'var(--line-height-subheadline)',
      fontWeight: 400,
    },
    footnote: {
      fontSize: 'var(--font-size-footnote)',
      lineHeight: 'var(--line-height-footnote)',
      fontWeight: 400,
    },
    caption1: {
      fontSize: 'var(--font-size-caption1)',
      lineHeight: 'var(--line-height-caption1)',
      fontWeight: 400,
    },
    caption2: {
      fontSize: 'var(--font-size-caption2)',
      lineHeight: 'var(--line-height-caption2)',
      fontWeight: 400,
    },
  },
  truncate: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as React.CSSProperties,
  lineClamp: {
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as React.CSSProperties,
};

export default Text;

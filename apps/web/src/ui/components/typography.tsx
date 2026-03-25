import React from 'react';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * PageTitle - For h1 elements (main page titles)
 */
export const PageTitle: React.FC<TypographyProps> = ({ children, className, style }) => (
  <h1 className={className} style={style}>
    {children}
  </h1>
);

/**
 * SectionTitle - For h2 elements (section headings)
 */
export const SectionTitle: React.FC<TypographyProps> = ({ children, className, style }) => (
  <h2 className={className} style={style}>
    {children}
  </h2>
);

/**
 * SubSectionTitle - For h3 elements (subsection headings)
 */
export const SubSectionTitle: React.FC<TypographyProps> = ({ children, className, style }) => (
  <h3 className={className} style={style}>
    {children}
  </h3>
);

/**
 * CardTitle - For h4 elements (card titles)
 */
export const CardTitle: React.FC<TypographyProps> = ({ children, className, style }) => (
  <h4 className={className} style={style}>
    {children}
  </h4>
);

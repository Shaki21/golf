import { ReactNode, CSSProperties } from 'react';

export interface BadgeProps {
  color?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Badge(props: BadgeProps): JSX.Element;

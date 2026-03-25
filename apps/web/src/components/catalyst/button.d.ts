import { ComponentPropsWithoutRef, ReactNode, ForwardRefExoticComponent, RefAttributes } from 'react';

export interface ButtonProps extends Omit<ComponentPropsWithoutRef<'button'>, 'color'> {
  color?: string;
  outline?: boolean;
  plain?: boolean;
  href?: string;
  children?: ReactNode;
  className?: string;
}

export const Button: ForwardRefExoticComponent<ButtonProps & RefAttributes<HTMLButtonElement | HTMLAnchorElement>>;

export interface TouchTargetProps {
  children?: ReactNode;
}

export function TouchTarget(props: TouchTargetProps): JSX.Element;

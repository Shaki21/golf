import { ComponentPropsWithoutRef, ReactNode, ForwardRefExoticComponent, RefAttributes } from 'react';

export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  'data-invalid'?: boolean;
  className?: string;
}

export const Input: ForwardRefExoticComponent<InputProps & RefAttributes<HTMLInputElement>>;

export interface InputGroupProps {
  children?: ReactNode;
  className?: string;
}

export function InputGroup(props: InputGroupProps): JSX.Element;

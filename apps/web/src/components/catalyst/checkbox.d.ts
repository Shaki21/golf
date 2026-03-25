import { ComponentPropsWithoutRef, ReactNode, ForwardRefExoticComponent, RefAttributes } from 'react';

export interface CheckboxProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'onChange'> {
  color?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  name?: string;
  className?: string;
}

export const Checkbox: ForwardRefExoticComponent<CheckboxProps & RefAttributes<HTMLInputElement>>;

export interface CheckboxFieldProps {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function CheckboxField(props: CheckboxFieldProps): JSX.Element;

export interface CheckboxGroupProps {
  children?: ReactNode;
  className?: string;
}

export function CheckboxGroup(props: CheckboxGroupProps): JSX.Element;

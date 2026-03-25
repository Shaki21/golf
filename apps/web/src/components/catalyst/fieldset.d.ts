import { ReactNode } from 'react';

export interface FieldProps {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function Field(props: FieldProps): JSX.Element;

export interface LabelProps {
  children?: ReactNode;
  className?: string;
}

export function Label(props: LabelProps): JSX.Element;

export interface DescriptionProps {
  children?: ReactNode;
  className?: string;
}

export function Description(props: DescriptionProps): JSX.Element;

export interface ErrorMessageProps {
  children?: ReactNode;
  className?: string;
}

export function ErrorMessage(props: ErrorMessageProps): JSX.Element;

export interface FieldsetProps {
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function Fieldset(props: FieldsetProps): JSX.Element;

export interface LegendProps {
  children?: ReactNode;
  className?: string;
}

export function Legend(props: LegendProps): JSX.Element;

export interface FieldGroupProps {
  children?: ReactNode;
  className?: string;
}

export function FieldGroup(props: FieldGroupProps): JSX.Element;

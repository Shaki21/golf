/**
 * TIER Golf - Input Components
 * Premium Light System: Stone × Midnight Blue × Emerald × Soft Gold
 *
 * NOW POWERED BY CATALYST UI
 *
 * Rules:
 * - Inputs are calm/neutral
 * - Focus = ak.action (blue)
 * - Errors = ak.status.error only
 */

import React from "react";
// @ts-ignore - Catalyst components are JS
import { Input as CatalystInput, InputGroup } from "../../components/catalyst/input";
// @ts-ignore - Catalyst components are JS
import { Field, Label, Description, ErrorMessage } from "../../components/catalyst/fieldset";

type InputSize = "sm" | "md";

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  /** @deprecated Use helperText instead */
  hint?: string;
  icon?: React.ReactNode;
  /** Addon element on the left side */
  leftAddon?: React.ReactNode;
  fullWidth?: boolean;
  /** Input size variant */
  size?: InputSize;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  helperText,
  hint,
  icon,
  leftAddon,
  fullWidth = false,
  size = "md",
  className,
  ...props
}) => {
  const resolvedHelperText = helperText ?? hint;
  const hasLeftElement = Boolean(icon || leftAddon);
  const isInvalid = Boolean(error);

  // Cast to any to handle JS component type mismatch
  const Input = CatalystInput as any;

  const inputElement = hasLeftElement ? (
    <InputGroup>
      {(icon || leftAddon) && <span data-slot="icon">{icon ?? leftAddon}</span>}
      <Input
        data-invalid={isInvalid || undefined}
        className={className}
        {...props}
      />
    </InputGroup>
  ) : (
    <Input
      data-invalid={isInvalid || undefined}
      className={className}
      {...props}
    />
  );

  // If no label/error/helper, just return the input
  if (!label && !error && !resolvedHelperText) {
    return (
      <div className={fullWidth ? "w-full" : ""}>
        {inputElement}
      </div>
    );
  }

  return (
    <Field className={fullWidth ? "w-full" : ""}>
      {label && <Label className="">{label}</Label>}
      {inputElement}
      {error && <ErrorMessage className="">{error}</ErrorMessage>}
      {!error && resolvedHelperText && <Description className="">{resolvedHelperText}</Description>}
    </Field>
  );
};

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  fullWidth = false,
  className,
  ...props
}) => {
  return (
    <div className={["flex flex-col gap-1.5", fullWidth ? "w-full" : ""].join(" ")}>
      {label ? (
        <label className="text-[13px] font-medium text-ak-text-primary">
          {label}
        </label>
      ) : null}

      <textarea
        className={[
          "w-full min-h-[100px] resize-y rounded-xl bg-ak-surface-elevated px-4 py-3",
          "text-[15px] leading-[22px] text-ak-text-body",
          "border-2",
          error ? "border-ak-status-error" : "border-ak-surface-border",
          "outline-none transition-all duration-200",
          "focus:border-ak-action-active focus:ring-2 focus:ring-ak-action-active/20",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />

      {error || helperText ? (
        <span
          className={[
            "text-[12px]",
            error ? "text-ak-status-error" : "text-ak-text-muted",
          ].join(" ")}
        >
          {error ?? helperText}
        </span>
      ) : null}
    </div>
  );
};

// Select
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  onChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helperText,
  fullWidth = false,
  onChange,
  className,
  ...props
}) => {
  return (
    <div className={["flex flex-col gap-1.5", fullWidth ? "w-full" : ""].join(" ")}>
      {label ? (
        <label className="text-[13px] font-medium text-ak-text-primary">
          {label}
        </label>
      ) : null}

      <div className="relative">
        <select
          className={[
            "w-full appearance-none rounded-xl bg-ak-surface-elevated px-4 py-3 pr-10",
            "text-[15px] leading-[20px] text-ak-text-body",
            "border-2",
            error ? "border-ak-status-error" : "border-ak-surface-border",
            "outline-none transition-all duration-200",
            "focus:border-ak-action-active focus:ring-2 focus:ring-ak-action-active/20",
            "cursor-pointer",
            className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
          onChange={(e) => onChange?.(e.target.value)}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Chevron */}
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ak-text-muted">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>

      {error || helperText ? (
        <span
          className={[
            "text-[12px]",
            error ? "text-ak-status-error" : "text-ak-text-muted",
          ].join(" ")}
        >
          {error ?? helperText}
        </span>
      ) : null}
    </div>
  );
};

// Alias for backwards compatibility
export const Input = TextInput;

export default TextInput;

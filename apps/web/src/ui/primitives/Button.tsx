/**
 * TIER Golf - Button Component
 * Premium Light System: Stone × Midnight Blue × Emerald × Soft Gold
 *
 * NOW POWERED BY CATALYST UI
 *
 * Rules:
 * - Primary action = ak.action (blue)
 * - Progress (emerald) is NOT allowed for buttons
 * - Prestige (gold) only for premium/earned contexts
 */

import React from "react";
// @ts-ignore - Catalyst components are JS
import { Button as CatalystButton } from "../../components/catalyst/button";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "destructive" // alias for danger
  | "success"
  | "premium"
  | "outline"; // backwards compat alias for secondary

export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  /** @deprecated Use icon with iconPosition="left" instead */
  leftIcon?: React.ReactNode;
  /** @deprecated Use icon with iconPosition="right" instead */
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  href?: string;
}

// Map our variants to Catalyst colors
const variantToCatalyst: Record<ButtonVariant, { color?: string; outline?: boolean; plain?: boolean }> = {
  primary: { color: "primary" },
  secondary: { outline: true },
  outline: { outline: true },
  ghost: { plain: true },
  danger: { color: "error" },
  destructive: { color: "error" },
  success: { color: "success" },
  premium: { color: "gold" },
};

// Size-specific classes to add
const sizeClasses: Record<ButtonSize, string> = {
  sm: "!text-xs !py-1.5 !px-3",
  md: "", // Default Catalyst size
  lg: "!text-base !py-3 !px-6",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = "left",
  leftIcon,
  rightIcon,
  children,
  disabled,
  className,
  href,
  ...props
}) => {
  const isDisabled = Boolean(disabled || loading);
  const resolvedLeftIcon = leftIcon ?? (iconPosition === "left" ? icon : undefined);
  const resolvedRightIcon = rightIcon ?? (iconPosition === "right" ? icon : undefined);

  const catalystProps = variantToCatalyst[variant];
  const combinedClassName = [
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    className ?? "",
  ].filter(Boolean).join(" ");

  // Cast to any to handle JS component type mismatch
  const Btn = CatalystButton as any;

  return (
    <Btn
      color={catalystProps.color}
      outline={catalystProps.outline}
      plain={catalystProps.plain}
      disabled={isDisabled}
      className={combinedClassName}
      href={href}
      {...props}
    >
      {loading ? (
        <span className="opacity-80">Loading...</span>
      ) : (
        <>
          {resolvedLeftIcon && <span data-slot="icon">{resolvedLeftIcon}</span>}
          {children}
          {resolvedRightIcon && <span data-slot="icon">{resolvedRightIcon}</span>}
        </>
      )}
    </Btn>
  );
};

export default Button;

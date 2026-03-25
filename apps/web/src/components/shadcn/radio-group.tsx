/**
 * Radio Group Component - shadcn API compatible wrapper for Catalyst Radio
 *
 * NOW POWERED BY CATALYST UI
 */

import * as React from "react"
import {
  RadioGroup as CatalystRadioGroup,
  RadioField as CatalystRadioField,
  Radio as CatalystRadio,
} from "../catalyst/radio"
import { Label, Description } from "../catalyst/fieldset"
import { cn } from "lib/utils"

// Re-export Catalyst components directly for new code
export {
  CatalystRadioGroup,
  CatalystRadioField,
  CatalystRadio,
}

/**
 * RadioGroup - Root group component
 */
interface RadioGroupProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  name?: string
  className?: string
  children?: React.ReactNode
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, defaultValue, onValueChange, ...props }, ref) => (
    <CatalystRadioGroup
      value={value}
      defaultValue={defaultValue}
      onChange={onValueChange}
      className={cn("grid gap-2", className)}
      {...props}
    />
  )
)
RadioGroup.displayName = "RadioGroup"

/**
 * RadioGroupItem - Individual radio button
 */
interface RadioGroupItemProps {
  value: string
  id?: string
  disabled?: boolean
  className?: string
  /** Color for the radio button */
  color?: string
}

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className, value, color = "blue", ...props }, ref) => (
    <CatalystRadio
      value={value}
      color={color}
      className={className}
      {...props}
    />
  )
)
RadioGroupItem.displayName = "RadioGroupItem"

/**
 * RadioField - Wrapper for radio with label (Catalyst-specific)
 */
interface RadioFieldProps {
  className?: string
  children: React.ReactNode
}

const RadioField: React.FC<RadioFieldProps> = ({ className, children }) => (
  <CatalystRadioField className={className}>
    {children}
  </CatalystRadioField>
)
RadioField.displayName = "RadioField"

export { RadioGroup, RadioGroupItem, RadioField, Label, Description }

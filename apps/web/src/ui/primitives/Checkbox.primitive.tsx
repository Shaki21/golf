import React from 'react';
// @ts-ignore - Catalyst components are JS
import { Checkbox as CatalystCheckbox, CheckboxField } from '../../components/catalyst/checkbox';
// @ts-ignore - Catalyst components are JS
import { Label, Description } from '../../components/catalyst/fieldset';

/**
 * Checkbox Primitive
 * Checkbox input with custom styling
 *
 * NOW POWERED BY CATALYST UI
 */

type CheckboxSize = 'sm' | 'md' | 'lg';

interface CheckboxProps {
  /** Checkbox label */
  label?: string;
  /** Size variant */
  size?: CheckboxSize;
  /** Indeterminate state */
  indeterminate?: boolean;
  /** Error state */
  error?: boolean;
  /** Helper text */
  helperText?: string;
  /** Checked state */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Change handler */
  onChange?: (checked: boolean) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Name attribute */
  name?: string;
  /** Additional className */
  className?: string;
  /** ID attribute */
  id?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  size = 'md',
  indeterminate = false,
  error = false,
  helperText,
  checked,
  defaultChecked,
  onChange,
  disabled,
  name,
  className = '',
  id,
}) => {
  const [internalChecked, setInternalChecked] = React.useState(defaultChecked || false);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internalChecked;

  const handleChange = (newChecked: boolean) => {
    if (!isControlled) {
      setInternalChecked(newChecked);
    }
    onChange?.(newChecked);
  };

  // Catalyst uses blue as default, which matches TIER Golf primary
  const color = error ? 'red' : 'blue';

  // If we have a label, use CheckboxField for proper layout
  if (label) {
    return (
      <CheckboxField className={className}>
        <CatalystCheckbox
          name={name}
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          color={color}
          indeterminate={indeterminate}
          className=""
        />
        <Label className="">{label}</Label>
        {helperText && (
          <Description className={error ? 'text-ak-status-error' : ''}>
            {helperText}
          </Description>
        )}
      </CheckboxField>
    );
  }

  // Simple checkbox without label
  return (
    <CatalystCheckbox
      name={name}
      checked={isChecked}
      onChange={handleChange}
      disabled={disabled}
      color={color}
      className={className}
      indeterminate={indeterminate}
    />
  );
};

Checkbox.displayName = 'Checkbox';

export default Checkbox;

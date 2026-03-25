import React from 'react';
// @ts-ignore - Catalyst components are JS
import { Switch as CatalystSwitch, SwitchField } from '../../components/catalyst/switch';
// @ts-ignore - Catalyst components are JS
import { Label, Description } from '../../components/catalyst/fieldset';

/**
 * Switch Primitive
 * Toggle switch for binary choices
 *
 * NOW POWERED BY CATALYST UI
 */

type SwitchSize = 'sm' | 'md' | 'lg';

interface SwitchProps {
  /** Checked state */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Change handler */
  onChange?: (checked: boolean) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: SwitchSize;
  /** Label text */
  label?: string;
  /** Label position */
  labelPosition?: 'left' | 'right';
  /** Name attribute */
  name?: string;
  /** Additional className */
  className?: string;
  /** Helper/description text */
  description?: string;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  labelPosition = 'right',
  name,
  className = '',
  description,
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

  // Map Catalyst color based on primary TIER Golf theme
  const color = 'blue'; // Uses TIER Golf primary blue

  // If we have a label, use SwitchField for proper layout
  if (label) {
    return (
      <SwitchField
        className={[
          className,
          labelPosition === 'left' ? 'flex-row-reverse' : '',
        ].filter(Boolean).join(' ')}
      >
        <Label className="">{label}</Label>
        {description && <Description className="">{description}</Description>}
        <CatalystSwitch
          name={name}
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
          color={color}
          className=""
        />
      </SwitchField>
    );
  }

  // Simple switch without label
  return (
    <CatalystSwitch
      name={name}
      checked={isChecked}
      onChange={handleChange}
      disabled={disabled}
      color={color}
      className={className}
    />
  );
};

export default Switch;

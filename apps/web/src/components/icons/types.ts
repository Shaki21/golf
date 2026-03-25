/**
 * TIER Golf - Custom Icon Types
 *
 * Shared types for all custom icons.
 * Icons are 24x24px with 1.5px stroke by default.
 */

import { SVGProps } from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

export const defaultIconProps = {
  size: 24,
  strokeWidth: 1.5,
};

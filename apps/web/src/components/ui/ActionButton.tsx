/**
 * ============================================================
 * ActionButton - Semantic buttons for common actions
 * TIER Golf Design System v3.1
 * ============================================================
 *
 * Provides developers with simple, semantic buttons for common use cases.
 * Uses the correct color automatically based on action type.
 *
 * Usage:
 * <ActionButton.Save onClick={handleSave} />
 * <ActionButton.Cancel onClick={handleCancel} />
 * <ActionButton.Delete onClick={handleDelete} />
 *
 * ============================================================
 */

import React from 'react';
import { Button, type ButtonProps } from '../shadcn/button';
import {
  Save,
  X,
  Trash2,
  Plus,
  Edit,
  Check,
  ArrowLeft,
  ArrowRight,
  Send,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Copy,
  Share2,
  Settings,
  type LucideIcon,
} from 'lucide-react';

type ActionButtonProps = Omit<ButtonProps, 'variant'> & {
  loading?: boolean;
  loadingText?: string;
};

// Helper for creating action buttons
function createActionButton(
  Icon: LucideIcon,
  defaultLabel: string,
  variant: ButtonProps['variant'],
  defaultSize: ButtonProps['size'] = 'default'
) {
  const ActionButtonComponent = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
    ({ children, loading, loadingText, disabled, size = defaultSize, ...props }, ref) => {
      return (
        <Button
          ref={ref}
          variant={variant}
          size={size}
          disabled={disabled || loading}
          {...props}
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin" size={16} />
              {loadingText || children || defaultLabel}
            </>
          ) : (
            <>
              <Icon size={16} />
              {children || defaultLabel}
            </>
          )}
        </Button>
      );
    }
  );
  ActionButtonComponent.displayName = `ActionButton`;
  return ActionButtonComponent;
}

// ═══════════════════════════════════════════════════════════
// PRIMARY ACTIONS (Gold)
// ═══════════════════════════════════════════════════════════

/** Save - Primary action */
export const SaveButton = createActionButton(Save, 'Save', 'default');

/** Send - Primary action */
export const SendButton = createActionButton(Send, 'Send', 'default');

/** Create - Primary action */
export const CreateButton = createActionButton(Plus, 'Create', 'default');

/** Add - Primary action */
export const AddButton = createActionButton(Plus, 'Add', 'default');

// ═══════════════════════════════════════════════════════════
// SECONDARY ACTIONS (Navy outline)
// ═══════════════════════════════════════════════════════════

/** Cancel - Secondary action */
export const CancelButton = createActionButton(X, 'Cancel', 'outline');

/** Back - Secondary action */
export const BackButton = createActionButton(ArrowLeft, 'Back', 'outline');

/** Next - Secondary action */
export const NextButton = createActionButton(ArrowRight, 'Next', 'outline');

/** Edit - Secondary action */
export const EditButton = createActionButton(Edit, 'Edit', 'outline');

// ═══════════════════════════════════════════════════════════
// DESTRUCTIVE ACTIONS (Red)
// ═══════════════════════════════════════════════════════════

/** Delete - Destructive action */
export const DeleteButton = createActionButton(Trash2, 'Delete', 'destructive');

/** Remove - Destructive action */
export const RemoveButton = createActionButton(X, 'Remove', 'destructive');

// ═══════════════════════════════════════════════════════════
// CONFIRMATION (Green)
// ═══════════════════════════════════════════════════════════

/** Confirm - Success action */
export const ConfirmButton = createActionButton(Check, 'Confirm', 'success');

/** Approve - Success action */
export const ApproveButton = createActionButton(Check, 'Approve', 'success');

// ═══════════════════════════════════════════════════════════
// TERTIARY ACTIONS (Gray)
// ═══════════════════════════════════════════════════════════

/** Download - Tertiary action */
export const DownloadButton = createActionButton(Download, 'Download', 'secondary');

/** Upload - Tertiary action */
export const UploadButton = createActionButton(Upload, 'Upload', 'secondary');

/** Copy - Tertiary action */
export const CopyButton = createActionButton(Copy, 'Copy', 'secondary');

/** Share - Tertiary action */
export const ShareButton = createActionButton(Share2, 'Share', 'secondary');

/** View - Tertiary action */
export const ViewButton = createActionButton(Eye, 'View', 'secondary');

/** Settings - Tertiary action */
export const SettingsButton = createActionButton(Settings, 'Settings', 'secondary');

/** Refresh - Tertiary action */
export const RefreshButton = createActionButton(RefreshCw, 'Refresh', 'secondary');

// ═══════════════════════════════════════════════════════════
// ICON-ONLY BUTTONS
// ═══════════════════════════════════════════════════════════

type IconButtonProps = Omit<ButtonProps, 'variant' | 'size' | 'children'> & {
  'aria-label': string;
};

function createIconButton(Icon: LucideIcon, variant: ButtonProps['variant']) {
  const IconButtonComponent = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ 'aria-label': ariaLabel, ...props }, ref) => {
      return (
        <Button
          ref={ref}
          variant={variant}
          size="icon"
          aria-label={ariaLabel}
          {...props}
        >
          <Icon size={18} />
        </Button>
      );
    }
  );
  IconButtonComponent.displayName = `IconButton`;
  return IconButtonComponent;
}

/** Close icon button */
export const CloseIconButton = createIconButton(X, 'ghost');

/** Edit icon button */
export const EditIconButton = createIconButton(Edit, 'ghost');

/** Delete icon button */
export const DeleteIconButton = createIconButton(Trash2, 'ghost');

/** Add icon button */
export const AddIconButton = createIconButton(Plus, 'ghost');

/** Copy icon button */
export const CopyIconButton = createIconButton(Copy, 'ghost');

/** Settings icon button */
export const SettingsIconButton = createIconButton(Settings, 'ghost');

// ═══════════════════════════════════════════════════════════
// COMBINED EXPORTS
// ═══════════════════════════════════════════════════════════

export const ActionButton = {
  // Primary
  Save: SaveButton,
  Send: SendButton,
  Create: CreateButton,
  Add: AddButton,

  // Secondary
  Cancel: CancelButton,
  Back: BackButton,
  Next: NextButton,
  Edit: EditButton,

  // Destructive
  Delete: DeleteButton,
  Remove: RemoveButton,

  // Confirmation
  Confirm: ConfirmButton,
  Approve: ApproveButton,

  // Tertiary
  Download: DownloadButton,
  Upload: UploadButton,
  Copy: CopyButton,
  Share: ShareButton,
  View: ViewButton,
  Settings: SettingsButton,
  Refresh: RefreshButton,

  // Icon-only
  CloseIcon: CloseIconButton,
  EditIcon: EditIconButton,
  DeleteIcon: DeleteIconButton,
  AddIcon: AddIconButton,
  CopyIcon: CopyIconButton,
  SettingsIcon: SettingsIconButton,
};

export default ActionButton;

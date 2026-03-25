/**
 * DeleteConfirmModal
 * Design System v3.0 - Premium Light
 *
 * Reusable confirmation modal for delete operations.
 * Uses tier color tokens for consistent branding.
 */

import React from 'react';
import Modal from '../../ui/composites/Modal.composite';
import Button from '../../ui/primitives/Button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm deletion',
  itemName,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
}: DeleteConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-tier-navy">
        {message || (
          <>
            Are you sure you want to delete{' '}
            <strong className="text-tier-gold">{itemName}</strong>?
          </>
        )}
      </p>
      <p className="text-tier-text-secondary text-sm mt-2">
        This action cannot be undone.
      </p>
    </Modal>
  );
}

export default DeleteConfirmModal;

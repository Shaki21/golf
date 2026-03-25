import React from 'react';
import { AppShell, PageHeader } from '../raw-blocks';
import { Button, Text } from '../primitives';
import { Tabs, Modal } from '../composites';

/**
 * SettingsTemplate
 * Settings page template with tabbed sections
 */

interface SettingsTab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  description?: string;
}

interface SettingsTemplateProps {
  /** Page title */
  title?: string;
  /** Page subtitle */
  subtitle?: string;
  /** Settings tabs */
  tabs: SettingsTab[];
  /** Show save button */
  showSave?: boolean;
  /** Save handler */
  onSave?: () => void | Promise<void>;
  /** Show cancel button */
  showCancel?: boolean;
  /** Cancel handler */
  onCancel?: () => void;
  /** Show reset button */
  showReset?: boolean;
  /** Reset handler */
  onReset?: () => void;
  /** Unsaved changes */
  hasUnsavedChanges?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Sticky footer */
  stickyFooter?: boolean;
}

const SettingsTemplate: React.FC<SettingsTemplateProps> = ({
  title = 'Settings',
  subtitle = 'Manage your preferences and configuration',
  tabs,
  showSave = true,
  onSave,
  showCancel = true,
  onCancel,
  showReset = false,
  onReset,
  hasUnsavedChanges = false,
  loading = false,
  stickyFooter = true,
}) => {
  const [saving, setSaving] = React.useState(false);
  const [resetModalOpen, setResetModalOpen] = React.useState(false);

  const handleSave = async () => {
    if (!onSave) return;

    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setResetModalOpen(false);
    onReset?.();
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      if (!confirmed) return;
    }
    onCancel?.();
  };

  return (
    <AppShell
      header={
        <PageHeader
          title={title}
          subtitle={subtitle}
        />
      }
    >
      <div className="flex flex-col gap-6 w-full pb-[100px]">
        <div className="bg-white rounded-lg p-5 shadow-sm">
          {/* Tabs */}
          <Tabs
            tabs={tabs}
            variant="pills"
            orientation="vertical"
            defaultActiveTab={tabs[0]?.id}
          />
        </div>

        {/* Footer Actions */}
        {(showSave || showCancel || showReset) && (
          <div
            className={`bg-white border-t border-tier-border-subtle py-4 mt-auto ${
              stickyFooter ? 'fixed bottom-0 left-0 right-0 z-30 shadow-sm' : ''
            }`}
          >
            <div className="w-full px-4 flex flex-col gap-3">
              {hasUnsavedChanges && (
                <Text variant="footnote" color="warning">
                  You have unsaved changes
                </Text>
              )}

              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
                {showReset && onReset && (
                  <Button
                    variant="ghost"
                    onClick={() => setResetModalOpen(true)}
                    disabled={loading || saving}
                  >
                    Reset to default
                  </Button>
                )}

                <div className="flex flex-col md:flex-row gap-3 md:w-auto w-full">
                  {showCancel && onCancel && (
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading || saving}
                    >
                      Cancel
                    </Button>
                  )}

                  {showSave && onSave && (
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      loading={saving}
                      disabled={loading || !hasUnsavedChanges}
                    >
                      Save changes
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset to default"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setResetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReset}
            >
              Reset
            </Button>
          </>
        }
      >
        <Text>
          Are you sure you want to reset all settings to default values?
          This action cannot be undone.
        </Text>
      </Modal>
    </AppShell>
  );
};

export default SettingsTemplate;

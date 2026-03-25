import React from 'react';
import { AppShell, PageHeader, CardSimple, CardHeader } from '../raw-blocks';
import { Button, Text, Badge, Divider, Avatar } from '../primitives';
import { Tabs, Dropdown, Modal } from '../composites';

/**
 * DetailTemplate
 * Detail view template for individual items
 */

interface DetailField {
  id: string;
  label: string;
  value: React.ReactNode;
  type?: 'text' | 'badge' | 'avatar' | 'custom';
  variant?: 'default' | 'success' | 'warning' | 'error' | 'primary';
}

interface DetailSection {
  id: string;
  title?: string;
  fields: DetailField[];
}

interface DetailAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  danger?: boolean;
}

interface DetailTab {
  id: string;
  label: string;
  content: React.ReactNode;
  badge?: number | string;
}

interface DetailTemplateProps {
  /** Page title */
  title: string;
  /** Page subtitle */
  subtitle?: string;
  /** Status badge */
  status?: {
    label: string;
    variant: 'default' | 'success' | 'warning' | 'error' | 'primary';
  };
  /** Detail sections */
  sections: DetailSection[];
  /** Content tabs */
  tabs?: DetailTab[];
  /** Primary action */
  primaryAction?: DetailAction;
  /** Additional actions (dropdown) */
  actions?: DetailAction[];
  /** Back handler */
  onBack?: () => void;
  /** Loading state */
  loading?: boolean;
  /** Header image/avatar */
  headerImage?: string;
  /** Show timestamps */
  createdAt?: string;
  updatedAt?: string;
}

const DetailTemplate: React.FC<DetailTemplateProps> = ({
  title,
  subtitle,
  status,
  sections,
  tabs,
  primaryAction,
  actions,
  onBack,
  loading = false,
  headerImage,
  createdAt,
  updatedAt,
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('nb-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderFieldValue = (field: DetailField) => {
    switch (field.type) {
      case 'badge':
        return (
          <Badge variant={field.variant as any} pill>
            {field.value}
          </Badge>
        );

      case 'avatar':
        if (typeof field.value === 'string') {
          return <Avatar src={field.value} name={field.label} size="sm" />;
        }
        return field.value;

      case 'custom':
        return field.value;

      default:
        return (
          <Text variant="body" color="primary">
            {field.value || '—'}
          </Text>
        );
    }
  };

  return (
    <AppShell
      header={
        <PageHeader
          title={title}
          subtitle={subtitle}
          onBack={onBack}
          actions={
            <div className="flex items-center gap-3 flex-wrap">
              {status && (
                <Badge variant={status.variant} pill>
                  {status.label}
                </Badge>
              )}

              {primaryAction && (
                <Button
                  variant={primaryAction.variant || 'primary'}
                  onClick={primaryAction.onClick}
                  leftIcon={primaryAction.icon}
                >
                  {primaryAction.label}
                </Button>
              )}

              {actions && actions.length > 0 && (
                <Dropdown
                  trigger={
                    <Button variant="outline">
                      More
                    </Button>
                  }
                  items={actions.map((action) => ({
                    id: action.id,
                    label: action.label,
                    icon: action.icon,
                    danger: action.danger,
                    onClick: action.onClick,
                  }))}
                  placement="bottom-right"
                />
              )}
            </div>
          }
        />
      }
    >
      <div className="flex flex-col gap-6 w-full">
        {/* Header Image */}
        {headerImage && (
          <div
            className="w-full h-[300px] bg-cover bg-center rounded-lg shadow-sm"
            style={{ backgroundImage: `url(${headerImage})` }}
          />
        )}

        {/* Detail Sections */}
        <div className="flex flex-col gap-4">
          {sections.map((section) => (
            <CardSimple key={section.id} padding="lg">
              {section.title && (
                <>
                  <CardHeader title={section.title} size="sm" />
                  <Divider spacing={16} />
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
                {section.fields.map((field) => (
                  <div key={field.id} className="flex flex-col gap-2">
                    <Text variant="caption1" color="secondary" weight={600}>
                      {field.label}
                    </Text>
                    <div className="min-h-[24px]">
                      {renderFieldValue(field)}
                    </div>
                  </div>
                ))}
              </div>
            </CardSimple>
          ))}

          {/* Timestamps */}
          {(createdAt || updatedAt) && (
            <CardSimple padding="md">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-wrap">
                {createdAt && (
                  <Text variant="caption1" color="tertiary">
                    Created: {formatTimestamp(createdAt)}
                  </Text>
                )}
                {updatedAt && (
                  <Text variant="caption1" color="tertiary">
                    Last updated: {formatTimestamp(updatedAt)}
                  </Text>
                )}
              </div>
            </CardSimple>
          )}
        </div>

        {/* Content Tabs */}
        {tabs && tabs.length > 0 && (
          <div className="bg-white rounded-lg p-5 shadow-sm">
            <Tabs
              tabs={tabs}
              variant="underline"
              defaultActiveTab={tabs[0]?.id}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm deletion"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                // Handle delete
                setDeleteModalOpen(false);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <Text>
          Are you sure you want to delete this item? This action cannot be undone.
        </Text>
      </Modal>
    </AppShell>
  );
};

export default DetailTemplate;

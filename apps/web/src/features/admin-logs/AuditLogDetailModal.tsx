/**
 * TIER Golf - Audit Log Detail Modal
 * Design System v3.0 - Premium Light
 *
 * Modal for viewing detailed audit log information.
 */

import React from 'react';
import { X, User, Database, Calendar, Globe } from 'lucide-react';
import Button from '../../ui/primitives/Button';
import { Text } from '../../ui/primitives';
import { SectionTitle } from '../../components/typography/Headings';

interface AuditEvent {
  id: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  actor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
  };
}

interface AuditLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditEvent | null;
}

export const AuditLogDetailModal: React.FC<AuditLogDetailModalProps> = ({
  isOpen,
  onClose,
  log,
}) => {
  if (!isOpen || !log) return null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('no-NO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionBadgeColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return 'bg-green-100 text-green-700';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-700';
      case 'DELETE':
        return 'bg-red-100 text-red-700';
      case 'LOGIN':
        return 'bg-purple-100 text-purple-700';
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-tier-surface-base text-tier-text-secondary';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-tier-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-tier-border-default flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-tier-navy/10 flex items-center justify-center">
              <Database size={20} className="text-tier-navy" />
            </div>
            <SectionTitle style={{ marginBottom: 0 }}>
              Audit Log Detaljer
            </SectionTitle>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-tier-surface-base rounded-lg transition-colors"
          >
            <X size={20} className="text-tier-text-tertiary" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="p-5 space-y-6 overflow-y-auto flex-1">
          {/* Basic Information */}
          <div>
            <Text className="font-semibold text-tier-navy mb-3">
              Grunnleggende informasjon
            </Text>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-tier-text-secondary mb-1">Tidspunkt</dt>
                <dd className="font-medium text-tier-navy flex items-center gap-2">
                  <Calendar size={16} className="text-tier-text-tertiary" />
                  {formatDateTime(log.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-tier-text-secondary mb-1">Handling</dt>
                <dd>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getActionBadgeColor(log.action)}`}>
                    {log.action}
                  </span>
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm text-tier-text-secondary mb-1">Aktør</dt>
                <dd className="font-medium text-tier-navy flex items-center gap-2">
                  <User size={16} className="text-tier-text-tertiary" />
                  {log.actor
                    ? `${log.actor.firstName} ${log.actor.lastName} (${log.actor.email})`
                    : log.actorId}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-tier-text-secondary mb-1">Ressurstype</dt>
                <dd className="font-medium text-tier-navy">{log.resourceType}</dd>
              </div>
              <div>
                <dt className="text-sm text-tier-text-secondary mb-1">Ressurs ID</dt>
                <dd className="font-mono text-sm text-tier-text-secondary">
                  {log.resourceId}
                </dd>
              </div>
            </dl>
          </div>

          {/* Metadata */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div>
              <Text className="font-semibold text-tier-navy mb-3">Metadata</Text>
              <pre className="bg-tier-surface-base p-4 rounded-lg overflow-x-auto text-sm">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* Technical Details */}
          <div>
            <Text className="font-semibold text-tier-navy mb-3">
              Tekniske detaljer
            </Text>
            <dl className="space-y-3">
              {log.ipAddress && (
                <div>
                  <dt className="text-sm text-tier-text-secondary mb-1 flex items-center gap-2">
                    <Globe size={16} />
                    IP-adresse
                  </dt>
                  <dd className="font-mono text-sm text-tier-navy bg-tier-surface-base px-3 py-2 rounded">
                    {log.ipAddress}
                  </dd>
                </div>
              )}
              {log.userAgent && (
                <div>
                  <dt className="text-sm text-tier-text-secondary mb-1">User Agent</dt>
                  <dd className="font-mono text-xs text-tier-text-secondary bg-tier-surface-base px-3 py-2 rounded break-all">
                    {log.userAgent}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-tier-text-secondary mb-1">Event ID</dt>
                <dd className="font-mono text-sm text-tier-text-secondary bg-tier-surface-base px-3 py-2 rounded">
                  {log.id}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-tier-border-default flex-shrink-0">
          <Button onClick={onClose} variant="primary" className="w-full justify-center">
            Lukk
          </Button>
        </div>
      </div>
    </div>
  );
};

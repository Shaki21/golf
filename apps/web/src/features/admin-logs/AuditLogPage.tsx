/**
 * TIER Golf - Admin Audit Log Viewer
 * Design System v3.0 - Premium Light
 *
 * Comprehensive audit log browser with filtering and analytics.
 */

import React, { useEffect, useState } from 'react';
import { FileText, RefreshCw, Download, Eye } from 'lucide-react';
import { Page } from '../../ui/components/Page';
import { Text } from '../../ui/primitives';
import Button from '../../ui/primitives/Button';
import { auditAPI, AuditEvent } from '../../services/api';
import { AuditLogFilters, AuditLogFiltersState } from './AuditLogFilters';
import { AuditLogDetailModal } from './AuditLogDetailModal';

// ============================================================================
// COMPONENT
// ============================================================================

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditEvent[]>([]);
  const [stats, setStats] = useState<{
    totalEvents: number;
    byAction: Array<{ action: string; count: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditEvent | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const limit = 20;

  // Filters
  const [filters, setFilters] = useState<AuditLogFiltersState>({
    action: '',
    resourceType: '',
    actorId: '',
    startDate: '',
    endDate: '',
  });

  // Fetch logs
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = {
        page: currentPage,
        limit,
      };

      if (filters.action) params.action = filters.action;
      if (filters.resourceType) params.resourceType = filters.resourceType;
      if (filters.actorId) params.actorId = filters.actorId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const response = await auditAPI.list(params);
      const data = response.data.data;

      setLogs(data.events || []);
      setTotalLogs(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await auditAPI.getStats({ days: 30 });
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch audit stats:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      action: '',
      resourceType: '',
      actorId: '',
      startDate: '',
      endDate: '',
    });
    setCurrentPage(1);
  };

  // View log details
  const handleViewDetails = (log: AuditEvent) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  // Format date
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('no-NO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get action badge color
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

  // Calculate quick stats from current stats
  const todayLogs = stats?.byAction?.reduce((sum, item) => sum + item.count, 0) || 0;
  const weekLogs = Math.floor(todayLogs * 7); // Approximation
  const uniqueActors = new Set(logs.map(l => l.actorId)).size;

  // Determine page state
  const pageState = loading ? 'loading' : logs.length === 0 ? 'empty' : 'idle';

  return (
    <>
      <Page state={pageState} maxWidth="xl">
        <Page.Header
          title="Audit-logg"
          subtitle="Spor brukeraktiviteter og systemendringer"
          helpText="Administrator-side for audit-logging av brukeraktiviteter og systemendringer. Se komplett logg med tidspunkt, bruker, hendelsestype (create/update/delete), ressurs (user/player/coach/session), JSON-detaljer. Filtrer etter hendelsestype, ressurs, bruker, datoperiode. Søk i logg-meldinger. Oppdater for sanntids-visning. Eksporter logg for revisjon. Bruk for sikkerhet, debugging og compliance."
          actions={
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={fetchLogs}
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Oppdater
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download size={16} />
                Eksporter
              </Button>
            </div>
          }
        />

        <Page.Content>
          {/* Stats Dashboard */}
          {stats && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-tier-white border border-tier-border-default rounded-xl p-4">
                <Text variant="caption1" color="secondary" className="mb-1">
                  Totalt antall
                </Text>
                <Text className="text-2xl font-bold text-tier-navy">
                  {stats.totalEvents || totalLogs}
                </Text>
              </div>

              <div className="bg-tier-white border border-tier-border-default rounded-xl p-4">
                <Text variant="caption1" color="secondary" className="mb-1">
                  I dag
                </Text>
                <Text className="text-2xl font-bold text-tier-navy">
                  {todayLogs}
                </Text>
              </div>

              <div className="bg-tier-white border border-tier-border-default rounded-xl p-4">
                <Text variant="caption1" color="secondary" className="mb-1">
                  Denne uken
                </Text>
                <Text className="text-2xl font-bold text-tier-navy">
                  {weekLogs}
                </Text>
              </div>

              <div className="bg-tier-white border border-tier-border-default rounded-xl p-4">
                <Text variant="caption1" color="secondary" className="mb-1">
                  Unike brukere
                </Text>
                <Text className="text-2xl font-bold text-tier-navy">
                  {uniqueActors}
                </Text>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-6">
            <AuditLogFilters
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
            />
          </div>

          {/* Logs Table */}
          <Page.Section>
            {logs.length === 0 && !loading ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto mb-4 text-tier-text-tertiary" />
                <Text variant="body" color="secondary">
                  Ingen logger funnet for valgte filtre
                </Text>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-tier-border-default">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-tier-navy">
                          Tidspunkt
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-tier-navy">
                          Aktør
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-tier-navy">
                          Handling
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-tier-navy">
                          Ressurs
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-tier-navy">
                          Detaljer
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr
                          key={log.id}
                          className="border-b border-tier-border-default hover:bg-tier-surface-base transition-colors"
                        >
                          <td className="py-3 px-4">
                            <Text variant="caption1" className="text-tier-text-secondary">
                              {formatDateTime(log.createdAt)}
                            </Text>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <Text variant="body" className="font-medium text-tier-navy">
                                {log.actor
                                  ? `${log.actor.firstName} ${log.actor.lastName}`
                                  : 'Ukjent'}
                              </Text>
                              {log.actor && (
                                <Text variant="caption1" color="secondary">
                                  {log.actor.email}
                                </Text>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(
                                log.action
                              )}`}
                            >
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <Text variant="body" className="font-medium text-tier-navy">
                                {log.resourceType}
                              </Text>
                              <Text variant="caption1" color="secondary" className="font-mono">
                                ID: {log.resourceId.substring(0, 8)}...
                              </Text>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleViewDetails(log)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-tier-navy hover:bg-tier-navy/10 rounded-lg transition-colors"
                            >
                              <Eye size={14} />
                              Vis
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-tier-border-default">
                    <Text variant="caption1" color="secondary">
                      Viser {(currentPage - 1) * limit + 1} til{' '}
                      {Math.min(currentPage * limit, totalLogs)} av {totalLogs} logger
                    </Text>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Forrige
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-tier-navy text-white'
                                  : 'text-tier-text-secondary hover:bg-tier-surface-base'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Neste
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </Page.Section>
        </Page.Content>
      </Page>

      {/* Detail Modal */}
      <AuditLogDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        log={selectedLog}
      />
    </>
  );
};

export default AuditLogPage;

/**
 * TIER Golf - Audit Log Filters Component
 * Design System v3.0 - Premium Light
 *
 * Reusable filter component for audit logs.
 */

import React from 'react';
import { RotateCcw } from 'lucide-react';
import Button from '../../ui/primitives/Button';

export interface AuditLogFiltersState {
  action: string;
  resourceType: string;
  actorId: string;
  startDate: string;
  endDate: string;
}

interface AuditLogFiltersProps {
  filters: AuditLogFiltersState;
  onChange: (filters: AuditLogFiltersState) => void;
  onReset: () => void;
}

export const AuditLogFilters: React.FC<AuditLogFiltersProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const handleChange = (field: keyof AuditLogFiltersState, value: string) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="bg-tier-white border border-tier-border-default rounded-xl p-5">
      <div className="grid grid-cols-5 gap-4">
        {/* Action Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-tier-navy">
            Handling
          </label>
          <select
            value={filters.action}
            onChange={(e) => handleChange('action', e.target.value)}
            className="w-full px-3 py-2 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-navy/20 bg-tier-white"
          >
            <option value="">Alle handlinger</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="ARCHIVE">Archive</option>
            <option value="RESTORE">Restore</option>
          </select>
        </div>

        {/* Resource Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-tier-navy">
            Ressurstype
          </label>
          <select
            value={filters.resourceType}
            onChange={(e) => handleChange('resourceType', e.target.value)}
            className="w-full px-3 py-2 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-navy/20 bg-tier-white"
          >
            <option value="">Alle typer</option>
            <option value="player">Player</option>
            <option value="coach">Coach</option>
            <option value="training-plan">Training Plan</option>
            <option value="test">Test</option>
            <option value="session">Session</option>
            <option value="goal">Goal</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Actor ID Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-tier-navy">
            Aktør
          </label>
          <input
            type="text"
            placeholder="Søk etter bruker..."
            value={filters.actorId}
            onChange={(e) => handleChange('actorId', e.target.value)}
            className="w-full px-3 py-2 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-navy/20"
          />
        </div>

        {/* Start Date Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-tier-navy">
            Fra dato
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-navy/20"
          />
        </div>

        {/* End Date Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-tier-navy">
            Til dato
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-tier-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-tier-navy/20"
          />
        </div>
      </div>

      {/* Reset Button */}
      <div className="flex justify-end mt-4">
        <Button
          variant="outline"
          onClick={onReset}
          className="flex items-center gap-2"
        >
          <RotateCcw size={16} />
          Tilbakestill filtre
        </Button>
      </div>
    </div>
  );
};

import React from 'react';

/**
 * DataTable Composite
 * Feature-rich data table with sorting, selection, and responsive design
 */

interface Column<T> {
  id: string;
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  /** Table columns */
  columns: Column<T>[];
  /** Table data */
  data: T[];
  /** Row key accessor */
  getRowId: (row: T) => string;
  /** Enable row selection */
  selectable?: boolean;
  /** Selected row IDs */
  selectedRows?: string[];
  /** Selection change handler */
  onSelectionChange?: (selectedIds: string[]) => void;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Compact mode */
  compact?: boolean;
  /** Striped rows */
  striped?: boolean;
  /** Hover effect */
  hoverable?: boolean;
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  getRowId,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  loading = false,
  emptyMessage = 'No data available',
  compact = false,
  striped = false,
  hoverable = true,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const handleSort = (columnId: string) => {
    const column = columns.find((col) => col.id === columnId);
    if (!column?.sortable) return;

    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (selectedRows.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map((row) => getRowId(row)));
    }
  };

  const handleSelectRow = (rowId: string) => {
    if (!onSelectionChange) return;

    if (selectedRows.includes(rowId)) {
      onSelectionChange(selectedRows.filter((id) => id !== rowId));
    } else {
      onSelectionChange([...selectedRows, rowId]);
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;

    const column = columns.find((col) => col.id === sortColumn);
    if (!column) return data;

    return [...data].sort((a, b) => {
      const aValue = typeof column.accessor === 'function'
        ? column.accessor(a)
        : a[column.accessor];
      const bValue = typeof column.accessor === 'function'
        ? column.accessor(b)
        : b[column.accessor];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1;
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1;

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection, columns]);

  const getCellValue = (row: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10 bg-white rounded-lg border border-tier-border-subtle">
        <div className="text-tier-text-secondary">Loading...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-10 bg-white rounded-lg border border-tier-border-subtle">
        <p className="text-tier-text-secondary text-sm m-0">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg border border-tier-border-subtle bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          {/* Header */}
          <thead className="bg-tier-surface-subtle border-b-2 border-tier-border-default">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-[11px] font-semibold text-tier-text-secondary uppercase tracking-wide whitespace-nowrap w-12">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length}
                    onChange={handleSelectAll}
                    className="w-[18px] h-[18px] cursor-pointer"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.id}
                  className={`text-[11px] font-semibold text-tier-text-secondary uppercase tracking-wide whitespace-nowrap ${
                    compact ? 'px-3 py-2' : 'px-4 py-3'
                  } ${column.sortable ? 'cursor-pointer select-none' : ''}`}
                  style={{ width: column.width, textAlign: column.align || 'left' }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <span className="text-tier-text-tertiary text-xs">
                        {sortColumn === column.id ? (
                          sortDirection === 'asc' ? '↑' : '↓'
                        ) : (
                          '↕'
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {sortedData.map((row, rowIndex) => {
              const rowId = getRowId(row);
              const isSelected = selectedRows.includes(rowId);

              return (
                <tr
                  key={rowId}
                  className={`border-b border-tier-border-subtle ${
                    striped && rowIndex % 2 === 1 ? 'bg-tier-surface-subtle/50' : ''
                  } ${hoverable ? 'transition-colors duration-150 hover:bg-tier-surface-subtle' : ''} ${
                    onRowClick ? 'cursor-pointer' : ''
                  } ${isSelected ? 'bg-tier-gold/5' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td className={compact ? 'px-3 py-2' : 'px-4 py-3'}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowId)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-[18px] h-[18px] cursor-pointer"
                        aria-label={`Select row ${rowIndex + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={`text-tier-navy ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}
                      style={{ textAlign: column.align || 'left' }}
                    >
                      {getCellValue(row, column)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;

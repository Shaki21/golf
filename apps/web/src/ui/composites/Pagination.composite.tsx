import React from 'react';

/**
 * Pagination Composite
 * Pagination controls with keyboard navigation
 * Migrated to Tailwind CSS
 */

type PaginationSize = 'sm' | 'md' | 'lg';

interface PaginationProps {
  /** Current page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Page change handler */
  onPageChange: (page: number) => void;
  /** Number of page buttons to show */
  siblingCount?: number;
  /** Show first/last buttons */
  showFirstLast?: boolean;
  /** Show previous/next buttons */
  showPrevNext?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: PaginationSize;
}

const SIZE_CLASSES: Record<PaginationSize, string> = {
  sm: 'min-w-[32px] h-8 text-xs px-2',
  md: 'min-w-[40px] h-10 text-sm px-3',
  lg: 'min-w-[48px] h-12 text-base px-4',
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  showPrevNext = true,
  disabled = false,
  size = 'md',
}) => {
  const generatePageNumbers = (): (number | string)[] => {
    const totalNumbers = siblingCount * 2 + 3; // siblings + current + first + last
    const totalBlocks = totalNumbers + 2; // + 2 ellipsis

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, '...', totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [1, '...', ...rightRange];
    }

    const middleRange = Array.from(
      { length: rightSiblingIndex - leftSiblingIndex + 1 },
      (_, i) => leftSiblingIndex + i
    );
    return [1, '...', ...middleRange, '...', totalPages];
  };

  const pageNumbers = generatePageNumbers();

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'string' || disabled) return;
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  const handlePrevious = () => {
    if (currentPage > 1 && !disabled) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !disabled) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    if (currentPage !== 1 && !disabled) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (currentPage !== totalPages && !disabled) {
      onPageChange(totalPages);
    }
  };

  const sizeClasses = SIZE_CLASSES[size];
  const baseButtonClasses = `inline-flex items-center justify-center font-medium text-tier-navy bg-white border border-tier-border-default rounded cursor-pointer transition-all duration-150 ${sizeClasses}`;
  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';
  const activeClasses = 'bg-tier-gold border-tier-gold text-white';

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="flex items-center gap-2 justify-center"
    >
      {/* First Button */}
      {showFirstLast && (
        <button
          onClick={handleFirst}
          disabled={disabled || currentPage === 1}
          aria-label="Go to first page"
          className={`${baseButtonClasses} ${disabled || currentPage === 1 ? disabledClasses : 'hover:bg-tier-surface-subtle'}`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 3L6 8l5 5M6 3L1 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Previous Button */}
      {showPrevNext && (
        <button
          onClick={handlePrevious}
          disabled={disabled || currentPage === 1}
          aria-label="Go to previous page"
          className={`${baseButtonClasses} ${disabled || currentPage === 1 ? disabledClasses : 'hover:bg-tier-surface-subtle'}`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 3L5 8l5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className={`inline-flex items-center justify-center text-tier-text-secondary ${sizeClasses}`}
            >
              ...
            </span>
          );
        }

        const pageNumber = page as number;
        const isActive = pageNumber === currentPage;

        return (
          <button
            key={pageNumber}
            onClick={() => handlePageClick(pageNumber)}
            disabled={disabled}
            aria-label={`Go to page ${pageNumber}`}
            aria-current={isActive ? 'page' : undefined}
            className={`${baseButtonClasses} ${isActive ? activeClasses : 'hover:bg-tier-surface-subtle'} ${disabled ? disabledClasses : ''}`}
          >
            {pageNumber}
          </button>
        );
      })}

      {/* Next Button */}
      {showPrevNext && (
        <button
          onClick={handleNext}
          disabled={disabled || currentPage === totalPages}
          aria-label="Go to next page"
          className={`${baseButtonClasses} ${disabled || currentPage === totalPages ? disabledClasses : 'hover:bg-tier-surface-subtle'}`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Last Button */}
      {showFirstLast && (
        <button
          onClick={handleLast}
          disabled={disabled || currentPage === totalPages}
          aria-label="Go to last page"
          className={`${baseButtonClasses} ${disabled || currentPage === totalPages ? disabledClasses : 'hover:bg-tier-surface-subtle'}`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 3l5 5-5 5M10 3l5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </nav>
  );
};

export default Pagination;

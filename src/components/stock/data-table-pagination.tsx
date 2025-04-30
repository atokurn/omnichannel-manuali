'use client';

import * as React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface DataTablePaginationProps {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  maxPagesToShow?: number; // Optional: customize how many page links are shown
}

export function DataTablePagination({ 
  currentPage, 
  pageCount, 
  onPageChange, 
  maxPagesToShow = 5 // Default to 5 pages shown
}: DataTablePaginationProps) {
  // Helper function to generate pagination items
  const renderPaginationItems = () => {
    const items = [];
    const ellipsis = <PaginationItem key="ellipsis"><PaginationEllipsis /></PaginationItem>;

    if (pageCount <= maxPagesToShow + 2) { // Show all pages if few enough
      for (let i = 1; i <= pageCount; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onPageChange(i); }} isActive={i === currentPage}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Always show first page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onPageChange(1); }} isActive={1 === currentPage}>
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Calculate page range to display
      const halfMax = Math.floor((maxPagesToShow - 2) / 2);
      let startPage = Math.max(2, currentPage - halfMax);
      let endPage = Math.min(pageCount - 1, currentPage + (maxPagesToShow - 3 - halfMax));

      // Adjust range if near the beginning
      if (currentPage <= halfMax + 2) {
          endPage = Math.min(pageCount - 1, maxPagesToShow -1);
      }
      // Adjust range if near the end
      if (currentPage >= pageCount - (halfMax + 1)) {
          startPage = Math.max(2, pageCount - maxPagesToShow + 2);
      }

      // Add start ellipsis if needed
      if (startPage > 2) {
        items.push(React.cloneElement(ellipsis, { key: "start-ellipsis" }));
      }

      // Add page numbers in the calculated range
      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onPageChange(i); }} isActive={i === currentPage}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Add end ellipsis if needed
      if (endPage < pageCount - 1) {
        items.push(React.cloneElement(ellipsis, { key: "end-ellipsis" }));
      }

      // Always show last page
      items.push(
        <PaginationItem key={pageCount}>
          <PaginationLink href="#" onClick={(e) => { e.preventDefault(); onPageChange(pageCount); }} isActive={pageCount === currentPage}>
            {pageCount}
          </PaginationLink>
        </PaginationItem>
      );
    }
    return items;
  };

  if (pageCount <= 1) {
    return null; // Don't render pagination if only one page or less
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => { e.preventDefault(); if (currentPage > 1) onPageChange(currentPage - 1); }}
            aria-disabled={currentPage <= 1}
            tabIndex={currentPage <= 1 ? -1 : undefined}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
        {renderPaginationItems()}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => { e.preventDefault(); if (currentPage < pageCount) onPageChange(currentPage + 1); }}
            aria-disabled={currentPage >= pageCount}
            tabIndex={currentPage >= pageCount ? -1 : undefined}
            className={currentPage >= pageCount ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
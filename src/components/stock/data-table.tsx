'use client';

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  PaginationState, // Import PaginationState
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Remove direct Pagination imports if no longer needed elsewhere in this file
// import {
//   Pagination,
//   PaginationContent,
//   PaginationEllipsis,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from '@/components/ui/pagination';
import { Button } from "@/components/ui/button"; // Keep Button if needed
import { Label } from "@/components/ui/label"; // Keep Label
import { DataTablePagination } from './data-table-pagination'; // Import the new pagination component

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  warehouses?: { id: string; name: string }[];
  onWarehouseChange?: (warehouseId: string) => void;
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  pageCount: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number; // Add pageSize prop
  onPageSizeChange: (size: number) => void; // Add onPageSizeChange prop
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  warehouses,
  onWarehouseChange,
  rowSelection = {},
  onRowSelectionChange,
  pageCount,
  currentPage,
  onPageChange,
  pageSize, // Destructure pageSize
  onPageSizeChange, // Destructure onPageSizeChange
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  // Combine pageIndex and pageSize into pagination state for useReactTable
  const pagination = React.useMemo<PaginationState>(() => ({
      pageIndex: currentPage - 1, // tanstack-table uses 0-based index
      pageSize: pageSize,
  }), [currentPage, pageSize]);

  const table = useReactTable({
    data,
    columns,
    pageCount: pageCount,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // Keep for potential internal calculations
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: onRowSelectionChange,
    manualPagination: true,
    // Handle pagination changes (both page index and size)
    onPaginationChange: (updater) => {
        if (typeof updater === 'function') {
            const newState = updater(pagination);
            onPageChange(newState.pageIndex + 1); // Update parent with 1-based index
            onPageSizeChange(newState.pageSize);
        } else {
            // This case might not happen with manualPagination, but good to handle
            onPageChange(updater.pageIndex + 1);
            onPageSizeChange(updater.pageSize);
        }
    },
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination, // Pass the combined pagination state
    },
  });

  // Remove the internal renderPaginationItems function
  // const renderPaginationItems = () => { ... };

  return (
    <div className="space-y-4">
      {/* Search and Filter Section */}
      <div className="flex items-center justify-between">
        {searchKey && (
          <div className="flex items-center gap-2">
            <Input
              placeholder="Cari..."
              value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn(searchKey)?.setFilterValue(event.target.value)
              }
              className="max-w-sm"
            />
          </div>
        )}

        {warehouses && onWarehouseChange && (
          <div className="flex items-center gap-2">
            <Select onValueChange={onWarehouseChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pilih Warehouse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Warehouse</SelectItem>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={header.column.getCanSort() ? "flex items-center gap-1 cursor-pointer select-none" : ""}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: <span className="ml-1 text-xs">↑</span>,
                            desc: <span className="ml-1 text-xs">↓</span>,
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Tidak ada data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination and Page Size Section */}
      {pageCount > 0 && ( // Show controls only if there's data
        <div className="flex items-center justify-between space-x-2 py-4">
          {/* Rows per page selector */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="rows-per-page" className="text-sm font-medium whitespace-nowrap">Baris per halaman</Label>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                onPageSizeChange(Number(value));
              }}
            >
              <SelectTrigger id="rows-per-page" className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Use the new DataTablePagination component */}
          <DataTablePagination 
            currentPage={currentPage} 
            pageCount={pageCount} 
            onPageChange={onPageChange} 
          />

          {/* Optional: Display total items info (can be moved or removed) */}
          <div className="flex-1 text-sm text-muted-foreground text-right">
            {/* You might want to display total items here if needed */}
            {/* Example: {table.getFilteredRowModel().rows.length} of {data.length} row(s) selected. */}
            {/* Or just keep the page info if preferred */}
             Halaman {currentPage} dari {pageCount}
          </div>
        </div>
      )}
    </div>
  );
}
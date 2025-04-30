import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DataTableSkeletonProps {
  columnCount: number;
  rowCount?: number;
  showToolbar?: boolean;
  showPagination?: boolean;
}

export function DataTableSkeleton({
  columnCount,
  rowCount = 10,
  showToolbar = true,
  showPagination = true,
}: DataTableSkeletonProps) {
  return (
    <div className="w-full space-y-4">
      {/* Optional Toolbar Skeleton */}
      {showToolbar && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-[150px] lg:w-[250px]" />
          {/* Add skeleton for other toolbar elements if needed (e.g., warehouse select) */}
        </div>
      )}

      {/* Table Skeleton */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-6 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Optional Pagination Skeleton */}
      {showPagination && (
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-8">
          <div className="flex-1 text-sm text-muted-foreground">
            <Skeleton className="h-5 w-20" />
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-7 w-24" /> 
              <Skeleton className="h-7 w-[70px]" />
            </div>
            <div className="flex items-center justify-center text-sm font-medium">
              <Skeleton className="h-7 w-20" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
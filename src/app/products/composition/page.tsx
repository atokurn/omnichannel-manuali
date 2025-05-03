'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, FileEdit, Trash2, Loader2, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTableSkeleton } from '@/components/table/data-table-skeleton';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Interface untuk komposisi produk (BOM)
interface Composition {
  id: string;
  productName: string;
  materialCount: number;
  createdAt: string;
}

// Interface for API response with pagination
interface ApiResponse {
    data: Composition[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}

// Placeholder data - replace with actual data fetching
// TODO: Ganti dengan state dan data fetching yang sebenarnya
const dummyCompositions: Composition[] = [
  { id: 'bom1', productName: 'Meja Kantor', materialCount: 5, createdAt: new Date().toISOString() },
  { id: 'bom2', productName: 'Kursi Lipat', materialCount: 3, createdAt: new Date().toISOString() },
  { id: 'bom3', productName: 'Lemari Buku', materialCount: 7, createdAt: new Date().toISOString() },
];

// Define columns with Checkbox and updated Actions
const getColumns = (refetchData: () => void): ColumnDef<Composition>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'productName',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Nama Produk
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const composition = row.original;
      return (
        <div className="font-medium">{composition.productName}</div>
      );
    },
  },
  {
    accessorKey: 'materialCount',
    header: 'Jumlah Material',
    cell: ({ row }) => {
      return (
        <div>{row.original.materialCount} item</div>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Tanggal Dibuat',
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => {
      const router = useRouter();
      const compositionId = row.original.id;
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
      const [isDeleting, setIsDeleting] = useState(false);

      const handleView = () => {
        router.push(`/products/composition/view/${compositionId}`);
      };

      const handleEdit = () => {
        router.push(`/products/composition/edit/${compositionId}`);
      };

      const handleDelete = async () => {
        setIsDeleting(true);
        try {
          // Simulasi API call untuk demo
          // const response = await fetch(`/api/products/composition?ids=${compositionId}`, {
          //   method: 'DELETE',
          // });
          // if (!response.ok) {
          //   const errorData = await response.json();
          //   throw new Error(errorData.message || 'Gagal menghapus komposisi');
          // }
          
          // Untuk demo, hapus dari state lokal
          const remainingCompositions = dummyCompositions.filter(c => c.id !== compositionId);
          setCompositions(remainingCompositions);
          
          toast.success('Sukses', { description: 'Komposisi produk berhasil dihapus.' });
          refetchData(); // Refetch data after delete
        } catch (err: any) {
          toast.error('Error', { description: err.message || 'Gagal menghapus komposisi produk.' });
        } finally {
          setIsDeleting(false);
          setIsDeleteDialogOpen(false);
        }
      };

      return (
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleView}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Lihat Detail</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleEdit}>
                  <FileEdit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Komposisi</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-100">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hapus Komposisi</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus komposisi produk "{row.original.productName}"? Tindakan ini tidak dapat diurungkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];

export default function CompositionPage() {
  const router = useRouter();
  const [compositions, setCompositions] = useState<Composition[]>(dummyCompositions);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10, // Default items per page (pageSize)
    totalItems: dummyCompositions.length,
    totalPages: 1,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const fetchCompositions = async (page = pagination.page, limit = pagination.limit) => {
    // Simulasi loading untuk demo
    setIsLoading(true);
    setError(null);
    
    // Simulasi API call untuk demo
    setTimeout(() => {
      setCompositions(dummyCompositions);
      setPagination({
        page,
        limit,
        totalItems: dummyCompositions.length,
        totalPages: Math.ceil(dummyCompositions.length / limit),
      });
      setRowSelection({}); // Reset selection on data fetch
      setIsLoading(false);
    }, 500);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handler for page size change
  const handlePageSizeChange = (newSize: number) => {
    setPagination(prev => ({ ...prev, limit: newSize, page: 1 })); // Reset to page 1 when size changes
  };

  // Memoize columns to prevent recreation on every render
  const columns = useMemo(() => getColumns(fetchCompositions), []);

  const selectedRowCount = Object.keys(rowSelection).length;
  const selectedRowIds = useMemo(() => {
      return Object.keys(rowSelection).map(index => compositions[parseInt(index)]?.id).filter(Boolean);
  }, [rowSelection, compositions]);

  const handleBulkDelete = async () => {
      if (selectedRowCount === 0) return;
      setIsBulkDeleting(true);
      try {
          // Simulasi API call untuk demo
          // const response = await fetch(`/api/products/composition?ids=${selectedRowIds.join(',')}`, {
          //     method: 'DELETE',
          // });
          // if (!response.ok) {
          //     const errorData = await response.json();
          //     throw new Error(errorData.message || 'Gagal menghapus komposisi terpilih');
          // }
          
          // Untuk demo, hapus dari state lokal
          const remainingCompositions = compositions.filter(c => !selectedRowIds.includes(c.id));
          setCompositions(remainingCompositions);
          
          toast.success('Sukses', { description: `${selectedRowCount} komposisi produk berhasil dihapus.` });
          fetchCompositions(1); // Refetch data from page 1 after bulk delete
      } catch (err: any) {
          toast.error('Error', { description: err.message || 'Gagal menghapus komposisi produk terpilih.' });
      } finally {
          setIsBulkDeleting(false);
      }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Komposisi Produk (BOM)</CardTitle>
            <CardDescription>
              Kelola komposisi material untuk produk Anda.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {selectedRowCount > 0 && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={isBulkDeleting}>
                            {isBulkDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            Hapus ({selectedRowCount})
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Konfirmasi Hapus Massal</AlertDialogTitle>
                            <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus {selectedRowCount} komposisi produk terpilih? Tindakan ini tidak dapat diurungkan.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={isBulkDeleting}>Batal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleBulkDelete} disabled={isBulkDeleting} className="bg-red-600 hover:bg-red-700">
                                {isBulkDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Hapus
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            <Button onClick={() => router.push('/products/composition/add')}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Komposisi
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataTableSkeleton columnCount={4} rowCount={10} />
          ) : error ? (
            <div className="text-center py-10 text-red-600">
              {error}
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={compositions}
                searchKey="productName"
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                currentPage={pagination.page}
                pageCount={pagination.totalPages}
                pageSize={pagination.limit}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
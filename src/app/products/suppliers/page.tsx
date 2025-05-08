'use client';

import { useState, useMemo, useEffect, useCallback } from 'react'; // Import useCallback
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, FileEdit, Trash2, Loader2, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog"

// Interface untuk supplier (sesuai dengan model Prisma)
interface Supplier {
  id: string;
  name: string;
  contactPerson: string; // Mengganti 'contact'
  phone: string;
  email: string;
  address: string;
  status: string; // Menambahkan 'status'
  createdAt: string;
  updatedAt: string; // Menambahkan 'updatedAt'
}

// Interface for API response with pagination
interface ApiResponse {
    data: Supplier[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}

// Gunakan state untuk menyimpan data supplier dari API

// Define columns with Checkbox and updated Actions
const getColumns = (refetchData: () => void): ColumnDef<Supplier>[] => [
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
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Nama Supplier
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const supplier = row.original;
      return (
        <div className="font-medium">{supplier.name}</div>
      );
    },
  },
  {
    accessorKey: 'contactPerson',
    header: 'Kontak Person',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phone',
    header: 'Telepon',
  },
  {
    accessorKey: 'address',
    header: 'Alamat',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={status === 'Aktif' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => {
      const router = useRouter();
      const supplierId = row.original.id;
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
      const [isDeleting, setIsDeleting] = useState(false);

      const handleView = () => {
        router.push(`/products/suppliers/view/${supplierId}`);
      };

      const handleEdit = () => {
        router.push(`/products/suppliers/edit/${supplierId}`);
      };

      const handleDelete = async () => {
        setIsDeleting(true);
        try {
          // Simulasi API call untuk demo
          // const response = await fetch(`/api/products/suppliers?ids=${supplierId}`, {
          //   method: 'DELETE',
          // });
          // if (!response.ok) {
          //   const errorData = await response.json();
          //   throw new Error(errorData.message || 'Gagal menghapus supplier');
          // }
          
          // Panggil API untuk menghapus supplier
          const response = await fetch(`/api/products/suppliers?ids=${supplierId}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal menghapus supplier');
          }
          
          const result = await response.json();
          
          toast.success('Sukses', { description: result.message || 'Supplier berhasil dihapus.' });
          refetchData(); // Refetch data after delete
        } catch (err: any) {
          toast.error('Error', { description: err.message || 'Gagal menghapus supplier.' });
        } finally {
          setIsDeleting(false);
          setIsDeleteDialogOpen(false);
        }
      };

      return (
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleView}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleEdit}>
            <FileEdit className="h-4 w-4" />
          </Button>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-100">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus supplier "{row.original.name}"? Tindakan ini tidak dapat diurungkan.
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

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10, // Default items per page (pageSize)
    totalItems: 0,
    totalPages: 1,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Ambil data supplier saat komponen dimuat atau pagination berubah
  const fetchSuppliers = useCallback(async (page = pagination.page, limit = pagination.limit) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Panggil API untuk mendapatkan data supplier, sertakan credentials
      const response = await fetch(`/api/products/suppliers?page=${page}&limit=${limit}`, {
        credentials: 'include' // Kirim cookies bersama request
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengambil data supplier');
      }
      
      const data: ApiResponse = await response.json();
      
      setSuppliers(data.data);
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        totalItems: data.pagination.totalItems,
        totalPages: data.pagination.totalPages,
      });
      setRowSelection({}); // Reset selection on data fetch
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data supplier';
      setError(errorMessage);
      toast.error('Error', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]); // Added dependencies

  useEffect(() => {
    fetchSuppliers(pagination.page, pagination.limit);
  }, [fetchSuppliers, pagination.page, pagination.limit]); // Added fetchSuppliers to dependencies

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handler for page size change
  const handlePageSizeChange = (newSize: number) => {
    setPagination(prev => ({ ...prev, limit: newSize, page: 1 })); // Reset to page 1 when size changes
  };

  // Memoize columns to prevent recreation on every render
  // Pass fetchSuppliers with current pagination to refetch correctly
  const columns = useMemo(() => getColumns(() => fetchSuppliers(pagination.page, pagination.limit)), [fetchSuppliers, pagination.page, pagination.limit]); // Added fetchSuppliers to dependencies

  const selectedRowCount = Object.keys(rowSelection).length;
  const selectedRowIds = useMemo(() => {
      return Object.keys(rowSelection).map(index => suppliers[parseInt(index)]?.id).filter(Boolean);
  }, [rowSelection, suppliers]);

  const handleBulkDelete = useCallback(async () => {
      if (selectedRowCount === 0) return;
      setIsBulkDeleting(true);
      try {
          // Panggil API untuk menghapus supplier terpilih
          const response = await fetch(`/api/products/suppliers?ids=${selectedRowIds.join(',')}`, {
              method: 'DELETE',
          });
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Gagal menghapus supplier terpilih');
          }
          
          const result = await response.json();
          
          toast.success('Sukses', { description: result.message || `${selectedRowCount} supplier berhasil dihapus.` });
          // Refetch data from current page or page 1 if current page becomes empty
          const newTotalPages = Math.ceil((pagination.totalItems - selectedRowCount) / pagination.limit);
          fetchSuppliers(pagination.page > newTotalPages ? Math.max(1, newTotalPages) : pagination.page);
      } catch (err: any) {
          toast.error('Error', { description: err.message || 'Gagal menghapus supplier terpilih.' });
      } finally {
          setIsBulkDeleting(false);
      }
  }, [selectedRowCount, selectedRowIds, fetchSuppliers, pagination.totalItems, pagination.limit, pagination.page]); // Added dependencies

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Daftar Supplier</CardTitle>
            <CardDescription>
              Kelola daftar supplier Anda.
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
                                Apakah Anda yakin ingin menghapus {selectedRowCount} supplier terpilih? Tindakan ini tidak dapat diurungkan.
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
            <Button onClick={() => router.push('/products/suppliers/add')}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Supplier
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataTableSkeleton columnCount={7} rowCount={10} />
          ) : error ? (
            <div className="text-center py-10 text-red-600">
              {error}
            </div>
          ) : (
            <>
              <DataTable
                columns={columns}
                data={suppliers}
                searchKey="name"
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
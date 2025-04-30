'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/stock/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, FileEdit, Trash2, Loader2, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTableSkeleton } from '@/components/stock/data-table-skeleton';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef, RowSelectionState } from '@tanstack/react-table';
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
import { AddCategoryDialog } from "@/components/products/add-category-dialog"; // Impor komponen dialog

// Interface untuk kategori
interface Category {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

// Interface for API response with pagination
interface ApiResponse {
    data: Category[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}

// Placeholder data - replace with actual data fetching
// TODO: Ganti dengan state dan data fetching yang sebenarnya
const dummyCategories: Category[] = [
  { id: 'cat1', name: 'Electronics', description: 'Gadgets and devices', createdAt: new Date().toISOString() },
  { id: 'cat2', name: 'Clothing', description: 'Apparel and accessories', createdAt: new Date().toISOString() },
  { id: 'cat3', name: 'Home Goods', description: 'Items for household use', createdAt: new Date().toISOString() },
];

// Define columns with Checkbox and updated Actions
const getColumns = (refetchData: () => void): ColumnDef<Category>[] => [
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
        Nama Kategori
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div className="font-medium">{category.name}</div>
      );
    },
  },
  {
    accessorKey: 'description',
    header: 'Deskripsi',
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
      const categoryId = row.original.id;
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
      const [isDeleting, setIsDeleting] = useState(false);

      const handleView = () => {
        router.push(`/products/categories/view/${categoryId}`);
      };

      const handleEdit = () => {
        router.push(`/products/categories/edit/${categoryId}`);
      };

      const handleDelete = async () => {
        setIsDeleting(true);
        try {
          // Simulasi API call untuk demo
          // const response = await fetch(`/api/products/categories?ids=${categoryId}`, {
          //   method: 'DELETE',
          // });
          // if (!response.ok) {
          //   const errorData = await response.json();
          //   throw new Error(errorData.message || 'Gagal menghapus kategori');
          // }
          
          // Untuk demo, hapus dari state lokal
          const remainingCategories = dummyCategories.filter(c => c.id !== categoryId);
          setCategories(remainingCategories);
          
          toast.success('Sukses', { description: 'Kategori berhasil dihapus.' });
          refetchData(); // Refetch data after delete
        } catch (err: any) {
          toast.error('Error', { description: err.message || 'Gagal menghapus kategori.' });
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
                  Apakah Anda yakin ingin menghapus kategori "{row.original.name}"? Tindakan ini tidak dapat diurungkan.
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

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(dummyCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10, // Default items per page (pageSize)
    totalItems: dummyCategories.length,
    totalPages: 1,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const fetchCategories = async (page = pagination.page, limit = pagination.limit) => {
    // Simulasi loading untuk demo
    setIsLoading(true);
    setError(null);
    
    // Simulasi API call untuk demo
    setTimeout(() => {
      setCategories(dummyCategories);
      setPagination({
        page,
        limit,
        totalItems: dummyCategories.length,
        totalPages: Math.ceil(dummyCategories.length / limit),
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
  const columns = useMemo(() => getColumns(fetchCategories), []);

  const selectedRowCount = Object.keys(rowSelection).length;
  const selectedRowIds = useMemo(() => {
      return Object.keys(rowSelection).map(index => categories[parseInt(index)]?.id).filter(Boolean);
  }, [rowSelection, categories]);

  const handleBulkDelete = async () => {
      if (selectedRowCount === 0) return;
      setIsBulkDeleting(true);
      try {
          // Simulasi API call untuk demo
          // const response = await fetch(`/api/products/categories?ids=${selectedRowIds.join(',')}`, {
          //     method: 'DELETE',
          // });
          // if (!response.ok) {
          //     const errorData = await response.json();
          //     throw new Error(errorData.message || 'Gagal menghapus kategori terpilih');
          // }
          
          // Untuk demo, hapus dari state lokal
          const remainingCategories = categories.filter(c => !selectedRowIds.includes(c.id));
          setCategories(remainingCategories);
          
          toast.success('Sukses', { description: `${selectedRowCount} kategori berhasil dihapus.` });
          fetchCategories(1); // Refetch data from page 1 after bulk delete
      } catch (err: any) {
          toast.error('Error', { description: err.message || 'Gagal menghapus kategori terpilih.' });
      } finally {
          setIsBulkDeleting(false);
      }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Kategori Produk</CardTitle>
            <CardDescription>
              Kelola kategori untuk produk Anda.
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
                                Apakah Anda yakin ingin menghapus {selectedRowCount} kategori terpilih? Tindakan ini tidak dapat diurungkan.
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
            <AddCategoryDialog />
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
                data={categories}
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
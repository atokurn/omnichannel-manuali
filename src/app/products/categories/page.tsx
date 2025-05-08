'use client';

import { useState, useMemo, useEffect, useCallback } from 'react'; // Tambahkan useCallback
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/data-table/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, FileEdit, Trash2, Loader2, ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Interface untuk kategori
interface Category {
  id: string;
  name: string;
  description: string;
  type?: string; // Tambahkan tipe kategori
  createdAt: string;
  updatedAt?: string;
}

interface ApiResponse {
  data: Category[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  message?: string;
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

// Gunakan state untuk menyimpan data kategori dari API

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
    accessorKey: 'type',
    header: 'Tipe',
    cell: ({ row }) => {
      const category = row.original;
      return (
        <div>{category.type || '-'}</div>
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
          // Panggil API untuk menghapus kategori
          const response = await fetch(`/api/products/categories?ids=${categoryId}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal menghapus kategori');
          }
          
          const result = await response.json();
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
  const [categories, setCategories] = useState<Category[]>([]);
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
  const [typeFilter, setTypeFilter] = useState<string>('all'); // State untuk filter tipe
  
  // Ambil data kategori saat komponen dimuat
  // Memoize fetchCategories with useCallback
  const fetchCategories = useCallback(async (page = pagination.page, limit = pagination.limit) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Panggil API untuk mendapatkan data kategori
      const response = await fetch(`/api/products/categories?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mengambil data kategori');
      }
      
      const data: ApiResponse = await response.json();
      
      // Filter kategori berdasarkan tipe jika filter tidak 'all'
      let filteredCategories = data.data;
      if (typeFilter !== 'all') {
        filteredCategories = data.data.filter(category => category.type === typeFilter);
      }
      
      setCategories(filteredCategories);
      setPagination(prev => ({
        ...prev,
        page: data.pagination.page,
        limit: data.pagination.limit,
        totalItems: typeFilter !== 'all' ? filteredCategories.length : data.pagination.totalItems,
        totalPages: typeFilter !== 'all' ? Math.ceil(filteredCategories.length / limit) : data.pagination.totalPages,
      }));
      setRowSelection({}); // Reset selection on data fetch
    } catch (err) {
      console.error('Error fetching categories:', err);
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data kategori';
      setError(errorMessage);
      toast.error('Error', { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, typeFilter]); // Add dependencies for useCallback

  useEffect(() => {
    fetchCategories(pagination.page, pagination.limit);
  }, [fetchCategories, pagination.page, pagination.limit]); // Include fetchCategories in useEffect dependencies

  const handlePageChange = useCallback((newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  // Handler for page size change
  const handlePageSizeChange = useCallback((newSize: number) => {
    setPagination(prev => ({ ...prev, limit: newSize, page: 1 })); // Reset to page 1 when size changes
  }, []);

  // Memoize columns to prevent recreation on every render
  const columns = useMemo(() => getColumns(fetchCategories), [fetchCategories]);

  const selectedRowCount = Object.keys(rowSelection).length;
  const selectedRowIds = useMemo(() => {
      return Object.keys(rowSelection).map(index => categories[parseInt(index)]?.id).filter(Boolean);
  }, [rowSelection, categories]);

  const handleBulkDelete = async () => {
      if (selectedRowCount === 0) return;
      setIsBulkDeleting(true);
      try {
          // Panggil API untuk menghapus kategori terpilih
          const response = await fetch(`/api/products/categories?ids=${selectedRowIds.join(',')}`, {
              method: 'DELETE',
          });
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Gagal menghapus kategori terpilih');
          }
          
          const result = await response.json();
          toast.success('Sukses', { description: result.message || `${selectedRowCount} kategori berhasil dihapus.` });
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
            <AddCategoryDialog onSuccess={() => fetchCategories()} />
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Tipe */}
          <div className="flex items-center gap-2 mb-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger id="type-filter" className="w-[180px]">
                <SelectValue placeholder="Pilih Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="Produk Jadi">Produk Jadi</SelectItem>
                <SelectItem value="Bahan Baku">Bahan Baku</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {isLoading ? (
            <DataTableSkeleton columnCount={5} rowCount={10} />
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
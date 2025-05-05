"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/table/data-table";
import { DataTableSkeleton } from "@/components/table/data-table-skeleton";
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { RowSelectionState } from "@tanstack/react-table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Composition {
  id: string;
  productName: string;
  materialCount: number;
  createdAt: string;
  isTemplate: boolean;
}

interface ApiResponse {
  data: Composition[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

const getColumns = (refreshData: () => void) => [
  {
    accessorKey: "productName",
    header: "Nama Produk/Template",
    cell: ({ row }: any) => {
      const isTemplate = row.original.isTemplate;
      return (
        <div className="flex items-center">
          {isTemplate && <span className="mr-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Template</span>}
          <span>{row.original.productName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "materialCount",
    header: "Jumlah Material",
  },
  {
    accessorKey: "createdAt",
    header: "Tanggal Dibuat",
    cell: ({ row }: any) => {
      return new Date(row.original.createdAt).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    },
  },
  {
    id: "actions",
    cell: ({ row }: any) => {
      const composition = row.original;
      return (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => console.log('View details', composition.id)}>
            Detail
          </Button>
          <Button variant="destructive" size="sm" onClick={() => console.log('Delete', composition.id)}>
            Hapus
          </Button>
        </div>
      );
    },
  },
];

export default function CompositionPage() {
  const router = useRouter();
  const { tenantId } = useAuth();
  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const fetchCompositions = async (page = pagination.page, limit = pagination.limit) => {
    if (!tenantId) {
      setError("Tenant ID tidak ditemukan. Silakan login ulang.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/products/composition?page=${page}&limit=${limit}`, {
        headers: {
          'X-Tenant-Id': tenantId,
        },
      });
      
      if (!response.ok) {
        throw new Error('Gagal mengambil data komposisi');
      }
      
      const result: ApiResponse = await response.json();
      
      setCompositions(result.data);
      setPagination(result.pagination);
      setRowSelection({});
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
      toast.error('Error', { description: err.message || 'Gagal memuat data komposisi.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchCompositions(pagination.page, pagination.limit);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, pagination.page, pagination.limit]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPagination(prev => ({ ...prev, limit: newSize, page: 1 }));
  };

  const columns = getColumns(fetchCompositions);

  const selectedRowCount = Object.keys(rowSelection).length;
  const selectedRowIds = Object.keys(rowSelection)
    .map(index => compositions[parseInt(index)]?.id)
    .filter(Boolean);

  const handleBulkDelete = async () => {
    if (selectedRowCount === 0) return;
    setIsBulkDeleting(true);
    try {
      // Implementasi API call untuk bulk delete
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulasi API call
      toast.success('Sukses', { description: `${selectedRowCount} komposisi berhasil dihapus.` });
      fetchCompositions(1);
    } catch (err: any) {
      toast.error('Error', { description: err.message || 'Gagal menghapus komposisi terpilih.' });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Komposisi Produk</CardTitle>
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
                      Apakah Anda yakin ingin menghapus {selectedRowCount} komposisi terpilih? Tindakan ini tidak dapat diurungkan.
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
              <Plus className="mr-2 h-4 w-4" /> Tambah Komposisi
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
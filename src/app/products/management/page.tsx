'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { DataTable } from "@/components/stock/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileEdit, Trash2, Plus, Loader2, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProductImageTooltip } from "@/components/ui/image-tooltip";
import { formatNumberWithSeparator } from "../../../lib/utils";
import { useRouter } from 'next/navigation';
import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { DataTableSkeleton } from '@/components/stock/data-table-skeleton';
import { toast } from 'sonner';
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

// Definisi tipe data untuk Produk
interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  normalPrice: number; // Harga normal
  salesCount: number; // Jumlah penjualan
  stock: number;
  status: string;
  lastUpdated: string;
}

// Data dummy untuk Produk
const dummyProductData: Product[] = [
  {
    id: "1",
    sku: "SKU001",
    name: "Kaos Polos Hitam",
    category: "Pakaian",
    price: 75000,
    normalPrice: 100000,
    salesCount: 150,
    stock: 500,
    status: "Aktif",
    lastUpdated: "2024-07-20",
  },
  {
    id: "2",
    sku: "SKU002",
    name: "Celana Jeans Biru",
    category: "Pakaian",
    price: 250000,
    normalPrice: 300000,
    salesCount: 80,
    stock: 200,
    status: "Aktif",
    lastUpdated: "2024-07-18",
  },
  {
    id: "3",
    sku: "SKU003",
    name: "Topi Baseball Merah",
    category: "Aksesoris",
    price: 50000,
    normalPrice: 65000,
    salesCount: 300,
    stock: 1000,
    status: "Nonaktif",
    lastUpdated: "2024-07-15",
  },
  // Tambahkan data dummy lainnya jika perlu
];

// Definisi kolom untuk DataTable dengan fitur seleksi dan aksi yang ditingkatkan
const getColumns = (refetchData: () => void): ColumnDef<Product>[] => [
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
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Produk
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <ProductImageTooltip
          imageUrl="/placeholder.svg"
          alt={row.original.name}
          thumbnailSize={40}
          previewSize={300}
        />
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">SKU Induk: {row.original.sku}</span>
          <span className="text-xs text-muted-foreground">ID Produk: {row.original.id}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Kategori",
  },
  {
    accessorKey: "price",
    header: "Harga Jual",
    cell: ({ row }) => `Rp ${formatNumberWithSeparator(row.original.price)}`,
  },
  {
    accessorKey: "normalPrice",
    header: "Harga Normal",
    cell: ({ row }) => `Rp ${formatNumberWithSeparator(row.original.normalPrice)}`,
  },
  {
    accessorKey: "salesCount",
    header: "Terjual",
    cell: ({ row }) => formatNumberWithSeparator(row.original.salesCount),
  },
  {
    accessorKey: "stock",
    header: "Stok",
    cell: ({ row }) => formatNumberWithSeparator(row.original.stock),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "Aktif" ? "default" : "destructive"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "lastUpdated",
    header: "Terakhir Diperbarui",
    cell: ({ row }) => new Date(row.original.lastUpdated).toLocaleDateString('id-ID'),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      const router = useRouter();
      const productId = row.original.id;
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
      const [isDeleting, setIsDeleting] = useState(false);

      const handleView = () => {
        // Implementasi view detail produk
        console.log('View product:', productId);
      };

      const handleEdit = () => {
        router.push(`/products/management/edit/${productId}`);
      };

      const handleDelete = async () => {
        setIsDeleting(true);
        try {
          // Simulasi API call untuk delete
          await new Promise(resolve => setTimeout(resolve, 1000));
          toast.success('Sukses', { description: 'Produk berhasil dihapus.' });
          refetchData(); // Refresh data setelah delete
        } catch (err: any) {
          toast.error('Error', { description: err.message || 'Gagal menghapus produk.' });
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
              <TooltipContent side="bottom" className="p-2">
                <span>Lihat Detail</span>
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
              <TooltipContent side="bottom" className="p-2">
                <span>Edit Produk</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="p-2">
                  <span>Hapus Produk</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                <AlertDialogDescription>
                  Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat diurungkan.
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

export default function ProductManagementPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(dummyProductData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10, // Default items per page
    totalItems: dummyProductData.length,
    totalPages: Math.ceil(dummyProductData.length / 10),
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Fungsi untuk fetch data produk (simulasi)
  const fetchProducts = async (page = pagination.page, limit = pagination.limit) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulasi API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Untuk demo, kita gunakan data dummy
      setProducts(dummyProductData);
      setPagination({
        page,
        limit,
        totalItems: dummyProductData.length,
        totalPages: Math.ceil(dummyProductData.length / limit),
      });
      setRowSelection({}); // Reset selection saat fetch data
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
      toast.error('Error', { description: err.message || 'Gagal memuat data produk.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data saat komponen dimount
  useMemo(() => {
    fetchProducts(pagination.page, pagination.limit);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handler untuk perubahan halaman
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchProducts(newPage, pagination.limit);
  };

  // Handler untuk perubahan ukuran halaman
  const handlePageSizeChange = (newSize: number) => {
    setPagination(prev => ({ ...prev, limit: newSize, page: 1 })); // Reset ke halaman 1 saat ukuran berubah
    fetchProducts(1, newSize);
  };

  // Memoize columns untuk mencegah re-render berlebihan
  const columns = useMemo(() => getColumns(fetchProducts), []);

  // Hitung jumlah baris yang dipilih
  const selectedRowCount = Object.keys(rowSelection).length;
  const selectedRowIds = useMemo(() => {
    return Object.keys(rowSelection).map(index => products[parseInt(index)]?.id).filter(Boolean);
  }, [rowSelection, products]);

  // Handler untuk bulk delete
  const handleBulkDelete = async () => {
    if (selectedRowCount === 0) return;
    setIsBulkDeleting(true);
    try {
      // Simulasi API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Sukses', { description: `${selectedRowCount} produk berhasil dihapus.` });
      fetchProducts(1); // Refresh data dari halaman 1 setelah bulk delete
    } catch (err: any) {
      toast.error('Error', { description: err.message || 'Gagal menghapus produk terpilih.' });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Manajemen Produk</CardTitle>
            <CardDescription>
              Kelola daftar produk Anda.
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
                      Apakah Anda yakin ingin menghapus {selectedRowCount} produk terpilih? Tindakan ini tidak dapat diurungkan.
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
            <Button onClick={() => router.push('/products/management/add')}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Produk
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <DataTableSkeleton columnCount={10} rowCount={10} />
          ) : error ? (
            <div className="text-center py-10 text-red-600">
              {error}
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={products}
              searchKey="name"
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
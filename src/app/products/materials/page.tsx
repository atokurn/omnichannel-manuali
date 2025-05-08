'use client';

import { useState, useEffect, useMemo, useCallback } from 'react'; // Import useCallback
import { useRouter } from 'next/navigation';
import Image from 'next/image'; // Import Image
import { DataTable } from '@/components/data-table/data-table'; // Make sure this path is correct
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, FileEdit, Trash2, Loader2, MoreHorizontal, ArrowUpDown, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'; // Import the skeleton component
import { FormattedMaterial, PaginationState } from '@/lib/types';
import { MaterialStatus } from '@prisma/client';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox
import { ColumnDef, RowSelectionState } from '@tanstack/react-table'; // Import types for DataTable
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
} from "@/components/ui/alert-dialog" // Import AlertDialog for confirmation
import Link from 'next/link'; // Added Link
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components
import { ProductImageTooltip } from "@/components/ui/image-tooltip";

// Interface dengan penambahan basePrice dan totalValue
interface ProductMaterial {
  id: string;
  name: string;
  code: string;
  unit: string;
  stock: number;
  basePrice?: number; // Harga dasar material
  totalValue?: number; // Nilai total (stock * basePrice)
  status: MaterialStatus;
  createdAt: string;
  imageUrl?: string | null; // Tambahkan imageUrl (opsional)
}

// Interface for API response with pagination
interface ApiResponse {
    data: ProductMaterial[];
    pagination: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    };
}

// formatNumber function remains the same
const formatNumber = (num: number) => {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('id-ID');
};

// Define columns with Checkbox and updated Actions
const getColumns = (refetchData: () => void): ColumnDef<ProductMaterial>[] => [
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
        Nama Material
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const material = row.original;
      const imageUrl = material.imageUrl || '/placeholder.svg'; // Fallback image
      return (
        <div className="flex items-center gap-3">
          <ProductImageTooltip
            imageUrl={imageUrl}
            alt={material.name}
            thumbnailSize={40}
            previewSize={300}
            side="right"
          />
          <div>
            <div className="font-medium">{material.name}</div>
            <div className="text-sm text-muted-foreground">{material.code}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'unit',
    header: 'Satuan',
  },
  {
    accessorKey: 'stock',
    header: 'Stok',
    cell: ({ row }) => formatNumber(row.original.stock),
  },
  {
    accessorKey: 'basePrice',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Harga
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = row.original.basePrice || 0;
      const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'totalValue',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Nilai Total
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = row.original.totalValue || 0;
      const formatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.status === MaterialStatus.AKTIF ? 'default' : 'destructive'}>
        {row.original.status === MaterialStatus.AKTIF ? 'Aktif' : 'Nonaktif'}
      </Badge>
    ),
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
      const materialId = row.original.id;
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
      const [isDeleting, setIsDeleting] = useState(false);

      const handleView = () => {
        router.push(`/products/materials/view/${materialId}`);
      };

      const handleEdit = () => {
        router.push(`/products/materials/edit/${materialId}`);
      };

      const handleDelete = async () => {
        setIsDeleting(true);
        try {
          const response = await fetch(`/api/products/materials?ids=${materialId}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Gagal menghapus material');
          }
          toast.success('Sukses', { description: 'Material berhasil dihapus.' });
          refetchData(); // Refetch data after delete
        } catch (err: any) {
          toast.error('Error', { description: err.message || 'Gagal menghapus material.' });
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
                  Apakah Anda yakin ingin menghapus material "{row.original.name}" ({row.original.code})? Tindakan ini tidak dapat diurungkan.
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

// --- Table Columns Definition --- (This section seems redundant and might need removal/refactoring)
// const columns: ColumnDef<FormattedMaterial>[] = [
//   {
//     accessorKey: 'select',
//     header: ({ table }) => (
//       <Checkbox
//         checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
//         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//         aria-label="Select all"
//         className="translate-y-[2px]"
//       />
//     ),
//     cell: ({ row }) => (
//       <Checkbox
//         checked={row.getIsSelected()}
//         onCheckedChange={(value) => row.toggleSelected(!!value)}
//         aria-label="Select row"
//         className="translate-y-[2px]"
//       />
//     ),
//     enableSorting: false,
//     enableHiding: false,
//   },
//   {
//     accessorKey: 'name',
//     header: ({ column }) => (
//       <Button
//         variant="ghost"
//         onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
//       >
//         Nama Material
//         <ArrowUpDown className="ml-2 h-4 w-4" />
//       </Button>
//     ),
//     cell: ({ row }) => {
//       const material = row.original;
//       const imageUrl = material.imageUrl || '/placeholder.svg'; // Fallback image
//       return (
//         <div className="flex items-center gap-3">
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger>
//                 <div className="relative h-10 w-10 overflow-hidden rounded-md cursor-pointer">
//                   <Image
//                     src={imageUrl}
//                     alt={material.name}
//                     fill
//                     sizes="40px"
//                     className="object-cover"
//                   />
//                 </div>
//               </TooltipTrigger>
//               <TooltipContent side="right" className="p-0 border-0 bg-transparent">
//                 <div className="relative w-40 h-40 overflow-hidden rounded-md shadow-lg">
//                   <Image
//                     src={imageUrl}
//                     alt={material.name}
//                     fill
//                     sizes="160px"
//                     className="object-cover"
//                     priority
//                   />
//                 </div>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//           <div>
//             <div className="font-medium">{material.name}</div>
//             <div className="text-sm text-muted-foreground">{material.code}</div>
//           </div>
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: 'code',
//     header: 'Kode',
//     cell: ({ row }) => <div>{row.getValue('code')}</div>,
//   },
//   {
//     accessorKey: 'unit',
//     header: 'Satuan',
//     cell: ({ row }) => <div>{row.getValue('unit')}</div>,
//   },
//   {
//     accessorKey: 'initialStock',
//     header: 'Stok Awal',
//     cell: ({ row }) => <div>{row.getValue('initialStock')}</div>,
//   },
//   {
//     accessorKey: 'basePrice',
//     header: 'Harga Dasar (Rp)',
//     cell: ({ row }) => {
//       const amount = parseFloat(row.getValue('basePrice'));
//       const formatted = new Intl.NumberFormat('id-ID', {
//         style: 'currency',
//         currency: 'IDR',
//         minimumFractionDigits: 0,
//       }).format(amount);
//       return <div className="text-right font-medium">{formatted}</div>;
//     },
//   },
//   {
//     accessorKey: 'status',
//     header: 'Status',
//     cell: ({ row }) => (
//       <Badge variant={row.getValue('status') === MaterialStatus.AKTIF ? 'default' : 'secondary'}>
//         {row.getValue('status')}
//       </Badge>
//     ),
//   },
//   {
//     id: 'actions',
//     cell: ({ row }) => {
//       const material = row.original;
//       const { handleDelete } = row.getContext() as any; // Assuming context provides delete handler

//       return (
//         <AlertDialog>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" className="h-8 w-8 p-0">
//                 <span className="sr-only">Buka menu</span>
//                 <MoreHorizontal className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuLabel>Aksi</DropdownMenuLabel>
//               {/* View Action - Link to View page */}
//               <DropdownMenuItem asChild>
//                  <Link href={`/products/materials/view/${material.id}`} className="flex items-center"> {/* Updated Link */} 
//                    <Eye className="mr-2 h-4 w-4" />
//                    Lihat
//                  </Link>
//               </DropdownMenuItem>
//               {/* Edit Action */}
//               <DropdownMenuItem asChild>
//                  <Link href={`/products/materials/edit/${material.id}`} className="flex items-center">
//                    <Pencil className="mr-2 h-4 w-4" />
//                    Edit
//                  </Link>
//               </DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <AlertDialogTrigger asChild>
//                 <DropdownMenuItem className="text-red-600 focus:text-red-700 focus:bg-red-100 flex items-center">
//                   <Trash2 className="mr-2 h-4 w-4" />
//                   Hapus
//                 </DropdownMenuItem>
//               </AlertDialogTrigger>
//             </DropdownMenuContent>
//           </DropdownMenu>
//           <AlertDialogContent>
//             <AlertDialogHeader>
//               <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
//               <AlertDialogDescription>
//                 Tindakan ini tidak dapat dibatalkan. Ini akan menghapus material
//                 <strong> {material.name} </strong> secara permanen.
//               </AlertDialogDescription>
//             </AlertDialogHeader>
//             <AlertDialogFooter>
//               <AlertDialogCancel>Batal</AlertDialogCancel>
//               <AlertDialogAction
//                 onClick={() => handleDelete(material.id)}
//                 className="bg-red-600 hover:bg-red-700 text-white"
//               >
//                 Ya, Hapus
//               </AlertDialogAction>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialog>
//       );
//     },
//   },
// ];

export default function ProductMaterialsPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<ProductMaterial[]>([]);
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

  const fetchMaterials = useCallback(async (page = pagination.page, limit = pagination.limit) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/products/materials?page=${page}&limit=${limit}`);
      if (!response.ok) {
        throw new Error('Gagal mengambil data material');
      }
      const result: ApiResponse = await response.json();
      
      // Tambahkan kalkulasi totalValue berdasarkan basePrice dan stock
      const materialsWithTotalValue = result.data.map(material => ({
        ...material,
        basePrice: material.basePrice || 0,
        totalValue: (material.basePrice || 0) * (material.stock || 0)
      }));
      
      setMaterials(materialsWithTotalValue);
      setPagination(result.pagination);
      setRowSelection({}); // Reset selection on data fetch
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
      toast.error('Error', { description: err.message || 'Gagal memuat data material.' });
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]); // Added dependencies

  useEffect(() => {
    fetchMaterials(pagination.page, pagination.limit);
  }, [fetchMaterials, pagination.page, pagination.limit]); // Added fetchMaterials to dependencies

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handler for page size change
  const handlePageSizeChange = (newSize: number) => {
    setPagination(prev => ({ ...prev, limit: newSize, page: 1 })); // Reset to page 1 when size changes
  };

  // Memoize columns to prevent recreation on every render
  const columns = useMemo(() => getColumns(fetchMaterials), [fetchMaterials]); // Added fetchMaterials to dependencies

  const selectedRowCount = Object.keys(rowSelection).length;
  const selectedRowIds = useMemo(() => {
      return Object.keys(rowSelection).map(index => materials[parseInt(index)]?.id).filter(Boolean);
  }, [rowSelection, materials]);

  const handleBulkDelete = useCallback(async () => {
      if (selectedRowCount === 0) return;
      setIsBulkDeleting(true);
      try {
          const response = await fetch(`/api/products/materials?ids=${selectedRowIds.join(',')}`, {
              method: 'DELETE',
          });
          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || 'Gagal menghapus material terpilih');
          }
          toast.success('Sukses', { description: `${selectedRowCount} material berhasil dihapus.` });
          fetchMaterials(1); // Refetch data from page 1 after bulk delete
      } catch (err: any) {
          toast.error('Error', { description: err.message || 'Gagal menghapus material terpilih.' });
      } finally {
          setIsBulkDeleting(false);
      }
  }, [selectedRowCount, selectedRowIds, fetchMaterials]); // Added dependencies

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Material Produk</CardTitle>
            <CardDescription>
              Kelola daftar material yang digunakan dalam produksi.
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
                                Apakah Anda yakin ingin menghapus {selectedRowCount} material terpilih? Tindakan ini tidak dapat diurungkan.
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
            <Button onClick={() => router.push('/products/materials/add')}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Material
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* TODO: Add search input and filter options here */}
          {isLoading ? (
            <DataTableSkeleton columnCount={7} rowCount={10} />
          ) : error ? (
            <div className="text-center py-10 text-red-600">
              {error}
            </div>
          ) : (
            <>
              <DataTable
                columns={columns} // Use the memoized columns from getColumns
                data={materials}
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
'use client';

import { useState, useMemo, useEffect, Fragment } from 'react'; // Import useEffect and Fragment
import Image from 'next/image';
import { DataTable } from "@/components/table/data-table"; // Keep this for now, might remove later if rendering directly
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileEdit, Trash2, Plus, Loader2, ArrowUpDown, ChevronDown, ChevronRight } from "lucide-react"; // Add Chevron icons
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProductImageTooltip } from "@/components/ui/image-tooltip";
import { formatNumberWithSeparator } from "../../../lib/utils";
import { useRouter } from 'next/navigation';
import { Checkbox } from "@/components/ui/checkbox";
import {
  ColumnDef,
  RowSelectionState,
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getExpandedRowModel, // Import getExpandedRowModel
  ExpandedState, // Import ExpandedState
  Row, // Import Row type
  flexRender, // Add flexRender import
} from "@tanstack/react-table";
import { DataTableSkeleton } from '@/components/table/data-table-skeleton';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import Table components
import { Separator } from "@/components/ui/separator"; // Import Separator

// Definisi tipe data untuk Produk berdasarkan respons API
interface Product {
  id: string;
  name: string;
  sku: string;
  price: number | null;
  totalStock: number;
  hasVariants: boolean;
  category: string | null;
  variantCount: number;
  syncStatus: { platformName: string; storeName: string | null; status: string; lastSyncedAt: Date | null }[];
  createdBy: string | null;
  createdAt: string; // Atau Date jika API mengembalikan Date
  // Tambahkan properti lain jika ada dari API, misal: imageUrl
  imageUrl?: string; // Opsional, jika API mengembalikan URL gambar
}


// Define VariantDetails component
interface VariantCombination {
  id: string;
  productId: string;
  combinationId: string;
  options: Record<string, string>;
  price: number;
  quantity: number;
  sku: string;
  weight: number;
  weightUnit: string;
  createdAt: string;
  updatedAt: string;
}

function VariantDetails({ productId }: { productId: string }) {
  const [variants, setVariants] = useState<VariantCombination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVariantDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Ambil tenantId dari header atau context jika diperlukan
        // Untuk contoh ini, kita asumsikan API bisa mengambilnya dari request
        const response = await fetch(`/api/products/${productId}/variants`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal memuat detail varian.');
        }
        const data = await response.json();
        setVariants(data);
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat memuat detail varian.');
        toast.error('Error Varian', { description: err.message || 'Gagal memuat detail varian.' });
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchVariantDetails();
    }
  }, [productId]);

  if (isLoading) {
    return <div className="p-4 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" /></div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  if (variants.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">Produk ini tidak memiliki varian atau detail varian tidak ditemukan.</div>;
  }

  // Mendapatkan semua nama opsi unik dari kombinasi varian
  const optionNames = variants.reduce<string[]>((acc, variant) => {
    Object.keys(variant.options).forEach(key => {
      if (!acc.includes(key)) {
        acc.push(key);
      }
    });
    return acc;
  }, []);

  return (
    <div className="p-4 bg-background">
      <h4 className="mb-2 font-semibold text-sm">Detail Varian</h4>
      <Table className="text-xs">
        <TableHeader>
          <TableRow>
            {optionNames.map(name => (
              <TableHead key={name}>{name}</TableHead>
            ))}
            <TableHead>Harga</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead>SKU</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {variants.map((variant) => (
            <TableRow key={variant.id}>
              {optionNames.map(name => (
                <TableCell key={`${variant.id}-${name}`}>{variant.options[name] || '-'}</TableCell>
              ))}
              <TableCell>Rp {formatNumberWithSeparator(variant.price)}</TableCell>
              <TableCell>{formatNumberWithSeparator(variant.quantity)}</TableCell>
              <TableCell>{variant.sku || '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


// Define getColumns function before it's used in the component
const getColumns = (refreshData: () => void): ColumnDef<Product>[] => [
// Select Column
{
id: "select",
header: ({ table }) => (
<Checkbox
checked={
table.getIsAllPageRowsSelected() ||
(table.getIsSomePageRowsSelected() && "indeterminate")
}
onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
aria-label="Select all"
/>
),
cell: ({ row }) => (
<Checkbox
checked={row.getIsSelected()}
onCheckedChange={(value) => row.toggleSelected(!!value)}
aria-label="Select row"
/>
),
enableSorting: false,
enableHiding: false,
size: 40, // Adjust size as needed
},
// REMOVED Expand/Collapse Column from here
// Product Column
{
accessorKey: "name",
header: "Produk",
cell: ({ row }) => {
const product = row.original;
return (
<div className="flex items-center gap-2">
<ProductImageTooltip imageUrl={product.mainImage} productName={product.name} alt={product.name}>
<Image
src={product.mainImage || '/placeholder.svg'} // Gunakan mainImage
alt={product.name}
width={40}
height={40}
className="rounded object-cover"
/>
</ProductImageTooltip>
<div>
<div className="font-medium">{product.name}</div>
<div className="text-xs text-muted-foreground">SKU Induk: {product.sku || '-'}</div>
<div className="text-xs text-muted-foreground">ID Produk: {product.id}</div>
</div>
</div>
);
},
size: 300, // Adjust size
},
// Category Column
{
accessorKey: "category",
header: "Kategori",
cell: ({ row }) => row.original.category || '-',
size: 100,
},
// Price Column
{
accessorKey: "price",
header: ({ column }) => (
<Button
variant="ghost"
onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
>
Harga Jual
<ArrowUpDown className="ml-2 h-4 w-4" />
</Button>
),
cell: ({ row }) => {
        const product = row.original;
        if (product.hasVariants) {
          const minPrice = product.minVariantPrice;
          const maxPrice = product.maxVariantPrice;

          if (minPrice !== null && maxPrice !== null) {
            if (minPrice === maxPrice) {
              return `Rp ${formatNumberWithSeparator(minPrice)}`;
            } else {
              return `Rp ${formatNumberWithSeparator(minPrice)} - Rp ${formatNumberWithSeparator(maxPrice)}`;
            }
          } else {
            // Fallback if variant prices are missing, though ideally they should exist
            return product.price !== null ? `Rp ${formatNumberWithSeparator(product.price)}` : '-'; 
          }
        } else {
          // Product without variants
          return product.price !== null ? `Rp ${formatNumberWithSeparator(product.price)}` : '-';
        }
      },
size: 120,
},
// Stock Column
{
accessorKey: "totalStock",
header: ({ column }) => (
<Button
variant="ghost"
onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
>
Stok
<ArrowUpDown className="ml-2 h-4 w-4" />
</Button>
),
cell: ({ row }) => formatNumberWithSeparator(row.original.totalStock),
size: 80,
},
// Variants Column
{
accessorKey: "hasVariants",
header: "Varian",
cell: ({ row }) => {
const product = row.original;
return product.hasVariants ? (
<Badge variant="secondary">Ya ({product.variantCount})</Badge>
) : (
<Badge variant="outline">Tidak</Badge>
);
},
size: 80,
},
// Sync Status Column
{
accessorKey: "syncStatus",
header: "Sinkronisasi",
cell: ({ row }) => {
// TODO: Implement sync status display logic (e.g., icons, tooltips)
return '-'; // Placeholder
},
size: 120,
},
// Created At Column
{
accessorKey: "createdAt",
header: ({ column }) => (
<Button
variant="ghost"
onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
>
Dibuat Pada
<ArrowUpDown className="ml-2 h-4 w-4" />
</Button>
),
cell: ({ row }) => {
const date = new Date(row.original.createdAt);
return date.toLocaleDateString('id-ID'); // Format date as needed
},
size: 120,
},
// Actions Column
{
id: "actions",
header: "Aksi",
cell: ({ row }) => {
const product = row.original;
const router = useRouter(); // Get router inside cell
const [isDeleting, setIsDeleting] = useState(false);

const handleDelete = async () => {
setIsDeleting(true);
try {
const response = await fetch(`/api/products/${product.id}`, {
method: 'DELETE',
});
if (!response.ok) {
const errorData = await response.json();
throw new Error(errorData.error || 'Gagal menghapus produk.');
}
toast.success('Sukses', { description: `Produk "${product.name}" berhasil dihapus.` });
refreshData(); // Call refreshData passed from the component
} catch (err: any) {
toast.error('Error Hapus', { description: err.message || 'Gagal menghapus produk.' });
} finally {
setIsDeleting(false);
}
};

return (
<div className="flex items-center gap-1">
<TooltipProvider>
<Tooltip>
<TooltipTrigger asChild>
<Button variant="ghost" size="icon" onClick={() => router.push(`/products/management/view/${product.id}`)}>
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
<Button variant="ghost" size="icon" onClick={() => router.push(`/products/management/edit/${product.id}`)}>
<FileEdit className="h-4 w-4" />
</Button>
</TooltipTrigger>
<TooltipContent>
<p>Edit Produk</p>
</TooltipContent>
</Tooltip>
</TooltipProvider>
<AlertDialog>
<TooltipProvider>
<Tooltip>
<TooltipTrigger asChild>
<AlertDialogTrigger asChild>
<Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" disabled={isDeleting}>
{isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
</Button>
</AlertDialogTrigger>
</TooltipTrigger>
<TooltipContent>
<p>Hapus Produk</p>
</TooltipContent>
</Tooltip>
</TooltipProvider>
<AlertDialogContent>
<AlertDialogHeader>
<AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
<AlertDialogDescription>
Apakah Anda yakin ingin menghapus produk "{product.name}"? Tindakan ini tidak dapat diurungkan.
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
size: 100,
},
];

export default function ProductManagementPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]); // Inisialisasi dengan array kosong
  const [isLoading, setIsLoading] = useState(true); // Set loading true di awal
  const [error, setError] = useState<string | null>(null);
  const [paginationState, setPaginationState] = useState({
    pageIndex: 0, // TanStack Table uses 0-based index
    pageSize: 10,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // State untuk search
  const [sorting, setSorting] = useState<any[]>([]); // State for sorting
  const [expanded, setExpanded] = useState<ExpandedState>({}); // State for expanded rows

  // Fungsi untuk fetch data produk dari API
  const fetchProducts = async (page = paginationState.pageIndex + 1, limit = paginationState.pageSize, search = searchTerm) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = new URL('/api/products', window.location.origin);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', limit.toString());
      if (search) {
        url.searchParams.append('search', search);
      }
      // TODO: Add sorting parameters if API supports it

      const response = await fetch(url.toString());
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal memuat data produk.');
      }
      const result = await response.json();

      setProducts(result.data || []); // Pastikan data selalu array
      // Update pagination based on API response
      if (result.pagination && typeof result.pagination.page === 'number') {
        setPaginationState(prev => ({
          ...prev,
          pageIndex: result.pagination.page - 1, // Convert back to 0-based index
        }));
        setTotalItems(result.pagination.totalItems || 0);
        setTotalPages(result.pagination.totalPages || 1);
      } else {
        console.warn('Invalid pagination data received from API:', result.pagination);
        setTotalItems(result.data?.length || 0);
        setTotalPages(1);
        setPaginationState(prev => ({ ...prev, pageIndex: 0 }));
      }
      setRowSelection({}); // Reset selection saat fetch data
      // setExpanded({}); // Optionally reset expanded state on data fetch
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
      toast.error('Error Memuat Data', { description: err.message || 'Gagal memuat data produk.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data saat komponen dimount atau dependensi berubah
  useEffect(() => {
    fetchProducts(paginationState.pageIndex + 1, paginationState.pageSize, searchTerm);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginationState.pageIndex, paginationState.pageSize, searchTerm]); // Add searchTerm as dependency

  // Memoize columns
  const columns = useMemo(() => getColumns(() => fetchProducts(paginationState.pageIndex + 1, paginationState.pageSize, searchTerm)), [paginationState.pageIndex, paginationState.pageSize, searchTerm]);

  const table = useReactTable({
    data: products,
    columns,
    state: {
      sorting,
      rowSelection,
      pagination: paginationState,
      expanded,
    },
    pageCount: totalPages,
    manualPagination: true, // We handle pagination server-side
    manualSorting: true, // Assuming server-side sorting later
    manualFiltering: true, // Assuming server-side filtering later
    onPaginationChange: setPaginationState,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded, // Handle expanded state changes
    getRowCanExpand: (row) => row.original.hasVariants, // Determine if a row can expand
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(), // Enable the expanded row model
    debugTable: process.env.NODE_ENV === 'development',
  });

  // Handler untuk perubahan search term
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    // fetchProducts will be called by useEffect
  };

  // Hitung jumlah baris yang dipilih
  const selectedRowCount = Object.keys(rowSelection).length;
  const selectedRowIds = useMemo(() => {
    // Ambil ID dari baris yang dipilih berdasarkan data produk saat ini
    return table.getSelectedRowModel().flatRows.map(row => row.original.id);
  }, [rowSelection, table]);

  // Handler untuk bulk delete
  const handleBulkDelete = async () => {
    if (selectedRowCount === 0) return;
    setIsBulkDeleting(true);
    try {
      const response = await fetch('/api/products/bulk-delete', { // Ganti ke endpoint bulk delete yang sesuai
        method: 'POST', // Atau DELETE, sesuaikan dengan API
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: selectedRowIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Gagal menghapus produk terpilih.');
      }

      toast.success('Sukses', { description: `${selectedRowCount} produk berhasil dihapus.` });
      fetchProducts(1, paginationState.pageSize, searchTerm); // Refresh data dari halaman 1 setelah bulk delete
    } catch (err: any) {
      toast.error('Error Hapus Massal', { description: err.message || 'Gagal menghapus produk terpilih.' });
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
            {/* Bulk Delete Button */}
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
            {/* Add Product Button */}
            <Button onClick={() => router.push('/products/management/add')}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Produk
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Input - Assuming DataTable has a search input or we add one here */}
          {/* <Input placeholder="Cari produk..." value={searchTerm} onChange={(e) => handleSearchChange(e.target.value)} className="max-w-sm mb-4" /> */}

          {isLoading ? (
            <DataTableSkeleton columnCount={columns.length} rowCount={paginationState.pageSize} />
          ) : error ? (
            <div className="text-center py-10 text-red-600">
              {error}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                          {header.isPlaceholder
                            ? null
                            : (
                              <div
                                {...{
                                  className: header.column.getCanSort()
                                    ? 'cursor-pointer select-none flex items-center gap-1'
                                    : '',
                                  onClick: header.column.getToggleSortingHandler(),
                                }}
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                                {{ asc: <ArrowUpDown className="ml-2 h-3 w-3" />, desc: <ArrowUpDown className="ml-2 h-3 w-3 rotate-180" /> }[header.column.getIsSorted() as string] ?? null}
                              </div>
                            )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map(row => (
                      <Fragment key={row.id}>
                        <TableRow
                          data-state={row.getIsSelected() && "selected"}
                        >
                          {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                        {/* Expander Row */}
                        {row.getCanExpand() && (
                          <TableRow>
                            <TableCell 
                              colSpan={columns.length} 
                              className="p-0 cursor-pointer hover:bg-muted/75" 
                              onClick={row.getToggleExpandedHandler()} // Move onClick here
                            >
                              <div className="flex items-center px-4 py-2 bg-muted/50">
                                {/* Remove button, keep icon and text */} 
                                <span className="p-1 rounded mr-2">
                                  {row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </span>
                                <span className="text-xs font-medium text-muted-foreground">
                                  {row.getIsExpanded() ? 'Sembunyikan Varian' : 'Tampilkan Varian'}
                                </span>
                              </div>
                              <Separator /> 
                            </TableCell>
                          </TableRow>
                        )}
                        {/* Expanded Content Row */}
                        {row.getIsExpanded() && (
                          <TableRow>
                            {/* Use a single cell that spans all columns */}
                            <TableCell colSpan={columns.length} className="p-0">
                              <VariantDetails productId={row.original.id} />
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        Tidak ada hasil.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          {/* Pagination Controls - Assuming DataTable had pagination or we add it here */}
          {/* Example Pagination (replace with DataTable's or custom) */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} dari{" "}
              {totalItems} baris terpilih.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
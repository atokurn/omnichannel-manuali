'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DataTable } from "@/components/stock/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileEdit, Trash2, Plus } from "lucide-react"; // Added Plus icon
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatNumberWithSeparator } from "../../../lib/utils"; // Import fungsi utilitas
import { useRouter } from 'next/navigation'; // Added useRouter

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

// Definisi kolom untuk DataTable
const columns = [
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "name",
    header: "Nama Produk",
    cell: ({ row }: { row: any }) => (
      <div className="flex items-center gap-2">
        {/* Placeholder for image - replace with actual Image component if available */}
        {/* <Image src="/placeholder.svg" alt={row.original.name} width={32} height={32} className="rounded" /> */}
        <span className="font-medium">{row.original.name}</span>
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
    cell: ({ row }: { row: any }) => `Rp ${formatNumberWithSeparator(row.original.price)}`,
  },
  {
    accessorKey: "normalPrice",
    header: "Harga Normal",
    cell: ({ row }: { row: any }) => `Rp ${formatNumberWithSeparator(row.original.normalPrice)}`,
  },
  {
    accessorKey: "salesCount",
    header: "Terjual",
    cell: ({ row }: { row: any }) => formatNumberWithSeparator(row.original.salesCount),
  },
  {
    accessorKey: "stock",
    header: "Stok",
    cell: ({ row }: { row: any }) => formatNumberWithSeparator(row.original.stock),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: any }) => (
      <Badge variant={row.original.status === "Aktif" ? "default" : "destructive"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "lastUpdated",
    header: "Terakhir Diperbarui",
    cell: ({ row }: { row: any }) => new Date(row.original.lastUpdated).toLocaleDateString('id-ID'),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }: { row: any }) => (
      <TooltipProvider>
        <div className="flex gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Lihat Detail</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <FileEdit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Produk</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 text-red-500">
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Hapus Produk</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    ),
  },
];

export default function ProductManagementPage() {
  const router = useRouter(); // Initialize router
  const [products, setProducts] = useState<Product[]>(dummyProductData);

  // TODO: Implement actual data fetching
  // TODO: Implement search/filter functionality
  // TODO: Implement actions (view, edit, delete)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Manajemen Produk</CardTitle>
            <CardDescription>
              Kelola daftar produk Anda.
            </CardDescription>
          </div>
          <Button onClick={() => router.push('/products/management/add')}>Tambah Produk
          </Button>
        </CardHeader>
        <CardContent>
          {/* TODO: Add search input and filter options here */}
          <DataTable columns={columns} data={products} searchKey="name" />
        </CardContent>
      </Card>
    </div>
  );
}
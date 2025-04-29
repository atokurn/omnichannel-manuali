'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DataTable } from "@/components/stock/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileEdit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatNumberWithSeparator } from "../../../lib/utils"; // Import fungsi utilitas
import Link from 'next/link'; // Import Link

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
    sku: "PRD-001",
    name: "Laptop Asus",
    category: "Elektronik",
    price: 11500000,
    normalPrice: 12000000,
    salesCount: 25,
    stock: 10,
    status: "Aktif",
    lastUpdated: "2023-10-15T08:30:00Z"
  },
  {
    id: "2",
    sku: "PRD-002",
    name: "Mouse Logitech",
    category: "Aksesoris",
    price: 350000,
    normalPrice: 350000,
    salesCount: 120,
    stock: 50,
    status: "Aktif",
    lastUpdated: "2023-10-16T10:15:00Z"
  },
  {
    id: "3",
    sku: "PRD-003",
    name: "Keyboard Mechanical",
    category: "Aksesoris",
    price: 799000,
    normalPrice: 850000,
    salesCount: 45,
    stock: 25,
    status: "Aktif",
    lastUpdated: "2023-10-17T14:45:00Z"
  },
  {
    id: "4",
    sku: "PRD-004",
    name: "Monitor LED 24\"",
    category: "Elektronik",
    price: 2500000,
    normalPrice: 2500000,
    salesCount: 18,
    stock: 15,
    status: "Aktif",
    lastUpdated: "2023-10-18T09:20:00Z"
  },
  {
    id: "5",
    sku: "PRD-005",
    name: "Headset Gaming",
    category: "Aksesoris",
    price: 599000,
    normalPrice: 750000,
    salesCount: 0,
    stock: 30,
    status: "Tidak Aktif",
    lastUpdated: "2023-10-19T11:10:00Z"
  }
];

// Data dummy untuk kategori
const dummyCategories = [
  { id: "1", name: "Elektronik" },
  { id: "2", name: "Aksesoris" },
];

export default function ProductManagementPage() {
  // State untuk data produk (gantilah dengan data asli)
  const [products, setProducts] = useState<Product[]>(dummyProductData);

  // Fungsi untuk menangani aksi (contoh)
  const handleView = (id: string) => {
    console.log(`View product ${id}`);
    // Navigasi ke halaman detail produk jika ada
  };

  const handleEdit = (id: string) => {
    console.log(`Edit product ${id}`);
    // Navigasi ke halaman edit produk
  };

  const handleDelete = (id: string) => {
    console.log(`Delete product ${id}`);
    // Tampilkan konfirmasi dan hapus produk
    setProducts(products.filter(p => p.id !== id));
  };

  // Definisi kolom untuk DataTable
  const columns = [
    {
      accessorKey: "name",
      header: "Nama Produk",
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-2">
          {/* Ganti dengan Image jika ada URL gambar */}
          <div className="w-10 h-10 bg-muted rounded-sm flex items-center justify-center text-xs">
            IMG
          </div>
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU",
    },
    {
      accessorKey: "category",
      header: "Kategori",
    },
    {
      accessorKey: "price",
      header: "Harga Jual",
      cell: ({ row }: { row: any }) => `Rp ${formatNumberWithSeparator(row.getValue("price"))}`,
    },
    {
      accessorKey: "normalPrice",
      header: "Harga Normal",
      cell: ({ row }: { row: any }) => `Rp ${formatNumberWithSeparator(row.getValue("normalPrice"))}`,
    },
    {
      accessorKey: "salesCount",
      header: "Terjual",
      cell: ({ row }: { row: any }) => formatNumberWithSeparator(row.getValue("salesCount")),
    },
    {
      accessorKey: "stock",
      header: "Stok",
      cell: ({ row }: { row: any }) => formatNumberWithSeparator(row.getValue("stock")),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: any }) => (
        <Badge variant={row.getValue("status") === 'Aktif' ? 'default' : 'secondary'}>
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      accessorKey: "lastUpdated",
      header: "Terakhir Diperbarui",
      cell: ({ row }: { row: any }) => new Date(row.getValue("lastUpdated")).toLocaleDateString('id-ID'),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }: { row: any }) => {
        const product = row.original;
        return (
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => handleView(product.id)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Lihat Detail</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  {/* Arahkan ke halaman edit */}
                  <Link href={`/products/management/edit/${product.id}`} passHref>
                    <Button variant="ghost" size="icon">
                      <FileEdit className="h-4 w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ubah Produk</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hapus Produk</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        );
      },
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Manajemen Produk</h1>
        {/* Arahkan ke halaman tambah produk */}
        <Link href="/products/management/add" passHref>
          <Button>Tambah Produk</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>Kelola semua produk Anda di sini.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={products} searchKey="name" />
        </CardContent>
      </Card>
    </div>
  );
}
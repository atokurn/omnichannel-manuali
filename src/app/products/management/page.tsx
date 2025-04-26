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
  const [filteredData, setFilteredData] = useState<Product[]>(dummyProductData);
  
  // Fungsi untuk filter berdasarkan kategori
  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === "all") {
      setFilteredData(dummyProductData);
    } else {
      setFilteredData(dummyProductData.filter(item => item.category === dummyCategories.find(cat => cat.id === categoryId)?.name));
    }
  };

  // Definisi kolom untuk DataTable
  const columns = [
    {
      accessorKey: "sku",
      header: "Informasi Produk",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="relative h-12 w-12 overflow-hidden rounded-md cursor-pointer">
                  <Image
                    src="/placeholder.svg"
                    alt={row.original.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="p-0 border-0 bg-transparent">
                <div className="relative w-48 h-48 overflow-hidden rounded-md shadow-lg">
                  <Image
                    src="/placeholder.svg"
                    alt={row.original.name}
                    fill
                    sizes="192px"
                    className="object-cover"
                    priority
                  />
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div>
            <div className="font-medium">{row.original.sku}</div>
            <div className="text-sm text-muted-foreground">{row.original.name}</div>
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
      cell: ({ row }: any) => {
        const product = row.original;
        const hasDiscount = product.price < product.normalPrice;
        const formattedPrice = `Rp${formatNumberWithSeparator(product.price)}`;
        const formattedNormalPrice = `Rp${formatNumberWithSeparator(product.normalPrice)}`;

        return (
          <div>
            <div className="flex items-center gap-1">
              {formattedPrice}
            </div>
            {hasDiscount && (
              <div className="text-sm text-muted-foreground">
                Harga normal: {formattedNormalPrice}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "salesCount",
      header: "Penjualan",
      cell: ({ row }: any) => formatNumberWithSeparator(row.original.salesCount),
    },
    {
      accessorKey: "stock",
      header: "Stok",
      cell: ({ row }: any) => formatNumberWithSeparator(row.original.stock),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status;
        let badgeVariant = "secondary";
        
        if (status === "Aktif") badgeVariant = "success";
        if (status === "Tidak Aktif") badgeVariant = "destructive";
        
        return <Badge variant={badgeVariant as any}>{status}</Badge>;
      },
    },
    {
      accessorKey: "lastUpdated",
      header: "Terakhir Diperbarui",
      cell: ({ row }: any) => {
        const date = new Date(row.original.lastUpdated);
        return (
          <div>
            {date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            <div className="text-sm text-muted-foreground">
              {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }: any) => {
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <FileEdit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Manajemen Produk</CardTitle>
                    <CardDescription>Kelola data produk dalam sistem</CardDescription>
                  </div>
                  <Button asChild>
                    <a href="/products/management/add">Tambah Produk</a>
                  </Button>
                </CardHeader>
                <CardContent>
                  <DataTable 
                    columns={columns} 
                    data={filteredData} 
                    searchKey="name" 
                    warehouses={dummyCategories}
                    onWarehouseChange={handleCategoryChange}
                  />
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
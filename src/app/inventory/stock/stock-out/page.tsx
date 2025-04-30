'use client';

import React from 'react';
import { useState } from 'react';
import Image from 'next/image'; // Import Image component
import Link from 'next/link'; // Import Link component
import { DataTable } from "@/components/stock/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileEdit, Trash2, Plus, Search } from "lucide-react"; // Import Plus and Search icons
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components
import { Input } from "@/components/ui/input"; // Import Input component
import { Label } from "@/components/ui/label"; // Import Label component
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components
import { formatNumberWithSeparator } from '@/lib/utils'; // Import fungsi format
import { ProductImageTooltip } from "@/components/ui/image-tooltip";

// Definisi tipe data untuk Stock Out
interface StockOutItem {
  id: string;
  sku: string;
  productName: string;
  warehouse: {
    id: string;
    name: string;
  };
  quantity: number;
  date: string;
  creator: {
    id: string;
    name: string;
  };
  reason: string;
}

// Data dummy untuk Stock Out
const dummyStockOutData: StockOutItem[] = [
  {
    id: "1",
    sku: "PRD-001",
    productName: "Laptop Asus",
    warehouse: {
      id: "1",
      name: "Gudang Pusat"
    },
    quantity: 5,
    date: "2023-10-16T09:30:00Z",
    creator: {
      id: "1",
      name: "John Doe"
    },
    reason: "Penjualan"
  },
  {
    id: "2",
    sku: "PRD-002",
    productName: "Mouse Logitech",
    warehouse: {
      id: "1",
      name: "Gudang Pusat"
    },
    quantity: 20,
    date: "2023-10-17T11:15:00Z",
    creator: {
      id: "2",
      name: "Jane Smith"
    },
    reason: "Penjualan"
  },
  {
    id: "3",
    sku: "PRD-003",
    productName: "Keyboard Mechanical",
    warehouse: {
      id: "2",
      name: "Gudang Cabang"
    },
    quantity: 10,
    date: "2023-10-18T15:45:00Z",
    creator: {
      id: "1",
      name: "John Doe"
    },
    reason: "Transfer"
  },
  {
    id: "4",
    sku: "PRD-004",
    productName: "Monitor LED 24\"",
    warehouse: {
      id: "2",
      name: "Gudang Cabang"
    },
    quantity: 8,
    date: "2023-10-19T10:20:00Z",
    creator: {
      id: "3",
      name: "Robert Johnson"
    },
    reason: "Penjualan"
  },
  {
    id: "5",
    sku: "PRD-005",
    productName: "Headset Gaming",
    warehouse: {
      id: "1",
      name: "Gudang Pusat"
    },
    quantity: 15,
    date: "2023-10-20T12:10:00Z",
    creator: {
      id: "2",
      name: "Jane Smith"
    },
    reason: "Rusak"
  }
];

// Data dummy untuk warehouse
const dummyWarehouses = [
  { id: "1", name: "Gudang Pusat" },
  { id: "2", name: "Gudang Cabang" },
];

export default function StockOutPage() {
  const [filteredData, setFilteredData] = useState<StockOutItem[]>(dummyStockOutData);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");

  // Fungsi untuk filter data berdasarkan semua kriteria
  const filterData = () => {
    let filtered = [...dummyStockOutData];

    // Filter berdasarkan warehouse
    if (selectedWarehouse !== "all") {
      filtered = filtered.filter(item => item.warehouse.id === selectedWarehouse);
    }

    // Filter berdasarkan pencarian (SKU atau Nama Produk)
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.sku.toLowerCase().includes(lowerCaseSearchTerm) ||
        item.productName.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    setFilteredData(filtered);
  };

  // Panggil filterData saat searchTerm atau selectedWarehouse berubah
  React.useEffect(() => {
    filterData();
  }, [searchTerm, selectedWarehouse]);

  // Fungsi untuk handle perubahan warehouse
  const handleWarehouseChange = (warehouseId: string) => {
    setSelectedWarehouse(warehouseId);
  };

  // Fungsi untuk handle perubahan input pencarian
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Definisi kolom untuk DataTable
  const columns = [
    {
      accessorKey: "sku",
      header: "SKU Information",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <ProductImageTooltip
            imageUrl="/placeholder.svg"
            alt={row.original.productName}
            thumbnailSize={48}
            previewSize={192}
            side="right"
          />
          <div>
            <div className="font-medium">{row.original.sku}</div>
            <div className="text-sm text-muted-foreground">{row.original.productName}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "warehouse.name",
      header: "Warehouse",
    },
    {
      accessorKey: "reason",
      header: "Stock Type",
      cell: ({ row }: any) => {
        const reason = row.original.reason;
        let badgeVariant = "secondary";
        
        if (reason === "Penjualan") badgeVariant = "default";
        if (reason === "Transfer") badgeVariant = "outline";
        if (reason === "Rusak") badgeVariant = "destructive";
        
        return <Badge variant={badgeVariant as any}>{reason}</Badge>;
      },
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      cell: ({ row }: any) => <div className="text-right pr-4">{formatNumberWithSeparator(row.original.quantity)}</div>,
    },
    {
      accessorKey: "date",
      header: "Time",
      cell: ({ row }: any) => {
        const date = new Date(row.original.date);
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
      accessorKey: "creator.name",
      header: "Creator",
    },
    {
      id: "actions",
      header: "Actions",
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
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Stock Out</CardTitle>
            <CardDescription>Kelola stok keluar dari gudang.</CardDescription>
          </div>
          <Button asChild>
            <Link href="/inventory/stock/stock-out/add">Tambah Stok Keluar
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filter Section */}
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="warehouse">Gudang</Label>
              <Select onValueChange={handleWarehouseChange} defaultValue="all">
                <SelectTrigger id="warehouse">
                  <SelectValue placeholder="Pilih Gudang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Gudang</SelectItem>
                  {dummyWarehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full">
            <Label htmlFor="search" className="mb-1 block text-sm font-medium">Pencarian</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  type="search"
                  placeholder="Cari SKU atau Nama Produk"
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
          <DataTable columns={columns} data={filteredData} />
        </CardContent>
      </Card>
    </main>
  );
}
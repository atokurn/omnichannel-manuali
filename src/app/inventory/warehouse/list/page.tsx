'use client';

import { useState, useEffect } from 'react'; // Added useEffect

import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileEdit, Trash2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatNumberWithSeparator } from '@/lib/utils'; // Import fungsi format



// Definisi tipe data untuk Inventory Item
interface InventoryItem {
  id: string;
  sku: string;
  productName: string;
  category: string;
  warehouse: {
    id: string;
    name: string;
  };
  area: string;
  shelf: string;
  stock: number;
  orderAllocated: number; // Kolom baru
  wholeWarehouseAvailable: number; // Kolom baru
  promoReserved: number; // Kolom baru
  minStock: number;
  status: string;
  lastUpdated: string;
}

// Data dummy untuk Inventory
const dummyInventoryData: InventoryItem[] = [
  {
    id: "1",
    sku: "PRD-001",
    productName: "Laptop Asus",
    category: "Elektronik",
    warehouse: {
      id: "1",
      name: "Gudang Pusat"
    },
    area: "Area A",
    shelf: "Rak 1",
    stock: 25,
    orderAllocated: 5,
    wholeWarehouseAvailable: 100,
    promoReserved: 2,
    minStock: 10,
    status: "Tersedia",
    lastUpdated: "2023-10-15T08:30:00Z"
  },
  {
    id: "2",
    sku: "PRD-002",
    productName: "Mouse Logitech",
    category: "Aksesoris",
    warehouse: {
      id: "1",
      name: "Gudang Pusat"
    },
    area: "Area B",
    shelf: "Rak 3",
    stock: 50,
    orderAllocated: 10,
    wholeWarehouseAvailable: 100,
    promoReserved: 0,
    minStock: 20,
    status: "Tersedia",
    lastUpdated: "2023-10-16T10:15:00Z"
  },
  {
    id: "3",
    sku: "PRD-003",
    productName: "Keyboard Mechanical",
    category: "Aksesoris",
    warehouse: {
      id: "2",
      name: "Gudang Cabang"
    },
    area: "Area A",
    shelf: "Rak 2",
    stock: 15,
    orderAllocated: 3,
    wholeWarehouseAvailable: 50,
    promoReserved: 1,
    minStock: 10,
    status: "Tersedia",
    lastUpdated: "2023-10-17T14:45:00Z"
  },
  {
    id: "4",
    sku: "PRD-004",
    productName: "Monitor LED 24\"",
    category: "Elektronik",
    warehouse: {
      id: "2",
      name: "Gudang Cabang"
    },
    area: "Area C",
    shelf: "Rak 4",
    stock: 8,
    orderAllocated: 2,
    wholeWarehouseAvailable: 50,
    promoReserved: 0,
    minStock: 5,
    status: "Hampir Habis",
    lastUpdated: "2023-10-18T09:20:00Z"
  },
  {
    id: "5",
    sku: "PRD-005",
    productName: "Headset Gaming",
    category: "Aksesoris",
    warehouse: {
      id: "1",
      name: "Gudang Pusat"
    },
    area: "Area B",
    shelf: "Rak 2",
    stock: 0,
    orderAllocated: 0,
    wholeWarehouseAvailable: 100,
    promoReserved: 0,
    minStock: 10,
    status: "Habis",
    lastUpdated: "2023-10-19T11:10:00Z"
  }
];

// Data dummy untuk warehouse
const dummyWarehouses = [
  { id: "1", name: "Gudang Pusat" },
  { id: "2", name: "Gudang Cabang" },
];

// Data dummy untuk kategori
const dummyCategories = [
  { id: "elektronik", name: "Elektronik" },
  { id: "aksesoris", name: "Aksesoris" },
];

// Data dummy untuk status
const dummyStatuses = [
  { id: "tersedia", name: "Tersedia" },
  { id: "hampir-habis", name: "Hampir Habis" },
  { id: "habis", name: "Habis" },
];

export default function InventoryListPage() {
  const [filteredData, setFilteredData] = useState<InventoryItem[]>(dummyInventoryData);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  
  // Fungsi untuk filter data berdasarkan semua kriteria
  const filterData = () => {
    let filtered = [...dummyInventoryData];
    
    // Filter berdasarkan warehouse
    if (selectedWarehouse !== "all") {
      filtered = filtered.filter(item => item.warehouse.id === selectedWarehouse);
    }
    
    // Filter berdasarkan kategori
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.category.toLowerCase() === selectedCategory);
    }
    
    // Filter berdasarkan status
    if (selectedStatus !== "all") {
      filtered = filtered.filter(item => item.status.toLowerCase().replace(" ", "-") === selectedStatus);
    }
    
    setFilteredData(filtered);
  };

  // Terapkan filter saat state berubah (Added useEffect)
  useEffect(() => {
    filterData();
  }, [selectedWarehouse, selectedCategory, selectedStatus]);

  // Kolom untuk DataTable
  const columns = [
    {
      header: "SKU",
      accessorKey: "sku",
    },
    {
      header: "Nama Produk",
      accessorKey: "productName",
    },
    {
      header: "Kategori",
      accessorKey: "category",
    },
    {
      header: "Gudang",
      accessorKey: "warehouse.name",
    },
    {
      header: "Area",
      accessorKey: "area",
    },
    {
      header: "Rak",
      accessorKey: "shelf",
    },
    {
      header: "Stok",
      accessorKey: "stock",
      cell: ({ row }: any) => <div className="text-right pr-4">{formatNumberWithSeparator(row.original.stock)}</div>,
    },
    {
      header: "Alokasi Pesanan",
      accessorKey: "orderAllocated",
      cell: ({ row }: any) => <div className="text-right pr-4">{formatNumberWithSeparator(row.original.orderAllocated)}</div>,
    },
    {
      header: "Tersedia Gudang",
      accessorKey: "wholeWarehouseAvailable",
      cell: ({ row }: any) => <div className="text-right pr-4">{formatNumberWithSeparator(row.original.wholeWarehouseAvailable)}</div>,
    },
    {
      header: "Reservasi Promo",
      accessorKey: "promoReserved",
      cell: ({ row }: any) => <div className="text-right pr-4">{formatNumberWithSeparator(row.original.promoReserved)}</div>,
    },
    {
      header: "Stok Min",
      accessorKey: "minStock",
      cell: ({ row }: any) => <div className="text-right pr-4">{formatNumberWithSeparator(row.original.minStock)}</div>,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.original.status;
        let badgeColor = "";
        
        switch (status.toLowerCase()) {
          case "tersedia":
            badgeColor = "bg-green-500";
            break;
          case "hampir habis":
            badgeColor = "bg-yellow-500";
            break;
          case "habis":
            badgeColor = "bg-red-500";
            break;
          default:
            badgeColor = "bg-gray-500";
        }
        
        return <Badge className={badgeColor}>{status}</Badge>;
      },
    },
    {
      header: "Terakhir Diperbarui",
      accessorKey: "lastUpdated",
      cell: ({ row }) => {
        const date = new Date(row.original.lastUpdated);
        return date.toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      header: "Aksi",
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
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
    // Removed wrapping div, SidebarProvider, SiteHeader, InventorySidebar, SidebarInset
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Daftar Inventaris</CardTitle>
          <CardDescription>
            Kelola dan pantau stok inventaris di semua gudang
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <Label>Gudang</Label>
              <Select
                value={selectedWarehouse}
                onValueChange={(value) => {
                  setSelectedWarehouse(value);
                  // Removed setTimeout, directly call filterData
                  filterData(); 
                }}
              >
                <SelectTrigger>
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
            <div>
              <Label>Kategori</Label>
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  // Removed setTimeout, directly call filterData
                  filterData();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {dummyCategories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value);
                  // Removed setTimeout, directly call filterData
                  filterData();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {dummyStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Pencarian</Label>
              <Input placeholder="Cari SKU atau nama produk" />
            </div>
          </div>
          <DataTable
            columns={columns}
            data={filteredData}
          />
        </CardContent>
      </Card>
    </main> // End main tag
    // Removed closing tags for SidebarInset, div, SidebarProvider, div
  );
}
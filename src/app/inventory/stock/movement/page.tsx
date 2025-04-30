'use client';

import React, { useState, useEffect } from 'react'; // Added useEffect
import Image from 'next/image'; // Import Image component
import { InventorySidebar } from "@/components/inventory-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DataTable } from "@/components/stock/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileEdit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components
import { formatNumberWithSeparator } from '@/lib/utils'; // Import fungsi format



// Definisi tipe data untuk Stock Movement
interface StockMovementItem {
  id: string;
  sku: string;
  productName: string;
  warehouse: {
    id: string;
    name: string;
  };
  quantity: number;
  type: string;
  date: string;
  creator: {
    id: string;
    name: string;
  };
  notes?: string;
}

// Data dummy untuk Stock Movement
const dummyStockMovementData: StockMovementItem[] = [
  {
    id: "1",
    sku: "PRD-001",
    productName: "Laptop Asus",
    warehouse: {
      id: "1",
      name: "Gudang Pusat"
    },
    quantity: 10,
    type: "Stock In",
    date: "2023-10-15T08:30:00Z",
    creator: {
      id: "1",
      name: "John Doe"
    },
    notes: "Pembelian dari supplier"
  },
  {
    id: "2",
    sku: "PRD-002",
    productName: "Mouse Logitech",
    warehouse: {
      id: "1",
      name: "Gudang Pusat"
    },
    quantity: -5,
    type: "Stock Out",
    date: "2023-10-16T10:15:00Z",
    creator: {
      id: "2",
      name: "Jane Smith"
    },
    notes: "Pengiriman ke pelanggan"
  },
  {
    id: "3",
    sku: "PRD-003",
    productName: "Keyboard Mechanical",
    warehouse: {
      id: "2",
      name: "Gudang Cabang"
    },
    quantity: 25,
    type: "Stock In",
    date: "2023-10-17T14:45:00Z",
    creator: {
      id: "1",
      name: "John Doe"
    },
    notes: "Pembelian dari supplier"
  },
  {
    id: "4",
    sku: "PRD-004",
    productName: "Monitor LED 24\"",
    warehouse: {
      id: "2",
      name: "Gudang Cabang"
    },
    quantity: -3,
    type: "Stock Out",
    date: "2023-10-18T09:20:00Z",
    creator: {
      id: "3",
      name: "Robert Johnson"
    },
    notes: "Pengiriman ke pelanggan"
  },
  {
    id: "5",
    sku: "PRD-005",
    productName: "Headset Gaming",
    warehouse: {
      id: "1",
      name: "Gudang Pusat"
    },
    quantity: 8,
    type: "Transfer In",
    date: "2023-10-19T11:10:00Z",
    creator: {
      id: "2",
      name: "Jane Smith"
    },
    notes: "Transfer dari Gudang Cabang"
  },
  {
    id: "6",
    sku: "PRD-005",
    productName: "Headset Gaming",
    warehouse: {
      id: "2",
      name: "Gudang Cabang"
    },
    quantity: -8,
    type: "Transfer Out",
    date: "2023-10-19T11:10:00Z",
    creator: {
      id: "2",
      name: "Jane Smith"
    },
    notes: "Transfer ke Gudang Pusat"
  }
];

// Data dummy untuk warehouse
const dummyWarehouses = [
  { id: "1", name: "Gudang Pusat" },
  { id: "2", name: "Gudang Cabang" },
];

// Data dummy untuk tipe movement
const movementTypes = [
  { id: "stock-in", name: "Stock In" },
  { id: "stock-out", name: "Stock Out" },
  { id: "transfer-in", name: "Transfer In" },
  { id: "transfer-out", name: "Transfer Out" },
];

export default function StockMovementPage() {
  const [filteredData, setFilteredData] = useState<StockMovementItem[]>(dummyStockMovementData);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all");

  // Handler for date range change
  const handleDateChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
  };

  // Handler for warehouse selection change
  const handleWarehouseChange = (value: string) => {
    setSelectedWarehouse(value);
  };

  // Handler for movement type selection change
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
  };
  
  // Fungsi untuk filter data berdasarkan semua kriteria
  const filterData = () => {
    let filtered = [...dummyStockMovementData];
    
    // Filter berdasarkan tipe
    if (selectedType !== "all") {
      filtered = filtered.filter(item => {
        const type = item.type.toLowerCase().replace(" ", "-");
        return type === selectedType;
      });
    }
    
    // Filter berdasarkan warehouse
    if (selectedWarehouse !== "all") {
      filtered = filtered.filter(item => item.warehouse.id === selectedWarehouse);
    }
    
    // Filter berdasarkan tanggal
    if (dateRange?.from) {
      filtered = filtered.filter(item => new Date(item.date) >= dateRange.from!);
    }
    
    if (dateRange?.to) {
      // Tambahkan 1 hari ke endDate untuk mencakup seluruh hari yang dipilih
      const nextDay = new Date(dateRange.to);
      nextDay.setDate(nextDay.getDate() + 1);
      filtered = filtered.filter(item => new Date(item.date) < nextDay);
    }
    
    setFilteredData(filtered);
  };
  
  // Panggil filterData setiap kali filter berubah
  React.useEffect(() => {
    filterData();
  }, [selectedType, selectedWarehouse, dateRange]);

  // Definisi kolom untuk DataTable
  const columns = [
    {
      accessorKey: "sku",
      header: "SKU Information",
      enableSorting: true,
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="relative h-12 w-12 overflow-hidden rounded-md cursor-pointer">
                  <Image
                    src="/placeholder.svg"
                    alt={row.original.productName}
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
                    alt={row.original.productName}
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
            <div className="text-sm text-muted-foreground">{row.original.productName}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "warehouse.name",
      header: "Warehouse",
      enableSorting: true,
    },
    {
      accessorKey: "type",
      header: "Movement Type",
      enableSorting: true,
      cell: ({ row }: any) => {
        const type = row.original.type;
        let badgeVariant = "secondary";
        
        if (type === "Stock In") badgeVariant = "default";
        if (type === "Stock Out") badgeVariant = "destructive";
        if (type === "Transfer In") badgeVariant = "outline";
        if (type === "Transfer Out") badgeVariant = "outline";
        
        return <Badge variant={badgeVariant as any}>{type}</Badge>;
      },
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
      enableSorting: true,
      cell: ({ row }: any) => (
        <div className="text-right pr-4">{formatNumberWithSeparator(row.original.quantity)}</div>
      ),
    },
    {
      accessorKey: "type",
      header: "Movement Type",
      enableSorting: true,
      cell: ({ row }: any) => {
        const type = row.original.type;
        let badgeVariant = "secondary";
        
        if (type === "Stock In") badgeVariant = "default";
        if (type === "Stock Out") badgeVariant = "destructive";
        if (type === "Transfer In") badgeVariant = "outline";
        if (type === "Transfer Out") badgeVariant = "outline";
        
        return <Badge variant={badgeVariant as any}>{type}</Badge>;
      },
    },
    {
      accessorKey: "date",
      header: "Time",
      enableSorting: true,
      sortingFn: "datetime",
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
      enableSorting: true,
    },
    {
      accessorKey: "notes",
      header: "Notes",
      enableSorting: true,
      cell: ({ row }: any) => (
        <div className="max-w-[200px] truncate" title={row.original.notes}>
          {row.original.notes}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
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
        <CardHeader>
          <CardTitle>Stock Movement</CardTitle>
          <CardDescription>Track all stock movements including in, out, and transfers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end">
            {/* Filters */}
            <div className="grid gap-2">
              <Label htmlFor="date-range">Date Range</Label>
              <DatePickerWithRange date={dateRange} onDateChange={handleDateChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="warehouse-filter">Warehouse</Label>
              <Select value={selectedWarehouse} onValueChange={handleWarehouseChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  {dummyWarehouses.map(warehouse => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type-filter">Movement Type</Label>
              <Select value={selectedType} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {movementTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DataTable columns={columns} data={filteredData} />
        </CardContent>
      </Card>
    </main>
  );
}
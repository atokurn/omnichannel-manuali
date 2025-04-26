'use client';

import { useState } from 'react';
import Image from 'next/image'; // Import Image component
import { InventorySidebar } from "@/components/inventory-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DataTable } from "@/components/stock/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileEdit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components

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
  
  // Fungsi untuk filter berdasarkan warehouse
  const handleWarehouseChange = (warehouseId: string) => {
    if (warehouseId === "all") {
      setFilteredData(dummyStockOutData);
    } else {
      setFilteredData(dummyStockOutData.filter(item => item.warehouse.id === warehouseId));
    }
  };

  // Definisi kolom untuk DataTable
  const columns = [
    {
      accessorKey: "sku",
      header: "SKU Information",
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
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <InventorySidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Stock Out</CardTitle>
                    <CardDescription>Kelola data barang keluar dari gudang</CardDescription>
                  </div>
                  <Button asChild>
                    <a href="/inventory/stock/stock-out/add">Tambah Stock Out</a>
                  </Button>
                </CardHeader>
                <CardContent>
                  <DataTable 
                    columns={columns} 
                    data={filteredData} 
                    searchKey="sku" 
                    warehouses={dummyWarehouses}
                    onWarehouseChange={handleWarehouseChange}
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
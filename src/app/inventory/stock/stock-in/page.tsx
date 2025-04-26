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
import { formatNumberWithSeparator } from '@/lib/utils'; // Import fungsi format



// Definisi tipe data untuk Stock In
interface StockInItem {
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
}

// Data dummy untuk Stock In
const dummyStockInData: StockInItem[] = [
  {
    id: "1",
    sku: "PRD-001",
    productName: "Laptop Asus",
    warehouse: {
      id: "1",
      name: "Gudang Pusat"
    },
    quantity: 10000,
    date: "2023-10-15T08:30:00Z",
    creator: {
      id: "1",
      name: "John Doe"
    }
  },
  {
    id: "2",
    sku: "PRD-002",
    productName: "Mouse Logitech",
    warehouse: {
      id: "1",
      name: "Gudang Pusat"
    },
    quantity: 50,
    date: "2023-10-16T10:15:00Z",
    creator: {
      id: "2",
      name: "Jane Smith"
    }
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
    date: "2023-10-17T14:45:00Z",
    creator: {
      id: "1",
      name: "John Doe"
    }
  },
  {
    id: "4",
    sku: "PRD-004",
    productName: "Monitor LED 24\"",
    warehouse: {
      id: "2",
      name: "Gudang Cabang"
    },
    quantity: 15,
    date: "2023-10-18T09:20:00Z",
    creator: {
      id: "3",
      name: "Robert Johnson"
    }
  },
  {
    id: "5",
    sku: "PRD-005",
    productName: "Headset Gaming",
    warehouse: {
      id: "1",
      name: "Gudang Pusat"
    },
    quantity: 30,
    date: "2023-10-19T11:10:00Z",
    creator: {
      id: "2",
      name: "Jane Smith"
    }
  }
];

// Data dummy untuk warehouse
const dummyWarehouses = [
  { id: "1", name: "Gudang Pusat" },
  { id: "2", name: "Gudang Cabang" },
];

export default function StockInPage() {
  const [filteredData, setFilteredData] = useState<StockInItem[]>(dummyStockInData);
  
  // Fungsi untuk filter berdasarkan warehouse
  const handleWarehouseChange = (warehouseId: string) => {
    if (warehouseId === "all") {
      setFilteredData(dummyStockInData);
    } else {
      setFilteredData(dummyStockInData.filter(item => item.warehouse.id === warehouseId));
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
      accessorKey: "type",
      header: "Stock Type",
      cell: ({ row }: any) => {
        const type = row.original.type;
        let badgeVariant = "secondary";
        
        if (type === "Pembelian") badgeVariant = "default";
        if (type === "Transfer") badgeVariant = "outline";
        if (type === "Retur") badgeVariant = "success";
        
        return <Badge variant={badgeVariant as any}>{type}</Badge>;
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
                    <CardTitle>Stock In</CardTitle>
                    <CardDescription>Kelola data barang masuk ke gudang</CardDescription>
                  </div>
                  <Button asChild>
                    <a href="/inventory/stock/stock-in/add">Tambah Stock In</a>
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
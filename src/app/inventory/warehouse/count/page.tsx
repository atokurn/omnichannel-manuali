'use client';

import React, { useState } from 'react';
import { InventorySidebar } from "@/components/inventory-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DataTable } from "@/components/stock/data-table"; // Asumsi menggunakan DataTable yang sama
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileEdit, Trash2, ListChecks, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatNumberWithSeparator } from '@/lib/utils'; // Import fungsi format

// Definisi tipe data untuk Stock Count Item (sesuaikan sesuai kebutuhan)
interface StockCountItem {
  id: string;
  countId: string; // ID unik stock count
  warehouse: {
    id: string;
    name: string;
  };
  countType: 'By Merchant SKU' | 'By Shelf' | 'By Warehouse';
  countDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  itemCount?: number; // Jumlah item yang dihitung (opsional, tergantung tipe)
}

// Data dummy untuk Stock Count (ganti dengan data asli nanti)
const dummyStockCountData: StockCountItem[] = [
  {
    id: "SC-001",
    countId: "SC-2024-001",
    warehouse: { id: "1", name: "Gudang Pusat" },
    countType: "By Merchant SKU",
    countDate: "2023-11-10T09:00:00Z",
    status: "Completed",
    itemCount: 15000
  },
  {
    id: "SC-002",
    countId: "SC-2024-002",
    warehouse: { id: "2", name: "Gudang Cabang A" },
    countType: "By Shelf",
    countDate: "2023-11-11T11:30:00Z",
    status: "In Progress",
    itemCount: 5 // Jumlah rak
  },
  {
    id: "SC-003",
    countId: "SC-2024-003",
    warehouse: { id: "1", name: "Gudang Pusat" },
    countType: "By Warehouse",
    countDate: "2023-11-12T15:00:00Z",
    status: "Pending",
  },
  // Tambahkan data dummy lainnya jika perlu
];



export default function StockCountListPage() {
  const [filteredData, setFilteredData] = useState<StockCountItem[]>(dummyStockCountData);

  // Definisi kolom untuk DataTable (sesuaikan)
  const columns = [
    {
      accessorKey: "countId",
      header: "Count ID",
    },
    {
      accessorKey: "warehouse.name",
      header: "Gudang",
    },
    {
      accessorKey: "countType",
      header: "Tipe Hitung",
    },
    {
      accessorKey: "itemCount",
      header: "Jumlah Item/Rak",
      cell: ({ row }: any) => (
        <div className="text-right pr-4">{formatNumberWithSeparator(row.original.itemCount)}</div> // Terapkan format dan ratakan kanan
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status;
        let badgeVariant: "secondary" | "default" | "success" | "destructive" | "outline" = "secondary";
        if (status === "In Progress") badgeVariant = "outline";
        if (status === "Completed") badgeVariant = "success";
        if (status === "Cancelled") badgeVariant = "destructive";
        return <Badge variant={badgeVariant as any}>{status}</Badge>;
      },
    },
    {
      accessorKey: "countDate",
      header: "Tanggal Hitung",
      cell: ({ row }: any) => {
        const date = new Date(row.original.countDate);
        return (
          <div>
            {date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
            <div className="text-sm text-muted-foreground">
              {date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <div className="flex items-center space-x-2">
          <TooltipProvider>
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
            {/* Tambahkan aksi lain jika perlu, misal Edit atau Cancel */} 
            {row.original.status === 'Pending' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <FileEdit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Stock Count</p>
                </TooltipContent>
              </Tooltip>
            )}
             {row.original.status !== 'Completed' && row.original.status !== 'Cancelled' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="destructive" size="icon" className="h-8 w-8">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Batalkan Stock Count</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      ),
    },
  ];

  return (
    <div className="[--header-height:calc(--spacing(14))] min-h-screen bg-muted/40">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <InventorySidebar />
          <SidebarInset>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Stock Count</CardTitle>
                    <CardDescription>Kelola hasil perhitungan stok gudang.</CardDescription>
                  </div>
                  <Button asChild>
                    <a href="/inventory/warehouse/count/add">
                      <Plus className="mr-2 h-4 w-4" /> Tambah Stock Count
                    </a>
                  </Button>
                </CardHeader>
                <CardContent>
                  {/* Placeholder untuk Filter */} 
                  <DataTable columns={columns} data={filteredData} />
                </CardContent>
              </Card>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
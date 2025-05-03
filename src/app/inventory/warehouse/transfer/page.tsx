'use client';

import React, { useState } from 'react';

import { DataTable } from "@/components/table/data-table"; // Asumsi menggunakan DataTable yang sama
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileEdit, Trash2, ArrowRightLeft, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatNumberWithSeparator } from '@/lib/utils'; // Import fungsi format



// Definisi tipe data untuk Transfer Item (sesuaikan sesuai kebutuhan)
interface TransferItem {
  id: string;
  transferId: string; // ID unik transfer
  sourceWarehouse: {
    id: string;
    name: string;
  };
  destinationWarehouse: {
    id: string;
    name: string;
  };
  transferDate: string;
  status: 'Pending' | 'In Transit' | 'Completed' | 'Cancelled';
  itemCount: number; // Jumlah jenis item yang ditransfer
}

// Data dummy untuk Transfer (ganti dengan data asli nanti)
const dummyTransferData: TransferItem[] = [
  {
    id: "TRF-001",
    transferId: "TRF-2024-001",
    sourceWarehouse: { id: "1", name: "Gudang Pusat" },
    destinationWarehouse: { id: "2", name: "Gudang Cabang A" },
    transferDate: "2023-11-05T09:00:00Z",
    status: "Completed",
    itemCount: 3
  },
  {
    id: "TRF-002",
    transferId: "TRF-2024-002",
    sourceWarehouse: { id: "1", name: "Gudang Pusat" },
    destinationWarehouse: { id: "3", name: "Gudang Cabang B" },
    transferDate: "2023-11-06T11:30:00Z",
    status: "In Transit",
    itemCount: 5
  },
  {
    id: "TRF-003",
    transferId: "TRF-2024-003",
    sourceWarehouse: { id: "2", name: "Gudang Cabang A" },
    destinationWarehouse: { id: "1", name: "Gudang Pusat" },
    transferDate: "2023-11-07T15:00:00Z",
    status: "Pending",
    itemCount: 2
  },
  // Tambahkan data dummy lainnya jika perlu
];

export default function WarehouseTransferPage() {
  const [filteredData, setFilteredData] = useState<TransferItem[]>(dummyTransferData);

  // Definisi kolom untuk DataTable (sesuaikan)
  const columns = [
    {
      accessorKey: "transferId",
      header: "Transfer ID",
    },
    {
      accessorKey: "sourceWarehouse.name",
      header: "Gudang Asal",
    },
    {
      accessorKey: "destinationWarehouse.name",
      header: "Gudang Tujuan",
    },
    {
      accessorKey: "itemCount",
      header: "Jumlah Item",
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
        if (status === "In Transit") badgeVariant = "outline";
        if (status === "Completed") badgeVariant = "success";
        if (status === "Cancelled") badgeVariant = "destructive";
        return <Badge variant={badgeVariant as any}>{status}</Badge>;
      },
    },
    {
      accessorKey: "transferDate",
      header: "Tanggal Transfer",
      cell: ({ row }: any) => {
        const date = new Date(row.original.transferDate);
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
                  <p>Edit Transfer</p>
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
                  <p>Batalkan Transfer</p>
                </TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      ),
    },
  ];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transfer Stok Gudang</CardTitle>
            <CardDescription>Kelola perpindahan stok antar gudang.</CardDescription>
          </div>
          <Button asChild>
            <a href="/inventory/warehouse/transfer/add">
              <Plus className="mr-2 h-4 w-4" /> Tambah Transfer
            </a>
          </Button>
        </CardHeader>
        <CardContent>
          {/* Placeholder untuk Filter */} 
          <DataTable columns={columns} data={filteredData} />
        </CardContent>
      </Card>
    </main>
  );
}
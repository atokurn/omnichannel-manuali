'use client';

import React, { useState } from 'react';
import Image from 'next/image'; // Import Image component
// Removed InventorySidebar, SiteHeader, SidebarInset, SidebarProvider imports
import { DataTable } from "@/components/stock/data-table"; // Assuming a similar table structure
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileEdit, Trash2, PackageCheck } from "lucide-react"; // Added PackageCheck
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Definisi tipe data untuk Receive Item (sesuaikan sesuai kebutuhan)
interface ReceiveItem {
  id: string;
  sourceType: 'Purchase Order' | 'Warehouse Transfer'; // Tipe sumber
  sourceId: string; // ID PO atau ID Transfer
  sku: string;
  productName: string;
  warehouse: {
    id: string;
    name: string;
  };
  quantityExpected: number;
  quantityReceived: number;
  receiveDate: string;
  receiver: {
    id: string;
    name: string;
  };
  status: 'Pending' | 'Partial' | 'Completed';
}

// Data dummy untuk Receive (ganti dengan data asli nanti)
const dummyReceiveData: ReceiveItem[] = [
  {
    id: "REC-001",
    sourceType: "Purchase Order",
    sourceId: "PO-123",
    sku: "PRD-001",
    productName: "Laptop Asus",
    warehouse: { id: "1", name: "Gudang Pusat" },
    quantityExpected: 10,
    quantityReceived: 10,
    receiveDate: "2023-11-01T10:00:00Z",
    receiver: { id: "1", name: "Admin Gudang" },
    status: "Completed"
  },
  {
    id: "REC-002",
    sourceType: "Warehouse Transfer",
    sourceId: "TRF-456",
    sku: "PRD-005",
    productName: "Headset Gaming",
    warehouse: { id: "1", name: "Gudang Pusat" },
    quantityExpected: 15,
    quantityReceived: 10,
    receiveDate: "2023-11-02T14:30:00Z",
    receiver: { id: "1", name: "Admin Gudang" },
    status: "Partial"
  },
  // Tambahkan data dummy lainnya jika perlu
];

export default function ReceiveStockPage() {
  const [filteredData, setFilteredData] = useState<ReceiveItem[]>(dummyReceiveData);

  // Definisi kolom untuk DataTable (sesuaikan)
  const columns = [
    {
      accessorKey: "sourceId",
      header: "Source Document",
      cell: ({ row }: any) => (
        <div>
          <div>{row.original.sourceType}</div>
          <div className="text-sm text-muted-foreground">{row.original.sourceId}</div>
        </div>
      ),
    },
    {
      accessorKey: "sku",
      header: "SKU Information",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          {/* Placeholder for Image Tooltip */}
          <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted flex items-center justify-center">
             <PackageCheck className="h-6 w-6 text-muted-foreground" />
          </div>
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
      accessorKey: "quantityExpected",
      header: "Qty Expected",
    },
    {
      accessorKey: "quantityReceived",
      header: "Qty Received",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status;
        let badgeVariant: "secondary" | "warning" | "success" = "secondary";
        if (status === "Partial") badgeVariant = "warning";
        if (status === "Completed") badgeVariant = "success";
        return <Badge variant={badgeVariant as any}>{status}</Badge>;
      },
    },
    {
      accessorKey: "receiveDate",
      header: "Receive Date",
      cell: ({ row }: any) => {
        const date = new Date(row.original.receiveDate);
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
                <p>View Details</p>
              </TooltipContent>
            </Tooltip>
            {/* Tambahkan aksi lain jika perlu, misal Edit jika status memungkinkan */}
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
            <CardTitle>Receive Stock</CardTitle>
            <CardDescription>Manage incoming stock from purchase orders or transfers.</CardDescription>
          </div>
          {/* Add Button for creating new receive if needed */}
        </CardHeader>
        <CardContent>
          {/* Placeholder for Filter */}
          <DataTable columns={columns} data={filteredData} />
        </CardContent>
      </Card>
    </main>
  );
}
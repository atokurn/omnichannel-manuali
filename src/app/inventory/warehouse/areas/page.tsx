'use client';

import { useState } from 'react';

import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileEdit, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { dummyWarehousesData } from "@/lib/services/warehouse-service";
import { Area, dummyAreasData, getAreasByWarehouse } from "@/lib/services/area-service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AddAreaDialog } from "@/components/warehouse/add-area-dialog";

// Menggunakan tipe data dan service dari area-service.ts

export default function AreasPage() {
  const [filteredData, setFilteredData] = useState<Area[]>(dummyAreasData);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>("all");
  
  // Fungsi untuk filter berdasarkan warehouse
  const handleWarehouseChange = (warehouseId: string) => {
    setSelectedWarehouse(warehouseId);
    // Menggunakan fungsi dari service, tapi karena ini sinkron untuk demo
    // kita tidak perlu async/await
    const areas = getAreasByWarehouse(warehouseId);
    if (Array.isArray(areas)) {
      setFilteredData(areas);
    } else {
      // Jika hasilnya Promise (untuk implementasi async nantinya)
      Promise.resolve(areas).then(result => setFilteredData(result));
    }
  };

  // Definisi kolom untuk DataTable
  const columns = [
    {
      accessorKey: "name",
      header: "Area Name",
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "warehouseName",
      header: "Warehouse",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }: any) => {
        const type = row.original.type;
        let badgeVariant = "secondary";
        
        if (type === "Penyimpanan") badgeVariant = "default";
        if (type === "Penerimaan") badgeVariant = "outline";
        if (type === "Pengiriman") badgeVariant = "success";
        
        return <Badge variant={badgeVariant as any}>{type}</Badge>;
      },
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
      cell: ({ row }: any) => (
        <div>{row.original.capacity.toLocaleString()} m²</div>
      ),
    },
    {
      accessorKey: "totalSku",
      header: "Total SKU",
      cell: ({ row }: any) => (
        <div>{row.original.totalSku} items</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status;
        let badgeVariant = "secondary";
        
        if (status === "Aktif") badgeVariant = "success";
        if (status === "Nonaktif") badgeVariant = "destructive";
        
        return <Badge variant={badgeVariant as any}>{status}</Badge>;
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }: any) => {
        const date = new Date(row.original.createdAt);
        return (
          <div>
            {date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </div>
        );
      },
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
    <main className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Areas</CardTitle>
            <CardDescription>Kelola area penyimpanan dalam gudang</CardDescription>
          </div>
          <AddAreaDialog onAddArea={(newArea) => {
            // Menambahkan area baru ke daftar area
            setFilteredData(prev => [newArea, ...prev]);
          }} />
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select
              value={selectedWarehouse || "all"}
              onValueChange={handleWarehouseChange}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Pilih Gudang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Gudang</SelectItem>
                {dummyWarehousesData.map(warehouse => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DataTable 
            columns={columns} 
            data={filteredData} 
            searchKey="name" 
          />
        </CardContent>
      </Card>
    </main>
  );
}
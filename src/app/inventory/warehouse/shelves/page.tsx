'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { DataTable } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileEdit, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { dummyWarehousesData } from "@/lib/services/warehouse-service";
import { dummyAreasData } from "@/lib/services/area-service";
import { Shelf, dummyShelvesData, getShelvesByArea, getShelvesByWarehouse } from "@/lib/services/shelf-service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function ShelvesPage() {
  const router = useRouter();
  const [filteredData, setFilteredData] = useState<Shelf[]>(dummyShelvesData);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>("all");
  const [selectedArea, setSelectedArea] = useState<string | null>("all");
  
  // Fungsi untuk filter berdasarkan warehouse
  const handleWarehouseChange = (warehouseId: string) => {
    setSelectedWarehouse(warehouseId);
    setSelectedArea("all"); // Reset area selection when warehouse changes
    
    // Filter shelves by warehouse
    const shelves = getShelvesByWarehouse(warehouseId);
    if (Array.isArray(shelves)) {
      setFilteredData(shelves);
    } else {
      // Jika hasilnya Promise (untuk implementasi async nantinya)
      Promise.resolve(shelves).then(result => setFilteredData(result));
    }
  };

  // Fungsi untuk filter berdasarkan area
  const handleAreaChange = (areaId: string) => {
    setSelectedArea(areaId);
    
    // Filter shelves by area
    const shelves = getShelvesByArea(areaId);
    if (Array.isArray(shelves)) {
      setFilteredData(shelves);
    } else {
      // Jika hasilnya Promise (untuk implementasi async nantinya)
      Promise.resolve(shelves).then(result => setFilteredData(result));
    }
  };

  // Definisi kolom untuk DataTable
  const columns = [
    {
      accessorKey: "name",
      header: "Shelf Name",
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "areaName",
      header: "Area",
    },
    {
      accessorKey: "warehouseName",
      header: "Warehouse",
    },
    {
      accessorKey: "position",
      header: "Position",
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
      cell: ({ row }: any) => (
        <div>{row.original.capacity.toLocaleString()} unit</div>
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

  // Filter areas based on selected warehouse
  const filteredAreas = selectedWarehouse && selectedWarehouse !== "all" 
    ? dummyAreasData.filter(area => area.warehouseId === selectedWarehouse)
    : dummyAreasData;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Shelves</CardTitle>
            <CardDescription>Kelola rak penyimpanan dalam area gudang</CardDescription>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Rak
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push('/inventory/warehouse/shelves/add')}>
                  Tambah Rak Single
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/inventory/warehouse/shelves/add-bulk')}>
                  Tambah Rak Bulk
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-4">
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

            <Select
              value={selectedArea || "all"}
              onValueChange={handleAreaChange}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Pilih Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Area</SelectItem>
                        {filteredAreas.map(area => (
                          <SelectItem key={area.id} value={area.id}>
                            {area.name}
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
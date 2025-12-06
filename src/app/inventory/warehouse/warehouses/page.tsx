'use client';

import { useState } from 'react';

import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileEdit, Trash2, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { dummyWarehouses } from "@/lib/services/stock-service";
import { AddWarehouseDialog } from "@/components/warehouse/add-warehouse-dialog";
import { dummyWarehousesData as warehouseService } from "@/lib/services/warehouse-service";
import { Warehouse } from "@/lib/services/warehouse-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Data dummy untuk Warehouses dengan informasi lebih lengkap
const dummyWarehousesData: Warehouse[] = [
  {
    id: "1",
    name: "Gudang Pusat",
    address: "Jl. Industri No. 123",
    city: "Jakarta",
    capacity: 5000,
    manager: "John Doe",
    totalSku: 120,
    defaultShipping: true,
    defaultReturning: false,
    createdAt: "2022-01-15T08:30:00Z"
  },
  {
    id: "2",
    name: "Gudang Cabang",
    address: "Jl. Raya Bandung No. 45",
    city: "Bandung",
    capacity: 3000,
    manager: "Jane Smith",
    totalSku: 85,
    defaultShipping: false,
    defaultReturning: true,
    createdAt: "2022-03-20T10:15:00Z"
  },
  {
    id: "3",
    name: "Gudang Distribusi Timur",
    address: "Jl. Pahlawan No. 78",
    city: "Surabaya",
    capacity: 4000,
    manager: "Robert Johnson",
    totalSku: 95,
    defaultShipping: false,
    defaultReturning: false,
    createdAt: "2022-05-10T09:45:00Z"
  },
  {
    id: "4",
    name: "Gudang Penyimpanan Khusus",
    address: "Jl. Industri Selatan No. 12",
    city: "Bekasi",
    capacity: 2000,
    manager: "Michael Brown",
    totalSku: 45,
    defaultShipping: false,
    defaultReturning: false,
    createdAt: "2022-07-05T14:20:00Z"
  },
  {
    id: "5",
    name: "Gudang Transit",
    address: "Jl. Logistik No. 56",
    city: "Tangerang",
    capacity: 1500,
    manager: "Sarah Wilson",
    totalSku: 30,
    defaultShipping: false,
    defaultReturning: false,
    createdAt: "2022-09-18T11:30:00Z"
  }
];

export default function WarehousesPage() {
  const [filteredData, setFilteredData] = useState<Warehouse[]>(dummyWarehousesData);

  // Fungsi untuk filter tidak lagi berdasarkan status
  const handleStatusChange = (status: string) => {
    setFilteredData(dummyWarehousesData);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Calculate pagination
  const totalItems = filteredData.length;
  const pageCount = Math.ceil(totalItems / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Definisi kolom untuk DataTable
  const columns = [
    {
      accessorKey: "name",
      header: "Warehouse Name",
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }: any) => (
        <div>
          <div>{row.original.address}</div>
          <div className="text-sm text-muted-foreground">{row.original.city}</div>
        </div>
      ),
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
      accessorKey: "defaultShipping",
      header: "Default Shipping",
      cell: ({ row }: any) => (
        <div className="flex items-center">
          <input
            type="radio"
            checked={row.original.defaultShipping}
            onChange={() => { }}
            className="mr-2"
          />
          {row.original.defaultShipping ? "Yes" : "No"}
        </div>
      ),
    },
    {
      accessorKey: "defaultReturning",
      header: "Default Returning",
      cell: ({ row }: any) => (
        <div className="flex items-center">
          <input
            type="radio"
            checked={row.original.defaultReturning}
            onChange={() => { }}
            className="mr-2"
          />
          {row.original.defaultReturning ? "Yes" : "No"}
        </div>
      ),
    },
    {
      accessorKey: "manager",
      header: "Manager",
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => console.log('View', row.original.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Edit', row.original.id)}>
                <FileEdit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => console.log('Delete', row.original.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Warehouses</CardTitle>
            <CardDescription>Kelola data gudang dan lokasi penyimpanan</CardDescription>
          </div>
          <AddWarehouseDialog onAddWarehouse={(newWarehouse) => {
            // Menambahkan warehouse baru ke data yang ada
            setFilteredData([newWarehouse, ...filteredData]);
          }} />
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={paginatedData}
            searchKey="name"
            pageCount={pageCount}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
          />   </CardContent>
      </Card>
    </main>
  );
}
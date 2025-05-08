'use client';

import React, { useState, useEffect } from 'react'; // Added useEffect
import Image from 'next/image'; // Import Image component
// Removed InventorySidebar, SiteHeader, SidebarInset, SidebarProvider imports
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileEdit, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Import Tooltip components
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { ProductImageTooltip } from "@/components/ui/image-tooltip";

// Definisi tipe data untuk Area Stock Movement
interface AreaStockMovementItem {
  id: string;
  sku: string;
  productName: string;
  sourceArea: {
    id: string;
    name: string;
    warehouse: {
      id: string;
      name: string;
    };
  };
  destinationArea: {
    id: string;
    name: string;
    warehouse: {
      id: string;
      name: string;
    };
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

// Data dummy untuk Area Stock Movement
const dummyAreaStockMovementData: AreaStockMovementItem[] = [
  {
    id: "1",
    sku: "PRD-001",
    productName: "Laptop Asus",
    sourceArea: {
      id: "1",
      name: "Area A",
      warehouse: {
        id: "1",
        name: "Gudang Pusat"
      }
    },
    destinationArea: {
      id: "2",
      name: "Area B",
      warehouse: {
        id: "1",
        name: "Gudang Pusat"
      }
    },
    quantity: 5,
    type: "Internal Transfer",
    date: "2023-10-15T08:30:00Z",
    creator: {
      id: "1",
      name: "John Doe"
    },
    notes: "Pemindahan ke area display"
  },
  {
    id: "2",
    sku: "PRD-002",
    productName: "Mouse Logitech",
    sourceArea: {
      id: "3",
      name: "Area C",
      warehouse: {
        id: "1",
        name: "Gudang Pusat"
      }
    },
    destinationArea: {
      id: "4",
      name: "Area D",
      warehouse: {
        id: "2",
        name: "Gudang Cabang"
      }
    },
    quantity: 10,
    type: "External Transfer",
    date: "2023-10-16T10:15:00Z",
    creator: {
      id: "2",
      name: "Jane Smith"
    },
    notes: "Transfer antar gudang"
  },
  {
    id: "3",
    sku: "PRD-003",
    productName: "Keyboard Mechanical",
    sourceArea: {
      id: "5",
      name: "Area E",
      warehouse: {
        id: "2",
        name: "Gudang Cabang"
      }
    },
    destinationArea: {
      id: "6",
      name: "Area F",
      warehouse: {
        id: "2",
        name: "Gudang Cabang"
      }
    },
    quantity: 8,
    type: "Internal Transfer",
    date: "2023-10-17T14:45:00Z",
    creator: {
      id: "1",
      name: "John Doe"
    },
    notes: "Pemindahan ke area packing"
  },
  {
    id: "4",
    sku: "PRD-004",
    productName: "Monitor LED 24\"",
    sourceArea: {
      id: "2",
      name: "Area B",
      warehouse: {
        id: "1",
        name: "Gudang Pusat"
      }
    },
    destinationArea: {
      id: "7",
      name: "Area G",
      warehouse: {
        id: "2",
        name: "Gudang Cabang"
      }
    },
    quantity: 3,
    type: "External Transfer",
    date: "2023-10-18T09:20:00Z",
    creator: {
      id: "3",
      name: "Robert Johnson"
    },
    notes: "Transfer antar gudang"
  },
  {
    id: "5",
    sku: "PRD-005",
    productName: "Headset Gaming",
    sourceArea: {
      id: "8",
      name: "Area H",
      warehouse: {
        id: "2",
        name: "Gudang Cabang"
      }
    },
    destinationArea: {
      id: "1",
      name: "Area A",
      warehouse: {
        id: "1",
        name: "Gudang Pusat"
      }
    },
    quantity: 12,
    type: "External Transfer",
    date: "2023-10-19T11:10:00Z",
    creator: {
      id: "2",
      name: "Jane Smith"
    },
    notes: "Transfer antar gudang"
  }
];

// Data dummy untuk warehouse
const dummyWarehouses = [
  { id: "1", name: "Gudang Pusat" },
  { id: "2", name: "Gudang Cabang" },
];

// Data dummy untuk tipe movement (sesuaikan jika perlu)
const dummyMovementTypes = [
  { id: "internal-transfer", name: "Internal Transfer" },
  { id: "external-transfer", name: "External Transfer" },
];

export default function AreaStockMovementPage() {
  const [filteredData, setFilteredData] = useState<AreaStockMovementItem[]>(dummyAreaStockMovementData);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [selectedSourceWarehouse, setSelectedSourceWarehouse] = useState<string>("all");
  const [selectedDestinationWarehouse, setSelectedDestinationWarehouse] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Handler for movement type selection change
  const handleTypeChange = (value: string) => {
    setSelectedType(value);
  };

  // Fungsi untuk filter data
  const filterData = () => {
    let filtered = [...dummyAreaStockMovementData];

    // Filter berdasarkan rentang tanggal
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= dateRange.from! && itemDate <= dateRange.to!;
      });
    } else if (dateRange?.from) {
      filtered = filtered.filter(item => new Date(item.date) >= dateRange.from!);
    } else if (dateRange?.to) {
      filtered = filtered.filter(item => new Date(item.date) <= dateRange.to!);
    }

    // Filter berdasarkan gudang sumber
    if (selectedSourceWarehouse !== "all") {
      filtered = filtered.filter(item => item.sourceArea.warehouse.id === selectedSourceWarehouse);
    }

    // Filter berdasarkan gudang tujuan
    if (selectedDestinationWarehouse !== "all") {
      filtered = filtered.filter(item => item.destinationArea.warehouse.id === selectedDestinationWarehouse);
    }

    // Filter berdasarkan tipe
    if (selectedType !== "all") {
      filtered = filtered.filter(item => item.type.toLowerCase().replace(/ /g, '-') === selectedType);
    }

    setFilteredData(filtered);
  };

  // Terapkan filter saat state berubah
  useEffect(() => {
    filterData();
  }, [dateRange, selectedSourceWarehouse, selectedDestinationWarehouse, selectedType]);

  // Kolom untuk DataTable
  const columns = [
    {
      accessorKey: "sku",
      header: "SKU Information",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <ProductImageTooltip
            imageUrl="/placeholder.svg"
            alt={row.original.productName}
            thumbnailSize={48}
            previewSize={300}
            side="right"
          />
          <div>
            <div className="font-medium">{row.original.sku}</div>
            <div className="text-sm text-muted-foreground">{row.original.productName}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "sourceArea",
      header: "Source Area",
      cell: ({ row }: any) => (
        <div>
          <div>{row.original.sourceArea.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.sourceArea.warehouse.name}</div>
        </div>
      ),
    },
    {
      accessorKey: "destinationArea",
      header: "Destination Area",
      cell: ({ row }: any) => (
        <div>
          <div>{row.original.destinationArea.name}</div>
          <div className="text-sm text-muted-foreground">{row.original.destinationArea.warehouse.name}</div>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Movement Type",
      cell: ({ row }: any) => {
        const type = row.original.type;
        let badgeVariant = "secondary";
        
        if (type === "Internal Transfer") badgeVariant = "default";
        if (type === "External Transfer") badgeVariant = "outline";
        
        return <Badge variant={badgeVariant as any}>{type}</Badge>;
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
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }: any) => (
        <div className="max-w-[200px] truncate" title={row.original.notes}>
          {row.original.notes}
        </div>
      ),
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
    // Removed wrapping div, SidebarProvider, SiteHeader, InventorySidebar, SidebarInset
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Area Stock Movement</CardTitle>
          <CardDescription>
            Lacak pergerakan stok antar area di dalam atau antar gudang.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-5">
            {/* Filter Tanggal */}
            <div>
              <Label className="mb-1 block text-sm font-medium">Rentang Tanggal</Label>
              <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
            </div>
            {/* Filter Gudang Sumber */}
            <div>
              <Label className="mb-1 block text-sm font-medium">Gudang Sumber</Label>
              <Select value={selectedSourceWarehouse} onValueChange={setSelectedSourceWarehouse}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Gudang Sumber" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Gudang</SelectItem>
                  {dummyWarehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Filter Gudang Tujuan */}
            <div>
              <Label className="mb-1 block text-sm font-medium">Gudang Tujuan</Label>
              <Select value={selectedDestinationWarehouse} onValueChange={setSelectedDestinationWarehouse}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Gudang Tujuan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Gudang</SelectItem>
                  {dummyWarehouses.map((wh) => (
                    <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Filter Tipe */}
            <div>
              <Label className="mb-1 block text-sm font-medium">Tipe Pergerakan</Label>
              <Select value={selectedType} onValueChange={handleTypeChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Pilih Tipe Movement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  {dummyMovementTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Filter Pencarian */}
            <div>
              <Label className="mb-1 block text-sm font-medium">Pencarian</Label>
              <Input placeholder="Cari SKU atau nama produk" />
            </div>
          </div>
          <DataTable columns={columns} data={filteredData} />
        </CardContent>
      </Card>
    </main> // End main tag
    // Removed closing tags for SidebarInset, div, SidebarProvider, div
  );
}
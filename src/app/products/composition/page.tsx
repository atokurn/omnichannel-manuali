'use client';

import { useState } from 'react';
import { DataTable } from "@/components/stock/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, FileEdit, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatNumberWithSeparator } from "../../../lib/utils";
import { useRouter } from 'next/navigation';

// Definisi tipe data untuk Komposisi Produk (contoh)
interface ProductComposition {
  id: string;
  productName: string; // Nama produk jadi
  sku: string; // SKU produk jadi
  components: {
    materialName: string;
    materialSku: string;
    quantity: number;
    unit: string;
  }[];
  lastUpdated: string;
}

// Data dummy untuk Komposisi Produk
const dummyCompositionData: ProductComposition[] = [
  {
    id: "1",
    productName: "Paket Hemat Kaos + Topi",
    sku: "PKT001",
    components: [
      { materialName: "Kaos Polos Hitam", materialSku: "SKU001", quantity: 1, unit: "pcs" },
      { materialName: "Topi Baseball Merah", materialSku: "SKU003", quantity: 1, unit: "pcs" },
    ],
    lastUpdated: "2024-07-25",
  },
  // Tambahkan data dummy lainnya jika perlu
];

// Definisi kolom untuk DataTable (contoh)
const columns = [
  {
    accessorKey: "sku",
    header: "SKU Produk Jadi",
  },
  {
    accessorKey: "productName",
    header: "Nama Produk Jadi",
  },
  {
    accessorKey: "components",
    header: "Komponen",
    cell: ({ row }: { row: any }) => (
      <ul>
        {row.original.components.map((comp: any, index: number) => (
          <li key={index}>{`${comp.materialName} (${comp.materialSku}) - ${comp.quantity} ${comp.unit}`}</li>
        ))}
      </ul>
    ),
  },
  {
    accessorKey: "lastUpdated",
    header: "Terakhir Diperbarui",
    cell: ({ row }: { row: any }) => new Date(row.original.lastUpdated).toLocaleDateString('id-ID'),
  },
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }: { row: any }) => (
      <TooltipProvider>
        <div className="flex gap-1">
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
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <FileEdit className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Edit Komposisi</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 text-red-500">
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Hapus Komposisi</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    ),
  },
];

export default function ProductCompositionPage() {
  const router = useRouter();
  const [compositions, setCompositions] = useState<ProductComposition[]>(dummyCompositionData);

  // TODO: Implement actual data fetching
  // TODO: Implement search/filter functionality
  // TODO: Implement actions (view, edit, delete)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Komposisi Produk</CardTitle>
            <CardDescription>
              Kelola komposisi atau bill of materials (BOM) untuk produk Anda.
            </CardDescription>
          </div>
          {/* TODO: Add button to create new composition */}
          {/* <Button onClick={() => router.push('/products/composition/add')}>Tambah Komposisi</Button> */}
        </CardHeader>
        <CardContent>
          {/* TODO: Add search input and filter options here */}
          <DataTable columns={columns} data={compositions} searchKey="productName" />
        </CardContent>
      </Card>
    </div>
  );
}
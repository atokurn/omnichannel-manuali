'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/stock/data-table'; // Assuming a data table will be used
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, FileEdit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Define the structure for a Product Material
interface ProductMaterial {
  id: string;
  name: string;
  code: string; // Material code
  unit: string; // e.g., kg, pcs, liter
  stock: number; // Add stock field
  description?: string;
  status: 'Aktif' | 'Nonaktif';
  createdAt: string;
}

// Format angka ke format ribuan
const formatNumber = (num: number) => {
  return num.toLocaleString('id-ID');
};

// Dummy data for product materials (replace with actual data fetching)
const dummyMaterialsData: ProductMaterial[] = [
  {
    id: 'MAT-001',
    name: 'Kain Katun Combed 30s',
    code: 'KTC-30S',
    unit: 'kg',
    stock: 150.5,
    description: 'Kain katun combed kualitas premium, 30s.',
    status: 'Aktif',
    createdAt: '2024-07-20',
  },
  {
    id: 'MAT-002',
    name: 'Benang Jahit Polyester',
    code: 'BJP-PLY',
    unit: 'roll',
    stock: 500,
    description: 'Benang jahit polyester warna hitam.',
    status: 'Aktif',
    createdAt: '2024-07-18',
  },
  {
    id: 'MAT-003',
    name: 'Kancing Plastik 15mm',
    code: 'KCP-15MM',
    unit: 'gross',
    stock: 25,
    status: 'Nonaktif',
    createdAt: '2024-07-15',
  },
  {
    id: 'MAT-004',
    name: 'Resleting YKK 50cm',
    code: 'RSY-YKK-50',
    unit: 'pcs',
    stock: 1200,
    status: 'Aktif',
    createdAt: '2024-07-21',
  },
];

// Define columns for the DataTable
const columns = [
  {
    accessorKey: 'code',
    header: 'Kode',
  },
  {
    accessorKey: 'name',
    header: 'Nama Material',
  },
  {
    accessorKey: 'unit',
    header: 'Satuan',
  },
  {
    accessorKey: 'stock',
    header: 'Stok',
    cell: ({ row }: { row: any }) => formatNumber(row.original.stock),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }: { row: any }) => (
      <Badge variant={row.original.status === 'Aktif' ? 'default' : 'destructive'}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Tanggal Dibuat',
    cell: ({ row }: { row: any }) => new Date(row.original.createdAt).toLocaleDateString('id-ID'),
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }: { row: any }) => (
      <div className="flex gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <FileEdit className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 text-red-500">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

export default function ProductMaterialsPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<ProductMaterial[]>(dummyMaterialsData);

  // TODO: Implement actual data fetching
  // TODO: Implement search/filter functionality
  // TODO: Implement actions (view, edit, delete)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Material Produk</CardTitle>
            <CardDescription>
              Kelola daftar material yang digunakan dalam produksi.
            </CardDescription>
          </div>
          <Button onClick={() => router.push('/products/materials/add')}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Material
          </Button>
        </CardHeader>
        <CardContent>
          {/* TODO: Add search input and filter options here */}
          <DataTable columns={columns} data={materials} searchKey="name" />
        </CardContent>
      </Card>
    </div>
  );
}
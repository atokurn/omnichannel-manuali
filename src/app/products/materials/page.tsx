'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/stock/data-table'; // Assuming a data table will be used
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, FileEdit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link'; // Import Link

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
    name: 'Kain Katun',
    code: 'KTN-01',
    unit: 'meter',
    stock: 1500,
    description: 'Kain katun kualitas premium',
    status: 'Aktif',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'MAT-002',
    name: 'Benang Polyester',
    code: 'PLY-05',
    unit: 'roll',
    stock: 500,
    description: 'Benang jahit polyester',
    status: 'Aktif',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'MAT-003',
    name: 'Kancing Plastik',
    code: 'KNC-PL-10',
    unit: 'gross',
    stock: 0, // Example for non-active
    status: 'Nonaktif',
    createdAt: new Date().toISOString(),
  },
];

export default function ProductMaterialsPage() {
  const router = useRouter();
  // Replace with actual data fetching and state management
  const [materials, setMaterials] = useState<ProductMaterial[]>(dummyMaterialsData);

  // Define columns for the DataTable
  const columns = [
    {
      accessorKey: "name",
      header: "Nama Material",
    },
    {
      accessorKey: "code",
      header: "Kode",
    },
    {
      accessorKey: "unit",
      header: "Satuan",
    },
    {
      accessorKey: "stock",
      header: "Stok",
      cell: ({ row }: { row: any }) => formatNumber(row.getValue("stock")),
    },
    {
      accessorKey: "description",
      header: "Deskripsi",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: any }) => (
        <Badge variant={row.getValue("status") === 'Aktif' ? 'default' : 'secondary'}>
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal Dibuat",
      cell: ({ row }: { row: any }) => new Date(row.getValue("createdAt")).toLocaleDateString('id-ID'),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }: { row: any }) => {
        const material = row.original;
        return (
          <div className="flex items-center gap-1">
            {/* Add Tooltips for better UX */}
            <Button variant="ghost" size="icon" onClick={() => router.push(`/products/materials/view/${material.id}`)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => router.push(`/products/materials/edit/${material.id}`)}>
              <FileEdit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(material.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  // Placeholder for delete function
  const handleDelete = (id: string) => {
    console.log(`Delete material ${id}`);
    // Implement deletion logic here (e.g., show confirmation dialog, call API)
    setMaterials(materials.filter(m => m.id !== id));
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Material Produk</h1>
        <Link href="/products/materials/add" passHref>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Tambah Material
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Material</CardTitle>
          <CardDescription>Kelola semua material produk Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Use DataTable component here */}
          <DataTable columns={columns} data={materials} searchKey="name" />
        </CardContent>
      </Card>
    </div>
  );
}
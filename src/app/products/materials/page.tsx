'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'; // Assuming sidebar components are needed
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
  const [materials, setMaterials] = useState<ProductMaterial[]>(dummyMaterialsData);

  // Define columns for the DataTable
  const columns = [
    {
      accessorKey: 'name',
      header: 'Nama Material',
      cell: ({ row }: any) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: 'code',
      header: 'Kode',
    },
    {
      accessorKey: 'unit',
      header: 'Satuan',
    },
    {
      accessorKey: 'stock',
      header: 'Stok',
      cell: ({ row }: any) => (
        <div>{formatNumber(row.original.stock)}</div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Deskripsi',
      cell: ({ row }: any) => (
        <div className="truncate max-w-[200px]">{row.original.description || '-'}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.original.status;
        let badgeVariant = 'secondary';
        if (status === 'Aktif') badgeVariant = 'success';
        if (status === 'Nonaktif') badgeVariant = 'destructive';
        return <Badge variant={badgeVariant as any}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Dibuat Pada',
      cell: ({ row }: any) => {
        const date = new Date(row.original.createdAt);
        return (
          <div>
            {date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Aksi',
      cell: ({ row }: any) => {
        const material = row.original;
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => console.log('View', material.id)}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => console.log('Edit', material.id)}>
              <FileEdit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => console.log('Delete', material.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
        <AppSidebar />
          {/* Assuming a ProductSidebar component might exist or be created later */}
          {/* <ProductSidebar /> */}
          <div className="flex-1 p-4 pl-[--sidebar-width]">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Material Produk</CardTitle>
                  <CardDescription>Kelola daftar material yang digunakan dalam produk.</CardDescription>
                </div>
                <Button onClick={() => router.push('/products/materials/add')}> {/* Adjust route as needed */}
                  {/*<Plus className="mr-2 h-4 w-4" />*/}
                  Tambah Material
                </Button>
              </CardHeader>
              <CardContent>
                <DataTable columns={columns} data={materials} />
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
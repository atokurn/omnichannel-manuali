'use client';

import React, { useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Plus, ArrowUpDown, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/stock/data-table'; // Assuming DataTable is suitable

// Tipe data untuk supplier (contoh)
interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: 'Aktif' | 'Nonaktif';
}

// Contoh data supplier
const dummySuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Supplier Maju Jaya',
    contactPerson: 'Budi Santoso',
    phone: '081234567890',
    email: 'budi.sj@majujaya.com',
    address: 'Jl. Industri No. 10, Jakarta',
    status: 'Aktif',
  },
  {
    id: '2',
    name: 'PT Sumber Rejeki',
    contactPerson: 'Ani Wijaya',
    phone: '087654321098',
    email: 'ani.w@sumberrejeki.co.id',
    address: 'Kawasan Industri Cikarang Blok A5',
    status: 'Aktif',
  },
  {
    id: '3',
    name: 'CV Berkah Abadi',
    contactPerson: 'Citra Lestari',
    phone: '085551112233',
    email: 'citra@berkahabadi.net',
    address: 'Jl. Raya Bogor Km 25',
    status: 'Nonaktif',
  },
];

// Fungsi untuk mendapatkan warna badge berdasarkan status
const getStatusBadgeVariant = (status: Supplier['status']): 'default' | 'secondary' => {
  return status === 'Aktif' ? 'default' : 'secondary';
};

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>(dummySuppliers);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

  // Handle row selection
  const handleSelect = (id: string, checked: boolean) => {
    setSelectedSuppliers(prev =>
      checked ? [...prev, id] : prev.filter(supplierId => supplierId !== id)
    );
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    setSelectedSuppliers(checked ? suppliers.map(s => s.id) : []);
  };

  // Placeholder for delete function
  const handleDelete = (id: string) => {
    console.log(`Delete supplier ${id}`);
    // Implement deletion logic (e.g., confirmation, API call)
    setSuppliers(suppliers.filter(s => s.id !== id));
    setSelectedSuppliers(prev => prev.filter(supplierId => supplierId !== id));
  };

  // Placeholder for bulk delete
  const handleBulkDelete = () => {
    console.log('Delete selected suppliers:', selectedSuppliers);
    // Implement bulk deletion logic
    setSuppliers(suppliers.filter(s => !selectedSuppliers.includes(s.id)));
    setSelectedSuppliers([]);
  };

  // Define columns for DataTable
  const columns = [
    {
      id: "select",
      header: ({ table }: { table: any }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => {
            table.toggleAllPageRowsSelected(!!value);
            handleSelectAll(!!value);
          }}
          aria-label="Select all"
        />
      ),
      cell: ({ row }: { row: any }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => {
            row.toggleSelected(!!value);
            handleSelect(row.original.id, !!value);
          }}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }: { column: any }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama Supplier
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "contactPerson",
      header: "Kontak Person",
    },
    {
      accessorKey: "phone",
      header: "Telepon",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "address",
      header: "Alamat",
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
      id: "actions",
      header: "Aksi",
      cell: ({ row }: { row: any }) => {
        const supplier = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* Link to edit page */}
              <Link href={`/products/suppliers/edit/${supplier.id}`} passHref>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Ubah
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={() => handleDelete(supplier.id)} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Daftar Supplier</h1>
        <div className="flex items-center gap-2">
          {selectedSuppliers.length > 0 && (
            <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Hapus ({selectedSuppliers.length})
            </Button>
          )}
          <Link href="/products/suppliers/add" passHref>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Tambah Supplier
            </Button>
          </Link>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Supplier</CardTitle>
          <CardDescription>Kelola daftar supplier Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={suppliers} searchKey="name" />
        </CardContent>
      </Card>
    </div>
  );
}
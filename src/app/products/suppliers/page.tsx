'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, Plus, ArrowUpDown, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
    email: 'budi.s@majujaya.com',
    address: 'Jl. Industri No. 10, Jakarta',
    status: 'Aktif',
  },
  {
    id: '2',
    name: 'CV Berkah Abadi',
    contactPerson: 'Siti Aminah',
    phone: '085678901234',
    email: 'siti.a@berkahabadi.co.id',
    address: 'Jl. Raya Bogor Km. 25, Bogor',
    status: 'Aktif',
  },
  {
    id: '3',
    name: 'Toko Sumber Bahan',
    contactPerson: 'Agus Wijaya',
    phone: '021-5556789',
    email: 'agus.w@sumberbahan.net',
    address: 'Jl. Merdeka No. 5, Bandung',
    status: 'Nonaktif',
  },
  // Tambahkan data dummy lainnya jika perlu
];

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>(dummySuppliers);
  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Supplier; direction: 'ascending' | 'descending' } | null>(null);

  // Fungsi untuk menangani pemilihan semua supplier
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(suppliers.map(s => s.id));
      setSelectedSuppliers(allIds);
    } else {
      setSelectedSuppliers(new Set());
    }
  };

  // Fungsi untuk menangani pemilihan satu supplier
  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelection = new Set(selectedSuppliers);
    if (checked) {
      newSelection.add(id);
    } else {
      newSelection.delete(id);
    }
    setSelectedSuppliers(newSelection);
  };

  // Fungsi untuk sorting
  const requestSort = (key: keyof Supplier) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedData = [...suppliers].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    setSuppliers(sortedData);
  };

  // Fungsi untuk filter berdasarkan pencarian
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fungsi untuk mendapatkan ikon sort
  const getSortIcon = (key: keyof Supplier) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'ascending' ?
      <ArrowUpDown className="ml-2 h-4 w-4" /> : // Ganti ikon jika perlu
      <ArrowUpDown className="ml-2 h-4 w-4" />; // Ganti ikon jika perlu
  };

  // TODO: Implement delete functionality
  const handleDeleteSelected = () => {
    console.log('Deleting suppliers:', Array.from(selectedSuppliers));
    // Filter out selected suppliers
    const remainingSuppliers = suppliers.filter(s => !selectedSuppliers.has(s.id));
    setSuppliers(remainingSuppliers);
    setSelectedSuppliers(new Set()); // Clear selection
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Supplier</CardTitle>
            <CardDescription>
              Kelola daftar supplier Anda.
            </CardDescription>
          </div>
          <Button asChild>
            <Link href="/products/suppliers/add">
              <Plus className="mr-2 h-4 w-4" /> Tambah Supplier
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari supplier (nama, kontak, email)..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {selectedSuppliers.size > 0 && (
              <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                <Trash2 className="mr-2 h-4 w-4" /> Hapus ({selectedSuppliers.size})
              </Button>
            )}
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead padding="checkbox">
                    <Checkbox
                      checked={selectedSuppliers.size > 0 && selectedSuppliers.size === filteredSuppliers.length}
                      onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead onClick={() => requestSort('name')} className="cursor-pointer">
                    Nama Supplier {getSortIcon('name')}
                  </TableHead>
                  <TableHead onClick={() => requestSort('contactPerson')} className="cursor-pointer">
                    Kontak Person {getSortIcon('contactPerson')}
                  </TableHead>
                  <TableHead>Telepon</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden md:table-cell">Alamat</TableHead>
                  <TableHead onClick={() => requestSort('status')} className="cursor-pointer">
                    Status {getSortIcon('status')}
                  </TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id} data-state={selectedSuppliers.has(supplier.id) && "selected"}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedSuppliers.has(supplier.id)}
                          onCheckedChange={(checked) => handleSelectOne(supplier.id, Boolean(checked))}
                          aria-label={`Select supplier ${supplier.name}`}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.contactPerson}</TableCell>
                      <TableCell>{supplier.phone}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
                      <TableCell className="hidden md:table-cell truncate max-w-xs">{supplier.address}</TableCell>
                      <TableCell>
                        <Badge variant={supplier.status === 'Aktif' ? 'default' : 'destructive'}>
                          {supplier.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => console.log('Edit', supplier.id)}> {/* TODO: Implement Edit */} 
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => console.log('Delete single', supplier.id)} className="text-red-600"> {/* TODO: Implement Delete */} 
                              <Trash2 className="mr-2 h-4 w-4" /> Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Tidak ada supplier ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {/* TODO: Add pagination if needed */}
        </CardContent>
      </Card>
    </div>
  );
}
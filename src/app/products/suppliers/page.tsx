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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const router = useRouter();

  // Filter supplier berdasarkan pencarian
  const filteredSuppliers = dummySuppliers.filter((supplier) => {
    const query = searchTerm.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(query) ||
      supplier.contactPerson.toLowerCase().includes(query) ||
      supplier.email.toLowerCase().includes(query) ||
      supplier.phone.includes(query)
    );
  });

  // Hitung total halaman
  const totalPages = Math.ceil(filteredSuppliers.length / rowsPerPage);
  const totalRows = filteredSuppliers.length;

  // Ambil data untuk halaman saat ini
  const currentTableData = filteredSuppliers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedSuppliers(currentTableData.map(supplier => supplier.id));
    } else {
      setSelectedSuppliers([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedSuppliers([...selectedSuppliers, id]);
    } else {
      setSelectedSuppliers(selectedSuppliers.filter(supplierId => supplierId !== id));
    }
  };

  const isAllSelected = currentTableData.length > 0 && selectedSuppliers.length === currentTableData.length;
  const isIndeterminate = selectedSuppliers.length > 0 && selectedSuppliers.length < currentTableData.length;

  // handleAddSupplier function removed as navigation is handled by Link

  const handleEditSupplier = (id: string) => {
    // Arahkan ke halaman edit supplier (jika ada)
    // router.push(`/products/suppliers/edit/${id}`);
    console.log(`Edit supplier dengan ID: ${id}`);
  };

  const handleDeleteSupplier = (id: string) => {
    // Logika hapus supplier
    console.log(`Hapus supplier dengan ID: ${id}`);
    // Mungkin perlu konfirmasi sebelum menghapus
  };

  return (
    <div className="[--header-height:calc(--spacing(14))] min-h-screen bg-muted/40">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <SidebarInset>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Daftar Supplier</h1>
                <Link href="/products/suppliers/add" passHref>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Tambah Supplier
                  </Button>
                </Link>
              </div>

              {/* Card Konten Utama */}
              <Card>
                <CardHeader>
                  <CardTitle>Manajemen Supplier</CardTitle>
                  <CardDescription>Kelola daftar supplier Anda.</CardDescription>
                  <div className="flex items-center gap-4 pt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Cari Nama, Kontak, Email, Telepon..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg bg-background pl-8"
                      />
                    </div>
                    {/* Tambahkan filter lain jika perlu */}
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead padding="checkbox">
                          <Checkbox
                            checked={isAllSelected || (isIndeterminate ? 'indeterminate' : false)}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead>
                          Nama Supplier <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead>Kontak Person</TableHead>
                        <TableHead>Telepon</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentTableData.length > 0 ? (
                        currentTableData.map((supplier) => (
                          <TableRow key={supplier.id}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedSuppliers.includes(supplier.id)}
                                onCheckedChange={(checked) => handleSelectRow(supplier.id, !!checked)}
                                aria-label={`Select supplier ${supplier.name}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{supplier.name}</TableCell>
                            <TableCell>{supplier.contactPerson}</TableCell>
                            <TableCell>{supplier.phone}</TableCell>
                            <TableCell>{supplier.email}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(supplier.status)}>{supplier.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Buka menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEditSupplier(supplier.id)}>
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleDeleteSupplier(supplier.id)} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            Tidak ada data supplier.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                {/* Footer Card (Pagination, etc.) */}
                {/* <CardFooter className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    Menampilkan <strong>{(currentPage - 1) * rowsPerPage + 1}-{(currentPage - 1) * rowsPerPage + currentTableData.length}</strong> dari <strong>{totalRows}</strong> supplier
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={rowsPerPage.toString()}
                      onValueChange={(value) => {
                        setRowsPerPage(Number(value));
                        setCurrentPage(1); // Reset ke halaman pertama saat mengubah jumlah baris
                      }}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue placeholder={rowsPerPage} />
                      </SelectTrigger>
                      <SelectContent side="top">
                        {[10, 20, 30, 40, 50].map((pageSize) => (
                          <SelectItem key={pageSize} value={pageSize.toString()}>
                            {pageSize}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Sebelumnya
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Berikutnya
                    </Button>
                  </div>
                </CardFooter> */}
              </Card>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
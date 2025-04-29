"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from 'lucide-react'; // PlusCircleIcon tidak digunakan, bisa dihapus jika tidak perlu
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddCategoryDialog } from "@/components/products/add-category-dialog"; // Impor komponen dialog

export const description = "Halaman manajemen Kategori Produk";

// Placeholder data - replace with actual data fetching
// TODO: Ganti dengan state dan data fetching yang sebenarnya
const categories = [
  { id: 'cat1', name: 'Electronics', description: 'Gadgets and devices', createdAt: new Date().toISOString() },
  { id: 'cat2', name: 'Clothing', description: 'Apparel and accessories', createdAt: new Date().toISOString() },
  { id: 'cat3', name: 'Home Goods', description: 'Items for household use', createdAt: new Date().toISOString() },
];

export default function CategoriesPage() {
  // TODO: Ganti dengan state dan data fetching yang sebenarnya
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold md:text-2xl">Kategori Produk</h1>
        {/*<Button onClick={() => setIsAddDialogOpen(true)}>Tambah Kategori</Button>*/}
        <AddCategoryDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />

      </div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kategori</CardTitle>
          <CardDescription>Kelola kategori produk Anda.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari kategori..."
                className="pl-8 sm:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Kategori</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                {/* Tambahkan Aksi jika perlu */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                  {/* Tambahkan sel Aksi jika perlu */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {/*<AddCategoryDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />*/}
    </div>
  );
}
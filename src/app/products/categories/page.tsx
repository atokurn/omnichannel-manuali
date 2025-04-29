import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon } from 'lucide-react';
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
  // TODO: Implement state for categories, search, etc.

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Kategori Produk</CardTitle>
            <CardDescription>
              Kelola kategori untuk produk Anda.
            </CardDescription>
          </div>
          {/* Tombol Tambah Kategori menggunakan Dialog */}
          <AddCategoryDialog />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari kategori..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background"
                // TODO: Add state and onChange handler for search
              />
            </div>
            {/* Optional: Add filter or other actions here */}
          </div>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kategori</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead>Tanggal Dibuat</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>{new Date(category.createdAt).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell className="text-right">
                      {/* TODO: Add Edit and Delete actions */}
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-600">Hapus</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* TODO: Add pagination if needed */}
        </CardContent>
      </Card>
    </div>
  );
}
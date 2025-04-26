import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchIcon, PlusCircleIcon } from 'lucide-react'; // PlusCircleIcon tidak digunakan, bisa dihapus jika tidak perlu
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
  // TODO: Tambahkan state untuk mengelola kategori dan fungsi untuk menambah kategori baru
  // const [categoryList, setCategoryList] = useState(categories);
  // const handleAddCategory = (newCategory) => {
  //   setCategoryList(prev => [...prev, newCategory]);
  //   // Tambahkan logika untuk mengirim data ke backend di sini
  // };

  return (
    <div className="[--header-height:calc(--spacing(14))] flex h-screen overflow-hidden">
      <SidebarProvider className="flex flex-col w-full">
        <SiteHeader />
        <div className="flex flex-1 overflow-hidden">
          <AppSidebar />
          <SidebarInset className="flex-1 overflow-y-auto">
            <main className="flex flex-1 flex-col gap-4 p-4 ">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>Kategori Produk</CardTitle>
                    <CardDescription>Kelola kategori produk Anda di sini.</CardDescription>
                  </div>
                  {/* Ganti Button dengan AddCategoryDialog */}
                  <AddCategoryDialog /* onAddCategory={handleAddCategory} */ />
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Cari kategori..." className="pl-8 w-full md:w-1/3" />
                  </div>
                  <div className="border shadow-sm rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nama</TableHead>
                          <TableHead>Deskripsi</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {/* Gunakan state categoryList jika sudah diimplementasikan */}
                        {categories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">{category.name}</TableCell>
                            <TableCell>{category.description}</TableCell>
                            <TableCell className="text-right">
                              {/* Placeholder for action buttons */}
                              <Button variant="ghost" size="sm">Ubah</Button>
                              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">Hapus</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
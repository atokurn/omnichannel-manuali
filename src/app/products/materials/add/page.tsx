'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';

// Interface untuk data form material
interface MaterialFormData {
  name: string;
  code: string;
  unit: string;
  initialStock: string; // Added initial stock
  basePrice: string;
  description: string;
  status: 'Aktif' | 'Nonaktif';
  isDynamicPrice: boolean; // Tambahkan state untuk harga dinamis
}

// Data dummy untuk satuan
const unitOptions = [
  { id: 'pcs', name: 'Pcs' },
  { id: 'kg', name: 'Kilogram' },
  { id: 'g', name: 'Gram' },
  { id: 'l', name: 'Liter' },
  { id: 'ml', name: 'Mililiter' },
  { id: 'm', name: 'Meter' },
  { id: 'cm', name: 'Centimeter' },
  { id: 'roll', name: 'Roll' },
  { id: 'box', name: 'Box' },
  { id: 'pack', name: 'Pack' },
  { id: 'gross', name: 'Gross' },
];

export default function AddMaterialPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<MaterialFormData>({
    name: '',
    code: '',
    unit: '',
    initialStock: '0', // Default initial stock to 0
    basePrice: '0', // Default base price to 0
    description: '',
    status: 'Aktif',
    isDynamicPrice: false, // Default harga dinamis ke false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isDynamicPrice: checked }));
  };

  const handleStatusChange = (value: 'Aktif' | 'Nonaktif') => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to save the material data
    console.log('Material data submitted:', formData);
    // Redirect back to the materials list page after saving
    router.push('/products/materials');
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Kembali</span>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Tambah Material Baru
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm" onClick={() => router.back()}>Batal</Button>
          <Button size="sm" onClick={handleSubmit}><Save className="mr-2 h-4 w-4" /> Simpan</Button>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Detail Material</CardTitle>
            <CardDescription>Masukkan informasi detail untuk material baru.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-3">
              <Label htmlFor="name">Nama Material</Label>
              <Input
                id="name"
                name="name"
                type="text"
                className="w-full"
                placeholder="Contoh: Kain Katun"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="code">Kode Material</Label>
              <Input
                id="code"
                name="code"
                type="text"
                className="w-full"
                placeholder="Contoh: KTN-001"
                value={formData.code}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="unit">Satuan</Label>
              <Select name="unit" onValueChange={(value) => handleSelectChange('unit', value)} value={formData.unit} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih satuan" />
                </SelectTrigger>
                <SelectContent>
                  {unitOptions.map(option => (
                    <SelectItem key={option.id} value={option.id}>{option.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="initialStock">Stok Awal</Label>
              <Input
                id="initialStock"
                name="initialStock"
                type="number"
                className="w-full"
                placeholder="0"
                value={formData.initialStock}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="basePrice">Harga Pokok</Label>
              <Input
                id="basePrice"
                name="basePrice"
                type="number"
                className="w-full"
                placeholder="0"
                value={formData.basePrice}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="status">Status</Label>
              <Select name="status" onValueChange={(value: 'Aktif' | 'Nonaktif') => handleStatusChange(value)} value={formData.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 md:col-span-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Deskripsi singkat material"
                className="min-h-32"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div className="flex items-center space-x-2 md:col-span-2">
              <Switch
                id="isDynamicPrice"
                checked={formData.isDynamicPrice}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="isDynamicPrice">Harga Pokok Dinamis</Label>
              {/* Tambahkan Tooltip atau penjelasan jika perlu */}
            </div>
          </CardContent>
          {/* Footer bisa ditambahkan jika perlu tombol aksi di bawah */}
          {/* <CardFooter className="justify-end gap-2">
            <Button variant="outline" onClick={() => router.back()}>Batal</Button>
            <Button onClick={handleSubmit}><Save className="mr-2 h-4 w-4" /> Simpan</Button>
          </CardFooter> */}
        </Card>
      </form>
      <div className="flex items-center justify-center gap-2 md:hidden">
        <Button variant="outline" size="sm" onClick={() => router.back()}>Batal</Button>
        <Button size="sm" onClick={handleSubmit}><Save className="mr-2 h-4 w-4" /> Simpan</Button>
      </div>
    </div>
  );
}
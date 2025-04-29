'use client';

import React, { useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react'; // Import Save icon

// Tipe data untuk supplier (sesuaikan jika perlu)
interface NewSupplierData {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: 'Aktif' | 'Nonaktif';
}

export default function AddSupplierPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewSupplierData>({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    status: 'Aktif',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: 'Aktif' | 'Nonaktif') => {
    setFormData(prev => ({ ...prev, status: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to save the supplier data
    console.log('Supplier data submitted:', formData);
    // Redirect back to the suppliers list page after saving
    router.push('/products/suppliers');
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Kembali</span>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Tambah Supplier Baru
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex">
          <Button variant="outline" size="sm" onClick={() => router.back()}>Batal</Button>
          <Button size="sm" onClick={handleSubmit}><Save className="mr-2 h-4 w-4" /> Simpan</Button>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informasi Supplier</CardTitle>
            <CardDescription>Masukkan detail untuk supplier baru.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-3">
              <Label htmlFor="name">Nama Supplier</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Contoh: PT Sumber Rejeki"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="contactPerson">Kontak Person</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={formData.contactPerson}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Contoh: 081234567890"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Contoh: info@sumberrejeki.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-3 md:col-span-2">
              <Label htmlFor="address">Alamat Lengkap</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Masukkan alamat lengkap supplier"
                className="min-h-32"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="status">Status</Label>
              <Select name="status" onValueChange={handleSelectChange} value={formData.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          {/* <CardFooter className="border-t px-6 py-4 justify-end gap-2">
            <Button variant="outline" onClick={() => router.back()}>Batal</Button>
            <Button onClick={handleSubmit}><Save className="mr-2 h-4 w-4" /> Simpan Supplier</Button>
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
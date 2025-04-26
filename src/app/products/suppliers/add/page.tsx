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
import { ArrowLeft } from 'lucide-react';

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
    status: 'Aktif', // Default status
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: 'Aktif' | 'Nonaktif') => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement API call to save the new supplier data
    console.log('Data Supplier Baru:', formData);
    // Simulasi delay API
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    // Redirect ke halaman daftar supplier setelah berhasil
    router.push('/products/suppliers');
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
              <div className="flex items-center gap-4">
                 <Button variant="outline" size="icon" className="h-7 w-7" asChild>
                    <Link href="/products/suppliers">
                      <ArrowLeft className="h-4 w-4" />
                      <span className="sr-only">Kembali</span>
                    </Link>
                  </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                  Tambah Supplier Baru
                </h1>
                {/* Optional: Breadcrumbs or other header elements */}
              </div>

              {/* Form Card */}
              <Card>
                <form onSubmit={handleSubmit}>
                  <CardHeader>
                    <CardTitle>Informasi Supplier</CardTitle>
                    <CardDescription>Masukkan detail supplier baru.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <div className="grid gap-3">
                      <Label htmlFor="name">Nama Supplier</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        className="w-full"
                        placeholder="Contoh: PT Sejahtera Bersama"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="grid gap-3">
                        <Label htmlFor="contactPerson">Kontak Person</Label>
                        <Input
                          id="contactPerson"
                          name="contactPerson"
                          type="text"
                          placeholder="Contoh: Budi Setiawan"
                          value={formData.contactPerson}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="grid gap-3">
                        <Label htmlFor="phone">Telepon</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="Contoh: 0812xxxxxxxx"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="grid gap-3">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Contoh: info@sejahtera.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                       <div className="grid gap-3">
                        <Label htmlFor="status">Status</Label>
                        <Select name="status" value={formData.status} onValueChange={handleSelectChange} required>
                          <SelectTrigger id="status" aria-label="Pilih Status">
                            <SelectValue placeholder="Pilih Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Aktif">Aktif</SelectItem>
                            <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="address">Alamat</Label>
                      <Textarea
                        id="address"
                        name="address"
                        placeholder="Masukkan alamat lengkap supplier"
                        className="min-h-32"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t px-6 py-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Menyimpan...' : 'Simpan Supplier'}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
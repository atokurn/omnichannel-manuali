'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';

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
  const [errors, setErrors] = useState<Partial<Record<keyof NewSupplierData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof NewSupplierData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Nama supplier harus diisi.';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Nama kontak person harus diisi.';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon harus diisi.';
    } else if (!/^\+?[0-9\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Format nomor telepon tidak valid.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi.';
    } else if (!/^[^s@]+@[^s@]+.[^s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid.';
    }
    if (!formData.address.trim()) newErrors.address = 'Alamat harus diisi.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof NewSupplierData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = (value: 'Aktif' | 'Nonaktif') => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    console.log('Submitting Supplier Data:', formData);

    // TODO: Implement API call to save the supplier data
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Supplier saved successfully!');
      router.push('/products/suppliers'); // Redirect to suppliers list page
    } catch (error) {
      console.error('Failed to save supplier:', error);
      // TODO: Show error message to the user (e.g., using a toast notification)
      setErrors({ name: 'Gagal menyimpan supplier. Silakan coba lagi.' }); // Example generic error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Kembali</span>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Tambah Supplier Baru
          </h1>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button variant="outline" size="sm" type="button" onClick={() => router.back()}>
              Batal
            </Button>
            <Button size="sm" type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : <><Save className="h-4 w-4 mr-2" /> Simpan Supplier</>}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Supplier</CardTitle>
            <CardDescription>Masukkan detail kontak dan alamat supplier.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="name" className={errors.name ? 'text-destructive' : ''}>Nama Supplier</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Contoh: PT Sumber Rejeki"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="contactPerson" className={errors.contactPerson ? 'text-destructive' : ''}>Kontak Person</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  type="text"
                  placeholder="Contoh: Bapak Budi"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  className={errors.contactPerson ? 'border-destructive' : ''}
                />
                {errors.contactPerson && <p className="text-sm text-destructive">{errors.contactPerson}</p>}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="phone" className={errors.phone ? 'text-destructive' : ''}>Nomor Telepon</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email" className={errors.email ? 'text-destructive' : ''}>Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Contoh: info@sumberrejeki.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="address" className={errors.address ? 'text-destructive' : ''}>Alamat Lengkap</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Masukkan alamat lengkap supplier"
                value={formData.address}
                onChange={handleInputChange}
                className={`min-h-32 ${errors.address ? 'border-destructive' : ''}`}
              />
              {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="status">Status</Label>
              <Select name="status" onValueChange={handleSelectChange} value={formData.status}>
                <SelectTrigger id="status" className="w-[180px]">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aktif">Aktif</SelectItem>
                  <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Save Button */}
        <div className="mt-6 flex items-center justify-center gap-2 md:hidden">
          <Button variant="outline" size="sm" type="button" onClick={() => router.back()}>
            Batal
          </Button>
          <Button size="sm" type="submit" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : <><Save className="h-4 w-4 mr-2" /> Simpan Supplier</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
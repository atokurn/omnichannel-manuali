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
    initialStock: '', // Initialize stock
    basePrice: '',
    description: '',
    status: 'Aktif',
    isDynamicPrice: false, // Inisialisasi state harga dinamis
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [descCharCount, setDescCharCount] = useState(0);
  const { isDynamicPrice } = formData; // Destructure untuk kemudahan akses

  // Fungsi untuk menangani perubahan input form utama
  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Update character count for description
    if (field === "description" && typeof value === 'string') {
      setDescCharCount(value.length);
    }
    
    // Hapus error untuk field yang diubah
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Fungsi untuk validasi form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nama material harus diisi';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Kode material harus diisi';
    }
    
    if (!formData.unit) {
      newErrors.unit = 'Satuan harus dipilih';
    }
    
    if (!isDynamicPrice) { // Hanya validasi harga dasar jika tidak dinamis
      if (!formData.basePrice.trim()) {
        newErrors.basePrice = 'Harga dasar harus diisi';
      } else if (isNaN(Number(formData.basePrice)) || Number(formData.basePrice) < 0) {
        newErrors.basePrice = 'Harga dasar harus berupa angka positif';
      }
    }

    if (!formData.initialStock.trim()) {
      newErrors.initialStock = 'Stok awal harus diisi';
    } else if (isNaN(Number(formData.initialStock)) || Number(formData.initialStock) < 0) {
      newErrors.initialStock = 'Stok awal harus berupa angka positif';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fungsi untuk menangani submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Proses penyimpanan data
      console.log('Data yang akan disimpan:', formData);
      
      // Redirect ke halaman daftar material setelah berhasil
      router.push('/products/materials');
    }
  };

  // Fungsi untuk kembali ke halaman sebelumnya
  const handleBack = () => {
    router.push('/products/materials');
  };

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <AppSidebar />
          <div className="flex-1 p-4 pl-[--sidebar-width]">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center">
                  <div>
                    <CardTitle>Tambah Material Baru</CardTitle>
                    <CardDescription>Isi informasi untuk material produk baru.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  {/* Informasi Dasar */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Informasi Dasar</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className={errors.name ? 'text-destructive' : ''}>
                          Nama Material <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          placeholder="Masukkan nama material"
                          className={errors.name ? 'border-destructive' : ''}
                        />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="code" className={errors.code ? 'text-destructive' : ''}>
                          Kode Material <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => handleChange('code', e.target.value)}
                          placeholder="Masukkan kode material"
                          className={errors.code ? 'border-destructive' : ''}
                        />
                        {errors.code && <p className="text-sm text-destructive">{errors.code}</p>}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="unit" className={errors.unit ? 'text-destructive' : ''}>
                          Satuan <span className="text-destructive">*</span>
                        </Label>
                        <Select 
                          value={formData.unit} 
                          onValueChange={(value) => handleChange('unit', value)}
                        >
                          <SelectTrigger className={errors.unit ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Pilih satuan" />
                          </SelectTrigger>
                          <SelectContent>
                            {unitOptions.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                {unit.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.unit && <p className="text-sm text-destructive">{errors.unit}</p>}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="status">
                          Status
                        </Label>
                        <Select 
                          value={formData.status} 
                          onValueChange={(value: 'Aktif' | 'Nonaktif') => handleChange('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Aktif">Aktif</SelectItem>
                            <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Deskripsi
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Masukkan deskripsi material"
                        className="min-h-[100px]"
                      />
                      <p className="text-sm text-muted-foreground text-right">
                        {descCharCount}/500 karakter
                      </p>
                    </div>
                  </div>
                  
                  {/* Informasi Stok & Harga */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Informasi Stok & Harga</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="initialStock" className={errors.initialStock ? 'text-destructive' : ''}>
                          Stok Awal <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="initialStock"
                          value={formData.initialStock}
                          onChange={(e) => handleChange('initialStock', e.target.value)}
                          placeholder="Masukkan jumlah stok awal"
                          className={errors.initialStock ? 'border-destructive' : ''}
                          type="text"
                          inputMode="numeric"
                        />
                        {errors.initialStock && <p className="text-sm text-destructive">{errors.initialStock}</p>}
                      </div>
                    </div>

                    {/* Opsi Harga Dinamis */}
                    <div className="flex items-center space-x-2 pt-4">
                      <Switch 
                        id="dynamic-price"
                        checked={isDynamicPrice}
                        onCheckedChange={(checked) => handleChange('isDynamicPrice', checked)}
                      />
                      <Label htmlFor="dynamic-price">Gunakan Harga Dinamis (berdasarkan PO)</Label>
                    </div>

                    {/* Harga Dasar (kondisional) */}
                    {!isDynamicPrice && (
                      <div className="space-y-2 pt-4">
                        <Label htmlFor="basePrice" className={errors.basePrice ? 'text-destructive' : ''}>
                          Harga Dasar <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                            Rp
                          </span>
                          <Input
                            id="basePrice"
                            value={formData.basePrice}
                            onChange={(e) => handleChange('basePrice', e.target.value)}
                            placeholder="0"
                            className={`pl-10 ${errors.basePrice ? 'border-destructive' : ''}`}
                            type="text"
                            inputMode="numeric"
                            disabled={isDynamicPrice} // Disable jika harga dinamis aktif
                          />
                        </div>
                        {errors.basePrice && <p className="text-sm text-destructive">{errors.basePrice}</p>}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t px-6 py-4 gap-2">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Batal
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Simpan Material
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
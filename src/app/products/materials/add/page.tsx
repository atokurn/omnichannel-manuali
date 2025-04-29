'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  { id: 'box', name: 'Box' },
  { id: 'pack', name: 'Pack' },
];

// Interface untuk harga dinamis
interface DynamicPrice {
  id: number;
  supplier: string;
  price: string;
}

export default function AddMaterialPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<MaterialFormData>({
    name: '',
    code: '',
    unit: '',
    initialStock: '', // Initialize initial stock
    basePrice: '',
    description: '',
    status: 'Aktif',
    isDynamicPrice: false, // Default harga dinamis tidak aktif
  });
  const [dynamicPrices, setDynamicPrices] = useState<DynamicPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof MaterialFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isDynamicPrice: checked }));
    if (!checked) {
      setDynamicPrices([]); // Reset harga dinamis jika switch dimatikan
    }
  };

  const addDynamicPriceRow = () => {
    setDynamicPrices((prev) => [...prev, { id: Date.now(), supplier: '', price: '' }]);
  };

  const handleDynamicPriceChange = (index: number, field: keyof Omit<DynamicPrice, 'id'>, value: string) => {
    setDynamicPrices((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeDynamicPriceRow = (id: number) => {
    setDynamicPrices((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Form Data:', formData);
    console.log('Dynamic Prices:', dynamicPrices);

    // TODO: Implement API call to save the material data
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log('Material saved successfully!');
      router.push('/products/materials'); // Redirect after successful save
    } catch (error) {
      console.error('Failed to save material:', error);
      // TODO: Show error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Kembali</span>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Tambah Material Baru
          </h1>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              Batal
            </Button>
            <Button size="sm" type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : <><Save className="h-4 w-4 mr-2" /> Simpan Material</>}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Detail Material</CardTitle>
                <CardDescription>
                  Masukkan informasi dasar tentang material produk.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name">Nama Material</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      className="w-full"
                      placeholder="Contoh: Kain Katun Jepang"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-3">
                      <Label htmlFor="code">Kode Material</Label>
                      <Input
                        id="code"
                        name="code"
                        type="text"
                        placeholder="Contoh: KTN-JPG-01"
                        value={formData.code}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="unit">Satuan</Label>
                      <Select name="unit" onValueChange={(value) => handleSelectChange('unit', value)} value={formData.unit} required>
                        <SelectTrigger id="unit" aria-label="Pilih Satuan">
                          <SelectValue placeholder="Pilih Satuan" />
                        </SelectTrigger>
                        <SelectContent>
                          {unitOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                   <div className="grid gap-3">
                      <Label htmlFor="initialStock">Stok Awal</Label>
                      <Input
                        id="initialStock"
                        name="initialStock"
                        type="number"
                        placeholder="Masukkan jumlah stok awal"
                        value={formData.initialStock}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  <div className="grid gap-3">
                    <Label htmlFor="description">Deskripsi (Opsional)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Deskripsi singkat material"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="min-h-32"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Harga</CardTitle>
                <CardDescription>
                  Atur harga dasar dan opsi harga dinamis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="basePrice">Harga Dasar per Satuan</Label>
                    <Input
                      id="basePrice"
                      name="basePrice"
                      type="number"
                      placeholder="Contoh: 15000"
                      value={formData.basePrice}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isDynamicPrice"
                      checked={formData.isDynamicPrice}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="isDynamicPrice">Gunakan Harga Dinamis Berdasarkan Supplier</Label>
                  </div>

                  {formData.isDynamicPrice && (
                    <div className="mt-4 border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <Label>Harga per Supplier</Label>
                        <Button type="button" size="sm" variant="outline" onClick={addDynamicPriceRow}>
                          <Plus className="h-4 w-4 mr-2" /> Tambah Supplier
                        </Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Harga</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dynamicPrices.map((price, index) => (
                            <TableRow key={price.id}>
                              <TableCell>
                                <Input
                                  type="text"
                                  placeholder="Nama Supplier"
                                  value={price.supplier}
                                  onChange={(e) => handleDynamicPriceChange(index, 'supplier', e.target.value)}
                                  required
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  placeholder="Harga"
                                  value={price.price}
                                  onChange={(e) => handleDynamicPriceChange(index, 'price', e.target.value)}
                                  required
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeDynamicPriceRow(price.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Status Material</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" onValueChange={(value) => handleSelectChange('status', value as 'Aktif' | 'Nonaktif')} value={formData.status} required>
                      <SelectTrigger id="status" aria-label="Pilih Status">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aktif">Aktif</SelectItem>
                        <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 md:hidden mt-6">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            Batal
          </Button>
          <Button size="sm" type="submit" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : <><Save className="h-4 w-4 mr-2" /> Simpan Material</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
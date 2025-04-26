'use client';

import { useState } from 'react';
import { InventorySidebar } from "@/components/inventory-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { dummyWarehousesData } from "@/lib/services/warehouse-service";
import { dummyAreasData } from "@/lib/services/area-service";
import { Shelf } from "@/lib/services/shelf-service";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, PackageCheck, CircleDashed } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

// Component for shelf preview
const ShelfPreview = ({ shelf }: { shelf: Partial<Shelf> }) => {
  // Find warehouse and area names
  const selectedWarehouse = shelf.warehouseId 
    ? dummyWarehousesData.find(w => w.id === shelf.warehouseId) 
    : null;
  const selectedArea = shelf.areaId 
    ? dummyAreasData.find(a => a.id === shelf.areaId) 
    : null;
  
  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'Aktif': return 'success';
      case 'Nonaktif': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="rounded-lg border p-4 bg-slate-50">
      <h3 className="text-lg font-semibold mb-4">Preview Rak</h3>
      <div className="space-y-3">
        <div className="flex items-center">
          <PackageCheck className="h-5 w-5 mr-2 text-slate-500" />
          <span className="font-medium">{shelf.name || 'Nama Rak'}</span>
        </div>
        
        <div className="flex flex-col gap-2 pl-7">
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Gudang:</span>
            <span className="text-sm font-medium">{selectedWarehouse?.name || '-'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Area:</span>
            <span className="text-sm font-medium">{selectedArea?.name || '-'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Posisi:</span>
            <span className="text-sm font-medium">{shelf.position || '-'}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">Kapasitas:</span>
            <span className="text-sm font-medium">
              {shelf.capacity ? `${parseInt(shelf.capacity.toString()).toLocaleString()} unit` : '-'}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Status:</span>
            {shelf.status ? (
              <Badge variant={getStatusVariant(shelf.status) as any}>
                {shelf.status}
              </Badge>
            ) : (
              <CircleDashed className="h-4 w-4 text-slate-300" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AddShelfPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    warehouseId: '',
    areaId: '',
    capacity: '',
    position: '',
    status: 'Aktif'
  });
  const [filteredAreas, setFilteredAreas] = useState(dummyAreasData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Jika warehouse berubah, filter area berdasarkan warehouse
    if (name === 'warehouseId') {
      if (value === '') {
        setFilteredAreas(dummyAreasData);
      } else {
        setFilteredAreas(dummyAreasData.filter(area => area.warehouseId === value));
      }
      // Reset area selection when warehouse changes
      setFormData(prev => ({
        ...prev,
        areaId: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    
    // Validasi form
    if (!formData.name) {
      setFormError('Nama rak harus diisi');
      return;
    }

    if (!formData.warehouseId) {
      setFormError('Gudang harus dipilih');
      return;
    }

    if (!formData.areaId) {
      setFormError('Area harus dipilih');
      return;
    }

    if (!formData.capacity) {
      setFormError('Kapasitas harus diisi');
      return;
    }

    setIsSubmitting(true);

    // Simulasi proses penyimpanan data
    setTimeout(() => {
      try {
        // Temukan nama warehouse dan area berdasarkan ID
        const selectedWarehouse = dummyWarehousesData.find(w => w.id === formData.warehouseId);
        const warehouseName = selectedWarehouse ? selectedWarehouse.name : '';
        
        const selectedArea = dummyAreasData.find(a => a.id === formData.areaId);
        const areaName = selectedArea ? selectedArea.name : '';

        // Buat objek shelf baru
        const newShelf: Shelf = {
          ...formData,
          id: Date.now().toString(), // Generate ID sementara
          warehouseName: warehouseName,
          areaName: areaName,
          totalSku: 0, // Rak baru belum memiliki SKU
          capacity: formData.capacity ? parseInt(formData.capacity) : 0,
          createdAt: new Date().toISOString()
        };

        // Di sini seharusnya ada kode untuk menyimpan data ke API/database
        console.log('Data rak baru:', newShelf);
        
        setFormSuccess('Rak berhasil ditambahkan!');
        
        // Reset form setelah berhasil
        setTimeout(() => {
          router.push('/inventory/warehouse/shelves');
        }, 1500);
      } catch (error) {
        console.error('Error saat menyimpan data:', error);
        setFormError('Terjadi kesalahan saat menyimpan data');
      } finally {
        setIsSubmitting(false);
      }
    }, 1000); // Simulasi delay network
  };

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <InventorySidebar />
          <SidebarInset>
            <div className="flex flex-1 flex-col gap-4 p-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => router.push('/inventory/warehouse/shelves')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-semibold">Tambah Rak Baru</h1>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Form Tambah Rak</CardTitle>
                    <CardDescription>
                      Isi informasi detail untuk rak penyimpanan baru.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {formError && (
                      <Alert variant="destructive" className="mb-6">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{formError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {formSuccess && (
                      <Alert variant="success" className="mb-6 bg-green-50 text-green-800 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle>Berhasil</AlertTitle>
                        <AlertDescription>{formSuccess}</AlertDescription>
                      </Alert>
                    )}
                    
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-6">
                        <div className="grid gap-3">
                          <Label htmlFor="name">
                            Nama Rak <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Nama rak"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                        
                        <div className="grid gap-3">
                          <Label htmlFor="warehouseId">
                            Gudang <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.warehouseId}
                            onValueChange={(value) => handleSelectChange('warehouseId', value)}
                            disabled={isSubmitting}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih gudang" />
                            </SelectTrigger>
                            <SelectContent>
                              {dummyWarehousesData.map(warehouse => (
                                <SelectItem key={warehouse.id} value={warehouse.id}>
                                  {warehouse.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid gap-3">
                          <Label htmlFor="areaId">
                            Area <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.areaId}
                            onValueChange={(value) => handleSelectChange('areaId', value)}
                            disabled={!formData.warehouseId || isSubmitting}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih area" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredAreas.map(area => (
                                <SelectItem key={area.id} value={area.id}>
                                  {area.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid gap-3">
                          <Label htmlFor="position">
                            Posisi
                          </Label>
                          <Input
                            id="position"
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            placeholder="Contoh: Baris 1, Kolom A"
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        <div className="grid gap-3">
                          <Label htmlFor="capacity">
                            Kapasitas (unit) <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="capacity"
                            name="capacity"
                            type="number"
                            value={formData.capacity}
                            onChange={handleChange}
                            placeholder="Kapasitas dalam unit"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                        
                        <div className="grid gap-3">
                          <Label htmlFor="status">
                            Status
                          </Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) => handleSelectChange('status', value)}
                            disabled={isSubmitting}
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
                      
                      <CardFooter className="flex justify-end gap-2 px-0 pt-6">
                        <Button 
                          variant="outline" 
                          onClick={() => router.push('/inventory/warehouse/shelves')}
                          disabled={isSubmitting}
                        >
                          Batal
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="animate-spin mr-2">⏳</span> Menyimpan...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" /> Simpan
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </CardContent>
                </Card>

                {/* Preview card */}
                <div className="flex flex-col gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Preview</CardTitle>
                      <CardDescription>
                        Lihat tampilan rak sebelum menyimpan
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ShelfPreview shelf={formData} />
                    </CardContent>
                  </Card>
                  
                  {/* Help card with tips */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Tips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-2 text-slate-600">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 font-bold">•</span>
                          Atur nama rak dengan jelas untuk memudahkan identifikasi
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 font-bold">•</span>
                          Tentukan posisi rak untuk memudahkan pencarian barang
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-500 font-bold">•</span>
                          Isi kapasitas rak sesuai dengan kemampuan penyimpanan
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
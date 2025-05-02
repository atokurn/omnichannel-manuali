'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// Interface untuk material yang dipilih dalam komposisi
interface CompositionMaterial {
  id: string;
  materialId: string;
  materialName: string;
  quantity: string;
  unit: string;
}

// Interface untuk data produk
interface Product {
  id: string;
  name: string;
}

// Interface untuk data material
interface Material {
  id: string;
  name: string;
  unit: string;
  basePrice?: number; // Harga dasar material
}

// Interface untuk data komposisi baru
interface NewCompositionData {
  productId: string;
  materials: CompositionMaterial[];
  isTemplate: boolean;
  templateName: string;
}

export default function AddCompositionPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [totalEstimatedPrice, setTotalEstimatedPrice] = useState<number>(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  
  const [formData, setFormData] = useState<NewCompositionData>({
    productId: '',
    materials: [],
    isTemplate: true, // Default: Menjadi template
    templateName: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    productId?: string;
    materials?: string;
    general?: string;
  }>({});

  // Fetch products data
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Gagal mengambil data produk');
        const data = await response.json();
        
        // Format data produk untuk dropdown
        const formattedProducts = data.map((product: any) => ({
          id: product.id,
          name: product.name
        }));
        
        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Gagal mengambil data produk');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Fetch materials data
  useEffect(() => {
    const fetchMaterials = async () => {
      setIsLoadingMaterials(true);
      try {
        const response = await fetch('/api/products/materials');
        if (!response.ok) throw new Error('Gagal mengambil data material');
        const data = await response.json();
        
        // Format data material untuk dropdown dengan harga dasar
        const formattedMaterials = data.data.map((material: any) => ({
          id: material.id,
          name: material.name,
          unit: material.unit,
          basePrice: material.basePrice || 0 // Tambahkan harga dasar
        }));
        
        setMaterials(formattedMaterials);
      } catch (error) {
        console.error('Error fetching materials:', error);
        toast.error('Gagal mengambil data material');
      } finally {
        setIsLoadingMaterials(false);
      }
    };

    fetchMaterials();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: {
      productId?: string;
      materials?: string;
      templateName?: string;
      general?: string;
    } = {};

    // Validasi productId hanya jika tidak menjadi template
    if (!formData.isTemplate && !formData.productId) {
      newErrors.productId = 'Produk harus dipilih.';
    }
    
    // Validasi nama template jika menjadi template
    if (formData.isTemplate && !formData.templateName.trim()) {
      newErrors.templateName = 'Nama template harus diisi.';
    }

    if (formData.materials.length === 0) {
      newErrors.materials = 'Minimal satu material harus ditambahkan.';
    } else {
      // Validasi setiap material
      const invalidMaterial = formData.materials.find(
        (material) => !material.materialId || !material.quantity || parseFloat(material.quantity) <= 0
      );
      
      if (invalidMaterial) {
        newErrors.materials = 'Semua material harus memiliki nama dan jumlah yang valid.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProductChange = (value: string) => {
    setFormData((prev) => ({ ...prev, productId: value }));
    if (errors.productId) {
      setErrors((prev) => ({ ...prev, productId: undefined }));
    }
  };

  const addMaterial = () => {
    const newMaterial: CompositionMaterial = {
      id: Date.now().toString(), // Temporary ID for UI
      materialId: '',
      materialName: '',
      quantity: '',
      unit: '',
    };

    setFormData((prev) => ({
      ...prev,
      materials: [...prev.materials, newMaterial],
    }));

    if (errors.materials) {
      setErrors((prev) => ({ ...prev, materials: undefined }));
    }
  };

  const removeMaterial = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.filter((material) => material.id !== id),
    }));
  };

  // Fungsi untuk menghitung total estimasi harga
  const calculateTotalEstimatedPrice = (compositionMaterials: CompositionMaterial[], materialsList: Material[]) => {
    let total = 0;
    
    compositionMaterials.forEach(material => {
      const materialData = materialsList.find(m => m.id === material.materialId);
      if (materialData?.basePrice && material.quantity) {
        total += materialData.basePrice * parseFloat(material.quantity);
      }
    });
    
    return total;
  };
  
  // Update total estimasi harga setiap kali material berubah
  useEffect(() => {
    const total = formData.materials.reduce((sum, material) => {
      const materialData = materials.find(m => m.id === material.materialId);
      if (materialData?.basePrice && material.quantity) {
        return sum + (materialData.basePrice * parseFloat(material.quantity));
      }
      return sum;
    }, 0);
    
    setTotalEstimatedPrice(total);
  }, [formData.materials, materials]);

  const handleMaterialChange = (id: string, field: keyof CompositionMaterial, value: string) => {
    setFormData((prev) => ({
      ...prev,
      materials: prev.materials.map((material) => {
        if (material.id === id) {
          if (field === 'materialId') {
            // Jika materialId berubah, update juga materialName dan unit
            const selectedMaterial = materials.find((m) => m.id === value);
            return {
              ...material,
              materialId: value,
              materialName: selectedMaterial?.name || '',
              unit: selectedMaterial?.unit || '',
            };
          }
          return { ...material, [field]: value };
        }
        return material;
      }),
    }));

    if (errors.materials) {
      setErrors((prev) => ({ ...prev, materials: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    console.log('Form data to submit:', formData);

    try {
      // Persiapkan data untuk dikirim ke API
      const compositionData = {
        productId: formData.isTemplate ? null : formData.productId,
        isTemplate: formData.isTemplate,
        templateName: formData.isTemplate ? formData.templateName : null,
        materials: formData.materials.map(material => ({
          materialId: material.materialId,
          quantity: parseFloat(material.quantity),
          unit: material.unit
        }))
      };

      const response = await fetch('/api/products/composition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(compositionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Composition saved successfully!', result);
      toast.success('Komposisi produk berhasil ditambahkan');
      router.push('/products/composition');
    } catch (error) {
      console.error('Failed to save composition:', error);
      toast.error('Gagal menyimpan komposisi produk');
      setErrors({
        general: 'Terjadi kesalahan saat menyimpan komposisi. Silakan coba lagi.',
      });
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
            Tambah Komposisi Produk
          </h1>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button variant="outline" size="sm" type="button" onClick={() => router.back()}>
              Batal
            </Button>
            <Button size="sm" type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : <><Save className="h-4 w-4 mr-2" /> Simpan Komposisi</>}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Komposisi</CardTitle>
            <CardDescription>Pilih tipe komposisi dan tambahkan material yang digunakan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Composition Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="compositionType">Tipe Komposisi</Label>
              <Select
                value={formData.isTemplate ? "template" : "product"}
                onValueChange={(value) => {
                  setFormData(prev => ({
                    ...prev,
                    isTemplate: value === "template",
                    // Reset productId jika beralih ke template
                    productId: value === "template" ? '' : prev.productId
                  }));
                  // Reset error jika ada
                  if (errors.productId) {
                    setErrors(prev => ({ ...prev, productId: undefined }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tipe komposisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="template">Menjadi template</SelectItem>
                  <SelectItem value="product">Pilih produk</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {formData.isTemplate 
                  ? "Komposisi akan disimpan sebagai template yang dapat digunakan untuk berbagai produk." 
                  : "Komposisi akan dikaitkan dengan produk spesifik yang dipilih."}
              </p>
            </div>
            
            {/* Template Name - only show if template */}
            {formData.isTemplate && (
              <div className="space-y-2">
                <Label htmlFor="templateName" className={errors.templateName ? 'text-destructive' : ''}>
                  Nama Template
                </Label>
                <Input
                  id="templateName"
                  value={formData.templateName}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, templateName: e.target.value }));
                    if (errors.templateName) {
                      setErrors(prev => ({ ...prev, templateName: undefined }));
                    }
                  }}
                  placeholder="Masukkan nama template"
                  className={errors.templateName ? 'border-destructive' : ''}
                />
                {errors.templateName && <p className="text-sm text-destructive">{errors.templateName}</p>}
              </div>
            )}
            
            {/* Product Selection - only show if not template */}
            {!formData.isTemplate && (
              <div className="space-y-2">
                <Label htmlFor="product" className={errors.productId ? 'text-destructive' : ''}>
                  Pilih Produk
                </Label>
                <Select
                  disabled={isLoadingProducts}
                  value={formData.productId}
                  onValueChange={handleProductChange}
                >
                  <SelectTrigger className={errors.productId ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingProducts ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Memuat produk...</span>
                      </div>
                    ) : (
                      products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.productId && <p className="text-sm text-destructive">{errors.productId}</p>}
              </div>
            )}

            {/* General Error Message */}
            {errors.general && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md">
                {errors.general}
              </div>
            )}

            {/* Materials Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className={errors.materials ? 'text-destructive' : ''}>
                  Material
                </Label>
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <span className="font-medium">Estimasi Harga: </span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(totalEstimatedPrice)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addMaterial}
                    disabled={isLoadingMaterials}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Material
                  </Button>
                </div>
              </div>
              {errors.materials && <p className="text-sm text-destructive">{errors.materials}</p>}

              {/* Materials List */}
              <div className="space-y-4 mt-4">
                {formData.materials.length === 0 ? (
                  <div className="text-center p-4 border border-dashed rounded-md">
                    <p className="text-muted-foreground">Belum ada material. Klik tombol "Tambah Material" untuk menambahkan.</p>
                  </div>
                ) : (
                  formData.materials.map((material) => (
                    <div key={material.id} className="p-4 border rounded-md">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Material</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeMaterial(material.id)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-4">
                        {/* Material Selection */}
                        <div className="space-y-2">
                          <Label htmlFor={`material-${material.id}`}>Nama Material</Label>
                          <Select
                            disabled={isLoadingMaterials}
                            value={material.materialId}
                            onValueChange={(value) => handleMaterialChange(material.id, 'materialId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih material" />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingMaterials ? (
                                <div className="flex items-center justify-center p-2">
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  <span>Memuat material...</span>
                                </div>
                              ) : (
                                materials.map((mat) => (
                                  <SelectItem key={mat.id} value={mat.id}>
                                    {mat.name}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Quantity and Unit */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`quantity-${material.id}`}>Jumlah</Label>
                            <Input
                              id={`quantity-${material.id}`}
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={material.quantity}
                              onChange={(e) => handleMaterialChange(material.id, 'quantity', e.target.value)}
                              placeholder="Contoh: 2.5"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`unit-${material.id}`}>Satuan</Label>
                            <Input
                              id={`unit-${material.id}`}
                              value={material.unit}
                              readOnly
                              disabled
                              placeholder="Satuan akan terisi otomatis"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

      
      </form>
    </div>
  );
}
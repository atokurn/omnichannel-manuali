"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Trash, Loader2, ListPlus } from 'lucide-react'; // Added ListPlus
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaterialSelectionDialog } from '@/components/products/material-selection-dialog'; // Import the dialog

interface Material {
  id: string;
  name: string;
  unit: string;
  basePrice: number;
  code?: string; // Added from dialog
  category?: string; // Added from dialog
  type?: string; // Added from dialog
  stock?: number; // Added from dialog
}

interface Product {
  id: string;
  name: string;
}

interface CompositionMaterial {
  // id: string; // Use materialId as key if unique within composition
  materialId: string;
  quantity: number;
  material?: Material; // Keep this to access name, unit, price
}

export default function AddCompositionPage() {
  const router = useRouter();
  const { tenantId } = useAuth();
  const [isTemplate, setIsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [materials, setMaterials] = useState<Material[]>([]); // Keep this for cost calculation
  const [products, setProducts] = useState<Product[]>([]);
  const [compositionMaterials, setCompositionMaterials] = useState<CompositionMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(true); // Still needed for cost calculation
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [totalEstimatedCost, setTotalEstimatedCost] = useState(0);

  // Fetch materials (keep this for price/unit info)
  useEffect(() => {
    if (!tenantId) return;

    const fetchMaterialsData = async () => {
      setIsLoadingMaterials(true);
      try {
        // Fetch all materials needed for price/unit lookup
        const response = await fetch('/api/products/materials?limit=1000', { // Fetch more if needed
          headers: {
            'X-Tenant-Id': tenantId,
          },
        });
        
        if (!response.ok) {
          throw new Error('Gagal mengambil data material');
        }
        
        const result = await response.json();
        const formattedMaterials = result.data.map((material: any) => ({
          id: material.id,
          name: material.name,
          unit: material.unit,
          basePrice: material.basePrice || 0,
          // Include other fields if needed for display later
          code: material.code,
          category: material.category,
          type: material.type,
          stock: material.stock,
        }));
        
        setMaterials(formattedMaterials); // Store all materials for lookup
      } catch (error) {
        console.error('Error fetching materials data:', error);
        // Don't necessarily show toast here, dialog handles its own errors
      } finally {
        setIsLoadingMaterials(false);
      }
    };

    fetchMaterialsData();
  }, [tenantId]);

  // Fetch products (keep as is)
  useEffect(() => {
    if (!tenantId) return;

    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const response = await fetch('/api/products', {
          headers: {
            'X-Tenant-Id': tenantId,
          },
        });
        
        if (!response.ok) {
          throw new Error('Gagal mengambil data produk');
        }
        
        const result = await response.json();
        const formattedProducts = result.data.map((product: any) => ({
          id: product.id,
          name: product.name,
        }));
        
        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Gagal memuat data produk');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [tenantId]);

  // Calculate total estimated cost (adjust lookup)
  useEffect(() => {
    const total = compositionMaterials.reduce((sum, item) => {
      // Find the material details from the fetched 'materials' state
      const materialDetails = materials.find(m => m.id === item.materialId);
      return sum + (materialDetails?.basePrice || 0) * item.quantity;
    }, 0);
    setTotalEstimatedCost(total);
  }, [compositionMaterials, materials]); // Depend on the main materials list

  // Remove handleAddMaterial - Dialog handles adding
  // const handleAddMaterial = () => { ... };

  const handleRemoveMaterial = (materialIdToRemove: string) => {
    setCompositionMaterials(compositionMaterials.filter(item => item.materialId !== materialIdToRemove));
  };

  // Update handleMaterialChange to only handle quantity
  const handleQuantityChange = (materialIdToUpdate: string, value: number) => {
    setCompositionMaterials(compositionMaterials.map(item => {
      if (item.materialId === materialIdToUpdate) {
        return { ...item, quantity: value };
      }
      return item;
    }));
  };

  // Handle selection from the dialog
  const handleMaterialsSelected = (selectedMaterialsFromDialog: Material[]) => {
    const newCompositionMaterials = selectedMaterialsFromDialog.map(material => {
      // Check if material already exists in composition
      const existing = compositionMaterials.find(cm => cm.materialId === material.id);
      return {
        materialId: material.id,
        quantity: existing?.quantity || 1, // Keep existing quantity or default to 1
        material: material // Store details for display
      };
    });
    setCompositionMaterials(newCompositionMaterials);
  };

  // handleSubmit (keep validation, adjust payload)
  const handleSubmit = async () => {
    // Validasi
    if (isTemplate && !templateName.trim()) {
      toast.error('Nama template harus diisi');
      return;
    }

    if (!isTemplate && !selectedProductId) {
      toast.error('Produk harus dipilih');
      return;
    }

    if (compositionMaterials.length === 0) {
      toast.error('Minimal satu material harus dipilih');
      return;
    }

    const invalidMaterial = compositionMaterials.find(
      item => item.quantity <= 0
    );

    if (invalidMaterial) {
      toast.error('Semua material harus memiliki jumlah lebih dari 0');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        isTemplate,
        templateName: isTemplate ? templateName : null,
        productId: isTemplate ? null : selectedProductId,
        materials: compositionMaterials.map(item => ({
          materialId: item.materialId,
          quantity: item.quantity,
        })),
      };

      const response = await fetch('/api/products/composition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-Id': tenantId || '',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan komposisi');
      }

      toast.success('Komposisi berhasil disimpan');
      router.push('/products/composition');
    } catch (error: any) {
      console.error('Error saving composition:', error);
      toast.error(error.message || 'Gagal menyimpan komposisi');
    } finally {
      setIsLoading(false);
    }
  };

  // Get current selected material IDs for the dialog
  const currentSelectedMaterialIds = compositionMaterials.map(cm => cm.materialId);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 bg-background">
      {/* Header remains the same */}
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/products/composition')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold md:text-2xl">Tambah Komposisi Produk</h1>
        <div className="ml-auto">
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Simpan Komposisi
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buat komposisi material baru untuk produk atau sebagai template.</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Template/Product selection remains the same */}
            <div className="flex items-center space-x-2">
              <Label htmlFor="template-mode">Jadikan Template?</Label>
              <Switch
                id="template-mode"
                checked={isTemplate}
                onCheckedChange={setIsTemplate}
              />
            </div>

            {isTemplate ? (
              <div className="space-y-2">
                <Label htmlFor="template-name">Nama Template</Label>
                <Input
                  id="template-name"
                  placeholder="Masukkan nama template"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="product-select">Pilih Produk</Label>
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih produk">
                      {isLoadingProducts ? (
                        <div className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Memuat...
                        </div>
                      ) : products.length === 0 ? (
                        <div>Tidak ada produk tersedia</div>
                      ) : (
                        products.find(p => p.id === selectedProductId)?.name || "Pilih produk"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Material Section Updated */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Material yang Dibutuhkan</Label>
                {/* Use MaterialSelectionDialog */}
                <MaterialSelectionDialog
                  initialSelectedIds={currentSelectedMaterialIds}
                  onSelect={handleMaterialsSelected}
                  trigger={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                    >
                      <ListPlus className="h-4 w-4 mr-2" /> Pilih Material
                    </Button>
                  }
                />
              </div>

              {compositionMaterials.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Belum ada material yang dipilih
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 font-medium border-b pb-2">
                    <div className="col-span-5">Material</div>
                    <div className="col-span-3">Jumlah</div>
                    <div className="col-span-3">Unit</div>
                    <div className="col-span-1 text-right">Aksi</div>
                  </div>

                  {/* Material Rows */}
                  {compositionMaterials.map((item) => {
                    // Find full material details from the main 'materials' state
                    const materialDetails = materials.find(m => m.id === item.materialId);
                    return (
                      <div key={item.materialId} className="grid grid-cols-12 gap-4 items-center">
                        {/* Display Material Name */}
                        <div className="col-span-5">
                          {materialDetails?.name || item.materialId} {/* Show name or ID if lookup fails */}
                        </div>
                        {/* Quantity Input */}
                        <div className="col-span-3">
                          <Input
                            type="number"
                            min="0.01" // Ensure quantity is positive
                            step="0.01"
                            value={item.quantity || ''}
                            onChange={(e) => handleQuantityChange(item.materialId, parseFloat(e.target.value) || 0)}
                            className="h-8" // Smaller input
                          />
                        </div>
                        {/* Display Unit */}
                        <div className="col-span-3">
                          {materialDetails?.unit || '-'}
                        </div>
                        {/* Remove Button */}
                        <div className="col-span-1 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMaterial(item.materialId)}
                            className="h-8 w-8" // Smaller button
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Total Estimated Cost remains the same */}
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <div className="font-semibold">Total Estimasi Harga Modal</div>
                <div className="text-xl font-bold">
                  Rp {totalEstimatedCost.toLocaleString('id-ID')}
                </div>
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Estimasi ini dihitung berdasarkan harga dasar material yang terdaftar. Harga aktual dapat bervariasi.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InventorySidebar } from "@/components/inventory-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Plus, Upload, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Data dummy untuk warehouse
const dummyWarehouses = [
  { id: "1", name: "Gudang Pusat" },
  { id: "2", name: "Gudang Cabang A" },
  { id: "3", name: "Gudang Cabang B" },
];

// Data dummy untuk SKU (jika count type = By Merchant SKU)
const dummySKUs = [
  { id: "SKU-001", name: "Laptop Pro", available: 50 },
  { id: "SKU-002", name: "Mouse Wireless", available: 120 },
  { id: "SKU-003", name: "Keyboard RGB", available: 75 },
];

// Data dummy untuk Rak (jika count type = By Shelf)
const dummyShelves = [
  { id: "SHELF-A1", name: "Rak A1" },
  { id: "SHELF-B2", name: "Rak B2" },
  { id: "SHELF-C3", name: "Rak C3" },
];

interface SelectedItem {
  id: string;
  name: string;
  // Tambahkan properti lain jika perlu, misal 'available' untuk SKU
}

type CountType = 'sku' | 'shelf' | 'warehouse';

export default function AddStockCountPage() {
  const router = useRouter();
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [countType, setCountType] = useState<CountType>('sku');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleWarehouseChange = (value: string) => {
    setSelectedWarehouse(value);
    if (errors.warehouseId) {
      setErrors(prev => ({ ...prev, warehouseId: '' }));
    }
  };

  const handleCountTypeChange = (value: CountType) => {
    setCountType(value);
    setSelectedItems([]); // Reset selected items when count type changes
    if (errors.countType) {
      setErrors(prev => ({ ...prev, countType: '' }));
    }
  };

  // Fungsi placeholder untuk menambah item (SKU atau Rak)
  const handleSelectItem = () => {
    // Implementasi modal atau dropdown untuk memilih SKU/Rak
    console.log("Select Item clicked, type:", countType);
    // Contoh penambahan item dummy
    if (countType === 'sku' && selectedItems.length < dummySKUs.length) {
      const nextSku = dummySKUs[selectedItems.length];
      setSelectedItems(prev => [...prev, { id: nextSku.id, name: nextSku.name }]);
    } else if (countType === 'shelf' && selectedItems.length < dummyShelves.length) {
      const nextShelf = dummyShelves[selectedItems.length];
      setSelectedItems(prev => [...prev, { id: nextShelf.id, name: nextShelf.name }]);
    }
    if (errors.items) {
      setErrors(prev => ({ ...prev, items: '' }));
    }
  };

  // Fungsi untuk menghapus item terpilih
  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== itemId));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!selectedWarehouse) {
      newErrors.warehouseId = "Gudang harus dipilih.";
    }
    if (!countType) {
      newErrors.countType = "Tipe hitung harus dipilih.";
    }
    if ((countType === 'sku' || countType === 'shelf') && selectedItems.length === 0) {
      newErrors.items = countType === 'sku' ? "Minimal satu Merchant SKU harus dipilih." : "Minimal satu Rak harus dipilih.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => { // Make the function async
    if (validateForm()) {
      // Simulate API call to create stock count task
      console.log("Creating stock count task with data:", { selectedWarehouse, countType, selectedItems });
      try {
        // --- Start Simulation --- 
        // Replace this block with actual API call in the future
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        console.log("Stock count task created successfully (simulated).");
        // --- End Simulation --- 

        // Redirect after successful task creation
        router.push('/inventory/warehouse/count');
      } catch (error) {
        console.error("Failed to create stock count task (simulated):", error);
        // Optionally, show an error message to the user
        setErrors(prev => ({ ...prev, submit: "Gagal membuat tugas stock count. Silakan coba lagi." }));
      }
    }
  };

  return (
    <div className="[--header-height:calc(--spacing(14))] min-h-screen bg-muted/40">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <InventorySidebar />
          <SidebarInset>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                  Tambah Stock Count Baru
                </h1>
                {/* Optional: Badges or other info */}
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Detail Stock Count</CardTitle>
                  <CardDescription>Pilih gudang dan tipe perhitungan stok.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    {/* Warehouse Selection */}
                    <div className="grid gap-3">
                      <Label htmlFor="warehouse">Warehouse <span className="text-red-500">*</span></Label>
                      <Select onValueChange={handleWarehouseChange} value={selectedWarehouse}>
                        <SelectTrigger id="warehouse" aria-label="Pilih Gudang">
                          <SelectValue placeholder="Pilih Gudang" />
                        </SelectTrigger>
                        <SelectContent>
                          {dummyWarehouses.map((wh) => (
                            <SelectItem key={wh.id} value={wh.id}>{wh.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.warehouseId && <p className="text-sm text-red-500">{errors.warehouseId}</p>}
                    </div>

                    {/* Count Type Selection */}
                    <div className="grid gap-3">
                      <Label>Count Type <span className="text-red-500">*</span></Label>
                      <RadioGroup defaultValue="sku" value={countType} onValueChange={(value) => handleCountTypeChange(value as CountType)} className="flex space-x-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="sku" id="sku" />
                          <Label htmlFor="sku">By Merchant SKU</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="shelf" id="shelf" />
                          <Label htmlFor="shelf">By Shelf</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="warehouse" id="warehouse-type" />
                          <Label htmlFor="warehouse-type">By Warehouse</Label>
                        </div>
                      </RadioGroup>
                      {errors.countType && <p className="text-sm text-red-500">{errors.countType}</p>}
                    </div>

                    {/* Conditional Item Selection Area */}
                    {(countType === 'sku' || countType === 'shelf') && (
                      <div className="grid gap-3">
                        <Label>{countType === 'sku' ? 'Add Merchant SKU' : 'Add Shelf'} <span className="text-red-500">*</span></Label>
                        <Card className="border-dashed">
                          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[150px]">
                            {selectedItems.length === 0 ? (
                              <Button variant="outline" onClick={handleSelectItem}>
                                <Plus className="mr-2 h-4 w-4" /> {countType === 'sku' ? 'Select Merchant SKU' : 'Select Shelf'}
                              </Button>
                            ) : (
                              <div className="w-full">
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>{countType === 'sku' ? 'Merchant SKU' : 'Shelf Name'}</TableHead>
                                      <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {selectedItems.map((item) => (
                                      <TableRow key={item.id}>
                                        <TableCell>{item.name} ({item.id})</TableCell>
                                        <TableCell className="text-right">
                                          <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Remove</span>
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                                <div className="mt-4 flex justify-center">
                                  <Button variant="outline" size="sm" onClick={handleSelectItem}>
                                    <Plus className="mr-2 h-4 w-4" /> Add More
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                        {errors.items && <p className="text-sm text-red-500 mt-1">{errors.items}</p>}
                      </div>
                    )}
                    {errors.submit && <p className="text-sm text-red-500">{errors.submit}</p>} {/* Display submit error */}
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <div className="flex w-full justify-end gap-2">
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button onClick={handleSubmit}>Import & Update</Button> {/* Changed button text for consistency if needed, or keep as is */} 
                  </div>
                </CardFooter>
              </Card>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
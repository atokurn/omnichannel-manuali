'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InventorySidebar } from "@/components/inventory-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Save, Trash2, ScanLine, Keyboard, Edit, Info, ArrowRightLeft } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Data dummy untuk warehouse (ganti dengan data asli)
const dummyWarehouses = [
  { id: "1", name: "Gudang Pusat" },
  { id: "2", name: "Gudang Cabang A" },
  { id: "3", name: "Gudang Cabang B" },
];

// Data dummy untuk SKU (ganti dengan data asli)
const dummySKUs = [
  { id: "PRD-001", name: "Laptop Asus", sku: "PRD-001", availableStock: { "1": 50, "2": 10 } }, // Stok tersedia per gudang
  { id: "PRD-002", name: "Mouse Logitech", sku: "PRD-002", availableStock: { "1": 100, "3": 20 } },
  { id: "PRD-003", name: "Keyboard Mechanical", sku: "PRD-003", availableStock: { "1": 30, "2": 5, "3": 15 } },
  { id: "PRD-004", name: "Monitor LED 24\"", sku: "PRD-004", availableStock: { "1": 25 } },
  { id: "PRD-005", name: "Headset Gaming", sku: "PRD-005", availableStock: { "2": 40, "3": 10 } },
];

// Interface untuk item transfer
interface TransferItem {
  id: string; // ID unik sementara untuk client-side
  sku: string;
  name?: string;
  title?: string;
  available?: number; // Stok tersedia di gudang asal
  quantity: string;
}

export default function AddWarehouseTransferPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    sourceWarehouseId: "",
    destinationWarehouseId: "",
    notes: "",
    items: [] as TransferItem[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [itemErrors, setItemErrors] = useState<Record<string, Record<string, string>>>({});
  const [scanMode, setScanMode] = useState(true);
  const [skuInput, setSkuInput] = useState("");
  const [noteCharCount, setNoteCharCount] = useState(0);
  const skuInputRef = useRef<HTMLInputElement>(null);

  // Fungsi untuk menangani perubahan input form utama
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Reset item jika gudang asal berubah
    if (field === 'sourceWarehouseId') {
      setFormData(prev => ({ ...prev, items: [] }));
      setItemErrors({});
    }

    // Update character count for notes
    if (field === "notes") {
      setNoteCharCount(value.length);
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

  // Focus pada input SKU saat mode berubah
  useEffect(() => {
    if (skuInputRef.current) {
      skuInputRef.current.focus();
    }
  }, [scanMode]);

  // Fungsi untuk menangani perubahan input item
  const handleItemChange = (itemId: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));

    // Hapus error untuk field item yang diubah
    if (itemErrors[itemId]?.[field]) {
      setItemErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[itemId]) {
          delete newErrors[itemId][field];
          if (Object.keys(newErrors[itemId]).length === 0) {
            delete newErrors[itemId];
          }
        }
        return newErrors;
      });
    }
  };

  // Fungsi untuk menambah item baru berdasarkan SKU
  const addItem = () => {
    if (!formData.sourceWarehouseId) {
      setErrors(prev => ({ ...prev, sourceWarehouseId: "Pilih gudang asal terlebih dahulu." }));
      return;
    }

    const skuToAdd = skuInput.trim();
    if (!skuToAdd) return;

    const product = dummySKUs.find(p => p.sku === skuToAdd);
    if (!product) {
      // Handle SKU tidak ditemukan (opsional: tampilkan pesan error)
      console.warn(`SKU ${skuToAdd} tidak ditemukan.`);
      setSkuInput(""); // Reset input
      if (skuInputRef.current) skuInputRef.current.focus();
      return;
    }

    const availableStock = product.availableStock[formData.sourceWarehouseId] || 0;

    // Cek apakah item sudah ada di daftar
    const existingItemIndex = formData.items.findIndex(item => item.sku === skuToAdd);

    if (existingItemIndex > -1) {
      // Jika sudah ada, tambahkan quantity
      setFormData(prev => ({
        ...prev,
        items: prev.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: (parseInt(item.quantity || '0') + 1).toString() }
            : item
        )
      }));
    } else {
      // Jika belum ada, tambahkan item baru
      const newItem: TransferItem = {
        id: Date.now().toString(),
        sku: product.sku,
        name: product.name,
        title: product.name, // Atau gunakan field title jika ada
        available: availableStock,
        quantity: "1",
      };
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }

    // Reset input SKU
    setSkuInput("");

    // Focus kembali ke input SKU
    if (skuInputRef.current) {
      skuInputRef.current.focus();
    }
  };

  // Fungsi untuk menangani input SKU
  const handleSkuInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSkuInput(e.target.value);
  };

  // Fungsi untuk menangani keypress pada input SKU
  const handleSkuKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skuInput.trim() !== "") {
      e.preventDefault();
      addItem();
    }
  };

  // Fungsi untuk toggle mode input
  const toggleInputMode = () => {
    setScanMode(!scanMode);
  };

  // Fungsi untuk menghapus item
  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));

    // Hapus error untuk item yang dihapus
    if (itemErrors[itemId]) {
      setItemErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[itemId];
        return newErrors;
      });
    }
  };

  // Fungsi untuk mengubah quantity item
  const handleQuantityChange = (itemId: string, value: string) => {
    const numericValue = parseInt(value);
    if (isNaN(numericValue) || numericValue < 0) {
      value = '0'; // Set ke 0 jika input tidak valid atau negatif
    }

    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, quantity: value } : item
      )
    }));
  };

  // Fungsi validasi
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const newItemErrors: Record<string, Record<string, string>> = {};
    let isValid = true;

    if (!formData.sourceWarehouseId) {
      newErrors.sourceWarehouseId = "Gudang asal harus dipilih.";
      isValid = false;
    }
    if (!formData.destinationWarehouseId) {
      newErrors.destinationWarehouseId = "Gudang tujuan harus dipilih.";
      isValid = false;
    }
    if (formData.sourceWarehouseId && formData.destinationWarehouseId && formData.sourceWarehouseId === formData.destinationWarehouseId) {
      newErrors.destinationWarehouseId = "Gudang tujuan tidak boleh sama dengan gudang asal.";
      isValid = false;
    }
    if (formData.items.length === 0) {
      newErrors.items = "Minimal harus ada satu item untuk ditransfer.";
      isValid = false;
    }

    formData.items.forEach(item => {
      const itemError: Record<string, string> = {};
      const quantity = parseInt(item.quantity || '0');
      if (quantity <= 0) {
        itemError.quantity = "Jumlah harus lebih dari 0.";
        isValid = false;
      }
      if (item.available !== undefined && quantity > item.available) {
        itemError.quantity = `Jumlah melebihi stok tersedia (${item.available}).`;
        isValid = false;
      }
      if (Object.keys(itemError).length > 0) {
        newItemErrors[item.id] = itemError;
      }
    });

    setErrors(newErrors);
    setItemErrors(newItemErrors);
    return isValid;
  };

  // Fungsi untuk submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Submitting Transfer Data:", formData);
      // TODO: Kirim data ke API
      // Tampilkan notifikasi sukses
      // Redirect ke halaman daftar transfer
      router.push('/inventory/warehouse/transfer');
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
                  <span className="sr-only">Kembali</span>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                  Tambah Transfer Stok Gudang
                </h1>
              </div>

              <form onSubmit={handleSubmit}>
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Transfer</CardTitle>
                    <CardDescription>Pilih gudang asal, tujuan, dan tambahkan catatan jika perlu.</CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="sourceWarehouse">Gudang Asal</Label>
                        <Select
                          value={formData.sourceWarehouseId}
                          onValueChange={(value) => handleChange('sourceWarehouseId', value)}
                        >
                          <SelectTrigger id="sourceWarehouse" aria-label="Pilih Gudang Asal">
                            <SelectValue placeholder="Pilih Gudang Asal" />
                          </SelectTrigger>
                          <SelectContent>
                            {dummyWarehouses.map(wh => (
                              <SelectItem key={wh.id} value={wh.id}>
                                {wh.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.sourceWarehouseId && <p className="text-sm text-red-500 mt-1">{errors.sourceWarehouseId}</p>}
                      </div>
                      <div>
                        <Label htmlFor="destinationWarehouse">Gudang Tujuan</Label>
                        <Select
                          value={formData.destinationWarehouseId}
                          onValueChange={(value) => handleChange('destinationWarehouseId', value)}
                        >
                          <SelectTrigger id="destinationWarehouse" aria-label="Pilih Gudang Tujuan">
                            <SelectValue placeholder="Pilih Gudang Tujuan" />
                          </SelectTrigger>
                          <SelectContent>
                            {dummyWarehouses.map(wh => (
                              <SelectItem key={wh.id} value={wh.id} disabled={wh.id === formData.sourceWarehouseId}>
                                {wh.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.destinationWarehouseId && <p className="text-sm text-red-500 mt-1">{errors.destinationWarehouseId}</p>}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes">Catatan (Opsional)</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder="Tambahkan catatan transfer..."
                        maxLength={255}
                      />
                      <p className="text-xs text-muted-foreground text-right mt-1">{noteCharCount}/255</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Item Transfer</CardTitle>
                    <CardDescription>Tambahkan item yang akan ditransfer.</CardDescription>
                    {errors.items && <p className="text-sm text-red-500 mt-2">{errors.items}</p>}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="relative flex-1">
                        {scanMode ? (
                          <ScanLine className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Keyboard className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        )}
                        <Input
                          ref={skuInputRef}
                          type="text"
                          placeholder={scanMode ? "Scan atau ketik SKU..." : "Ketik SKU..."}
                          value={skuInput}
                          onChange={handleSkuInputChange}
                          onKeyPress={handleSkuKeyPress}
                          className="pl-8"
                          disabled={!formData.sourceWarehouseId} // Disable jika gudang asal belum dipilih
                        />
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button type="button" variant="outline" size="icon" onClick={toggleInputMode}>
                              {scanMode ? <Keyboard className="h-4 w-4" /> : <ScanLine className="h-4 w-4" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ganti ke mode {scanMode ? 'ketik' : 'scan'}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button type="button" onClick={addItem} disabled={!skuInput.trim() || !formData.sourceWarehouseId}>
                        <Plus className="mr-2 h-4 w-4" /> Tambah
                      </Button>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[150px]">SKU</TableHead>
                          <TableHead>Nama Produk</TableHead>
                          <TableHead className="w-[100px] text-right">Stok Asal</TableHead>
                          <TableHead className="w-[120px] text-right">Jumlah Transfer</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {formData.items.length > 0 ? (
                          formData.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.sku}</TableCell>
                              <TableCell>{item.title}</TableCell>
                              <TableCell className="text-right">{item.available ?? '-'}</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                  className={`w-20 text-right ${itemErrors[item.id]?.quantity ? 'border-red-500' : ''}`}
                                  min="1"
                                  max={item.available}
                                />
                                {itemErrors[item.id]?.quantity && (
                                  <p className="text-xs text-red-500 mt-1 text-right">{itemErrors[item.id].quantity}</p>
                                )}
                              </TableCell>
                              <TableCell>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem(item.id)}
                                        className="text-muted-foreground hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Hapus Item</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground">
                              Belum ada item yang ditambahkan.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="justify-end border-t p-4">
                    <Button type="button" variant="outline" className="mr-2" onClick={() => router.push('/inventory/warehouse/transfer')}>
                      Batal
                    </Button>
                    <Button type="submit">
                      <Save className="mr-2 h-4 w-4" /> Simpan Transfer
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
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
import { ArrowLeft, Plus, Save, Trash2, ScanLine, Keyboard, Edit, Info } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Data dummy untuk warehouse
const dummyWarehouses = [
  { id: "1", name: "Gudang Pusat" },
  { id: "2", name: "Gudang Cabang" },
];

// Data dummy untuk tipe stock-out
const stockOutTypes = [
  { id: "sales", name: "Penjualan" },
  { id: "transfer", name: "Transfer" },
  { id: "damage", name: "Rusak" },
  { id: "expired", name: "Kadaluarsa" },
  { id: "adjustment", name: "Penyesuaian" },
];

// Data dummy untuk SKU
const dummySKUs = [
  { id: "PRD-001", name: "Laptop Asus", sku: "PRD-001" },
  { id: "PRD-002", name: "Mouse Logitech", sku: "PRD-002" },
  { id: "PRD-003", name: "Keyboard Mechanical", sku: "PRD-003" },
  { id: "PRD-004", name: "Monitor LED 24\"", sku: "PRD-004" },
  { id: "PRD-005", name: "Headset Gaming", sku: "PRD-005" },
];

// Interface untuk item stock out
interface StockOutItem {
  id: string;
  sku: string;
  name?: string;
  title?: string;
  shelf?: string;
  area?: string;
  available?: number;
  quantity: string;
  reason?: string;
}

export default function AddStockOutPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    warehouseId: "",
    type: "",
    notes: "",
    items: [] as StockOutItem[],
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
  
  // Fungsi untuk menambah item baru
  const addItem = () => {
    // Untuk demo, kita akan menambahkan item dengan data dummy
    const newItem = { 
      id: Date.now().toString(), 
      sku: skuInput, 
      name: "TESTINGPAGE1",
      title: "BASICCLUB Eau De Toilette Around The World 8ml | 35ml | Pewangi tubuh by Geamoore",
      shelf: "Default Shelf",
      area: "Default Piling Area",
      available: 50,
      quantity: "1",
      reason: ""
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
    
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
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, quantity: value } : item
      )
    }));
  };
  
  // Fungsi untuk mengubah reason item
  const handleReasonChange = (itemId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, reason: value } : item
      )
    }));
  };

  // Fungsi untuk validasi form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const newItemErrors: Record<string, Record<string, string>> = {};
    let isValid = true;
    
    // Validasi form utama
    if (!formData.warehouseId) newErrors.warehouseId = "Warehouse harus dipilih";
    if (!formData.type) newErrors.type = "Tipe stock-out harus dipilih";
    
    // Validasi items
    formData.items.forEach(item => {
      const itemError: Record<string, string> = {};
      
      if (!item.sku) itemError.sku = "SKU harus dipilih";
      if (!item.quantity) {
        itemError.quantity = "Quantity harus diisi";
      } else if (isNaN(Number(item.quantity)) || Number(item.quantity) <= 0) {
        itemError.quantity = "Quantity harus berupa angka positif";
      } else if (Number(item.quantity) > (item.available || 0)) {
        itemError.quantity = `Quantity tidak boleh melebihi stok tersedia (${item.available})`;
      }
      
      if (Object.keys(itemError).length > 0) {
        newItemErrors[item.id] = itemError;
        isValid = false;
      }
    });
    
    // Validasi minimal harus ada 1 item
    if (formData.items.length === 0) {
      newErrors.items = "Minimal harus ada 1 item";
      isValid = false;
    }
    
    setErrors(newErrors);
    setItemErrors(newItemErrors);
    
    return isValid && Object.keys(newErrors).length === 0;
  };

  // Fungsi untuk menangani submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Di sini akan ada kode untuk mengirim data ke API
      console.log("Form data submitted:", formData);
      
      // Redirect ke halaman stock-out setelah berhasil
      router.push("/inventory/stock/stock-out");
    }
  };

  // Fungsi untuk kembali ke halaman sebelumnya
  const handleBack = () => {
    router.back();
  };

  return (
    <div className="w-full h-full">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Tambah Stock Out</h1>
              <p className="text-sm text-muted-foreground">Tambahkan data barang keluar dari gudang</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleBack}>
              Batal
            </Button>
            <Button type="submit" form="stock-out-form">
              <Save className="mr-2 h-4 w-4" />
              Simpan
            </Button>
          </div>
        </div>
        <div className="flex-1 p-4 overflow-auto">
          <Card>
                <form id="stock-out-form" onSubmit={handleSubmit}>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="warehouse">Warehouse</Label>
                        <Select 
                          value={formData.warehouseId} 
                          onValueChange={(value) => handleChange("warehouseId", value)}
                        >
                          <SelectTrigger id="warehouse" className={errors.warehouseId ? "border-red-500" : ""}>
                            <SelectValue placeholder="Pilih Warehouse" />
                          </SelectTrigger>
                          <SelectContent>
                            {dummyWarehouses.map((warehouse) => (
                              <SelectItem key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.warehouseId && <p className="text-red-500 text-sm">{errors.warehouseId}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type">Tipe Stock Out</Label>
                        <Select 
                          value={formData.type} 
                          onValueChange={(value) => handleChange("type", value)}
                        >
                          <SelectTrigger id="type" className={errors.type ? "border-red-500" : ""}>
                            <SelectValue placeholder="Pilih Tipe" />
                          </SelectTrigger>
                          <SelectContent>
                            {stockOutTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">Note</Label>
                      <div className="relative">
                        <Textarea 
                          id="notes" 
                          placeholder="Tambahkan catatan (opsional)" 
                          value={formData.notes}
                          onChange={(e) => handleChange("notes", e.target.value)}
                          rows={2}
                          maxLength={500}
                          className="pr-16"
                        />
                        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                          {noteCharCount} / 500
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Scan/Enter</Label>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer" onClick={toggleInputMode}>
                            <div className="flex items-center">
                              <input 
                                type="checkbox" 
                                checked={!scanMode} 
                                onChange={toggleInputMode} 
                                className="mr-1"
                              />
                              Switch input method to {scanMode ? "[EN]" : "[SCAN]"} before scanning
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Select defaultValue="Merchant SKU/GTIN">
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select input type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Merchant SKU/GTIN">Merchant SKU/GTIN</SelectItem>
                              <SelectItem value="Barcode">Barcode</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-[3] relative">
                          <Input
                            ref={skuInputRef}
                            value={skuInput}
                            onChange={handleSkuInputChange}
                            onKeyPress={handleSkuKeyPress}
                            placeholder={scanMode ? "Scan barcode..." : "Enter SKU and press Enter"}
                            className="w-full"
                          />
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                            {scanMode ? <ScanLine className="h-4 w-4 text-muted-foreground" /> : <Keyboard className="h-4 w-4 text-muted-foreground" />}
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          className="bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => skuInput.trim() !== "" && addItem()}
                        >
                          + Select Merchant SKU
                        </Button>
                      </div>
                      
                      {errors.items && <p className="text-red-500 text-sm">{errors.items}</p>}
                      
                      {formData.items.length > 0 && (
                        <div className="border rounded-md overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[80px]">SKU Name</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead className="w-[100px]">Shelf</TableHead>
                                <TableHead className="w-[100px]">Area</TableHead>
                                <TableHead className="w-[80px]">Available</TableHead>
                                <TableHead className="w-[120px]">
                                  <div className="flex items-center gap-1">
                                    Stock-Out Qty
                                    <Badge variant="outline" className="ml-1 text-xs">Bulk Edit</Badge>
                                  </div>
                                </TableHead>
                                <TableHead className="w-[120px]">
                                  <div className="flex items-center gap-1">
                                    Reason
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Info className="h-3 w-3 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Alasan barang keluar</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </TableHead>
                                <TableHead className="w-[80px]">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {formData.items.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-medium">
                                    <div className="flex items-center gap-2">
                                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                        <img src="/file.svg" alt="Product" className="w-6 h-6" />
                                      </div>
                                      <div>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-xs text-muted-foreground">{item.sku}</div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="max-w-[200px] truncate">{item.title}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      {item.shelf} <Edit className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                  </TableCell>
                                  <TableCell>{item.area}</TableCell>
                                  <TableCell>{item.available}</TableCell>
                                  <TableCell>
                                    <Input 
                                      type="number" 
                                      value={item.quantity}
                                      onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                      min="1"
                                      max={item.available?.toString()}
                                      className="w-20"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Select 
                                      value={item.reason || ""} 
                                      onValueChange={(value) => handleReasonChange(item.id, value)}
                                    >
                                      <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Pilih alasan" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {stockOutTypes.map((type) => (
                                          <SelectItem key={type.id} value={type.id}>
                                            {type.name}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell>
                                    <Button 
                                      type="button" 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => removeItem(item.id)}
                                      className="text-indigo-600 hover:text-indigo-800"
                                    >
                                      <Trash2 className="h-4 w-4" />
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
                </form>
              </Card>
            </div>
        </div>
    </div>
  );
}
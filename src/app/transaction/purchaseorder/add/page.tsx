"use client";

import React, { useState, useRef } from 'react'; // Import useRef
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Save, SendHorizonal, Trash2, Package, Calendar as CalendarIcon, Info } from 'lucide-react'; // Added Package icon, CalendarIcon, Info
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Added RadioGroup
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // Added Popover
import { Calendar } from "@/components/ui/calendar"; // Added Calendar
import { format } from "date-fns"; // Added date-fns
import { cn } from "@/lib/utils"; // Added cn
import { SiteHeader } from '@/components/site-header';
import { TransactionSidebar } from '@/components/transaction-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import Image from 'next/image'; // Import Image component
import { ScrollArea } from "@/components/ui/scroll-area"; // Added ScrollArea
import { Textarea } from '@/components/ui/textarea'; // Added Textarea
import { SelectProductsDialog } from '@/components/select-products-dialog'; // Import the dialog

// Interface for Item Detail (Rincian Barang)
// Updated ItemDetail interface to match product structure from dialog
interface ItemDetail {
  id: string;
  productId: string; // ID produk induk
  variantId?: string; // ID varian jika ada
  name: string;
  sku: string; // Menambahkan field SKU
  quantity: number;
  unit: string;
  buyPrice: number;
  discount: number;
  total: number;
  // Add other relevant fields from the product data if needed
  category?: string;
  type?: string;
  stock?: number;
  variant?: string; // Informasi varian (misalnya "Warna: test")
}

const AddPurchaseOrderPage = () => {
  const router = useRouter();
  const [items, setItems] = useState<ItemDetail[]>([]); // State for item details
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('fixed');
  const [discountValue, setDiscountValue] = useState<string>('0');
  const [taxType, setTaxType] = useState<'none' | 'include' | 'exclude'>('none');
  const [taxValue, setTaxValue] = useState<string>('0');
  const [otherCosts, setOtherCosts] = useState<{ id: string; name: string; amount: string }[]>([]);
  const [downPaymentEnabled, setDownPaymentEnabled] = useState(false);
  const [downPaymentAmount, setDownPaymentAmount] = useState<string>('0'); // Assuming down payment needs an amount input
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date()); // State for date picker
  const [stockSource, setStockSource] = useState<string>('no_reference'); // State for stock source radio
  const [activeSection, setActiveSection] = useState<string>("Sumber Stok"); // State for active section

  // Refs for scrolling
  const stockSourceRef = useRef<HTMLDivElement>(null);
  const orderInfoRef = useRef<HTMLDivElement>(null);
  const itemDetailsRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const notesRef = useRef<HTMLDivElement>(null);

  const scrollToRef = (ref: React.RefObject<HTMLDivElement>, title: string) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(title);
  };

  const handleBack = () => {
    router.push('/transaction/purchaseorder');
  };

  const handleAddItem = () => {
    // Logic to open a modal or navigate to add/select items
    console.log('Atur Barang clicked');
  };

  // Handler for saving selected products from the dialog
  const handleSaveSelectedProducts = (selectedProducts: any[]) => {
    // Buat map dari item yang sudah ada untuk referensi cepat
    const existingItemsMap = items.reduce((map, item) => {
      // Gunakan ID unik yang mencakup informasi varian jika ada
      const uniqueId = item.id;
      map[uniqueId] = item;
      return map;
    }, {} as Record<string, ItemDetail>);
  
    // Map selected products to the ItemDetail structure
    // Pertahankan nilai quantity, discount, dan total jika item sudah ada
    const newItems: ItemDetail[] = selectedProducts.map(product => {
      // Buat ID unik untuk produk, termasuk informasi varian jika ada
      const uniqueId = product.variantId 
        ? `${product.id}_${product.variantId}` 
        : product.id;
      
      // Cek apakah produk sudah ada dalam daftar
      const existingItem = existingItemsMap[uniqueId];
      
      if (existingItem) {
        // Jika produk sudah ada, pertahankan nilai quantity, discount, dan total
        return {
          ...product,
          id: uniqueId, // Gunakan ID unik
          productId: product.id, // Simpan ID produk induk
          sku: product.sku || '-', // Gunakan SKU dari produk
          quantity: existingItem.quantity,
          unit: existingItem.unit,
          discount: existingItem.discount,
          total: existingItem.total,
          // Pastikan buyPrice dipertahankan jika ada perubahan
          buyPrice: product.buyPrice || existingItem.buyPrice,
          variant: product.hasVariants ? product.options ? Object.entries(product.options)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ') : '' : ''
        };
      } else {
        // Jika produk baru, inisialisasi dengan nilai default
        return {
          ...product,
          id: uniqueId, // Gunakan ID unik
          productId: product.id, // Simpan ID produk induk
          sku: product.sku || '-', // Gunakan SKU dari produk
          quantity: 1, // Default quantity to 1, allow user to change later
          unit: 'Pcs', // Default unit, adjust as needed
          discount: 0, // Default discount
          total: product.buyPrice * 1, // Initial total based on default quantity
          variant: product.hasVariants ? product.options ? Object.entries(product.options)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ') : '' : ''
        };
      }
    });
  
    // Update state dengan item baru
    setItems(newItems);
    console.log('Selected products saved:', newItems);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Function to update item quantity, discount, etc.
  const handleItemChange = (id: string, field: keyof ItemDetail, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate total when quantity, price, or discount changes
        if (field === 'quantity' || field === 'buyPrice' || field === 'discount') {
          const quantity = field === 'quantity' ? Number(value) : item.quantity;
          const price = field === 'buyPrice' ? Number(value) : item.buyPrice;
          const discount = field === 'discount' ? Number(value) : item.discount;
          // Basic total calculation, adjust based on discount type (fixed/percentage)
          updatedItem.total = (quantity * price) - discount;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleAddOtherCost = () => {
    setOtherCosts([...otherCosts, { id: Date.now().toString(), name: '', amount: '' }]);
  };

  const handleRemoveOtherCost = (id: string) => {
    setOtherCosts(otherCosts.filter(cost => cost.id !== id));
  };

  const handleOtherCostChange = (id: string, field: 'name' | 'amount', value: string) => {
    setOtherCosts(otherCosts.map(cost => cost.id === id ? { ...cost, [field]: value } : cost));
  };

  // Calculate totals (implement logic based on items, discount, tax, other costs)
  const calculateSubtotal = () => items.reduce((sum, item) => sum + item.total, 0);
  const calculateDiscountAmount = () => {
    const sub = calculateSubtotal();
    if (discountType === 'percentage') {
      return sub * (Number(discountValue) / 100);
    }
    return Number(discountValue) || 0;
  }; // Placeholder
  const calculateTaxAmount = () => {
    const subAfterDiscount = calculateSubtotal() - calculateDiscountAmount();
    if (taxType === 'include' || taxType === 'exclude') {
        // Assuming taxValue is percentage for now
        const taxRate = Number(taxValue) / 100;
        if (taxType === 'include') {
            // Tax is included in the subtotal after discount
            // Amount = (SubtotalAfterDiscount * TaxRate) / (1 + TaxRate)
            return (subAfterDiscount * taxRate) / (1 + taxRate);
        } else { // exclude
            // Tax is added on top of subtotal after discount
            // Amount = SubtotalAfterDiscount * TaxRate
            return subAfterDiscount * taxRate;
        }
    } 
    return 0;
  }; // Placeholder
  const calculateTotalOtherCosts = () => otherCosts.reduce((sum, cost) => sum + (Number(cost.amount) || 0), 0); // Calculate total other costs
  const calculateTotal = () => {
    const sub = calculateSubtotal();
    const disc = calculateDiscountAmount();
    const other = calculateTotalOtherCosts();
    let tax = calculateTaxAmount();

    let baseForTotal = sub - disc;
    let totalAmount = baseForTotal + other;

    // If tax is excluded, add it to the total
    if (taxType === 'exclude') {
        totalAmount += tax;
    } 
    // If tax is included, it's already part of the subtotal calculation logic,
    // but we need the tax amount itself for display. The total remains base + other.
    // Note: The calculateTaxAmount already handles the 'include' logic correctly for display.

    return totalAmount;
  }; // Placeholder

  const subtotal = calculateSubtotal();
  const discountAmount = calculateDiscountAmount();
  const taxAmount = calculateTaxAmount();
  const totalOtherCosts = calculateTotalOtherCosts();
  const total = calculateTotal();

  const navigationItems = [
    { title: "Sumber Stok", ref: stockSourceRef },
    { title: "Informasi Pemesanan", ref: orderInfoRef },
    { title: "Rincian Barang", ref: itemDetailsRef },
    { title: "Ringkasan", ref: summaryRef },
    { title: "Catatan", ref: notesRef },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Button variant="outline" size="icon" onClick={handleBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Kembali</span>
        </Button>
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
          Detail Pemesanan Stok
        </h1>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm">
            Simpan sebagai draf
          </Button>
          <Button size="sm">
            <SendHorizonal className="h-4 w-4 mr-2" />
            Kirim
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 p-4 md:p-8">
        {/* Left Navigation Panel */}
        <aside className="w-full md:w-64 lg:w-72">
        <Card className="sticky top-18">
        <CardContent className='grid gap-4'>
          <ScrollArea className="pr-4">
            <nav className="grid gap-1 text-sm text-muted-foreground">
              {navigationItems.map((item) => (
                <a
                  key={item.title}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToRef(item.ref, item.title);
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                    activeSection === item.title ? "bg-muted text-primary font-semibold" : ""
                  )}
                >
                  <Info className="h-4 w-4" /> {/* Placeholder icon */}
                  {item.title}
                </a>
              ))}
            </nav>
          </ScrollArea>
        </CardContent>
        </Card>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 grid gap-6">
          {/* Sumber Stok Card */}
          <div ref={stockSourceRef}>
            <Card>
              <CardHeader>
                <CardTitle>Sumber Stok</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup defaultValue="no_reference" value={stockSource} onValueChange={setStockSource} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Label
                    htmlFor="no_reference"
                    className={cn(
                      "flex flex-col items-start space-y-1 rounded-md border-2 p-4 transition-colors hover:border-accent",
                      stockSource === 'no_reference' ? "border-primary" : "border-muted"
                    )}
                  >
                    <div className="flex items-center w-full">
                      <RadioGroupItem value="no_reference" id="no_reference" className="mr-2" />
                      <span className="font-semibold flex-1">Tanpa Referensi</span>
                    </div>
                    <span className="text-sm text-muted-foreground ml-6">Kirim pemesanan form yang tersedia</span>
                  </Label>
                  <Label
                    htmlFor="with_reference"
                    className={cn(
                      "flex flex-col items-start space-y-1 rounded-md border-2 p-4 transition-colors hover:border-accent",
                      stockSource === 'with_reference' ? "border-primary" : "border-muted"
                    )}
                  >
                    <div className="flex items-center w-full">
                      <RadioGroupItem value="with_reference" id="with_reference" className="mr-2" />
                      <span className="font-semibold flex-1">Referensikan Permintaan Barang</span>
                    </div>
                    <span className="text-sm text-muted-foreground ml-6">Tambahkan stok melalui permintaan barang</span>
                  </Label>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Informasi Pemesanan Stok Card */}
          <div ref={orderInfoRef}>
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pemesanan Stok</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="outlet">Daftar Gudang <span className="text-red-500">*</span></Label>
                  <Select defaultValue="gudang_default">
                    <SelectTrigger id="outlet">
                      <SelectValue placeholder="Pilih Gudang" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gudang_default">Toko Saranjana</SelectItem>
                      {/* Add other outlets here */}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="supplier">Suplier <span className="text-red-500">*</span></Label>
                  <Select defaultValue="agen_sopi">
                    <SelectTrigger id="supplier">
                      <SelectValue placeholder="Pilih Suplier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="agen_sopi">agen sopi</SelectItem>
                      {/* Add other suppliers here */}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 md:col-span-2">
                  <Label>Alamat <span className="text-red-500">*</span></Label>
                  <div className="text-sm text-muted-foreground grid grid-cols-[auto_1fr] gap-x-2">
                    <span>Alamat</span><span>: Jl Karyawistasa</span>
                    <span>No Ponsel</span><span>: 085467867954</span>
                    <span>Email</span><span>: ester@gmail.com</span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="po-number">Nomor Pemesanan Stok <span className="text-red-500">*</span></Label>
                  <Input id="po-number" defaultValue="PO/250423/12W" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="po-date">Tanggal Pemesanan Stok <span className="text-red-500">*</span></Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP HH:mm") : <span>Pilih tanggal</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                      {/* Add time picker if needed */}
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rincian Barang Card */}
          <div ref={itemDetailsRef}>
            <Card>
              <CardHeader>
                <CardTitle>Rincian Barang</CardTitle>
                <CardDescription>Atur barang yang akan dipesan.</CardDescription>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-muted rounded-lg">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">Belum ada barang yang ditambahkan</p>
                    {/* Replace Button with SelectProductsDialog */}
                    <SelectProductsDialog
                      trigger={
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Atur Barang
                        </Button>
                      }
                      onSave={handleSaveSelectedProducts}
                      initialSelectedProducts={items}
                    />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead>Satuan</TableHead>
                        <TableHead className="text-right">Harga Satuan</TableHead>
                        <TableHead className="text-right">Diskon (Rp)</TableHead>
                        <TableHead className="text-right">Total Harga</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Map through items here */}
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.name}
                            {item.variant && (
                              <div className="text-xs text-muted-foreground mt-1">{item.variant}</div>
                            )}
                          </TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell className="text-right">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                              className="h-8 w-[70px] text-right"
                            />
                          </TableCell>
                          <TableCell>
                             {/* Assuming unit is fixed for now, make it editable if needed */}
                            {item.unit}
                          </TableCell>
                          <TableCell className="text-right">Rp {item.buyPrice ? item.buyPrice.toLocaleString('id-ID') : '0'}</TableCell>
                          <TableCell className="text-right">
                             <Input
                              type="number"
                              min="0"
                              value={item.discount}
                              onChange={(e) => handleItemChange(item.id, 'discount', Number(e.target.value))}
                              className="h-8 w-[90px] text-right"
                              placeholder="0"
                            />
                          </TableCell>
                          <TableCell className="text-right">Rp {item.total ? item.total.toLocaleString('id-ID') : '0'}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              {items.length > 0 && (
                <CardFooter className="border-t pt-4">
                   {/* Use Dialog trigger here as well */}
                   <SelectProductsDialog
                      trigger={
                        <Button variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Tambah Barang Lain
                        </Button>
                      }
                      onSave={handleSaveSelectedProducts}
                      initialSelectedProducts={items}
                    />
                </CardFooter>
              )}
            </Card>
          </div>

          {/* Ringkasan Card */}
          <div ref={summaryRef}>
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rp {subtotal ? subtotal.toLocaleString('id-ID') : '0'}</span>
                </div>
                <Separator />
                {/* Discount Section */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="discount-type" className="flex items-center gap-2">
                    Diskon
                    <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => setDiscountType(value)}>
                      <SelectTrigger id="discount-type" className="h-8 w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed">Rp</SelectItem>
                        <SelectItem value="percentage">%</SelectItem>
                      </SelectContent>
                    </Select>
                  </Label>
                  <Input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="h-8 w-[100px] text-right"
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Jumlah Diskon</span>
                  <span>- Rp {discountAmount ? discountAmount.toLocaleString('id-ID') : '0'}</span>
                </div>
                <Separator />
                {/* Tax Section */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="tax-type" className="flex items-center gap-2">
                    Pajak
                    <Select value={taxType} onValueChange={(value: 'none' | 'include' | 'exclude') => setTaxType(value)}>
                      <SelectTrigger id="tax-type" className="h-8 w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Tidak Ada</SelectItem>
                        <SelectItem value="include">Termasuk</SelectItem>
                        <SelectItem value="exclude">Tidak Termasuk</SelectItem>
                      </SelectContent>
                    </Select>
                  </Label>
                  <Input
                    type="number"
                    value={taxValue}
                    onChange={(e) => setTaxValue(e.target.value)}
                    className="h-8 w-[100px] text-right"
                    placeholder="0"
                    disabled={taxType === 'none'}
                  />
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Jumlah Pajak</span>
                  <span>Rp {taxAmount ? taxAmount.toLocaleString('id-ID') : '0'}</span>
                </div>
                <Separator />
                {/* Other Costs Section */}
                {otherCosts.map((cost, index) => (
                  <div key={`${cost.id}-${index}`} className="flex items-center justify-between gap-2">
                    <Input
                      value={cost.name}
                      onChange={(e) => handleOtherCostChange(cost.id, 'name', e.target.value)}
                      placeholder={`Biaya Lain ${index + 1}`}
                      className="h-8 flex-1"
                    />
                    <Input
                      type="number"
                      value={cost.amount}
                      onChange={(e) => handleOtherCostChange(cost.id, 'amount', e.target.value)}
                      className="h-8 w-[100px] text-right"
                      placeholder="0"
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveOtherCost(cost.id)} className="h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddOtherCost} className="w-fit">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Biaya Lain
                </Button>
                <Separator />
                {/* Down Payment Section */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="down-payment"
                      checked={downPaymentEnabled}
                      onCheckedChange={setDownPaymentEnabled}
                    />
                    <Label htmlFor="down-payment">Uang Muka</Label>
                  </div>
                  <Input
                    type="number"
                    value={downPaymentAmount}
                    onChange={(e) => setDownPaymentAmount(e.target.value)}
                    className="h-8 w-[150px] text-right"
                    placeholder="Jumlah Uang Muka"
                    disabled={!downPaymentEnabled}
                  />
                </div>
                <Separator />
                {/* Total Section */}
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>Rp {total ? total.toLocaleString('id-ID') : '0'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Catatan Card */}
          <div ref={notesRef}>
            <Card>
              <CardHeader>
                <CardTitle>Catatan</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea placeholder="Tambahkan catatan untuk pemesanan ini..." />
              </CardContent>
            </Card>
          </div>

        </main>
      </div>
    </div>
  );
};

export default AddPurchaseOrderPage;
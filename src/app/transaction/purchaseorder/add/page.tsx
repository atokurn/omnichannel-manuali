"use client";

import React, { useState, useRef } from 'react'; // Import useRef
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

// Interface for Item Detail (Rincian Barang)
interface ItemDetail {
  id: string;
  // Add properties for item details like name, quantity, unit, price, discount, total
  // Example:
  // name: string;
  // quantity: number;
  // unit: string;
  // price: number;
  // discount: number;
  // total: number;
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
  const calculateSubtotal = () => 0; // Placeholder
  const calculateDiscountAmount = () => 0; // Placeholder
  const calculateTaxAmount = () => 0; // Placeholder
  const calculateTotalOtherCosts = () => otherCosts.reduce((sum, cost) => sum + (Number(cost.amount) || 0), 0); // Calculate total other costs
  const calculateTotal = () => {
    const sub = calculateSubtotal();
    const disc = calculateDiscountAmount();
    const tax = calculateTaxAmount();
    const other = calculateTotalOtherCosts();
    // Adjust calculation based on tax type (include/exclude)
    // Placeholder logic:
    return sub - disc + tax + other;
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
                    <Button onClick={handleAddItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Atur Barang
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Barang</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead>Satuan</TableHead>
                        <TableHead className="text-right">Harga Satuan</TableHead>
                        <TableHead className="text-right">Diskon</TableHead>
                        <TableHead className="text-right">Total Harga</TableHead>
                        <TableHead></TableHead> {/* For actions */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Map through items here */}
                      {/* Example Row (replace with actual data mapping) */}
                      <TableRow>
                        <TableCell>Contoh Barang</TableCell>
                        <TableCell className="text-right">1</TableCell>
                        <TableCell>Pcs</TableCell>
                        <TableCell className="text-right">Rp 10.000</TableCell>
                        <TableCell className="text-right">Rp 0</TableCell>
                        <TableCell className="text-right">Rp 10.000</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              {items.length > 0 && (
                <CardFooter className="border-t pt-4">
                  <Button variant="outline" onClick={handleAddItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Barang Lain
                  </Button>
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
                  <span>Rp {subtotal.toLocaleString('id-ID')}</span>
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
                  <span>- Rp {discountAmount.toLocaleString('id-ID')}</span>
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
                  <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
                </div>
                <Separator />
                {/* Other Costs Section */}
                {otherCosts.map((cost, index) => (
                  <div key={cost.id} className="flex items-center justify-between gap-2">
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
                  <span>Rp {total.toLocaleString('id-ID')}</span>
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
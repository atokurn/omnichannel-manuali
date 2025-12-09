'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { OrdersSidebar } from '@/components/orders-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar as CalendarIcon, Clock, Plus, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, setHours, setMinutes, setSeconds } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Combobox } from "@/components/ui/combobox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface SaleFormData {
  orderId: string;
  orderDate: Date | undefined;
  platform: string;
  income: string;
  priceAfterDiscount: string;
  totalFees: string;
  platformFees: string;
  affiliateCommission: string;
  refund: string;
  warehouseId: string;
}

interface SaleItem {
  key: string; // unique key for UI list
  productId: string;
  quantity: number;
  price: number;
}

const platformOptions = [
  { id: 'shopee', name: 'Shopee' },
  { id: 'tokopedia', name: 'Tokopedia' },
  { id: 'lazada', name: 'Lazada' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'manual', name: 'Manual' },
];

export default function AddSalePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<SaleFormData>({
    orderId: '',
    orderDate: new Date(),
    platform: '',
    income: '0',
    priceAfterDiscount: '0',
    totalFees: '0',
    platformFees: '0',
    affiliateCommission: '0',
    refund: '0',
    warehouseId: ''
  });

  const [items, setItems] = useState<SaleItem[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderHour, setOrderHour] = useState<string>(format(formData.orderDate ?? new Date(), 'HH'));
  const [orderMinute, setOrderMinute] = useState<string>(format(formData.orderDate ?? new Date(), 'mm'));

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prodRes, wareRes] = await Promise.all([
          fetch('/api/products?limit=100'),
          fetch('/api/warehouses')
        ]);

        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(data.data || []);
        }
        if (wareRes.ok) {
          const data = await wareRes.json();
          setWarehouses(data);
          if (data.length > 0) {
            setFormData(prev => ({ ...prev, warehouseId: data[0].id }));
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat data produk/gudang");
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, []);

  const handleInputChange = (field: keyof SaleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addItem = () => {
    setItems([...items, { key: crypto.randomUUID(), productId: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (key: string) => {
    setItems(items.filter(i => i.key !== key));
  };

  const updateItem = (key: string, field: keyof SaleItem, value: any) => {
    setItems(items.map(i => {
      if (i.key === key) {
        const updated = { ...i, [field]: value };
        // Auto-fetch price if product changes? 
        if (field === 'productId') {
          const prod = products.find(p => p.id === value);
          if (prod) updated.price = prod.price;
        }
        return updated;
      }
      return i;
    }));
  };

  // Date handlers...
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const currentHour = parseInt(orderHour);
      const currentMinute = parseInt(orderMinute);
      const newDate = setSeconds(setMinutes(setHours(selectedDate, currentHour), currentMinute), 0);
      setFormData(prev => ({ ...prev, orderDate: newDate }));
      if (errors.orderDate) {
        setErrors(prev => { const newErrors = { ...prev }; delete newErrors.orderDate; return newErrors; });
      }
    }
  };

  const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
    let numericValue = parseInt(value);
    if (isNaN(numericValue)) numericValue = 0;
    let newDate = formData.orderDate ?? new Date();

    if (type === 'hour') {
      if (numericValue < 0) numericValue = 0;
      if (numericValue > 23) numericValue = 23;
      setOrderHour(numericValue.toString().padStart(2, '0'));
      newDate = setHours(newDate, numericValue);
    } else {
      if (numericValue < 0) numericValue = 0;
      if (numericValue > 59) numericValue = 59;
      setOrderMinute(numericValue.toString().padStart(2, '0'));
      newDate = setMinutes(newDate, numericValue);
    }
    setFormData(prev => ({ ...prev, orderDate: setSeconds(newDate, 0) }));
  };

  const setTimeToNow = () => {
    const now = new Date();
    setFormData(prev => ({ ...prev, orderDate: now }));
    setOrderHour(format(now, 'HH'));
    setOrderMinute(format(now, 'mm'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orderId.trim()) { toast.error("Order ID wajib diisi"); return; }
    if (!formData.warehouseId) { toast.error("Gudang wajib dipilih"); return; }
    if (items.length === 0) { toast.error("Minimal satu produk harus dipilih"); return; }

    // Check incomplete items
    for (const item of items) {
      if (!item.productId) { toast.error("Semua baris produk harus dipilih"); return; }
      if (item.quantity <= 0) { toast.error("Jumlah qty harus positif"); return; }
    }

    setIsSubmitting(true);
    try {
      const finalOrderDate = setSeconds(setMinutes(setHours(formData.orderDate ?? new Date(), parseInt(orderHour)), parseInt(orderMinute)), 0);

      const payload = {
        orderId: formData.orderId,
        date: finalOrderDate.toISOString(),
        warehouseId: formData.warehouseId,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        notes: `Platform: ${formData.platform}, Income: ${formData.income}`,
        // We could send financial data as 'notes' or specific fields if backend supported them.
        // For now backend validates 'items' mostly.
      };

      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.message || 'Gagal menyimpan penjualan');
      }

      toast.success("Penjualan berhasil disimpan!");
      router.push('/orders/sales');

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="[--header-height:calc(--spacing(14))] min-h-screen">
      <SidebarProvider className="flex flex-col min-h-screen">
        <SiteHeader />
        <div className="flex flex-1">
          <OrdersSidebar />
          <main className="flex-1 p-4 pl-[--sidebar-width]">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => router.push('/orders/sales')}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <CardTitle>Catat Penjualan Baru</CardTitle>
                    <CardDescription>Masukkan detail penjualan dan produk yang terjual.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">

                  {/* Bagian 1: Detail Transaksi */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg bg-muted/20">
                    <div className="space-y-4">
                      <div>
                        <Label>Order ID</Label>
                        <Input value={formData.orderId} onChange={(e) => handleInputChange('orderId', e.target.value)} placeholder="Contoh: INV-2023001" />
                      </div>
                      <div>
                        <Label>Platform</Label>
                        <Select onValueChange={(val) => handleInputChange('platform', val)} value={formData.platform}>
                          <SelectTrigger><SelectValue placeholder="Pilih Platform" /></SelectTrigger>
                          <SelectContent>
                            {platformOptions.map((opt) => <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Income Total (Financial Report)</Label>
                        <Input type="number" value={formData.income} onChange={(e) => handleInputChange('income', e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label>Tanggal Order</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !formData.orderDate && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.orderDate ? format(formData.orderDate, "dd MMMM yyyy, HH:mm", { locale: id }) : <span>Pilih tanggal</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 flex flex-col sm:flex-row">
                            <CalendarComponent mode="single" selected={formData.orderDate} onSelect={handleDateSelect} initialFocus locale={id} />
                            <div className="p-3 border-t sm:border-t-0 sm:border-l border-border flex flex-col items-center justify-center space-y-4">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium">Waktu</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Input type="number" min="0" max="23" value={orderHour} onChange={(e) => handleTimeChange('hour', e.target.value)} className="w-16 h-9 text-center" />
                                <span>:</span>
                                <Input type="number" min="0" max="59" value={orderMinute} onChange={(e) => handleTimeChange('minute', e.target.value)} className="w-16 h-9 text-center" />
                              </div>
                              <Button variant="outline" size="sm" onClick={setTimeToNow} className="w-full">Hari ini</Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <Label>Gudang Asal (Stok Keluar)</Label>
                        <Select onValueChange={(val) => handleInputChange('warehouseId', val)} value={formData.warehouseId}>
                          <SelectTrigger><SelectValue placeholder="Pilih Gudang" /></SelectTrigger>
                          <SelectContent>
                            {warehouses.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Bagian 2: Produk / Line Items */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Item Penjualan (Pengurangan Stok & COGS)</h3>
                      <Button type="button" size="sm" onClick={addItem}><Plus className="mr-2 h-4 w-4" /> Tambah Produk</Button>
                    </div>

                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40%]">Produk</TableHead>
                            <TableHead className="w-[20%]">Harga Satuan</TableHead>
                            <TableHead className="w-[20%]">Jumlah</TableHead>
                            <TableHead className="w-[10%]">Total</TableHead>
                            <TableHead className="w-[10%]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Belum ada item. Klik "Tambah Produk".</TableCell></TableRow>
                          ) : (
                            items.map((item) => (
                              <TableRow key={item.key}>
                                <TableCell>
                                  <Combobox
                                    options={products.map(p => ({ value: p.id, label: p.name }))}
                                    value={item.productId}
                                    onValueChange={(val) => updateItem(item.key, 'productId', val)}
                                    placeholder="Pilih Produk..."
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => updateItem(item.key, 'price', parseFloat(e.target.value))}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => updateItem(item.key, 'quantity', parseInt(e.target.value))}
                                  />
                                </TableCell>
                                <TableCell>
                                  Rp {(item.price * item.quantity).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.key)} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" type="button" onClick={() => router.push('/orders/sales')}>Batal</Button>
                    <Button type="submit" disabled={isSubmitting || isLoadingData}>
                      {isSubmitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                    </Button>
                  </div>

                </form>
              </CardContent>
            </Card>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
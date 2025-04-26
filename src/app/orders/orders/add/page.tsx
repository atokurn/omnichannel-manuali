'use client';

import React, { useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { OrdersSidebar } from '@/components/orders-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Check, ChevronsUpDown, Clock } from 'lucide-react'; // Added Check, ChevronsUpDown, Clock
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar'; // Renamed to avoid conflict
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'; // Added Command components
import { cn } from '@/lib/utils';
import { format, setHours, setMinutes, setSeconds } from 'date-fns';
import { id } from 'date-fns/locale'; // Import locale for Indonesian date format
import { useRouter } from 'next/navigation';

// Dummy product data (replace with actual data fetching)
const products = [
  { value: 'product1', label: 'Produk Contoh 1' },
  { value: 'product2', label: 'Produk Contoh 2' },
  { value: 'mayanacare-rosemary', label: 'Mayanacare Rosemary Oil & Carrier Oil Hair Growth 20 ml' },
];

export default function AddOrderPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState('');
  const [orderDate, setOrderDate] = useState<Date | undefined>(new Date());
  const [platform, setPlatform] = useState('');
  const [productValue, setProductValue] = useState(''); // State for Combobox value
  const [productSearchOpen, setProductSearchOpen] = useState(false); // State for Combobox open/close
  const [sku, setSku] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [totalOrder, setTotalOrder] = useState<number | string>(0);
  const [status, setStatus] = useState('Pending');
  const [regencyCity, setRegencyCity] = useState('');
  const [province, setProvince] = useState('');
  const [orderHour, setOrderHour] = useState<string>(format(orderDate ?? new Date(), 'HH'));
  const [orderMinute, setOrderMinute] = useState<string>(format(orderDate ?? new Date(), 'mm'));

  const handleCreateOrder = () => {
    // Logic to handle order creation
    console.log('Order Data:', {
      orderId,
      orderDate,
      platform,
      productName: products.find(p => p.value === productValue)?.label || '', // Get label from value
      sku,
      customerName,
      quantity,
      totalOrder,
      status,
      regencyCity,
      province,
    });
    // Redirect or show success message
    const finalOrderDate = setSeconds(setMinutes(setHours(orderDate ?? new Date(), parseInt(orderHour)), parseInt(orderMinute)), 0);
    console.log('Order Data:', {
      orderId,
      orderDate: finalOrderDate, // Use combined date and time
      platform,
      productName: products.find(p => p.value === productValue)?.label || '', // Get label from value
      sku,
      customerName,
      quantity,
      totalOrder,
      status,
      regencyCity,
      province,
    });
    // Redirect or show success message
    router.push('/orders/orders'); // Example redirect
  };

  const handleCancel = () => {
    router.back(); // Go back to the previous page
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const currentHour = parseInt(orderHour);
      const currentMinute = parseInt(orderMinute);
      const newDate = setSeconds(setMinutes(setHours(selectedDate, currentHour), currentMinute), 0);
      setOrderDate(newDate);
    }
  };

  const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
    let numericValue = parseInt(value);
    if (isNaN(numericValue)) numericValue = 0;

    if (type === 'hour') {
      if (numericValue < 0) numericValue = 0;
      if (numericValue > 23) numericValue = 23;
      setOrderHour(numericValue.toString().padStart(2, '0'));
      if (orderDate) {
        setOrderDate(setHours(orderDate, numericValue));
      }
    } else {
      if (numericValue < 0) numericValue = 0;
      if (numericValue > 59) numericValue = 59;
      setOrderMinute(numericValue.toString().padStart(2, '0'));
      if (orderDate) {
        setOrderDate(setMinutes(orderDate, numericValue));
      }
    }
  };

  const setTimeToNow = () => {
    const now = new Date();
    setOrderDate(now);
    setOrderHour(format(now, 'HH'));
    setOrderMinute(format(now, 'mm'));
  };

  return (
    <div className="[--header-height:calc(--spacing(14))] min-h-screen bg-muted/40">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <OrdersSidebar />
          <SidebarInset>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Tambah Pesanan Baru</h1>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Informasi Pesanan</CardTitle>
                  <CardDescription>Masukkan detail pesanan.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="grid gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="orderId">ID Pesanan</Label>
                          <Input
                            id="orderId"
                            placeholder="Masukkan ID pesanan"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="platform">Platform</Label>
                          <Select value={platform} onValueChange={setPlatform}>
                            <SelectTrigger id="platform">
                              <SelectValue placeholder="Pilih platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Tokopedia">Tokopedia</SelectItem>
                              <SelectItem value="Shopee">Shopee</SelectItem>
                              <SelectItem value="Lazada">Lazada</SelectItem>
                              <SelectItem value="TikTok">TikTok</SelectItem>
                              <SelectItem value="Manual">Manual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="sku">SKU</Label>
                          <Input
                            id="sku"
                            placeholder="Masukkan SKU produk"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="quantity">Kuantitas</Label>
                          <Input
                            id="quantity"
                            type="number"
                            placeholder="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value ? parseInt(e.target.value) : '')}
                            min="1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="status">Status</Label>
                          <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger id="status">
                              <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Processing">Processing</SelectItem>
                              <SelectItem value="Shipped">Shipped</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="province">Provinsi</Label>
                          <Input
                            id="province"
                            placeholder="Masukkan provinsi"
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="orderDate">Tanggal Pesanan</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !orderDate && "text-muted-foreground"
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {orderDate ? format(orderDate, "dd MMMM yyyy, HH:mm", { locale: id }) : <span>Pilih tanggal & waktu</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 flex flex-col sm:flex-row">
                              <CalendarComponent
                                mode="single"
                                selected={orderDate}
                                onSelect={handleDateSelect} // Use custom handler
                                initialFocus
                                locale={id} // Set locale to Indonesian
                              />
                              <div className="p-3 border-t sm:border-t-0 sm:border-l border-border flex flex-col items-center justify-center space-y-4">
                                <div className="flex items-center space-x-2">
                                  <Clock className="h-5 w-5 text-muted-foreground" />
                                  <span className="font-medium">Waktu</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={orderHour}
                                    onChange={(e) => handleTimeChange('hour', e.target.value)}
                                    className="w-16 h-9 text-center"
                                    aria-label="Jam"
                                  />
                                  <span>:</span>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="59"
                                    value={orderMinute}
                                    onChange={(e) => handleTimeChange('minute', e.target.value)}
                                    className="w-16 h-9 text-center"
                                    aria-label="Menit"
                                  />
                                </div>
                                <Button variant="outline" size="sm" onClick={setTimeToNow} className="w-full">
                                  Hari ini
                                </Button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label htmlFor="productName">Nama Produk</Label>
                          <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={productSearchOpen}
                                className="w-full justify-between"
                              >
                                {productValue
                                  ? products.find((product) => product.value === productValue)?.label
                                  : "Pilih produk..."}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                              <Command>
                                <CommandInput placeholder="Cari produk..." />
                                <CommandList>
                                  <CommandEmpty>Produk tidak ditemukan.</CommandEmpty>
                                  <CommandGroup>
                                    {products.map((product) => (
                                      <CommandItem
                                        key={product.value}
                                        value={product.value}
                                        onSelect={(currentValue) => {
                                          setProductValue(currentValue === productValue ? "" : currentValue)
                                          setProductSearchOpen(false)
                                          // Optionally set SKU based on selected product
                                          // setSku(findSkuForProduct(currentValue)); 
                                        }}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            productValue === product.value ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        {product.label}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div>
                          <Label htmlFor="customerName">Nama Pelanggan</Label>
                          <Input
                            id="customerName"
                            placeholder="Masukkan nama pelanggan"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="totalOrder">Total Pesanan</Label>
                          <Input
                            id="totalOrder"
                            type="number"
                            placeholder="0"
                            value={totalOrder}
                            onChange={(e) => setTotalOrder(e.target.value ? parseFloat(e.target.value) : '')}
                            min="0"
                          />
                        </div>
                        <div>
                          <Label htmlFor="regencyCity">Kabupaten/Kota</Label>
                          <Input
                            id="regencyCity"
                            placeholder="Masukkan kabupaten/kota"
                            value={regencyCity}
                            onChange={(e) => setRegencyCity(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="outline" onClick={handleCancel} type="button">
                        Batal
                      </Button>
                      <Button onClick={handleCreateOrder} type="button">
                        Buat Pesanan
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
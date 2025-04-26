'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { OrdersSidebar } from '@/components/orders-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Calendar as CalendarIcon, Clock } from 'lucide-react'; // Added Clock
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar'; // Renamed to avoid conflict
import { format, setHours, setMinutes, setSeconds } from 'date-fns'; // Added setHours, setMinutes, setSeconds
import { id } from 'date-fns/locale'; // Import locale for Indonesian date format
import { cn } from '@/lib/utils';

// Interface untuk data form penjualan
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
}

// Data dummy untuk platform
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
    orderDate: new Date(), // Default ke tanggal hari ini
    platform: '',
    income: '0',
    priceAfterDiscount: '0',
    totalFees: '0',
    platformFees: '0',
    affiliateCommission: '0',
    refund: '0',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orderHour, setOrderHour] = useState<string>(format(formData.orderDate ?? new Date(), 'HH'));
  const [orderMinute, setOrderMinute] = useState<string>(format(formData.orderDate ?? new Date(), 'mm'));

  // Fungsi untuk menangani perubahan input umum
  const handleInputChange = (field: keyof SaleFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Hapus error untuk field yang diubah
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Fungsi untuk menangani perubahan tanggal dari kalender
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const currentHour = parseInt(orderHour);
      const currentMinute = parseInt(orderMinute);
      const newDate = setSeconds(setMinutes(setHours(selectedDate, currentHour), currentMinute), 0);
      setFormData(prev => ({ ...prev, orderDate: newDate }));
      if (errors.orderDate) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.orderDate;
          return newErrors;
        });
      }
    }
  };

  // Fungsi untuk menangani perubahan waktu (jam/menit)
  const handleTimeChange = (type: 'hour' | 'minute', value: string) => {
    let numericValue = parseInt(value);
    if (isNaN(numericValue)) numericValue = 0;
    let newDate = formData.orderDate ?? new Date();

    if (type === 'hour') {
      if (numericValue < 0) numericValue = 0;
      if (numericValue > 23) numericValue = 23;
      const formattedHour = numericValue.toString().padStart(2, '0');
      setOrderHour(formattedHour);
      newDate = setHours(newDate, numericValue);
    } else {
      if (numericValue < 0) numericValue = 0;
      if (numericValue > 59) numericValue = 59;
      const formattedMinute = numericValue.toString().padStart(2, '0');
      setOrderMinute(formattedMinute);
      newDate = setMinutes(newDate, numericValue);
    }
    setFormData(prev => ({ ...prev, orderDate: setSeconds(newDate, 0) }));
  };

  // Fungsi untuk mengatur waktu ke saat ini
  const setTimeToNow = () => {
    const now = new Date();
    setFormData(prev => ({ ...prev, orderDate: now }));
    setOrderHour(format(now, 'HH'));
    setOrderMinute(format(now, 'mm'));
  };

  // Fungsi untuk validasi form (contoh sederhana)
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.orderId.trim()) newErrors.orderId = 'Order ID harus diisi';
    if (!formData.orderDate) newErrors.orderDate = 'Tanggal Order harus diisi';
    if (!formData.platform) newErrors.platform = 'Platform harus dipilih';
    // Tambahkan validasi lain jika perlu (misal: angka harus positif)
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fungsi untuk menangani submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Pastikan orderDate sudah termasuk waktu yang benar
      const finalOrderDate = setSeconds(setMinutes(setHours(formData.orderDate ?? new Date(), parseInt(orderHour)), parseInt(orderMinute)), 0);
      const dataToSubmit = { ...formData, orderDate: finalOrderDate };

      console.log('Data Penjualan yang akan disimpan:', dataToSubmit);
      // Logika penyimpanan data ke backend
      // ...

      // Redirect ke halaman daftar penjualan setelah berhasil
      router.push('/orders/sales');
    }
  };

  // Fungsi untuk kembali ke halaman sebelumnya
  const handleBack = () => {
    router.push('/orders/sales');
  };

  // Fungsi untuk membatalkan
  const handleCancel = () => {
    router.push('/orders/sales'); // Atau reset form
  };

  return (
    <div className="[--header-height:calc(--spacing(14))] min-h-screen">
      <SidebarProvider className="flex flex-col min-h-screen">
        <SiteHeader />
        <div className="flex flex-1">
          <OrdersSidebar />
          <main className="flex-1 p-4 pl-[--sidebar-width]">
            <Card>
              <CardHeader className="flex flex-row items-center">
                 <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                <div>
                  <CardTitle>Sale Information</CardTitle>
                  <CardDescription>Enter the sale details</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Kolom Kiri */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="orderId">Order ID</Label>
                      <Input
                        id="orderId"
                        placeholder="Enter order ID"
                        value={formData.orderId}
                        onChange={(e) => handleInputChange('orderId', e.target.value)}
                      />
                      {errors.orderId && <p className="text-red-500 text-sm mt-1">{errors.orderId}</p>}
                    </div>
                    <div>
                      <Label htmlFor="platform">Platform</Label>
                      <Select onValueChange={(value) => handleInputChange('platform', value)} value={formData.platform}>
                        <SelectTrigger id="platform">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          {platformOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.platform && <p className="text-red-500 text-sm mt-1">{errors.platform}</p>}
                    </div>
                    <div>
                      <Label htmlFor="priceAfterDiscount">Price After Discount</Label>
                      <Input
                        id="priceAfterDiscount"
                        type="number"
                        placeholder="0"
                        value={formData.priceAfterDiscount}
                        onChange={(e) => handleInputChange('priceAfterDiscount', e.target.value)}
                      />
                      {/* Tambahkan validasi error jika perlu */}
                    </div>
                    <div>
                      <Label htmlFor="platformFees">Platform Fees</Label>
                      <Input
                        id="platformFees"
                        type="number"
                        placeholder="0"
                        value={formData.platformFees}
                        onChange={(e) => handleInputChange('platformFees', e.target.value)}
                      />
                    </div>
                     <div>
                      <Label htmlFor="refund">Refund</Label>
                      <Input
                        id="refund"
                        type="number"
                        placeholder="0"
                        value={formData.refund}
                        onChange={(e) => handleInputChange('refund', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Kolom Kanan */}
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="orderDate">Order Date</Label>
                       <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.orderDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.orderDate ? format(formData.orderDate, "dd MMMM yyyy, HH:mm", { locale: id }) : <span>Pilih tanggal</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 flex flex-col sm:flex-row">
                          <CalendarComponent
                            mode="single"
                            selected={formData.orderDate}
                            onSelect={handleDateSelect}
                            initialFocus
                            locale={id} // Gunakan locale Indonesia
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
                      {errors.orderDate && <p className="text-red-500 text-sm mt-1">{errors.orderDate}</p>}
                    </div>
                    <div>
                      <Label htmlFor="income">Income</Label>
                      <Input
                        id="income"
                        type="number"
                        placeholder="0"
                        value={formData.income}
                        onChange={(e) => handleInputChange('income', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalFees">Total Fees</Label>
                      <Input
                        id="totalFees"
                        type="number"
                        placeholder="0"
                        value={formData.totalFees}
                        onChange={(e) => handleInputChange('totalFees', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="affiliateCommission">Affiliate Commission</Label>
                      <Input
                        id="affiliateCommission"
                        type="number"
                        placeholder="0"
                        value={formData.affiliateCommission}
                        onChange={(e) => handleInputChange('affiliateCommission', e.target.value)}
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>Batal</Button>
                <Button onClick={handleSubmit}>Simpan Penjualan</Button>
              </CardFooter>
            </Card>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
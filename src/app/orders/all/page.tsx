'use client';

import React, { useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { OrdersSidebar } from '@/components/orders-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Filter, ArrowUpDown, Download, MoreHorizontal, AlertCircle, X, RefreshCcw } from 'lucide-react';
import Image from 'next/image';

// Dummy data for summary cards
const summaryData = [
  { title: 'Perlu tindakan', value: 12, description: 'Harus dikirim sebelum pukul 23.59 hari ini' },
  { title: 'Pembatalan otomatis', value: 0, description: 'dalam maks. 24 jam' },
  { title: 'Pengiriman terlambat', value: 0 },
  { title: 'Pembatalan diajukan', value: 0 },
  { title: 'Masalah logistik', value: 0 },
  { title: 'Pengembalian barang/dana diajukan', value: 0 },
];

// Dummy data for orders table
const dummyOrders = [
  {
    id: '578528787616007602',
    date: 'Senin 17:40:02',
    customer: 'zahrasukriani',
    productCount: 1,
    productImage: '/placeholder.svg', // Placeholder image
    status: 'Menunggu pengiriman',
    statusDetail: 'Harus dikirim sebelum pukul 23.5...', // Truncated for display
    shippingMethod: 'Dikirim melalui platform',
    courier: 'J&T Express',
    shippingOption: 'Pengiriman standar',
    totalPrice: 150000,
    platform: 'Shopee',
  },
  {
    id: '578529487862662891',
    date: 'Senin 18:30:54',
    customer: 'tuu6668',
    productCount: 1,
    productImage: '/placeholder.svg',
    status: 'Menunggu pengiriman',
    statusDetail: 'Harus dikirim sebelum pukul 23.5...',
    shippingMethod: 'Dikirim melalui platform',
    courier: 'J&T Express',
    shippingOption: 'Pengiriman standar',
    totalPrice: 75000,
    platform: 'Tokopedia',
  },
  {
    id: '578529603314550356',
    date: 'Senin 18:37:03',
    customer: 'bilarchive',
    productCount: 1,
    productImage: '/placeholder.svg',
    status: 'Menunggu pengiriman',
    statusDetail: 'Harus dikirim sebelum pukul 23.5...',
    shippingMethod: 'Dikirim melalui platform',
    courier: 'J&T Express',
    shippingOption: 'Pengiriman standar',
    totalPrice: 210000,
    platform: 'Lazada',
  },
  {
    id: '578530191162377465',
    date: 'Senin 19:30:29',
    customer: 'sipalingleo06',
    productCount: 1,
    productImage: '/placeholder.svg',
    status: 'Menunggu pengiriman',
    statusDetail: 'Harus dikirim sebelum pukul 23.5...',
    shippingMethod: 'Dikirim melalui platform',
    courier: 'J&T Express',
    shippingOption: 'Pengiriman standar',
    totalPrice: 95000,
    platform: 'Shopee',
  },
  // Add more dummy orders as needed
];

// Dummy filter options
const filterOptions = {
  statusLabel: ['Label 1', 'Label 2'],
  kurir: ['J&T Express', 'SiCepat', 'Anteraja'],
  kontenPesanan: ['Produk A', 'Produk B'],
  namaGudang: ['Gudang Pusat', 'Gudang Cabang'],
  pengecualianPesanan: ['Pengecualian 1', 'Pengecualian 2'],
  masalahPengiriman: ['Masalah 1', 'Masalah 2'],
};

export default function AllOrdersPage() {
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({
    statusLabel: ['Kurir'], // Example initial active filter
    kurir: [],
    kontenPesanan: [],
    namaGudang: [],
    pengecualianPesanan: [],
    masalahPengiriman: [],
  });
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = (category: string, value: string) => {
    setActiveFilters(prev => {
      const currentValues = prev[category] || [];
      if (currentValues.includes(value)) {
        return { ...prev, [category]: currentValues.filter(v => v !== value) };
      } else {
        return { ...prev, [category]: [...currentValues, value] };
      }
    });
  };

  const removeFilter = (category: string, value: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: (prev[category] || []).filter(v => v !== value),
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({});
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters).reduce((count, values) => count + values.length, 0);
  };

  return (
    <div className="[--header-height:calc(--spacing(14))] min-h-screen bg-muted/40">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <OrdersSidebar />
          <SidebarInset>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Kelola Pesanan</h1>
                <div className="flex items-center gap-2">
                  <div className="relative ml-auto flex-1 md:grow-0">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Cari ID pesanan/ID produk/nama produk..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-lg bg-background pl-8 md:w-[200px] 
                      lg:w-[320px]"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    Label pengiriman
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Opsi 1</DropdownMenuItem>
                      <DropdownMenuItem>Opsi 2</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Summary Cards Section */}
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                {summaryData.map((item, index) => (
                  <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{item.value}</div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Tabs and Filters Section */}
              <Tabs defaultValue="perlu-dikirim">
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="semua">Semua</TabsTrigger>
                  <TabsTrigger value="perlu-dikirim">Perlu dikirim <Badge variant="destructive" className="ml-1">12</Badge></TabsTrigger>
                  <TabsTrigger value="dikirim">Dikirim <Badge variant="secondary" className="ml-1">292</Badge></TabsTrigger>
                  <TabsTrigger value="selesai">Selesai</TabsTrigger>
                  <TabsTrigger value="dalam-proses">Dalam proses</TabsTrigger>
                  <TabsTrigger value="dibatalkan">Dibatalkan</TabsTrigger>
                  <TabsTrigger value="pengantaran-gagal">Pengantaran gagal</TabsTrigger>
                </TabsList>

                {/* Content for 'Perlu dikirim' tab (example) */}
                <TabsContent value="perlu-dikirim">
                  <Card>
                    <CardContent className="pt-6">
                      {/* Filter Controls */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Filter className="mr-2 h-4 w-4" />
                                Filter ({getActiveFilterCount()})
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[200px]">
                              <DropdownMenuLabel>Filter Berdasarkan</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              {Object.entries(filterOptions).map(([categoryKey, options]) => (
                                <React.Fragment key={categoryKey}>
                                  <DropdownMenuLabel className="text-xs font-semibold">{categoryKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</DropdownMenuLabel>
                                  {options.map(option => (
                                    <DropdownMenuItem key={option} onSelect={(e) => e.preventDefault()} onClick={() => handleFilterChange(categoryKey, option)}>
                                      <Checkbox checked={activeFilters[categoryKey]?.includes(option)} className="mr-2" />
                                      {option}
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuSeparator />
                                </React.Fragment>
                              ))}
                              <DropdownMenuItem onClick={clearAllFilters} className="text-red-600">
                                <RefreshCcw className="mr-2 h-4 w-4" /> Hapus Semua Filter
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Active Filters Display */}
                          {Object.entries(activeFilters).flatMap(([category, values]) =>
                            values.map(value => (
                              <Badge key={`${category}-${value}`} variant="secondary" className="flex items-center gap-1">
                                {value}
                                <Button variant="ghost" size="icon" className="h-4 w-4 p-0 ml-1" onClick={() => removeFilter(category, value)}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </Badge>
                            ))
                          )}

                          {getActiveFilterCount() > 0 && (
                             <p className="text-sm text-muted-foreground">Ada {getActiveFilterCount()} filter aktif</p>
                          )}

                          <div className="ml-auto flex items-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <ArrowUpDown className="mr-2 h-4 w-4" />
                                  Urutkan menurut
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Terbaru</DropdownMenuItem>
                                <DropdownMenuItem>Terlama</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="outline" size="sm">
                              <Download className="mr-2 h-4 w-4" />
                              Ekspor
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Cetak</DropdownMenuItem>
                                <DropdownMenuItem>Pengaturan Kolom</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>

                      {/* Orders Table */}
                      <div className="mt-4 rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">
                                <Checkbox />
                              </TableHead>
                              <TableHead>Pesanan</TableHead>
                              <TableHead>Pelanggan</TableHead>
                              <TableHead>Produk</TableHead>
                              <TableHead>Harga Total</TableHead>
                              <TableHead>Platform</TableHead>
                              <TableHead>Status pesanan</TableHead>
                              <TableHead>Metode pengiriman</TableHead>
                              <TableHead>Opsi pengiriman</TableHead>
                              <TableHead>Tindakan</TableHead> {/* Added Actions Header */}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dummyOrders.map((order) => (
                              <TableRow key={order.id}>
                                <TableCell>
                                  <Checkbox />
                                </TableCell>
                                <TableCell>
                                  <div className="font-medium">{order.id}</div>
                                  <div className="text-sm text-muted-foreground">{order.date}</div>
                                </TableCell>
                                <TableCell>{order.customer}</TableCell>
                                <TableCell className="flex items-center gap-2">
                                  <Image src={order.productImage} alt="Product Image" width={32} height={32} className="rounded" />
                                  {order.productCount} produk
                                </TableCell>
                                <TableCell>
                                  {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.totalPrice)}
                                </TableCell>
                                <TableCell>{order.platform}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{order.status}</Badge>
                                  <div className="text-xs text-red-500 mt-1">{order.statusDetail}</div>
                                </TableCell>
                                <TableCell>
                                  {order.shippingMethod}
                                  <div className="text-sm text-muted-foreground">{order.courier}</div>
                                </TableCell>
                                <TableCell>{order.shippingOption}</TableCell>
                                <TableCell> {/* Added Actions Cell */}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Buka menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuLabel>Tindakan</DropdownMenuLabel>
                                      <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
                                      <DropdownMenuItem>Cetak Label</DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem>Tandai sebagai Dikirim</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Add TabsContent for other statuses (semua, dikirim, etc.) here */}
                <TabsContent value="semua">
                  <Card>
                    <CardContent className="pt-6">
                      <p>Konten untuk tab Semua akan ditampilkan di sini.</p>
                      {/* Anda bisa menduplikasi struktur tabel dan filter dari tab 'perlu-dikirim' dan menyesuaikannya */}
                    </CardContent>
                  </Card>
                </TabsContent>
                 <TabsContent value="dikirim">
                  <Card>
                    <CardContent className="pt-6">
                      <p>Konten untuk tab Dikirim akan ditampilkan di sini.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                 <TabsContent value="selesai">
                  <Card>
                    <CardContent className="pt-6">
                      <p>Konten untuk tab Selesai akan ditampilkan di sini.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                 <TabsContent value="dalam-proses">
                  <Card>
                    <CardContent className="pt-6">
                      <p>Konten untuk tab Dalam Proses akan ditampilkan di sini.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                 <TabsContent value="dibatalkan">
                  <Card>
                    <CardContent className="pt-6">
                      <p>Konten untuk tab Dibatalkan akan ditampilkan di sini.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                 <TabsContent value="pengantaran-gagal">
                  <Card>
                    <CardContent className="pt-6">
                      <p>Konten untuk tab Pengantaran Gagal akan ditampilkan di sini.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
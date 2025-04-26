"use client";

import React, { useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { useRouter } from 'next/navigation';
import { OrdersSidebar } from '@/components/orders-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowUpDown, Download, MoreHorizontal, Plus, Calendar, Upload, Eye, FileDown, FileUp, EllipsisVertical, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

// Tipe data untuk pesanan
interface Order {
  id: string;
  orderId: string;
  customer: string;
  productName: string;
  quantity: number;
  totalOrder: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';
  platform: string;
  cancelReason?: string; // Optional: Alasan pembatalan
  cancelledAt?: string; // Optional: Tanggal pembatalan
}

// Contoh data pesanan (termasuk yang dibatalkan)
const dummyOrders: Order[] = [
  // ... (data pesanan lain bisa ditambahkan di sini jika perlu)
  {
    id: '11',
    orderId: '577920885561132351',
    customer: 'cancel_user_1',
    productName: 'Produk Dibatalkan A',
    quantity: 2,
    totalOrder: 50000,
    status: 'Cancelled',
    platform: 'Shopee',
    cancelReason: 'Stok habis',
    cancelledAt: '2024-07-29 10:00:00'
  },
  {
    id: '12',
    orderId: '577920885561132352',
    customer: 'cancel_user_2',
    productName: 'Produk Dibatalkan B',
    quantity: 1,
    totalOrder: 75000,
    status: 'Cancelled',
    platform: 'Tokopedia',
    cancelReason: 'Permintaan pembeli',
    cancelledAt: '2024-07-28 15:30:00'
  },
  {
    id: '1',
    orderId: '577921878811116824',
    customer: '_silenttracker',
    productName: 'Mayanacare Rosemary Oil & Carrier Oil Hair Growth 20 ml Vitamin Almond Extract Argan Haircare Minyak Treatment Perawatan Rontok',
    quantity: 1,
    totalOrder: 31309,
    status: 'Pending',
    platform: 'TikTok',
  },
];

// Format angka ke format rupiah
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

// Fungsi untuk mendapatkan warna badge berdasarkan status
const getStatusBadgeVariant = (status: Order['status']): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'Pending':
      return 'secondary';
    case 'Processing':
      return 'default';
    case 'Shipped':
      return 'outline';
    case 'Completed':
      return 'default';
    case 'Cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export default function CancelledOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const router = useRouter();

  // Filter pesanan hanya yang berstatus 'Cancelled'
  const cancelledOrders = dummyOrders.filter(order => order.status === 'Cancelled');

  // Filter pesanan berdasarkan pencarian
  const filteredOrders = cancelledOrders.filter((order) => {
    const query = searchTerm.toLowerCase();
    return (
      order.orderId.toLowerCase().includes(query) ||
      order.customer.toLowerCase().includes(query) ||
      order.productName.toLowerCase().includes(query)
    );
  });

  // Hitung total halaman
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);
  const totalRows = filteredOrders.length;

  // Ambil data untuk halaman saat ini
  const currentTableData = filteredOrders.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedOrders(currentTableData.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, id]);
    } else {
      setSelectedOrders(selectedOrders.filter(orderId => orderId !== id));
    }
  };

  const isAllSelected = currentTableData.length > 0 && selectedOrders.length === currentTableData.length;
  const isIndeterminate = selectedOrders.length > 0 && selectedOrders.length < currentTableData.length;

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
                <h1 className="text-lg font-semibold md:text-2xl">Pesanan Dibatalkan</h1>
                <div className="flex items-center gap-2">
                  {/* Tombol Aksi (jika diperlukan) */}
                  {/* <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button> */}
                </div>
              </div>

              {/* Card Konten Utama */}
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Pesanan Dibatalkan</CardTitle>
                  <CardDescription>Kelola pesanan yang telah dibatalkan.</CardDescription>
                  <div className="flex items-center gap-4 pt-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Cari ID Pesanan, Pelanggan, Produk..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg bg-background pl-8"
                      />
                    </div>
                    <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
                    {/* Tambahkan filter lain jika perlu */}
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead padding="checkbox">
                          <Checkbox
                            checked={isAllSelected || (isIndeterminate ? 'indeterminate' : false)}
                            onCheckedChange={handleSelectAll}
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead>
                          <Button variant="ghost" onClick={() => console.log('Sort Order ID')}>
                            ID Pesanan <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Produk</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead className="text-right">Total Pesanan</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Alasan Batal</TableHead>
                        <TableHead>Tgl Batal</TableHead>
                        <TableHead>Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentTableData.length > 0 ? (
                        currentTableData.map((order) => (
                          <TableRow
                            key={order.id}
                            data-state={selectedOrders.includes(order.id) ? "selected" : undefined}
                          >
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedOrders.includes(order.id)}
                                onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)}
                                aria-label={`Select row ${order.id}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{order.orderId}</TableCell>
                            <TableCell>{order.customer}</TableCell>
                            <TableCell className="max-w-[300px] truncate">{order.productName}</TableCell>
                            <TableCell className="text-right">{order.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(order.totalOrder)}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                            </TableCell>
                            <TableCell>{order.platform}</TableCell>
                            <TableCell>{order.cancelReason || '-'}</TableCell>
                            <TableCell>{order.cancelledAt || '-'}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => console.log('View order', order.id)}>
                                    <Eye className="mr-2 h-4 w-4" /> Lihat Detail
                                  </DropdownMenuItem>
                                  {/* Tambahkan aksi lain jika perlu */}
                                  {/* <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">Hapus</DropdownMenuItem> */}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={11} className="h-24 text-center">
                            Tidak ada pesanan dibatalkan yang ditemukan.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
                {/* Footer Tabel (Paginasi) */}
                <div className="flex items-center justify-between border-t p-4">
                  <div className="text-sm text-muted-foreground">
                    {selectedOrders.length} dari {totalRows} baris dipilih.
                  </div>
                  <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">Baris per halaman</p>
                      <Select
                        value={`${rowsPerPage}`}
                        onValueChange={(value) => {
                          setRowsPerPage(Number(value));
                          setCurrentPage(1); // Reset ke halaman pertama saat mengubah jumlah baris
                        }}
                      >
                        <SelectTrigger className="h-8 w-[70px]">
                          <SelectValue placeholder={rowsPerPage} />
                        </SelectTrigger>
                        <SelectContent side="top">
                          {[10, 20, 30, 40, 50].map((pageSize) => (
                            <SelectItem key={pageSize} value={`${pageSize}`}>
                              {pageSize}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                      Halaman {currentPage} dari {totalPages}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                      >
                        <span className="sr-only">Go to first page</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-left"><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <span className="sr-only">Go to previous page</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <span className="sr-only">Go to next page</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        <span className="sr-only">Go to last page</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevrons-right"><path d="m6 17 5-5-5-5"/><path d="m13 17 5-5-5-5"/></svg>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
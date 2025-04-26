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
import { Search, ArrowUpDown, Download, MoreHorizontal, Plus, Calendar, Upload, Eye, FileDown, FileUp, EllipsisVertical, FileText, CheckCircle } from 'lucide-react';
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
  completedAt?: string; // Optional: Tanggal selesai
}

// Contoh data pesanan (termasuk yang selesai)
const dummyOrders: Order[] = [
  {
    id: '13',
    orderId: '577920885561132353',
    customer: 'completed_user_1',
    productName: 'Produk Selesai A',
    quantity: 1,
    totalOrder: 100000,
    status: 'Completed',
    platform: 'Lazada',
    completedAt: '2024-07-27 11:00:00'
  },
  {
    id: '14',
    orderId: '577920885561132354',
    customer: 'completed_user_2',
    productName: 'Produk Selesai B',
    quantity: 3,
    totalOrder: 250000,
    status: 'Completed',
    platform: 'Manual',
    completedAt: '2024-07-26 14:20:00'
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
    {
    id: '11',
    orderId: '577920885561132351',
    customer: 'cancel_user_1',
    productName: 'Produk Dibatalkan A',
    quantity: 2,
    totalOrder: 50000,
    status: 'Cancelled',
    platform: 'Shopee',
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
      return 'default'; // Menggunakan 'default' untuk Completed, bisa disesuaikan
    case 'Cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getStatusBadgeStyle = (status: Order['status']): React.CSSProperties => {
    switch (status) {
      case 'Completed':
        return { backgroundColor: '#4CAF50', color: 'white' }; // Hijau untuk Completed
      // Tambahkan case lain jika perlu styling khusus
      default:
        return {};
    }
  };

export default function CompletedOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const router = useRouter();

  // Filter pesanan hanya yang berstatus 'Completed'
  const completedOrders = dummyOrders.filter(order => order.status === 'Completed');

  // Filter pesanan berdasarkan pencarian
  const filteredOrders = completedOrders.filter((order) => {
    const query = searchTerm.toLowerCase();
    // Tambahkan logika filter tanggal jika dateRange didefinisikan
    // ... (logika filter tanggal)
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

  // Fungsi paginasi
  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const handleRowsPerPageChange = (value: string) => {
    setRowsPerPage(Number(value));
    setCurrentPage(1); // Reset ke halaman pertama saat mengubah jumlah baris
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
                <h1 className="text-lg font-semibold md:text-2xl">Pesanan Selesai</h1>
                <div className="flex items-center gap-2">
                  {/* Tombol Aksi (jika diperlukan) */}
                  <Button size="sm" variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                </div>
              </div>

              {/* Card Konten Utama */}
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Pesanan Selesai</CardTitle>
                  <CardDescription>Kelola pesanan yang telah selesai.</CardDescription>
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
                        <TableHead>ID Pesanan</TableHead>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead className="hidden md:table-cell">Produk</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden sm:table-cell">Platform</TableHead>
                        <TableHead className="hidden md:table-cell">Tgl Selesai</TableHead>
                        <TableHead>
                          <span className="sr-only">Aksi</span>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentTableData.length > 0 ? (
                        currentTableData.map((order) => (
                          <TableRow key={order.id} data-state={selectedOrders.includes(order.id) ? 'selected' : undefined}>
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedOrders.includes(order.id)}
                                onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)}
                                aria-label={`Select row ${order.id}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{order.orderId}</TableCell>
                            <TableCell>{order.customer}</TableCell>
                            <TableCell className="hidden md:table-cell max-w-xs truncate" title={order.productName}>{order.productName}</TableCell>
                            <TableCell className="text-right">{order.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(order.totalOrder)}</TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(order.status)} style={getStatusBadgeStyle(order.status)}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{order.platform}</TableCell>
                            <TableCell className="hidden md:table-cell">{order.completedAt ? new Date(order.completedAt).toLocaleDateString('id-ID') : '-'}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button aria-haspopup="true" size="icon" variant="ghost">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">Toggle menu</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                  <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
                                  {/* Tambahkan aksi lain jika perlu */}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={10} className="h-24 text-center">
                            Tidak ada pesanan selesai yang ditemukan.
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
                        onValueChange={handleRowsPerPageChange}
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
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                      >
                        <span className="sr-only">Go to previous page</span>
                        <ArrowUpDown className="h-4 w-4 rotate-180" /> {/* Ganti ikon jika perlu */}
                      </Button>
                      <Button
                        variant="outline"
                        className="h-8 w-8 p-0"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        <span className="sr-only">Go to next page</span>
                        <ArrowUpDown className="h-4 w-4" /> {/* Ganti ikon jika perlu */}
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
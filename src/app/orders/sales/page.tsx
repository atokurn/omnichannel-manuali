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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ArrowUpDown, MoreHorizontal, Plus, Calendar, Eye, FileDown, FileUp, EllipsisVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

// Tipe data untuk penjualan (sesuaikan dengan gambar)
interface Sale {
  id: string;
  orderId: string;
  orderAt: string; // Tanggal dan waktu
  income: number;
  priceAfterDiscount: number;
  totalFees: number;
  platform: 'Shopee' | 'Tokopedia' | 'Lazada' | 'TikTok' | 'Manual'; // Contoh platform
}

// Contoh data penjualan (sesuai gambar)
const dummySales: Sale[] = [
  {
    id: '1',
    orderId: '250128N5BM01G1',
    orderAt: '31 Jan 2025',
    income: 103708,
    priceAfterDiscount: 117850,
    totalFees: -14142,
    platform: 'Shopee',
  },
  {
    id: '2',
    orderId: '250125CP1CWC34',
    orderAt: '31 Jan 2025',
    income: 103708,
    priceAfterDiscount: 117850,
    totalFees: -14142,
    platform: 'Shopee',
  },
  {
    id: '3',
    orderId: '250123A2MXSSR2',
    orderAt: '31 Jan 2025',
    income: 30220,
    priceAfterDiscount: 34341,
    totalFees: -4121,
    platform: 'Shopee',
  },
  {
    id: '4',
    orderId: '250124CH5VN276',
    orderAt: '31 Jan 2025',
    income: 51854,
    priceAfterDiscount: 58925,
    totalFees: -7071,
    platform: 'Shopee',
  },
  {
    id: '5',
    orderId: '2501093SWCR8SD',
    orderAt: '31 Jan 2025',
    income: 51854,
    priceAfterDiscount: 58925,
    totalFees: -7071,
    platform: 'Shopee',
  },
  {
    id: '6',
    orderId: '250125ERDVHWSA',
    orderAt: '31 Jan 2025',
    income: 30220,
    priceAfterDiscount: 34341,
    totalFees: -4121,
    platform: 'Shopee',
  },
  {
    id: '7',
    orderId: '2501214RERFYNA',
    orderAt: '31 Jan 2026',
    income: 51854,
    priceAfterDiscount: 58925,
    totalFees: -7071,
    platform: 'Shopee',
  },
  {
    id: '8',
    orderId: '250125E5AQKKJQ',
    orderAt: '31 Jan 2026',
    income: 51854,
    priceAfterDiscount: 58925,
    totalFees: -7071,
    platform: 'Shopee',
  },
  {
    id: '9',
    orderId: '2501239GPA128W',
    orderAt: '31 Jan 2026',
    income: 51854,
    priceAfterDiscount: 58925,
    totalFees: -7071,
    platform: 'Shopee',
  },
  {
    id: '10',
    orderId: '250126G0G3D885',
    orderAt: '31 Jan 2026',
    income: 103708,
    priceAfterDiscount: 117850,
    totalFees: -14142,
    platform: 'Shopee',
  },
];

// Format angka ke format rupiah
const formatCurrency = (amount: number) => {
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  // Hapus spasi setelah 'Rp'
  return formatter.format(amount).replace(/\s/g, '');
};

// Fungsi untuk mendapatkan warna badge berdasarkan platform
const getPlatformBadgeVariant = (platform: Sale['platform']): "default" | "secondary" | "destructive" | "outline" => {
  switch (platform) {
    case 'Shopee':
      return 'default'; // Oranye
    case 'Tokopedia':
      return 'secondary'; // Hijau
    case 'Lazada':
      return 'destructive'; // Biru
    case 'TikTok':
      return 'outline'; // Hitam/Putih
    case 'Manual':
      return 'secondary'; // Abu-abu
    default:
      return 'secondary';
  }
};

const getPlatformBadgeStyle = (platform: Sale['platform']): React.CSSProperties => {
    switch (platform) {
      case 'Shopee':
        return { backgroundColor: '#FF6B00', color: 'white' };
      case 'Tokopedia':
        return { backgroundColor: '#4CAF50', color: 'white' };
      case 'Lazada':
        return { backgroundColor: '#1976D2', color: 'white' };
      case 'TikTok':
        return { backgroundColor: '#000000', color: 'white' };
      case 'Manual':
        return { backgroundColor: '#757575', color: 'white' };
      default:
        return {};
    }
  };

export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSales, setSelectedSales] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const router = useRouter();


  // Filter penjualan berdasarkan pencarian dan tanggal
  const filteredSales = dummySales.filter((sale) => {
    const query = searchTerm.toLowerCase();
    // Tambahkan logika filter tanggal jika diperlukan
    // const saleDate = new Date(sale.orderAt); // Perlu parsing tanggal yang benar
    // if (dateFilter !== 'All Time') { ... }

    return (
      sale.orderId.toLowerCase().includes(query)
      // Tambahkan filter untuk kolom lain jika perlu
    );
  });

  // Hitung total halaman
  const totalPages = Math.ceil(filteredSales.length / rowsPerPage);
  const totalRows = filteredSales.length;

  // Ambil data untuk halaman saat ini
  const currentTableData = filteredSales.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedSales(currentTableData.map(sale => sale.id));
    } else {
      setSelectedSales([]);
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedSales([...selectedSales, id]);
    } else {
      setSelectedSales(selectedSales.filter(saleId => saleId !== id));
    }
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
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
            <Card>
            <CardContent className="flex flex-col gap-4">
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Cari Order ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[300px]"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-1">
                      <DatePickerWithRange
                        date={dateRange}
                        onDateChange={setDateRange}
                        placeholder="Pilih rentang tanggal"
                      />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                <Button onClick={() => router.push('/orders/sales/add')}> {/* Adjust route as needed */}
                  {/*<Plus className="mr-2 h-4 w-4" />*/}
                  Tambah Penjualan
                </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <EllipsisVertical className="h-4 w-4" />
                        <span className="sr-only">More actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <FileDown className="mr-2 h-4 w-4" />
                        Eksport
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileUp className="mr-2 h-4 w-4" />
                        Import
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button size="sm" variant="outline" className="h-9 gap-1">
                    <Eye className="mr-2 h-4 w-4" /> View
                  </Button>
                </div>
              </div>

              {/* Table Section */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={selectedSales.length === currentTableData.length && currentTableData.length > 0}
                            onCheckedChange={(checked) => {
                                if (checked === true) {
                                    setSelectedSales(currentTableData.map(sale => sale.id));
                                } else if (checked === false) {
                                    setSelectedSales([]);
                                }
                            }}
                            aria-label="Select all"
                          />
                        </TableHead>
                        <TableHead className="cursor-pointer">
                          Order ID <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead className="cursor-pointer">
                          Order at <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead className="text-right cursor-pointer">
                          Income <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead className="text-right cursor-pointer">
                          Price after discount <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead className="text-right cursor-pointer">
                          Total Fees <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead className="cursor-pointer">
                          Platform <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                        </TableHead>
                        <TableHead className="w-[50px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentTableData.length > 0 ? (
                        currentTableData.map((sale) => (
                          <TableRow key={sale.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedSales.includes(sale.id)}
                                onCheckedChange={(checked) => handleSelectRow(sale.id, checked === true)}
                                aria-label={`Select row ${sale.id}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{sale.orderId}</TableCell>
                            <TableCell>{sale.orderAt}</TableCell>
                            <TableCell className="text-right">{formatCurrency(sale.income)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(sale.priceAfterDiscount)}</TableCell>
                            <TableCell className="text-right text-red-600">{formatCurrency(sale.totalFees)}</TableCell>
                            <TableCell>
                              <Badge variant={getPlatformBadgeVariant(sale.platform)} style={getPlatformBadgeStyle(sale.platform)}>{sale.platform}</Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Edit Sale</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">Delete Sale</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No results found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Pagination Section */}
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  {selectedSales.length} of {totalRows} row(s) selected.
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
                    <Select
                      value={`${rowsPerPage}`}
                      onValueChange={(value) => handleRowsPerPageChange(value)}
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
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      <span className="sr-only">Go to previous page</span>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      <span className="sr-only">Go to next page</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              </CardContent>
              </Card>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}

// Dummy ChevronLeft and ChevronRight components if not imported
const ChevronLeft = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRight = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);
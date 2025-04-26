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
import { Search, ArrowUpDown, Download, MoreHorizontal, Plus, Calendar, Upload, Eye, FileDown, FileUp, EllipsisVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
}

// Contoh data pesanan (sesuai gambar)
const dummyOrders: Order[] = [
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
    id: '2',
    orderId: '577921801882142099',
    customer: 'dwiselsitan1973',
    productName: 'Mayanacare Rosemary Oil & Carrier Oil Hair Growth 20 ml Vitamin Almond Extract Argan Haircare Minyak Treatment Perawatan Rontok',
    quantity: 1,
    totalOrder: 32621,
    status: 'Pending',
    platform: 'TikTok',
  },
  {
    id: '3',
    orderId: '577921781387461843',
    customer: 'optansah86',
    productName: 'Mayanacare Rosemary Oil & Carrier Oil Hair Growth 20 ml Vitamin Almond Extract Argan Haircare Minyak Treatment Perawatan Rontok',
    quantity: 1,
    totalOrder: 34284,
    status: 'Pending',
    platform: 'TikTok',
  },
  {
    id: '4',
    orderId: '577921593978194132',
    customer: 'yibo_official',
    productName: 'Mayanacare Rosemary Oil & Carrier Oil Hair Growth 20 ml Vitamin Almond Extract Argan Haircare Minyak Treatment Perawatan Rontok',
    quantity: 1,
    totalOrder: 34284,
    status: 'Pending',
    platform: 'TikTok',
  },
  {
    id: '5',
    orderId: '577921484060808256',
    customer: 'qshshell',
    productName: 'Mayanacare Rosemary Oil & Carrier Oil Hair Growth 20 ml Vitamin Almond Extract Argan Haircare Minyak Treatment Perawatan Rontok',
    quantity: 1,
    totalOrder: 34284,
    status: 'Pending',
    platform: 'TikTok',
  },
  {
    id: '6',
    orderId: '577921383356875968',
    customer: 'eeelo3vv',
    productName: 'Mayanacare Rosemary Oil & Carrier Oil Hair Growth 20 ml Vitamin Almond Extract Argan Haircare Minyak Treatment Perawatan Rontok',
    quantity: 1,
    totalOrder: 33813,
    status: 'Pending',
    platform: 'TikTok',
  },
  {
    id: '7',
    orderId: '577921145134023976',
    customer: 'laarashati',
    productName: 'Mayanacare Rosemary Oil & Carrier Oil Hair Growth 20 ml Vitamin Almond Extract Argan Haircare Minyak Treatment Perawatan Rontok',
    quantity: 1,
    totalOrder: 35496,
    status: 'Pending',
    platform: 'TikTok',
  },
  {
    id: '8',
    orderId: '57792117207824131',
    customer: 'cil1114',
    productName: 'Mayanacare Rosemary Oil & Carrier Oil Hair Growth 20 ml Vitamin Almond Extract Argan Haircare Minyak Treatment Perawatan Rontok',
    quantity: 1,
    totalOrder: 34284,
    status: 'Pending',
    platform: 'TikTok',
  },
  {
    id: '9',
    orderId: '577920929850950884',
    customer: 'virgoo061',
    productName: 'Mayanacare Rosemary Oil & Carrier Oil Hair Growth 20 ml Vitamin Almond Extract Argan Haircare Minyak Treatment Perawatan Rontok',
    quantity: 4,
    totalOrder: 178738,
    status: 'Pending',
    platform: 'TikTok',
  },
  {
    id: '10',
    orderId: '577920885561132350',
    customer: 'bbytarramell0',
    productName: 'Mayanacare Rosemary Oil & Carrier Oil Hair Growth 20 ml Vitamin Almond Extract Argan Haircare Minyak Treatment Perawatan Rontok',
    quantity: 1,
    totalOrder: 31822,
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
      return 'default'; // Atau warna lain yang sesuai
    case 'Shipped':
      return 'outline'; // Atau warna lain yang sesuai
    case 'Completed':
      return 'default'; // Atau warna lain yang sesuai
    case 'Cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const router = useRouter();

  // Filter pesanan berdasarkan pencarian
  const filteredOrders = dummyOrders.filter((order) => {
    const query = searchTerm.toLowerCase();
    return (
      order.orderId.toLowerCase().includes(query) ||
      order.customer.toLowerCase().includes(query) ||
      order.productName.toLowerCase().includes(query)
    );
  });

  // Hitung total halaman
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

  // Ambil data untuk halaman saat ini
  const currentTableData = filteredOrders.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
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
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Cari pesanan..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
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
                <Button onClick={() => router.push('/orders/orders/add')}> {/* Adjust route as needed */}
                  {/*<Plus className="mr-2 h-4 w-4" />*/}
                  Tambah Order
                </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <EllipsisVertical className="h-4 w-4" />
                        <span className="sr-only">Opsi Lain</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <FileUp className="mr-2 h-4 w-4" />
                        Import Pesanan
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export Pesanan
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button size="sm" variant="outline" className="h-9 gap-1">
                  <Eye className="mr-2 h-4 w-4" /> View
                    {/*<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">View</span>*/}
                  </Button>
                </div>
              </div>

              {/* Table Section */}
                <div className="rounded-lg border shadow-sm bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox
                          checked={isAllSelected}
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead className="w-[180px]">
                        <Button variant="ghost" size="sm">
                          Order ID
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm">
                          Customer
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="min-w-[300px]">
                        <Button variant="ghost" size="sm">
                          Product Name
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-center">
                        <Button variant="ghost" size="sm">
                          Quantity
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">
                        <Button variant="ghost" size="sm">
                          Total Order
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm">
                          Status
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm">
                          Platform
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentTableData.length > 0 ? (
                      currentTableData.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedOrders.includes(order.id)}
                              onCheckedChange={(checked) => handleSelectRow(order.id, !!checked)}
                              aria-label={`Select order ${order.orderId}`}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{order.orderId}</TableCell>
                          <TableCell>{order.customer}</TableCell>
                          <TableCell className="text-sm text-muted-foreground truncate max-w-xs">
                            {order.productName}
                          </TableCell>
                          <TableCell className="text-center">{order.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(order.totalOrder)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(order.status)}>{order.status}</Badge>
                          </TableCell>
                          <TableCell>{order.platform}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem>Edit Order</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">Cancel Order</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="h-24 text-center">
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Section */}
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  {selectedOrders.length} of {filteredOrders.length} row(s) selected.
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Rows per page</p>
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
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      <span className="sr-only">Go to first page</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                        <path fillRule="evenodd" d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                      </svg>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <span className="sr-only">Go to previous page</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                      </svg>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <span className="sr-only">Go to next page</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                      </svg>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <span className="sr-only">Go to last page</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708z"/>
                        <path fillRule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708z"/>
                      </svg>
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
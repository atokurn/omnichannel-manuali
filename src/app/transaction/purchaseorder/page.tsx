"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation'; // Import useRouter
import { TransactionSidebar } from "@/components/transaction-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownToLine, ArrowUpFromLine, Download, Plus, Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Contoh data pesanan pembelian
const purchaseOrderData = [
  {
    id: "PO-2023-001",
    date: "2023-10-15",
    supplier: "PT Supplier Utama",
    amount: 5000000,
    status: "selesai",
    items: 12,
    paymentStatus: "lunas",
  },
  {
    id: "PO-2023-002",
    date: "2023-10-18",
    supplier: "CV Mitra Sejahtera",
    amount: 3500000,
    status: "diproses",
    items: 8,
    paymentStatus: "belum dibayar",
  },
  {
    id: "PO-2023-003",
    date: "2023-10-20",
    supplier: "UD Makmur Jaya",
    amount: 2800000,
    status: "dikirim",
    items: 5,
    paymentStatus: "sebagian",
  },
  {
    id: "PO-2023-004",
    date: "2023-10-22",
    supplier: "PT Sumber Bahan",
    amount: 4200000,
    status: "menunggu konfirmasi",
    items: 10,
    paymentStatus: "belum dibayar",
  },
  {
    id: "PO-2023-005",
    date: "2023-10-25",
    supplier: "CV Berkah Abadi",
    amount: 1800000,
    status: "dibatalkan",
    items: 4,
    paymentStatus: "dikembalikan",
  },
];

export default function PurchaseOrderPage() {
  const router = useRouter(); // Initialize router
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("semua");

  // Filter pesanan pembelian berdasarkan tab aktif dan pencarian
  const filteredPurchaseOrders = purchaseOrderData.filter((po) => {
    // Filter berdasarkan tab
    if (activeTab === "selesai" && po.status !== "selesai") return false;
    if (activeTab === "diproses" && po.status !== "diproses") return false;
    if (activeTab === "dikirim" && po.status !== "dikirim") return false;
    if (activeTab === "dibatalkan" && po.status !== "dibatalkan") return false;

    // Filter berdasarkan pencarian
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        po.id.toLowerCase().includes(query) ||
        po.supplier.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Format angka ke format rupiah
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Fungsi untuk mendapatkan warna badge berdasarkan status
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "selesai":
        return "bg-green-100 text-green-800";
      case "diproses":
        return "bg-blue-100 text-blue-800";
      case "dikirim":
        return "bg-purple-100 text-purple-800";
      case "menunggu konfirmasi":
        return "bg-yellow-100 text-yellow-800";
      case "dibatalkan":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Fungsi untuk mendapatkan warna badge berdasarkan status pembayaran
  const getPaymentStatusBadgeColor = (paymentStatus: string) => {
    switch (paymentStatus.toLowerCase()) {
      case "lunas":
        return "bg-green-100 text-green-800";
      case "sebagian":
        return "bg-yellow-100 text-yellow-800";
      case "belum dibayar":
        return "bg-red-100 text-red-800";
      case "dikembalikan":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <TransactionSidebar />
          <SidebarInset>
            <div className="flex-1 p-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Pesanan Pembelian</h1>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export
                  </Button>
                  <Button onClick={() => router.push('/transaction/purchaseorder/add')}>
                    <Plus className="mr-2 h-4 w-4" /> Pesanan Baru
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total PO</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{purchaseOrderData.length}</div>
                    <p className="text-xs text-muted-foreground">Pesanan dalam 30 hari terakhir</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">PO Selesai</CardTitle>
                    <div className="h-4 w-4 rounded-full bg-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {purchaseOrderData.filter(po => po.status === "selesai").length}
                    </div>
                    <p className="text-xs text-muted-foreground">Pesanan selesai dalam 30 hari terakhir</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">PO Diproses</CardTitle>
                    <div className="h-4 w-4 rounded-full bg-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {purchaseOrderData.filter(po => po.status === "diproses").length}
                    </div>
                    <p className="text-xs text-muted-foreground">Pesanan diproses dalam 30 hari terakhir</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Nilai PO</CardTitle>
                    <ArrowDownToLine className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(
                        purchaseOrderData.reduce((sum, po) => sum + po.amount, 0)
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Nilai pesanan dalam 30 hari terakhir</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Pesanan Pembelian</CardTitle>
                  <CardDescription>Daftar semua pesanan pembelian</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <Tabs
                      defaultValue="semua"
                      className="w-[400px]"
                      value={activeTab}
                      onValueChange={setActiveTab}
                    >
                      <TabsList>
                        <TabsTrigger value="semua">Semua</TabsTrigger>
                        <TabsTrigger value="selesai">Selesai</TabsTrigger>
                        <TabsTrigger value="diproses">Diproses</TabsTrigger>
                        <TabsTrigger value="dikirim">Dikirim</TabsTrigger>
                        <TabsTrigger value="dibatalkan">Dibatalkan</TabsTrigger>
                      </TabsList>
                    </Tabs>
                    <div className="relative w-[300px]">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Cari pesanan..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>No. PO</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead>Jumlah Item</TableHead>
                          <TableHead className="text-right">Nilai</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Pembayaran</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPurchaseOrders.length > 0 ? (
                          filteredPurchaseOrders.map((po) => (
                            <TableRow key={po.id}>
                              <TableCell className="font-medium">{po.id}</TableCell>
                              <TableCell>{po.date}</TableCell>
                              <TableCell>{po.supplier}</TableCell>
                              <TableCell>{po.items} item</TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(po.amount)}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(
                                    po.status
                                  )}`}
                                >
                                  {po.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPaymentStatusBadgeColor(
                                    po.paymentStatus
                                  )}`}
                                >
                                  {po.paymentStatus}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="h-24 text-center">
                              Tidak ada pesanan pembelian yang ditemukan.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
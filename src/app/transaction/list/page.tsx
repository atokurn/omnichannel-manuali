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
import { ArrowDownToLine, ArrowUpFromLine, Download, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Contoh data transaksi
const transactionData = [
  {
    id: "TR-001",
    date: "2023-10-15",
    description: "Pembelian Barang",
    amount: 5000000,
    type: "masuk",
    reference: "PO-2023-001",
    status: "selesai",
  },
  {
    id: "TR-002",
    date: "2023-10-16",
    description: "Penjualan Produk",
    amount: 2500000,
    type: "keluar",
    reference: "INV-2023-042",
    status: "selesai",
  },
  {
    id: "TR-003",
    date: "2023-10-18",
    description: "Pembayaran Supplier",
    amount: 3500000,
    type: "keluar",
    reference: "PAY-2023-015",
    status: "selesai",
  },
  {
    id: "TR-004",
    date: "2023-10-20",
    description: "Penerimaan Pembayaran",
    amount: 4200000,
    type: "masuk",
    reference: "REC-2023-028",
    status: "selesai",
  },
  {
    id: "TR-005",
    date: "2023-10-22",
    description: "Biaya Operasional",
    amount: 1800000,
    type: "keluar",
    reference: "EXP-2023-033",
    status: "selesai",
  },
];

export default function TransactionListPage() {
  const router = useRouter(); // Initialize router
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("semua");

  // Filter transaksi berdasarkan tab aktif dan pencarian
  const filteredTransactions = transactionData.filter((transaction) => {
    // Filter berdasarkan tab
    if (activeTab === "masuk" && transaction.type !== "masuk") return false;
    if (activeTab === "keluar" && transaction.type !== "keluar") return false;

    // Filter berdasarkan pencarian
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        transaction.id.toLowerCase().includes(query) ||
        transaction.description.toLowerCase().includes(query) ||
        transaction.reference.toLowerCase().includes(query)
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

  return (
    <div className="[--header-height:calc(--spacing(14))]">
  <SidebarProvider className="flex flex-col">
    <SiteHeader />
    <div className="flex flex-1">
      <TransactionSidebar />
      <SidebarInset>
        <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Daftar Transaksi</h1>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button>
            <Button onClick={() => router.push('/transaction/list/add')}> {/* Update onClick handler */}
              <Plus className="mr-2 h-4 w-4" /> Transaksi Baru
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{transactionData.length}</div>
              <p className="text-xs text-muted-foreground">Transaksi dalam 30 hari terakhir</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Masuk</CardTitle>
              <ArrowDownToLine className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  transactionData
                    .filter((t) => t.type === "masuk")
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </div>
              <p className="text-xs text-muted-foreground">Transaksi masuk dalam 30 hari terakhir</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Keluar</CardTitle>
              <ArrowUpFromLine className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(
                  transactionData
                    .filter((t) => t.type === "keluar")
                    .reduce((sum, t) => sum + t.amount, 0)
                )}
              </div>
              <p className="text-xs text-muted-foreground">Transaksi keluar dalam 30 hari terakhir</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  transactionData.reduce((sum, t) => {
                    return t.type === "masuk" ? sum + t.amount : sum - t.amount;
                  }, 0)
                )}
              </div>
              <p className="text-xs text-muted-foreground">Saldo saat ini</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaksi</CardTitle>
            <CardDescription>Daftar semua transaksi masuk dan keluar</CardDescription>
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
                  <TabsTrigger value="masuk">Masuk</TabsTrigger>
                  <TabsTrigger value="keluar">Keluar</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative w-[300px]">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari transaksi..."
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
                    <TableHead>ID Transaksi</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead>Referensi</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">{transaction.id}</TableCell>
                        <TableCell>{transaction.date}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.reference}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              transaction.type === "masuk"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {transaction.type === "masuk" ? "Masuk" : "Keluar"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={transaction.type === "masuk" ? "text-green-600" : "text-red-600"}
                          >
                            {formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {transaction.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Tidak ada transaksi yang ditemukan.
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
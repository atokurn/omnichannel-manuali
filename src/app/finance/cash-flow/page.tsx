"use client";

import { useState } from "react";
import { FinanceSidebar } from "@/components/finance-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Placeholder for date range picker
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Calendar as CalendarIcon } from "lucide-react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Placeholder data structure - replace with actual data fetching later
const cashFlowData = {
  startDate: "2025-04-01",
  endDate: "2025-04-30",
  operationalActivities: [
    { description: "Penerimaan dari pelanggan", amount: 0 },
    { description: "Total Penerimaan dari pelanggan", amount: 0, isTotal: true },
    { description: "Pembayaran ke pemasok", amount: 0 },
    { description: "Total Pembayaran ke pemasok", amount: 0, isTotal: true },
    { description: "Aset lancar lainnya", amount: 0 },
    { description: "Total Aset lancar lainnya", amount: 0, isTotal: true },
    { description: "Hutang Jangka Pendek", amount: 0 },
    { description: "Total Hutang Jangka Pendek", amount: 0, isTotal: true },
    { description: "Penerimaan/(Pengeluaran) Operasional", amount: 0 },
    { description: "Total Penerimaan/(Pengeluaran) Operasional", amount: 0, isTotal: true },
    { description: "Arus Kas Dari Aktivitas Operasional", amount: 0, isHeaderTotal: true },
  ],
  investingActivities: [
    { description: "Penjualan/(Pembelian) aset", amount: 0 },
    { description: "Total Penjualan/(Pembelian) aset", amount: 0, isTotal: true },
    { description: "Arus Kas Dari Aktivitas Investasi", amount: 0, isHeaderTotal: true },
  ],
  financingActivities: [
    { description: "Penerimaan/(Pembayaran) pinjaman", amount: 0 },
    { description: "Total Penerimaan/(Pembayaran) pinjaman", amount: 0, isTotal: true },
    { description: "Ekuitas/Modal", amount: 0 },
    { description: "Total Ekuitas/Modal", amount: 0, isTotal: true },
    { description: "Arus Kas Dari Aktivitas Pendanaan", amount: 0, isHeaderTotal: true },
  ],
  summary: {
    beginningCashBalance: 0,
    netCashIncreaseDecrease: 0,
    endingCashBalance: 0,
  },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function CashFlowPage() {
  const [startDate, setStartDate] = useState(cashFlowData.startDate);
  const [endDate, setEndDate] = useState(cashFlowData.endDate);
  const [activeTab, setActiveTab] = useState("langsung"); // 'langsung' or 'tidak-langsung'

  // Calculate totals (using placeholder data)
  const totalOperational = cashFlowData.operationalActivities.find(a => a.isHeaderTotal)?.amount ?? 0;
  const totalInvesting = cashFlowData.investingActivities.find(a => a.isHeaderTotal)?.amount ?? 0;
  const totalFinancing = cashFlowData.financingActivities.find(a => a.isHeaderTotal)?.amount ?? 0;
  const netCashFlow = totalOperational + totalInvesting + totalFinancing;
  const endingCashBalance = cashFlowData.summary.beginningCashBalance + netCashFlow;

  return (
    <div className="[--header-height:calc(--spacing(14))] min-h-screen bg-muted/40">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <FinanceSidebar />
          <SidebarInset>
            <div className="flex-1 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Laporan Arus Kas</h1>
                  <p className="text-sm text-muted-foreground">(dalam Rupiah)</p>
                  <p className="text-sm text-muted-foreground">Semua Outlet</p>
                </div>
                <Button variant="outline" className="bg-green-500 text-white hover:bg-green-600">
                  <Download className="mr-2 h-4 w-4" /> Ekspor Laporan
                </Button>
              </div>

              {/* Date Range Picker & Method Tabs */}
              <div className="flex items-center justify-between mb-6">
                <Card className="w-fit">
                  <CardContent className="pt-6 flex items-center space-x-2">
                    <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                    {/* Replace with actual Date Range Picker component */}
                    <Input
                      type="text"
                      readOnly
                      value={`${new Date(startDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(endDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}`}
                      className="w-[250px]"
                    />
                  </CardContent>
                </Card>
                <Tabs
                  defaultValue="langsung"
                  className="w-fit"
                  value={activeTab}
                  onValueChange={setActiveTab}
                >
                  <TabsList>
                    <TabsTrigger value="langsung">Langsung</TabsTrigger>
                    <TabsTrigger value="tidak-langsung">Tidak Langsung</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Details Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[70%]">AKTIVITAS</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Aktivitas Operasional */}
                      <TableRow className="font-semibold bg-muted/30">
                        <TableCell>Aktivitas Operasional</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      {cashFlowData.operationalActivities.map((item, index) => (
                        <TableRow key={`op-${index}`} className={item.isTotal || item.isHeaderTotal ? "font-medium" : ""}>
                          <TableCell className={`${item.isTotal ? 'pl-8' : item.isHeaderTotal ? 'pl-4 bg-muted/20' : 'pl-8'}`}>{item.description}</TableCell>
                          <TableCell className={`text-right ${item.isHeaderTotal ? 'bg-muted/20' : ''}`}>{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}

                      {/* Aktivitas Investasi */}
                      <TableRow className="font-semibold bg-muted/30">
                        <TableCell>Aktivitas Investasi</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      {cashFlowData.investingActivities.map((item, index) => (
                        <TableRow key={`inv-${index}`} className={item.isTotal || item.isHeaderTotal ? "font-medium" : ""}>
                          <TableCell className={`${item.isTotal ? 'pl-8' : item.isHeaderTotal ? 'pl-4 bg-muted/20' : 'pl-8'}`}>{item.description}</TableCell>
                          <TableCell className={`text-right ${item.isHeaderTotal ? 'bg-muted/20' : ''}`}>{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}

                      {/* Aktivitas Pendanaan */}
                      <TableRow className="font-semibold bg-muted/30">
                        <TableCell>Aktivitas Pendanaan</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      {cashFlowData.financingActivities.map((item, index) => (
                        <TableRow key={`fin-${index}`} className={item.isTotal || item.isHeaderTotal ? "font-medium" : ""}>
                          <TableCell className={`${item.isTotal ? 'pl-8' : item.isHeaderTotal ? 'pl-4 bg-muted/20' : 'pl-8'}`}>{item.description}</TableCell>
                          <TableCell className={`text-right ${item.isHeaderTotal ? 'bg-muted/20' : ''}`}>{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}

                      {/* Summary Section */}
                      <TableRow className="font-medium">
                        <TableCell>Saldo Kas Awal Periode</TableCell>
                        <TableCell className="text-right">{formatCurrency(cashFlowData.summary.beginningCashBalance)}</TableCell>
                      </TableRow>
                      <TableRow className="font-medium">
                        <TableCell>Kenaikan (Penurunan) Kas</TableCell>
                        <TableCell className="text-right">{formatCurrency(netCashFlow)}</TableCell>
                      </TableRow>
                      <TableRow className="font-bold bg-muted/50">
                        <TableCell>Saldo Kas Akhir Periode</TableCell>
                        <TableCell className="text-right">{formatCurrency(endingCashBalance)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
"use client";

import { useState } from "react";
import { FinanceSidebar } from "@/components/finance-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Placeholder for date range picker
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Calendar as CalendarIcon } from "lucide-react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Placeholder data structure - replace with actual data fetching later
const profitLossData = {
  startDate: "2025-04-01",
  endDate: "2025-04-30",
  totalGrossProfit: 0,
  totalOperationalProfit: 0,
  totalNetProfit: 0,
  revenue: {
    totalRevenue: 0,
  },
  costOfGoodsSold: {
    totalCOGS: 0,
  },
  operationalExpenses: {
    totalOperationalExpenses: 0,
  },
  otherIncome: {
    totalOtherIncome: 0,
  },
  otherExpenses: {
    totalOtherExpenses: 0,
  },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function ProfitLossPage() {
  const [startDate, setStartDate] = useState(profitLossData.startDate);
  const [endDate, setEndDate] = useState(profitLossData.endDate);

  const grossProfit = profitLossData.revenue.totalRevenue - profitLossData.costOfGoodsSold.totalCOGS;
  const operationalProfit = grossProfit - profitLossData.operationalExpenses.totalOperationalExpenses;
  const netProfit = operationalProfit + profitLossData.otherIncome.totalOtherIncome - profitLossData.otherExpenses.totalOtherExpenses;

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
                  <h1 className="text-2xl font-bold">Laporan Laba Rugi</h1>
                  <p className="text-sm text-muted-foreground">(dalam Rupiah)</p>
                  <p className="text-sm text-muted-foreground">Semua Outlet</p> {/* Added Outlet info */}
                </div>
                <Button variant="outline" className="bg-green-500 text-white hover:bg-green-600">
                  <Download className="mr-2 h-4 w-4" /> Ekspor Laporan
                </Button>
              </div>

              {/* Date Range Picker Placeholder */}
              <div className="mb-6">
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
              </div>

              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Laba Kotor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-cyan-600">{formatCurrency(grossProfit)}</div>
                    <div className="h-1 bg-cyan-500 rounded-full mt-2"></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Laba Operasional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(operationalProfit)}</div>
                    <div className="h-1 bg-blue-500 rounded-full mt-2"></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Laba Bersih</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(netProfit)}</div>
                    <div className="h-1 bg-purple-500 rounded-full mt-2"></div>
                  </CardContent>
                </Card>
              </div>

              {/* Details Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/100">
                      <TableRow>
                        <TableHead className="w-[70%]">DESKRIPSI</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Pendapatan */}
                      <TableRow>
                        <TableCell className="font-medium">Pendapatan</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-8">Total Pendapatan</TableCell>
                        <TableCell className="text-right">{formatCurrency(profitLossData.revenue.totalRevenue)}</TableCell>
                      </TableRow>

                      {/* Harga Pokok Penjualan */}
                      <TableRow>
                        <TableCell className="font-medium">Harga Pokok Penjualan</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-8">Total Harga Pokok Penjualan</TableCell>
                        <TableCell className="text-right">{formatCurrency(profitLossData.costOfGoodsSold.totalCOGS)}</TableCell>
                      </TableRow>

                      {/* Laba (Rugi) Kotor */}
                      <TableRow className="font-semibold bg-muted/80">
                        <TableCell>Laba (Rugi) Kotor</TableCell>
                        <TableCell className="text-right">{formatCurrency(grossProfit)}</TableCell>
                      </TableRow>

                      {/* Beban Operasional */}
                      <TableRow>
                        <TableCell className="font-medium">Beban Operasional</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-8">Total Beban Operasional</TableCell>
                        <TableCell className="text-right">{formatCurrency(profitLossData.operationalExpenses.totalOperationalExpenses)}</TableCell>
                      </TableRow>

                      {/* Laba (Rugi) Operasional */}
                      <TableRow className="font-semibold bg-muted/80">
                        <TableCell>Laba (Rugi) Operasional</TableCell>
                        <TableCell className="text-right">{formatCurrency(operationalProfit)}</TableCell>
                      </TableRow>

                      {/* Pendapatan Lainnya */}
                      <TableRow>
                        <TableCell className="font-medium">Pendapatan Lainnya</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-8">Total Pendapatan Lainnya</TableCell>
                        <TableCell className="text-right">{formatCurrency(profitLossData.otherIncome.totalOtherIncome)}</TableCell>
                      </TableRow>

                      {/* Beban Lainnya */}
                      <TableRow>
                        <TableCell className="font-medium">Beban Lainnya</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="pl-8">Total Beban Lainnya</TableCell>
                        <TableCell className="text-right">{formatCurrency(profitLossData.otherExpenses.totalOtherExpenses)}</TableCell>
                      </TableRow>

                      {/* Laba (Rugi) Bersih */}
                      <TableRow className="font-bold bg-muted/80">
                        <TableCell>Laba (Rugi) Bersih</TableCell>
                        <TableCell className="text-right">{formatCurrency(netProfit)}</TableCell>
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
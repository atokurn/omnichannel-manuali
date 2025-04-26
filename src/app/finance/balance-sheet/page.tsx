"use client";

import { useState } from "react";
import { FinanceSidebar } from "@/components/finance-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Assuming date picker might use Input or a dedicated component
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Calendar as CalendarIcon } from "lucide-react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Placeholder data structure - replace with actual data fetching later
const balanceSheetData = {
  date: "25 April 2025",
  totalAsset: 0,
  totalLiability: 0,
  totalEquity: 0,
  assets: {
    currentAssets: [
      { description: "Kas Dan Setara Kas", amount: 0 },
      { description: "Jumlah Kas Dan Setara Kas", amount: 0, isTotal: true },
      { description: "Piutang Usaha", amount: 0 },
      { description: "Jumlah Piutang Usaha", amount: 0, isTotal: true },
      { description: "Persediaan", amount: 0 },
      { description: "Jumlah Persediaan", amount: 0, isTotal: true },
      { description: "Aset Lancar Lainnya", amount: 0 },
      { description: "Jumlah Aset Lancar Lainnya", amount: 0, isTotal: true },
      { description: "JUMLAH ASET LANCAR", amount: 0, isHeaderTotal: true },
    ],
    fixedAssets: [
      { description: "Aset Tetap", amount: 0 },
      { description: "Jumlah Aset Tetap", amount: 0, isTotal: true },
      { description: "Akumulasi Penyusutan", amount: 0 },
      { description: "Jumlah Akumulasi Penyusutan", amount: 0, isTotal: true },
      { description: "JUMLAH ASET TETAP", amount: 0, isHeaderTotal: true },
    ],
  },
  liabilitiesAndEquity: {
    liabilities: {
      shortTerm: [
        { description: "Hutang Usaha", amount: 0 },
        { description: "Jumlah Hutang Usaha", amount: 0, isTotal: true },
        { description: "Hutang Jangka Pendek Lainnya", amount: 0 },
        { description: "Jumlah Hutang Jangka Pendek Lainnya", amount: 0, isTotal: true },
        { description: "JUMLAH HUTANG JANGKA PENDEK", amount: 0, isHeaderTotal: true },
      ],
      longTerm: [
        { description: "Hutang Jangka Panjang", amount: 0 },
        { description: "Jumlah Hutang Jangka Panjang", amount: 0, isTotal: true },
        { description: "JUMLAH HUTANG JANGKA PANJANG", amount: 0, isHeaderTotal: true },
      ],
    },
    equity: [
      { description: "Laba Ditahan", amount: 0 },
      { description: "Laba Tahun Ini", amount: 0 },
      { description: "JUMLAH EKUITAS", amount: 0, isHeaderTotal: true },
    ],
  },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function BalanceSheetPage() {
  const [selectedDate, setSelectedDate] = useState("2025-04-25"); // Default date

  const totalAssets = balanceSheetData.assets.currentAssets.find(a => a.isHeaderTotal)?.amount ?? 0 +
                      (balanceSheetData.assets.fixedAssets.find(a => a.isHeaderTotal)?.amount ?? 0);
  const totalLiabilities = (balanceSheetData.liabilitiesAndEquity.liabilities.shortTerm.find(l => l.isHeaderTotal)?.amount ?? 0) +
                           (balanceSheetData.liabilitiesAndEquity.liabilities.longTerm.find(l => l.isHeaderTotal)?.amount ?? 0);
  const totalEquity = balanceSheetData.liabilitiesAndEquity.equity.find(e => e.isHeaderTotal)?.amount ?? 0;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  return (
    <div className="[--header-height:calc(--spacing(14))]">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <FinanceSidebar />
          <SidebarInset>
            <div className="flex-1 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold">Laporan Neraca</h1>
                  <p className="text-sm text-muted-foreground">(dalam Rupiah)</p>
                </div>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Ekspor Laporan
                </Button>
              </div>

              <div className="mb-6">
                <Card className="w-fit">
                  <CardContent className="pt-6">
                    <div className="relative w-[240px]">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="pl-10"
                      />
                      {/* Replace with ShadCN Date Picker if available and preferred */}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Aset</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalAssets)}</div>
                    <div className="h-1 bg-blue-500 rounded-full mt-2"></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Hutang</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(totalLiabilities)}</div>
                     <div className="h-1 bg-red-500 rounded-full mt-2"></div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Ekuitas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">{formatCurrency(totalEquity)}</div>
                     <div className="h-1 bg-purple-500 rounded-full mt-2"></div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[60%]">DESKRIPSI</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* ASET */}
                      <TableRow className="font-semibold bg-muted/30">
                        <TableCell>ASET</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow className="font-medium">
                        <TableCell className="pl-8">ASET LANCAR</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      {balanceSheetData.assets.currentAssets.map((item, index) => (
                        <TableRow key={`ca-${index}`} className={item.isTotal || item.isHeaderTotal ? "font-medium" : ""}>
                          <TableCell className={`${item.isTotal ? 'pl-12' : item.isHeaderTotal ? 'pl-8 bg-muted/20' : 'pl-12'}`}>{item.description}</TableCell>
                          <TableCell className={`text-right ${item.isHeaderTotal ? 'bg-muted/20' : ''}`}>{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-medium">
                        <TableCell className="pl-8">ASET TETAP</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      {balanceSheetData.assets.fixedAssets.map((item, index) => (
                         <TableRow key={`fa-${index}`} className={item.isTotal || item.isHeaderTotal ? "font-medium" : ""}>
                          <TableCell className={`${item.isTotal ? 'pl-12' : item.isHeaderTotal ? 'pl-8 bg-muted/20' : 'pl-12'}`}>{item.description}</TableCell>
                          <TableCell className={`text-right ${item.isHeaderTotal ? 'bg-muted/20' : ''}`}>{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-muted/50">
                        <TableCell>JUMLAH ASET</TableCell>
                        <TableCell className="text-right">{formatCurrency(totalAssets)}</TableCell>
                      </TableRow>

                      {/* HUTANG DAN EKUITAS */}
                      <TableRow className="font-semibold bg-muted/30">
                        <TableCell>HUTANG DAN EKUITAS</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow className="font-medium">
                        <TableCell className="pl-8">HUTANG</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow className="font-medium">
                        <TableCell className="pl-12">HUTANG JANGKA PENDEK</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      {balanceSheetData.liabilitiesAndEquity.liabilities.shortTerm.map((item, index) => (
                         <TableRow key={`stl-${index}`} className={item.isTotal || item.isHeaderTotal ? "font-medium" : ""}>
                          <TableCell className={`${item.isTotal ? 'pl-16' : item.isHeaderTotal ? 'pl-12 bg-muted/20' : 'pl-16'}`}>{item.description}</TableCell>
                          <TableCell className={`text-right ${item.isHeaderTotal ? 'bg-muted/20' : ''}`}>{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                       <TableRow className="font-medium">
                        <TableCell className="pl-12">HUTANG JANGKA PANJANG</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      {balanceSheetData.liabilitiesAndEquity.liabilities.longTerm.map((item, index) => (
                         <TableRow key={`ltl-${index}`} className={item.isTotal || item.isHeaderTotal ? "font-medium" : ""}>
                          <TableCell className={`${item.isTotal ? 'pl-16' : item.isHeaderTotal ? 'pl-12 bg-muted/20' : 'pl-16'}`}>{item.description}</TableCell>
                          <TableCell className={`text-right ${item.isHeaderTotal ? 'bg-muted/20' : ''}`}>{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-medium bg-muted/20">
                        <TableCell className="pl-8">JUMLAH HUTANG</TableCell>
                        <TableCell className="text-right">{formatCurrency(totalLiabilities)}</TableCell>
                      </TableRow>
                      <TableRow className="font-medium">
                        <TableCell className="pl-8">EKUITAS</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      {balanceSheetData.liabilitiesAndEquity.equity.map((item, index) => (
                         <TableRow key={`eq-${index}`} className={item.isHeaderTotal ? "font-medium bg-muted/20" : ""}>
                          <TableCell className={`${item.isHeaderTotal ? 'pl-8' : 'pl-12'}`}>{item.description}</TableCell>
                          <TableCell className={`text-right ${item.isHeaderTotal ? 'bg-muted/20' : ''}`}>{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-muted/50">
                        <TableCell>JUMLAH HUTANG DAN EKUITAS</TableCell>
                        <TableCell className="text-right">{formatCurrency(totalLiabilitiesAndEquity)}</TableCell>
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
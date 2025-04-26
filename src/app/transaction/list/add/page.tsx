"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { TransactionSidebar } from "@/components/transaction-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar as CalendarIcon, Plus, Trash2, Upload } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface TransactionDetail {
  id: number;
  accountId: string;
  description: string;
  amount: number;
}

export default function AddTransactionPage() {
  const router = useRouter();
  const [transactionType, setTransactionType] = useState<"masuk" | "keluar">("keluar");
  const [outlet, setOutlet] = useState<string>("");
  const [transactionNumber, setTransactionNumber] = useState<string>(""); // Contoh: BKM-1001
  const [sourceAccount, setSourceAccount] = useState<string>("");
  const [transactionDate, setTransactionDate] = useState<Date | undefined>(new Date());
  const [transactionTime, setTransactionTime] = useState<string>("14:07"); // Default time
  const [details, setDetails] = useState<TransactionDetail[]>([]);
  const [description, setDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [nextDetailId, setNextDetailId] = useState(1);

  const handleAddDetail = () => {
    setDetails([...details, { id: nextDetailId, accountId: "", description: "", amount: 0 }]);
    setNextDetailId(nextDetailId + 1);
  };

  const handleRemoveDetail = (id: number) => {
    setDetails(details.filter(detail => detail.id !== id));
  };

  const handleDetailChange = (id: number, field: keyof TransactionDetail, value: string | number) => {
    setDetails(details.map(detail =>
      detail.id === id ? { ...detail, [field]: value } : detail
    ));
  };

  const calculateTotal = () => {
    return details.reduce((sum, detail) => sum + Number(detail.amount || 0), 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFile(event.target.files[0]);
      // Add validation for size and format here if needed
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({
      transactionType,
      outlet,
      transactionNumber,
      sourceAccount,
      transactionDate,
      transactionTime,
      details,
      description,
      file,
      total: calculateTotal(),
    });
    // Redirect or show success message
    // router.push('/transaction/list');
  };

  return (
    <div className="[--header-height:calc(--spacing(14))] min-h-screen bg-muted/40">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <TransactionSidebar />
          <SidebarInset>
            <main className="flex-1 p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Tambah Transaksi Baru</h1>
                <div className="flex gap-2">
                   <Button variant="outline" onClick={() => router.back()}>Batal</Button>
                   <Button onClick={handleSubmit}>Simpan</Button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Sidebar/Section (optional, based on image structure) */}
                {/* <div className="lg:col-span-1"> ... </div> */}

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informasi Transaksi {transactionType === 'masuk' ? 'Pemasukan' : 'Pengeluaran'} Kas & Bank</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="transactionType">Jenis Transaksi*</Label>
                        <RadioGroup
                          defaultValue="keluar"
                          value={transactionType}
                          onValueChange={(value: "masuk" | "keluar") => setTransactionType(value)}
                          className="flex space-x-4"
                          id="transactionType"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="masuk" id="masuk" />
                            <Label htmlFor="masuk">Masuk</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="keluar" id="keluar" />
                            <Label htmlFor="keluar">Keluar</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="outlet">Outlet*</Label>
                        <Select value={outlet} onValueChange={setOutlet}>
                          <SelectTrigger id="outlet">
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Add Outlet options here */}
                            <SelectItem value="outlet1">Outlet 1</SelectItem>
                            <SelectItem value="outlet2">Outlet 2</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transactionNumber">No Transaksi*</Label>
                        <Input
                          id="transactionNumber"
                          placeholder="Contoh: BKM-1001"
                          value={transactionNumber}
                          onChange={(e) => setTransactionNumber(e.target.value)}
                          required
                        />
                        <p className="text-xs text-muted-foreground">Nomor transaksi akan terisi otomatis jika dikosongkan</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sourceAccount">Akun Asal*</Label>
                        <Select value={sourceAccount} onValueChange={setSourceAccount}>
                          <SelectTrigger id="sourceAccount">
                            <SelectValue placeholder="Pilih" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Add Account options here */}
                            <SelectItem value="akun1">Kas Besar</SelectItem>
                            <SelectItem value="akun2">Bank BCA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transactionDate">Tanggal Transaksi*</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !transactionDate && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {transactionDate ? format(transactionDate, "PPP") : <span>Pilih tanggal</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={transactionDate}
                              onSelect={setTransactionDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transactionTime">Waktu</Label>
                        <Input
                          id="transactionTime"
                          type="time"
                          value={transactionTime}
                          onChange={(e) => setTransactionTime(e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Detail {transactionType === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}</CardTitle>
                      <Button type="button" size="sm" variant="outline" onClick={handleAddDetail}>
                        <Plus className="mr-2 h-4 w-4" /> Pilih Akun
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {details.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h10l4 4v10a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">Data tidak tersedia</h3>
                          <p className="mt-1 text-sm text-gray-500">Belum ada data yang dapat ditampilkan di halaman ini</p>
                        </div>
                      ) : (
                        <div className="rounded-md border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Nama Akun*</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead className="text-right">Jumlah*</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {details.map((detail) => (
                                <TableRow key={detail.id}>
                                  <TableCell>
                                    <Select
                                      value={detail.accountId}
                                      onValueChange={(value) => handleDetailChange(detail.id, 'accountId', value)}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Pilih Akun" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {/* Add Detail Account options here */}
                                        <SelectItem value="detailAkun1">Biaya Listrik</SelectItem>
                                        <SelectItem value="detailAkun2">Biaya Air</SelectItem>
                                        <SelectItem value="detailAkun3">Pendapatan Jasa</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      placeholder="Deskripsi..."
                                      value={detail.description}
                                      onChange={(e) => handleDetailChange(detail.id, 'description', e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={detail.amount}
                                      onChange={(e) => handleDetailChange(detail.id, 'amount', e.target.valueAsNumber || 0)}
                                      className="text-right"
                                      required
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleRemoveDetail(detail.id)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                      <div className="flex justify-end mt-4 pr-16">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total</p>
                          <p className="text-xl font-semibold">{formatCurrency(calculateTotal())}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Keterangan & Lampiran</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="description">Keterangan</Label>
                        <Textarea
                          id="description"
                          placeholder="Contoh: Keterangan penerimaan"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fileUpload">Lampirkan Berkas</Label>
                        <div className="flex items-center justify-center w-full">
                          <label
                            htmlFor="fileUpload"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 dark:hover:border-gray-500"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-3 text-gray-400" />
                              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                {file ? file.name : <><span className="font-semibold">Pilih atau letakkan</span> berkas di sini</>}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">JPG, JPEG, PNG, PDF, EXCEL (MAX. 1MB)</p>
                            </div>
                            <Input id="fileUpload" type="file" className="hidden" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf,.xls,.xlsx" />
                          </label>
                        </div>
                        <p className="text-xs text-muted-foreground">Hanya dapat input 1 file per menu transaksi dengan ukuran maksimal 1 MB. Format dapat berupa JPG, JPEG, PNG, PDF, EXCEL</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </form>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}
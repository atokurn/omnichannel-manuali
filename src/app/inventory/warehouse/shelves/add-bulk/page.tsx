'use client';

import { useState, useEffect } from 'react';
import { InventorySidebar } from "@/components/inventory-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { dummyWarehousesData } from "@/lib/services/warehouse-service";
import { dummyAreasData } from "@/lib/services/area-service";
import { Shelf } from "@/lib/services/shelf-service";
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, PackageCheck, Info, Layers, Grid, Eye } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ShelfPreviewItem {
  name: string;
  position: string;
}

// Component for visual grid preview
const VisualGridPreview = ({ 
  prefix, 
  column, 
  startRow, 
  rowCount, 
  selectedStatus 
}: { 
  prefix: string; 
  column: string; 
  startRow: string; 
  rowCount: string; 
  selectedStatus: string;
}) => {
  // Convert inputs to numbers for calculations
  const columnCount = parseInt(column) || 1;
  const startRowNum = parseInt(startRow) || 1;
  const rowCountNum = parseInt(rowCount) || 0;
  
  // Function to get status color
  const getStatusColor = (status: string) => {
    return status === 'Aktif' ? 'bg-green-500' : 'bg-red-400';
  };
  
  // Don't render grid if inputs are invalid
  if (!prefix || rowCountNum <= 0 || rowCountNum > 50 || columnCount <= 0 || columnCount > 10) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-slate-400">
        <Grid className="h-10 w-10 mb-2 opacity-40" />
        <p>Isi parameter rak untuk melihat preview grid</p>
      </div>
    );
  }
  
  return (
    <div className="mt-2 p-2 border rounded-md bg-slate-50">
      <div className="text-xs text-slate-500 mb-3 font-medium">
        Kolom 1-{columnCount}, Baris {startRowNum}-{startRowNum + rowCountNum - 1}
      </div>
      
      <div className="max-h-[500px] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: columnCount }).map((_, colIndex) => {
            const colNum = colIndex + 1;
            return (
              <div key={`col-${colNum}`} className="mb-2">
                <div className="text-sm font-medium mb-2 text-slate-700 border-b pb-1">Kolom {colNum}</div>
                <div className="grid grid-cols-1 gap-2">
                  {Array.from({ length: rowCountNum }).map((_, rowIndex) => {
                    const rowNum = startRowNum + rowIndex;
                    const shelfName = `${prefix}-${colNum}-${rowNum}`;
                    
                    return (
                      <div key={`${colNum}-${rowNum}`} className="flex items-center">
                        <div className={`w-10 h-10 flex items-center justify-center text-xs rounded-md mr-2 border ${getStatusColor(selectedStatus)} text-white font-medium`}>
                          {rowNum}
                        </div>
                        <div className="flex-1 p-2 border rounded-md bg-white shadow-sm">
                          <div className="font-medium text-sm">{shelfName}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function AddBulkShelfPage() {
  const router = useRouter();
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  
  // New form fields for structured naming
  const [prefix, setPrefix] = useState('');
  const [column, setColumn] = useState('1');
  const [startRow, setStartRow] = useState('1');
  const [rowCount, setRowCount] = useState('5');
  
  const [capacity, setCapacity] = useState('');
  const [status, setStatus] = useState('Aktif');
  const [filteredAreas, setFilteredAreas] = useState(dummyAreasData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [previewShelves, setPreviewShelves] = useState<ShelfPreviewItem[]>([]);


  // Handle warehouse selection change
  const handleWarehouseChange = (value: string) => {
    setSelectedWarehouse(value);
    setSelectedArea('');

    // Filter areas based on selected warehouse
    if (value === '') {
      setFilteredAreas(dummyAreasData);
    } else {
      setFilteredAreas(dummyAreasData.filter(area => area.warehouseId === value));
    }
  };

  // Generate preview when inputs change
  useEffect(() => {
    generatePreview();
  }, [prefix, column, startRow, rowCount]);

  const generatePreview = () => {
    if (!prefix || parseInt(rowCount) <= 0 || parseInt(rowCount) > 50 || parseInt(column) <= 0 || parseInt(column) > 10) {
      setPreviewShelves([]);
      return;
    }

    const startRowNum = parseInt(startRow) || 1;
    const rowCountNum = parseInt(rowCount) || 5;
    const columnCount = parseInt(column) || 2;
    const newShelves: ShelfPreviewItem[] = [];

    // Generate shelves for each column and row combination
    for (let c = 1; c <= columnCount; c++) {
      for (let i = 0; i < rowCountNum; i++) {
        const rowNum = startRowNum + i;
        // Generate name in format: Prefix-Column-Row
        const name = `${prefix}-${c}-${rowNum}`;
        
        // Generate position in format: Rak{prefixNum}, Kolom{columnNum}, Baris{rowNum}
        const position = `Rak-${prefix}, Kolom-${c}, Baris-${rowNum}`;

        newShelves.push({ name, position });
      }
    }

    setPreviewShelves(newShelves);
  };

  // Validate and submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validate form
    if (!prefix) {
      setFormError('Awalan (Prefix) harus diisi');
      return;
    }

    if (!selectedWarehouse) {
      setFormError('Gudang harus dipilih');
      return;
    }

    if (!selectedArea) {
      setFormError('Area harus dipilih');
      return;
    }

    if (!capacity) {
      setFormError('Kapasitas harus diisi');
      return;
    }

    const rowCountNum = parseInt(rowCount);
    if (isNaN(rowCountNum) || rowCountNum <= 0 || rowCountNum > 50) {
      setFormError('Jumlah baris harus antara 1-50');
      return;
    }
    
    const columnCount = parseInt(column);
    if (isNaN(columnCount) || columnCount <= 0 || columnCount > 10) {
      setFormError('Jumlah kolom harus antara 1-10');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      try {
        // Find warehouse and area names
        const selectedWarehouseObj = dummyWarehousesData.find(w => w.id === selectedWarehouse);
        const warehouseName = selectedWarehouseObj ? selectedWarehouseObj.name : '';
        
        const selectedAreaObj = dummyAreasData.find(a => a.id === selectedArea);
        const areaName = selectedAreaObj ? selectedAreaObj.name : '';

        // Create bulk shelves
        const startRowNum = parseInt(startRow) || 1;
        const columnCount = parseInt(column) || 2;
        const newShelves: Shelf[] = [];

        // Create shelves for each column and row combination
        for (let c = 1; c <= columnCount; c++) {
          for (let i = 0; i < rowCountNum; i++) {
            const rowNum = startRowNum + i;
            
            // Generate name in format: Prefix-Column-Row
            const name = `${prefix}-${c}-${rowNum}`;
            
            // Generate position in format: Rak{prefixNum}, Kolom{columnNum}, Baris{rowNum}
            const position = `Rak-${prefix}, Kolom-${c}, Baris-${rowNum}`;

            const shelf: Shelf = {
              id: Date.now().toString() + c + i, // Generate temporary ID with column and row info
              name,
              warehouseId: selectedWarehouse,
              warehouseName,
              areaId: selectedArea,
              areaName,
              position,
              capacity: parseInt(capacity),
              totalSku: 0,
              status,
              createdAt: new Date().toISOString()
            };

            newShelves.push(shelf);
          }
        }

        // Here we would send the data to the API/database
        console.log('Bulk shelves to add:', newShelves);
        
        setFormSuccess(`${newShelves.length} rak berhasil ditambahkan!`);
        
        // Redirect after success
        setTimeout(() => {
          router.push('/inventory/warehouse/shelves');
        }, 1500);
      } catch (error) {
        console.error('Error saat menyimpan data:', error);
        setFormError('Terjadi kesalahan saat menyimpan data');
      } finally {
        setIsSubmitting(false);
      }
    }, 1000);
  };

  return (
    <SidebarProvider className="flex flex-col">
      <SiteHeader />
      <div className="flex-1 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/inventory/warehouse/shelves')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-semibold">Tambah Rak Bulk</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Form Tambah Rak Bulk</CardTitle>
              <CardDescription>
                Tambahkan beberapa rak sekaligus dengan pola penamaan terstruktur.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}
              
              {formSuccess && (
                <Alert variant="success" className="mb-6 bg-green-50 text-green-800 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Berhasil</AlertTitle>
                  <AlertDescription>{formSuccess}</AlertDescription>
                </Alert>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-2">
                    <div className="flex gap-2 items-start">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-700 font-medium mb-1">Format Penamaan</p>
                        <p className="text-sm text-blue-600">
                          Rak akan diberi nama dengan format: <code className="bg-blue-100 px-1 rounded">Awalan-Kolom-Baris</code>
                          <br />
                          Contoh: <code className="bg-blue-100 px-1 rounded">A-2-28</code> untuk rak dengan awalan A, kolom 2, baris 28.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="warehouseId">
                        Gudang <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedWarehouse}
                        onValueChange={handleWarehouseChange}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih gudang" />
                        </SelectTrigger>
                        <SelectContent>
                          {dummyWarehousesData.map(warehouse => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                              {warehouse.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="areaId">
                        Area <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedArea}
                        onValueChange={setSelectedArea}
                        disabled={!selectedWarehouse || isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih area" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredAreas.map(area => (
                            <SelectItem key={area.id} value={area.id}>
                              {area.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Struktur Penamaan section */}
                  <div className="border rounded-md p-4">
                    <h3 className="text-base font-medium mb-4">Struktur Penamaan Rak</h3>
                    
                    <div className="grid gap-4">
                      <div className="grid gap-3">
                        <Label htmlFor="prefix">
                          Awalan <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="prefix"
                          value={prefix}
                          onChange={(e) => setPrefix(e.target.value)}
                          placeholder="Contoh: A, B, C, dst."
                          disabled={isSubmitting}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="grid gap-3">
                          <Label htmlFor="column">
                            Jumlah Kolom <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="column"
                            type="number"
                            min="1"
                            max="10"
                            value={column}
                            onChange={(e) => setColumn(e.target.value)}
                            placeholder="Jumlah kolom (1-10)"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                        
                        <div className="grid gap-3">
                          <Label htmlFor="startRow">
                            Baris Awal <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="startRow"
                            type="number"
                            min="1"
                            value={startRow}
                            onChange={(e) => setStartRow(e.target.value)}
                            placeholder="Baris awal"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                        
                        <div className="grid gap-3">
                          <Label htmlFor="rowCount">
                            Jumlah Baris <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="rowCount"
                            type="number"
                            min="1"
                            max="50"
                            value={rowCount}
                            onChange={(e) => setRowCount(e.target.value)}
                            placeholder="Jumlah baris (1-50)"
                            disabled={isSubmitting}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm text-slate-500">
                          Format posisi akan menjadi: <code className="bg-slate-100 px-1 rounded">Rak {prefix}, Kolom 1-{column}, Baris {startRow}-{parseInt(startRow) + parseInt(rowCount) - 1}</code>
                        </p>
                      </div>
                      
                      <div className="mt-4 border rounded-md p-4 bg-slate-50">
                        <h3 className="text-base font-medium mb-3">Preview</h3>
                        <VisualGridPreview 
                          prefix={prefix} 
                          column={column} 
                          startRow={startRow} 
                          rowCount={rowCount}
                          selectedStatus={status}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="capacity">
                        Kapasitas per Rak (unit) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="capacity"
                        type="number"
                        min="1"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        placeholder="Kapasitas dalam unit"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="status">
                        Status
                      </Label>
                      <Select
                        value={status}
                        onValueChange={setStatus}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aktif">Aktif</SelectItem>
                          <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <CardFooter className="flex justify-end gap-2 px-0 pt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/inventory/warehouse/shelves')}
                    disabled={isSubmitting}
                  >
                    Batal
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span> Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Simpan {previewShelves.length} Rak
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>

          {/* Preview card */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    Lihat rak yang akan dibuat
                  </CardDescription>
                </div>
                <Badge variant="outline" className="whitespace-nowrap">
                  <Layers className="h-3 w-3 mr-1" /> 
                  {previewShelves.length} Rak
                </Badge>
              </CardHeader>
              <CardContent>
                {previewShelves.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">#</TableHead>
                          <TableHead>Nama Rak</TableHead>
                          <TableHead>Posisi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewShelves.slice(0, 10).map((shelf, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                            <TableCell className="font-medium">{shelf.name}</TableCell>
                            <TableCell>{shelf.position || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {previewShelves.length > 10 && (
                      <div className="py-2 px-4 border-t text-center text-sm text-muted-foreground">
                        +{previewShelves.length - 10} rak lainnya
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <PackageCheck className="mx-auto h-8 w-8 mb-2 opacity-50" />
                    <p>Isi formulir untuk melihat preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Help card with tips */}
            <Card>
              <CardHeader>
                <CardTitle>Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    Gunakan huruf (A, B, C) atau angka untuk awalan rak
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    Kolom dan baris menentukan lokasi fisik rak
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    Batasi jumlah baris (max. 50) untuk performa yang baik
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-500 font-bold">•</span>
                    Lihat preview grid pada form untuk melihat tata letak rak
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
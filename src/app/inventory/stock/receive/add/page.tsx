'use client';

import React, { useState, useEffect } from 'react'; // Added useEffect
import { InventorySidebar } from '@/components/inventory-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { DataTable } from '@/components/data-table/data-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton'; // Import skeleton
import { PlusCircle, Trash2, ScanLine, Loader2 } from 'lucide-react'; // Added Loader2
import { FormattedMaterial } from '@/lib/types'; // Assuming this type is used or needed

// Define types for the form and items (adjust as needed)
interface ReceiveAddItem {
  id: string; // Temporary ID for client-side handling
  sku: string;
  productName: string;
  quantityReceived: number;
  // Add other relevant item fields like expected quantity from PO
  quantityExpected?: number; // Optional: Expected quantity from PO
}

// Dummy PO Data structure (replace with actual API response type)
interface POData {
  warehouseId: string;
  items: Array<{ sku: string; productName: string; quantityExpected: number }>;
}

// Dummy function to simulate fetching PO data (replace with actual API call)
const fetchPOData = async (poId: string): Promise<POData | null> => {
  console.log('Fetching PO Data for:', poId);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Example: Check if PO ID is 'PO-123'
  if (poId === 'PO-123') {
    return {
      warehouseId: '1', // Gudang Pusat
      items: [
        { sku: 'LAP-ASUS-01', productName: 'Laptop Asus Zenbook', quantityExpected: 5 },
        { sku: 'MOUSE-LOGI-02', productName: 'Mouse Logitech MX Master', quantityExpected: 10 },
      ],
    };
  }
  // Example: Check if PO ID is 'PO-456'
   if (poId === 'PO-456') {
    return {
      warehouseId: '2', // Gudang Cabang
      items: [
        { sku: 'KB-MECH-03', productName: 'Keyboard Mechanical Keychron', quantityExpected: 3 },
      ],
    };
  }

  return null; // Return null if PO not found or invalid
};

export default function AddReceiveStockPage() {
  const [receiveDate, setReceiveDate] = useState<Date | undefined>(new Date());
  const [sourceType, setSourceType] = useState<string>('');
  const [sourceId, setSourceId] = useState<string>('');
  const [warehouseId, setWarehouseId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [items, setItems] = useState<ReceiveAddItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState<string>('');
  const [isLoadingPO, setIsLoadingPO] = useState<boolean>(false);
  const [poError, setPoError] = useState<string | null>(null);

  // Dummy data for selects (replace with actual data fetching)
  const warehouses = [
    { id: '1', name: 'Gudang Pusat' },
    { id: '2', name: 'Gudang Cabang' },
  ];
  const sourceTypes = [
    { id: 'po', name: 'Purchase Order' },
    { id: 'transfer', name: 'Warehouse Transfer' },
    // Add other source types if needed
  ];

  // Effect to fetch PO data when sourceId changes and sourceType is 'po'
  useEffect(() => {
    if (sourceType === 'po' && sourceId) {
      const loadPOData = async () => {
        setIsLoadingPO(true);
        setPoError(null);
        setWarehouseId(''); // Reset warehouse and items
        setItems([]);
        try {
          const data = await fetchPOData(sourceId);
          if (data) {
            setWarehouseId(data.warehouseId);
            // Map PO items to ReceiveAddItem format
            const poItems = data.items.map((item, index) => ({
              id: `po-${sourceId}-${index}`, // Generate a unique ID based on PO
              sku: item.sku,
              productName: item.productName,
              quantityExpected: item.quantityExpected,
              quantityReceived: 0, // Default received quantity to 0
            }));
            setItems(poItems);
          } else {
            setPoError('Nomor PO tidak ditemukan atau tidak valid.');
          }
        } catch (error) {
          console.error('Error fetching PO data:', error);
          setPoError('Gagal mengambil data PO.');
        } finally {
          setIsLoadingPO(false);
        }
      };
      loadPOData();
    } else {
      // Reset if source type is not PO or sourceId is empty
      setWarehouseId('');
      setItems([]);
      setPoError(null);
    }
  }, [sourceId, sourceType]);


  const handleBarcodeScan = () => {
    // TODO: Implement logic to find product by barcode and increment quantity
    console.log('Barcode scanned:', barcodeInput);
    // Find product in items list, if exists, increment quantityReceived
    // If not exists, fetch product details and add as a new item (manual add style)
    const existingItemIndex = items.findIndex(item => item.sku === `SKU-${barcodeInput}`);
    if (existingItemIndex > -1) {
        const updatedItems = [...items];
        updatedItems[existingItemIndex].quantityReceived += 1;
        setItems(updatedItems);
    } else {
        // If item not from PO/Transfer, add manually (or fetch details)
         const newItem: ReceiveAddItem = {
          id: Date.now().toString(), // Simple unique ID
          sku: `SKU-${barcodeInput}`,
          productName: `Product for ${barcodeInput}`, // Fetch actual name if possible
          quantityReceived: 1,
        };
        setItems([...items, newItem]);
    }
    setBarcodeInput(''); // Clear input after scan
  };

  const handleAddItemManually = () => {
    // Add an empty row or open a modal for manual item entry
    console.log('Add item manually');
     const newItem: ReceiveAddItem = {
      id: Date.now().toString(), // Simple unique ID
      sku: ``, // User needs to fill this
      productName: ``, // User needs to fill this
      quantityReceived: 1,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    setItems(items.map(item => (item.id === id ? { ...item, quantityReceived: quantity } : item)));
  };

  // Handle changes for manually added items (SKU, Product Name)
  const handleItemInputChange = (id: string, field: keyof ReceiveAddItem, value: string) => {
    setItems(items.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement submission logic, including validation
    console.log('Submitting receive data:', {
      receiveDate,
      sourceType,
      sourceId,
      warehouseId,
      notes,
      items,
    });
    // Add validation here (e.g., check if warehouse is selected, items exist)
    // Reset form or redirect after successful submission
  };

  // Columns for the items table - Adjusted for new layout and manual input
  const itemColumns = [
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }: any) => (
        // Allow editing SKU only for manually added items (e.g., ID doesn't start with 'po-')
        !row.original.id.startsWith('po-') ? (
          <Input
            value={row.original.sku}
            onChange={(e) => handleItemInputChange(row.original.id, 'sku', e.target.value)}
            className="min-w-[150px]"
            placeholder="Masukkan SKU"
          />
        ) : (
          row.original.sku
        )
      ),
    },
    {
      accessorKey: 'productName',
      header: 'Product Name',
       cell: ({ row }: any) => (
        // Allow editing Product Name only for manually added items
        !row.original.id.startsWith('po-') ? (
          <Input
            value={row.original.productName}
            onChange={(e) => handleItemInputChange(row.original.id, 'productName', e.target.value)}
            className="min-w-[250px]"
            placeholder="Nama Produk"
          />
        ) : (
          row.original.productName
        )
      ),
    },
    {
      accessorKey: 'quantityExpected',
      header: 'Qty Expected',
      cell: ({ row }: any) => row.original.quantityExpected ?? '-', // Show expected qty if available
    },
    {
      accessorKey: 'quantityReceived',
      header: 'Qty Received',
      cell: ({ row }: any) => (
        <Input
          type="number"
          min="0"
          value={row.original.quantityReceived}
          onChange={(e) => handleQuantityChange(row.original.id, parseInt(e.target.value, 10) || 0)}
          className="w-24"
        />
      ),
    },
    {
      id: 'actions',
      cell: ({ row }: any) => (
        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(row.original.id)} className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="[--header-height:calc(--spacing(14))] min-h-screen bg-muted/40">
      <SidebarProvider className="flex flex-col">
        <SiteHeader />
        <div className="flex flex-1">
          <InventorySidebar />
          <SidebarInset>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              {/* Header Section */}
              <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Tambah Penerimaan Stok</h1>
                {/* Optional: Add breadcrumbs or other header elements */}
              </div>

              {/* Form Card */}
              <Card>
                <CardHeader>
                  {/* <CardTitle>Detail Penerimaan</CardTitle> */}
                  <CardDescription>Masukkan detail penerimaan barang.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Top Section: Tanggal, Sumber, Gudang */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      {/* Tanggal Penerimaan */}
                      <div className="md:col-span-1">
                        <Label htmlFor="receiveDate">Tanggal Penerimaan</Label>
                        <DatePicker date={receiveDate} setDate={setReceiveDate} />
                      </div>

                      {/* Sumber Dokumen & ID */}
                      <div className="md:col-span-1 grid grid-cols-3 gap-2 items-end">
                         <div className="col-span-1">
                            <Label htmlFor="sourceType">Sumber</Label>
                            <Select onValueChange={setSourceType} value={sourceType}>
                              <SelectTrigger id="sourceType">
                                <SelectValue placeholder="Pilih" />
                              </SelectTrigger>
                              <SelectContent>
                                {sourceTypes.map((type) => (
                                  <SelectItem key={type.id} value={type.id}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2 relative">
                            <Label htmlFor="sourceId">ID Sumber</Label>
                            <Input
                              id="sourceId"
                              value={sourceId}
                              onChange={(e) => setSourceId(e.target.value)}
                              placeholder="Contoh: PO-123"
                              disabled={!sourceType} // Disable if no source type selected
                            />
                             {isLoadingPO && (
                                <div className="absolute right-2 top-7">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            )}
                          </div>
                      </div>

                      {/* Gudang Tujuan */}
                      <div className="md:col-span-1">
                        <Label htmlFor="warehouse">Gudang Tujuan</Label>
                        <Select onValueChange={setWarehouseId} value={warehouseId} disabled={isLoadingPO || sourceType === 'po'}> {/* Disable if loading or PO selected */}
                          <SelectTrigger id="warehouse">
                            <SelectValue placeholder="Pilih Gudang" />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses.map((wh) => (
                              <SelectItem key={wh.id} value={wh.id}>
                                {wh.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                         {poError && <p className="text-sm text-destructive mt-1">{poError}</p>}
                      </div>
                    </div>

                    {/* Catatan */}
                    <div>
                      <Label htmlFor="notes">Catatan</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Tambahkan catatan jika perlu (opsional)"
                        rows={2}
                      />
                    </div>

                    {/* Item Diterima Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Item Diterima</CardTitle>
                        <CardDescription>Tambahkan item yang diterima menggunakan barcode atau manual.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-end gap-2 mb-4">
                          <div className="flex-grow">
                            <Label htmlFor="barcode">Scan Barcode</Label>
                            <Input
                              id="barcode"
                              value={barcodeInput}
                              onChange={(e) => setBarcodeInput(e.target.value)}
                              placeholder="Scan atau ketik barcode lalu tekan Enter"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault(); // Prevent form submission on Enter
                                    handleBarcodeScan();
                                }
                              }}
                            />
                          </div>
                          <Button type="button" onClick={handleBarcodeScan} variant="outline" size="icon" aria-label="Scan Barcode">
                            <ScanLine className="h-5 w-5" />
                          </Button>
                           <Button type="button" onClick={handleAddItemManually} variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4" /> Tambah Manual
                          </Button>
                        </div>
                        {/* Item Table */}
                        <DataTable columns={itemColumns} data={items} />
                         {items.length === 0 && !isLoadingPO && (
                            <div className="text-center text-muted-foreground py-4">
                                Tidak ada data item.
                                {sourceType === 'po' && !poError && ' Masukkan nomor PO yang valid untuk memuat item.'}
                                {sourceType !== 'po' && ' Scan barcode atau tambah item secara manual.'}
                            </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline">Batal</Button>
                      <Button type="submit" disabled={isLoadingPO}> {/* Disable submit while loading PO */}
                        {isLoadingPO ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Simpan Penerimaan
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
}

// --- Fetch Materials --- (Assuming a function like this exists or needs to be added)
useEffect(() => {
  const fetchMaterials = async () => {
    setIsLoadingMaterials(true);
    setMaterialError(null);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm, // Add search term if applicable
        status: 'AKTIF', // Fetch only active materials
      });
      const response = await fetch(`/api/products/materials?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Gagal memuat data material');
      }
      const data = await response.json();
      setMaterials(data.data || []);
      setPagination(prev => ({ ...prev, totalPages: data.totalPages }));
    } catch (err: any) {
      setMaterialError(err.message);
      toast.error('Error', { description: err.message });
    } finally {
      setIsLoadingMaterials(false);
    }
  };
  fetchMaterials();
}, [pagination.page, pagination.limit, searchTerm]);

// --- Material Table Columns --- (Define columns for material selection table)
const materialColumns: ColumnDef<FormattedMaterial>[] = useMemo(() => [
// Define columns: e.g., Checkbox, Name, Code, Unit
{
id: 'select',
header: ({ table }) => (
<Checkbox
checked={table.getIsAllPageRowsSelected()}
onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
aria-label="Select all"
/>
),
cell: ({ row }) => (
<Checkbox
checked={row.getIsSelected()}
onCheckedChange={(value) => row.toggleSelected(!!value)}
aria-label="Select row"
/>
),
enableSorting: false,
enableHiding: false,
},
{ accessorKey: 'name', header: 'Nama Material' },
{ accessorKey: 'code', header: 'Kode' },
{ accessorKey: 'unit', header: 'Satuan' },
// Add other relevant columns
], []);

// State for material table row selection
const [materialRowSelection, setMaterialRowSelection] = useState({});

// Handler for material page change
const handleMaterialPageChange = (newPage: number) => {
setPagination(prev => ({ ...prev, page: newPage }));
};

// Handler for material page size change
const handleMaterialPageSizeChange = (newPageSize: number) => {
setPagination(prev => ({ ...prev, limit: newPageSize, page: 1 }));
};

return (
<div className="flex flex-1 flex-col gap-4 p-4">
{/* ... existing Card for Receive Details ... */}

{/* --- Card for Selecting Materials --- */}
<Card>
<CardHeader>
<CardTitle>Pilih Material</CardTitle>
<CardDescription>Cari dan pilih material yang diterima.</CardDescription>
{/* Add Search Input here */}
<Input 
placeholder="Cari material (nama/kode)..."
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
className="mt-2 max-w-sm"
/>
</CardHeader>
<CardContent>
{isLoadingMaterials ? (
<DataTableSkeleton 
columnCount={materialColumns.length} 
rowCount={pagination.limit}
showToolbar={false} // Search is in CardHeader
/>
) : materialError ? (
<div className="text-center text-red-600 py-4">{materialError}</div>
) : (
<DataTable
columns={materialColumns}
data={materials}
pageCount={pagination.totalPages}
currentPage={pagination.page}
onPageChange={handleMaterialPageChange}
pageSize={pagination.limit}
onPageSizeChange={handleMaterialPageSizeChange}
rowSelection={materialRowSelection}
onRowSelectionChange={setMaterialRowSelection}
// Add other necessary props
/>
)}
</CardContent>
</Card>

{/* ... Card for Selected Items Summary ... */}

{/* ... Action Buttons ... */}
</div>
);
}
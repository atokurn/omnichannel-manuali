"use client"

import React, { useRef, useState } from 'react'; // Import useState
import { useRouter } from 'next/navigation'; // Import useRouter
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Info, Image as ImageIcon, Package, DollarSign, Truck, Sparkles, Upload, Trash2, Check, X, GripVertical, HelpCircle, Save, SendHorizonal, ChevronDown, Plus, ArrowLeft } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Add import for RadioGroup
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn, formatNumberWithSeparator } from '@/lib/utils'; // Import cn utility and format function
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // Import Table components

// Interface for Variant Option
interface VariantOption {
  id: string;
  value: string;
  image?: File | null; // Optional image
  charCount: number;
}

// Interface for Variant
interface Variant {
  id: string;
  name: string;
  options: VariantOption[];
  // Removed showAddAnother, addAnotherValue, addAnotherCharCount
}

// Interface for Variant Combination Data
interface VariantCombinationData {
  combinationId: string; // Unique ID for the combination (e.g., 'optionId1-optionId2')
  options: { [variantName: string]: string }; // e.g., { Warna: 'hitam', Ukuran: 'M' }
  price: string;
  quantity: string;
  sku: string;
  weight: string;
  weightUnit: 'g' | 'kg'; // Add weight unit
}

const AddProductPage = () => {
  const router = useRouter(); // Initialize router
  const basicInfoRef = useRef<HTMLDivElement>(null);
  const detailProductRef = useRef<HTMLDivElement>(null);
  const costPriceRef = useRef<HTMLDivElement>(null); // Ref for Harga Modal
  const skuMappingRef = useRef<HTMLDivElement>(null); // Ref for SKU Mapping
  const salesInfoRef = useRef<HTMLDivElement>(null);
  const shippingRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string>("Informasi dasar"); // State to track active section
  const [addVariant, setAddVariant] = useState(false); // State for Add Variant switch
  const [purchaseLimit, setPurchaseLimit] = useState(false); // State for Purchase Limit switch
  const [enableSkuMapping, setEnableSkuMapping] = useState(true); // State for SKU Mapping toggle
  const [skuMappingOption, setSkuMappingOption] = useState<"all" | "channel" | "store">("all"); // State for SKU Mapping option
  const [showChannelDialog, setShowChannelDialog] = useState(false); // State for Channel dialog
  const [showStoreDialog, setShowStoreDialog] = useState(false); // State for Store dialog
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]); // State for selected channels
  const [selectedStores, setSelectedStores] = useState<string[]>([]); // State for selected stores
  const [variants, setVariants] = useState<Variant[]>([]); // State for variants
  const [variantTableData, setVariantTableData] = useState<VariantCombinationData[]>([]); // State for table data
  const [showManualCostPrice, setShowManualCostPrice] = useState(false); // State for manual cost price toggle

  const scrollToRef = (ref: React.RefObject<HTMLDivElement>, title: string) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(title); // Update active section on click
  };

  // --- Variant Management Functions ---

  // Add a new variant section
  const handleAddVariantSection = () => {
    if (variants.length < 3) {
      const newVariant: Variant = {
        id: `variant-${Date.now()}`,
        name: '',
        options: [
          { id: `option-${Date.now()}`, value: '', image: null, charCount: 0 },
        ],
        // Removed showAddAnother, addAnotherValue, addAnotherCharCount initialization
      };
      setVariants([...variants, newVariant]);
    }
  };

  // Remove a variant section
  const handleRemoveVariantSection = (variantId: string) => {
    setVariants(variants.filter(v => v.id !== variantId));
  };

  // Update variant name
  const handleVariantNameChange = (variantId: string, name: string) => {
    setVariants(variants.map(v => v.id === variantId ? { ...v, name } : v));
  };

  // Add a new option to a variant
  const handleAddVariantOption = (variantId: string) => {
    setVariants(variants.map(v => {
      if (v.id === variantId && v.options.length < 50) { // Limit options if needed
        const newOption: VariantOption = { id: `option-${Date.now()}`, value: '', image: null, charCount: 0 };
        return { ...v, options: [...v.options, newOption] };
      }
      return v;
    }));
  };

  // Remove an option from a variant
  const handleRemoveVariantOption = (variantId: string, optionId: string) => {
    setVariants(variants.map(v => {
      if (v.id === variantId) {
        // Prevent removing the last option if needed, or handle accordingly
        if (v.options.length > 1) {
           return { ...v, options: v.options.filter(opt => opt.id !== optionId) };
        }
      }
      return v;
    }));
  };

  // Update variant option value and char count, automatically add new option if last one is typed into
  const handleVariantOptionValueChange = (variantId: string, optionId: string, value: string) => {
    setVariants(prevVariants => {
      const newVariants = prevVariants.map(v => {
        if (v.id === variantId) {
          const optionIndex = v.options.findIndex(opt => opt.id === optionId);
          const isLastOption = optionIndex === v.options.length - 1;
          const wasEmpty = v.options[optionIndex]?.value === '';

          const updatedOptions = v.options.map(opt =>
            opt.id === optionId ? { ...opt, value: value.slice(0, 50), charCount: value.slice(0, 50).length } : opt
          );

          // If typing in the last empty option, add a new one
          if (isLastOption && wasEmpty && value.length > 0 && v.options.length < 50) {
            const newOption: VariantOption = { id: `option-${Date.now()}`, value: '', image: null, charCount: 0 };
            return { ...v, options: [...updatedOptions, newOption] };
          }

          return { ...v, options: updatedOptions };
        }
        return v;
      });
      return newVariants;
    });
  };

  // Removed handleAddAnotherInputChange and handleConfirmAddAnother functions

  // Handle image upload for an option (basic structure)
  const handleVariantOptionImageChange = (variantId: string, optionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVariants(variants.map(v => {
        if (v.id === variantId) {
          return {
            ...v,
            options: v.options.map(opt =>
              opt.id === optionId ? { ...opt, image: file } : opt
            )
          };
        }
        return v;
      }));
      // Add image preview logic here if needed
    }
  };

  // --- Generate Variant Combinations ---
  const generateVariantCombinations = (currentVariants: Variant[]): VariantCombinationData[] => {
    const activeVariants = currentVariants.filter(v => v.name && v.options.length > 0 && v.options.some(opt => opt.value.trim() !== ''));
    if (activeVariants.length === 0) {
      return [];
    }

    const optionsArrays = activeVariants.map(v =>
      v.options.filter(opt => opt.value.trim() !== '').map(opt => ({ variantName: v.name, optionValue: opt.value, optionId: opt.id }))
    );

    if (optionsArrays.some(arr => arr.length === 0)) {
        return []; // If any variant has no valid options, no combinations possible
    }


    const combinations = optionsArrays.reduce((acc, currentOptions) => {
      if (acc.length === 0) {
        return currentOptions.map(opt => [{ ...opt }]);
      }
      const newAcc: { variantName: string; optionValue: string; optionId: string; }[][] = [];
      acc.forEach(existingCombo => {
        currentOptions.forEach(newOption => {
          newAcc.push([...existingCombo, { ...newOption }]);
        });
      });
      return newAcc;
    }, [] as { variantName: string; optionValue: string; optionId: string; }[][]);


    return combinations.map(combo => {
      const combinationId = combo.map(opt => opt.optionId).sort().join('-');
      const options: { [variantName: string]: string } = {};
      combo.forEach(opt => {
        options[opt.variantName] = opt.optionValue;
      });

      // Try to find existing data for this combination to preserve inputs
      const existingData = variantTableData.find(d => d.combinationId === combinationId);

      return {
        combinationId,
        options,
        price: existingData?.price || '',
        quantity: existingData?.quantity || '',
        sku: existingData?.sku || '',
        weight: existingData?.weight || '',
        weightUnit: existingData?.weightUnit || 'g',
      };
    });
  };


  // --- Update Table Data on Variant Change ---
  React.useEffect(() => {
    const newCombinations = generateVariantCombinations(variants);
    setVariantTableData(newCombinations);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variants]); // Rerun when variants change


  // --- Handle Input Changes in Variant Table ---
  const handleVariantTableInputChange = (combinationId: string, field: keyof VariantCombinationData, value: string) => {
    setVariantTableData(prevData =>
      prevData.map(item =>
        item.combinationId === combinationId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleWeightUnitChange = (combinationId: string, unit: 'g' | 'kg') => {
    setVariantTableData(prevData =>
      prevData.map(item =>
        item.combinationId === combinationId ? { ...item, weightUnit: unit } : item
      )
    );
  };

  // --- Handle Deleting a Variant Combination Row ---
  const handleRemoveVariantCombination = (combinationIdToRemove: string) => {
    setVariantTableData(prevData =>
      prevData.filter(item => item.combinationId !== combinationIdToRemove)
    );
  };

  // --- End Variant Management Functions ---

  // Add intersection observer logic here later if needed for scroll spying

  const navItems = [
    { title: "Informasi dasar", ref: basicInfoRef },
    { title: "Detail produk", ref: detailProductRef },
    { title: "Harga Modal", ref: costPriceRef }, // Added Harga Modal
    { title: "Info penjualan", ref: salesInfoRef },
    { title: "Pengiriman", ref: shippingRef },
    { title: "SKU Mapping", ref: skuMappingRef }, // Moved SKU Mapping to bottom
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height))] bg-muted/40">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6 py-4 shrink-0">
        <div className="flex items-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => router.back()}> {/* Add onClick handler */}
           {/* Add back arrow or similar navigation if needed */}
           <ArrowLeft className="h-4 w-4" />
           <span className="text-sm">Kelola produk</span>
        </div>
        <h1 className="text-xl font-semibold ml-4">Tambahkan produk baru</h1>
        {/* Dropdown for TikTok/Tokopedia can be added here */}
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm"><HelpCircle className="h-4 w-4 mr-1"/> Bantuan</Button>
          <Button variant="outline" size="sm"><Save className="h-4 w-4 mr-1"/> Simpan sebagai draf</Button>
          <Button size="sm"><SendHorizonal className="h-4 w-4 mr-1"/> Kirim</Button>
        </div>
      </header>

      <div className="flex flex-1 p-4 gap-6">
        {/* Left Navigation */}
        <aside className="w-64 hidden md:block shrink-0">
          <Card className="sticky top-18">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" /> Saran
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground pb-4">
              Melengkapi informasi produk bisa membantu meningkatkan eksposur produk.
            </CardContent>
            <Separator />
            <CardContent className="p-0">
              <nav className="flex flex-col py-2">
                {navItems.map((item) => (
                  <Button
                    key={item.title}
                    variant="ghost"
                    className={cn(
                      "justify-start px-4 py-2 rounded-none text-sm font-normal hover:bg-muted/50 h-10",
                      activeSection === item.title ? "bg-muted font-medium text-primary hover:bg-muted" : "text-muted-foreground"
                    )}
                    onClick={() => scrollToRef(item.ref, item.title)}
                  >
                    {item.title}
                  </Button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content Form */}
        <main className="flex-1 overflow-y-auto">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6 max-w-full mx-auto">
              {/* Informasi Dasar */}
              <Card ref={basicInfoRef} id="informasi-dasar">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Informasi dasar</CardTitle>
                  <Button variant="ghost" size="sm" className="text-primary"><Sparkles className="h-4 w-4 mr-1"/> Optimisasi AI</Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2 max-w-3xl mx-auto">
                    <Label htmlFor="product-image" className="flex items-center"><span className="text-red-500 mr-1">*</span>Gambar</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Main Image Upload */}
                      <div className="md:col-span-1 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-6 aspect-square text-center hover:border-primary cursor-pointer bg-muted/20">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">Unggah gambar utama</span>
                        <p className="text-xs text-muted-foreground mt-1">
                          - Dimensi: 600 x 600 px.<br/>
                          - Ukuran file maks.: 5 MB.<br/>
                          - Format: JPG, JPEG, PNG.
                        </p>
                        {/* Hidden file input */}
                        <Input id="main-image-upload" type="file" className="hidden" accept=".jpg,.jpeg,.png" />
                        {/* Add preview logic later */}
                      </div>
                      {/* Additional Image Placeholders */}
                      <div className="md:col-span-2 grid grid-cols-4 gap-2">
                        {['Depan', 'Samping', 'Berbagai sisi', 'Saat diguna...', 'Variasi', 'Dengan latar...', 'Close-up', 'Ukuran & Sk...'].map((label) => (
                          <div key={label} className="border rounded-lg flex flex-col items-center justify-center p-2 aspect-square bg-muted/50 text-center cursor-pointer hover:border-primary">
                            {/* Placeholder Icon - replace with actual image preview later */}
                            <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                            <span className="text-[10px] text-muted-foreground leading-tight">{label}</span>
                            {/* Hidden file input for each */}
                            <Input id={`image-upload-${label}`} type="file" className="hidden" accept=".jpg,.jpeg,.png" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-name" className="flex items-center"><span className="text-red-500 mr-1">*</span>Nama produk</Label>
                    <Input id="product-name" placeholder="[Merek] + [Konten] + [Lingkup penggunaan] + [Tipe produk] + [Fungsi/Fitur Utama]" maxLength={255} />
                    <p className="text-xs text-muted-foreground text-right">0/255</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-category" className="flex items-center"><span className="text-red-500 mr-1">*</span>Kategori</Label>
                    <Select>
                      <SelectTrigger id="product-category">
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {/* Populate with actual categories later */}
                        <SelectItem value="category1">Elektronik &gt; Handphone</SelectItem>
                        <SelectItem value="category2">Fashion &gt; Pakaian Pria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Detail Produk */}
              <Card ref={detailProductRef} id="detail-produk">
                <CardHeader>
                  <CardTitle>Detail produk</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product-description" className="flex items-center"><span className="text-red-500 mr-1">*</span>Deskripsi produk</Label>
                    <Textarea id="product-description" placeholder="Masukkan deskripsi produk yang menarik..." rows={8} />
                  </div>
                  {/* Add more fields like attributes, brand, etc. here */}
                </CardContent>
              </Card>

              {/* Card Harga Modal */}
              <Card ref={costPriceRef} id="harga-modal">
                <CardHeader>
                  <CardTitle>Harga Modal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="calculated-cost-price">Harga Modal Dihitung</Label>
                    <Input id="calculated-cost-price" type="text" placeholder="Rp 0" disabled />
                    <p className="text-sm text-muted-foreground">
                      Harga modal dihitung otomatis berdasarkan bahan baku (fitur mendatang).
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="manual-cost-price-toggle" 
                      checked={showManualCostPrice}
                      onCheckedChange={(checked) => setShowManualCostPrice(Boolean(checked))}
                    />
                    <Label htmlFor="manual-cost-price-toggle" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Sesuaikan Harga Modal Manual
                    </Label>
                  </div>
                  {/* Conditional rendering for manual input based on checkbox state */}
                  {showManualCostPrice && (
                    <div className="grid gap-2 pt-2">
                      <Label htmlFor="manual-cost-price">Harga Modal Manual</Label>
                      <Input id="manual-cost-price" type="number" placeholder="Masukkan harga modal manual" />
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* End Card Harga Modal */}

              {/* Info Penjualan */}
              <Card ref={salesInfoRef} id="info-penjualan">
                <CardHeader>
                  <CardTitle>Info penjualan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Tambah Varian Switch */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="add-variant" className="font-medium">Tambah varian</Label>
                      <p className="text-xs text-muted-foreground">Tambahkan hingga 3 varian.</p>
                    </div>
                    <Switch id="add-variant" checked={addVariant} onCheckedChange={(checked) => {
                      setAddVariant(checked);
                      if (checked && variants.length === 0) {
                        handleAddVariantSection(); // Add the first variant section automatically
                      } else if (!checked) {
                        setVariants([]); // Clear variants if switch is turned off
                      }
                    }} />
                  </div>

                  {/* Conditionally render Price & Stock section */}
                  {!addVariant && (
                    <div className="space-y-4 p-4 border rounded-md bg-muted/20">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center font-medium">
                          <span className="text-red-500 mr-1">*</span>Harga & Stok
                        </Label>
                        <div className="flex items-center gap-2">
                          {/* Pre-order Checkbox moved here */}
                          <Checkbox id="pre-order" />
                          <Label htmlFor="pre-order" className="text-sm font-normal flex items-center">
                            Pre-order
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Aktifkan jika produk ini memerlukan pre-order.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                          {/* End Pre-order Checkbox */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 text-xs">
                                Ubah sekaligus <ChevronDown className="h-3 w-3 ml-1" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Ubah Harga</DropdownMenuItem>
                              <DropdownMenuItem>Ubah Kuantitas</DropdownMenuItem>
                              <DropdownMenuItem>Ubah SKU</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <Label htmlFor="product-price" className="text-xs flex items-center">
                            <span className="text-red-500 mr-1">*</span>Harga jual
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Harga jual akhir produk.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground">Rp</span>
                            <Input id="product-price" type="number" placeholder="0" className="pl-8" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="product-quantity" className="text-xs flex items-center">
                            <span className="text-red-500 mr-1">*</span>Kuantitas
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Jumlah stok produk yang tersedia.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                          <Input id="product-quantity" type="number" placeholder="0" />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="product-sku" className="text-xs flex items-center">
                            SKU Penjual
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Kode unik (Stock Keeping Unit) untuk produk ini.</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                          <Input id="product-sku" placeholder="Masukkan SKU" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Variant Creation Forms (Conditional & Mapped) */}
                  {addVariant && variants.map((variant, variantIndex) => (
                    <div key={variant.id} className="space-y-4 p-4 border rounded-md bg-muted/20 relative">
                       {/* Delete Variant Section Button */}
                       {variants.length > 1 && (
                         <Button
                           variant="ghost"
                           size="icon"
                           className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive"
                           onClick={() => handleRemoveVariantSection(variant.id)}
                         >
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       )}

                      {/* Variant Name */}
                      <div className="space-y-2">
                        <Label htmlFor={`variant-name-${variant.id}`} className="flex items-center">
                          <span className="text-red-500 mr-1">*</span>Nama Varian
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Masukkan nama untuk grup varian (mis. Warna, Ukuran).</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Select onValueChange={(value) => handleVariantNameChange(variant.id, value)} value={variant.name}>
                          <SelectTrigger id={`variant-name-${variant.id}`}>
                            <SelectValue placeholder="Pilih atau masukkan varian" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Add predefined variant names or allow custom input */}
                            <SelectItem value="Warna">Warna</SelectItem>
                            <SelectItem value="Ukuran">Ukuran</SelectItem>
                            {/* Add more predefined or allow custom input */}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Variant Options (Mapped) */}
                      {variant.options.map((option, optionIndex) => (
                        <div key={option.id} className="space-y-2">
                          {/* Label only needed for the first option conceptually, but keep structure for now */}
                          {optionIndex === 0 && (
                            <Label htmlFor={`variant-value-${option.id}`} className="flex items-center">
                              <span className="text-red-500 mr-1">*</span>Nilai varian
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Masukkan opsi untuk varian ini (mis. Merah, XL). Ketik di baris terakhir untuk menambah opsi baru.</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </Label>
                          )}
                          <div className="flex items-start gap-3">
                            {/* Image Upload */}
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Label htmlFor={`variant-image-upload-${option.id}`} className="border rounded-lg flex flex-col items-center justify-center p-4 aspect-square text-center hover:border-primary cursor-pointer bg-background w-24 h-24 shrink-0">
                                    {/* Basic image preview or icon */}
                                    {option.image ? (
                                      <img src={URL.createObjectURL(option.image)} alt="Preview" className="h-full w-full object-cover rounded-md" />
                                    ) : (
                                      <>
                                        <ImageIcon className="h-6 w-6 text-muted-foreground mb-1" />
                                        <span className="text-xs text-muted-foreground">Unggah gambar</span>
                                      </>
                                    )}
                                    <Input
                                      id={`variant-image-upload-${option.id}`}
                                      type="file"
                                      className="hidden"
                                      accept=".jpg,.jpeg,.png"
                                      onChange={(e) => handleVariantOptionImageChange(variant.id, option.id, e)}
                                    />
                                  </Label>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Unggah gambar untuk opsi varian ini (opsional).</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {/* Value Input & Actions */}
                            <div className="flex-1 flex items-center gap-2">
                              <div className="flex-1 relative">
                                <Input
                                  id={`variant-value-${option.id}`}
                                  placeholder={optionIndex === variant.options.length - 1 && optionIndex > 0 ? "Tambahkan nilai lain" : "Masukkan opsi"} // Dynamic placeholder
                                  maxLength={50}
                                  value={option.value}
                                  onChange={(e) => handleVariantOptionValueChange(variant.id, option.id, e.target.value)}
                                />
                                <span className="absolute right-3 bottom-2 text-xs text-muted-foreground">{option.charCount}/50</span>
                              </div>
                              {/* Action Buttons */}
                              {/* Show remove button only if it's not the last empty option */} 
                              {(variant.options.length > 1 && !(optionIndex === variant.options.length - 1 && option.value === '')) ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 text-muted-foreground hover:text-destructive"
                                        onClick={() => handleRemoveVariantOption(variant.id, option.id)}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Hapus opsi</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                /* Spacer to keep alignment when remove button is hidden */
                                <div className="w-9 h-9"></div>
                              )}
                               <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                     <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground cursor-move">
                                       <GripVertical className="h-4 w-4" />
                                     </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Pindahkan (fungsi belum aktif)</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                      ))}
                      {/* Removed the separate 'Tambahkan nilai lain' input section and associated buttons */}
                    </div>
                  ))}

                  {/* Button to Add New Variant Section */}
                  {addVariant && variants.length < 3 && (
                     <Button
                       variant="outline"
                       className="w-full border-dashed"
                       onClick={handleAddVariantSection}
                     >
                       <Plus className="h-4 w-4 mr-2" /> Tambah varian ({variants.length}/3)
                     </Button>
                  )}

                  {/* Variant Combination Table (List Varian) */}
                  {addVariant && variantTableData.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <Separator />
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center">
                          <span className="text-red-500 mr-1">*</span>List Varian
                        </h3>
                        {/* TODO: Implement Bulk Edit Functionality */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Ubah sekaligus <ChevronDown className="h-4 w-4 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ubah Harga</DropdownMenuItem>
                            <DropdownMenuItem>Ubah Kuantitas</DropdownMenuItem>
                            <DropdownMenuItem>Ubah Berat</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center space-x-2 mb-4">
                        <Checkbox id="pre-order" />
                        <Label htmlFor="pre-order" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center">
                          Pre-order
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Aktifkan jika produk ini memerlukan pre-order.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                      </div>

                      <Card className="overflow-hidden">
                        <ScrollArea className="max-h-[400px] w-full">
                          <Table className="min-w-full">
                            <TableHeader className="sticky top-0 bg-muted/50 z-10">
                              <TableRow>
                                {/* Dynamic Variant Headers */}
                                {variants.filter(v => v.name).map(variant => (
                                  <TableHead key={variant.id}>{variant.name}</TableHead>
                                ))}
                                <TableHead className="min-w-[150px]"><span className="text-red-500 mr-1">*</span>Harga jual <TooltipProvider><Tooltip><TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground ml-1 inline-block cursor-help" /></TooltipTrigger><TooltipContent><p>Harga jual akhir produk.</p></TooltipContent></Tooltip></TooltipProvider></TableHead>
                                <TableHead className="min-w-[120px]"><span className="text-red-500 mr-1">*</span>Kuantitas <TooltipProvider><Tooltip><TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground ml-1 inline-block cursor-help" /></TooltipTrigger><TooltipContent><p>Jumlah stok tersedia.</p></TooltipContent></Tooltip></TooltipProvider></TableHead>
                                <TableHead className="min-w-[150px]">SKU Penjual <TooltipProvider><Tooltip><TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground ml-1 inline-block cursor-help" /></TooltipTrigger><TooltipContent><p>Kode unik SKU untuk varian ini.</p></TooltipContent></Tooltip></TooltipProvider></TableHead>
                                <TableHead className="min-w-[180px]"><span className="text-red-500 mr-1">*</span>Berat dengan kemasan</TableHead>
                                <TableHead className="w-[50px]"></TableHead> {/* For Delete Button */}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {variantTableData.map((combination) => (
                                <TableRow key={combination.combinationId}>{/* Remove whitespace here */}
                                  {/* Dynamic Variant Values */}
                                  {variants.filter(v => v.name).map(variant => (
                                    <TableCell key={`${combination.combinationId}-${variant.id}`}>
                                      {combination.options[variant.name] || '-'}
                                    </TableCell>
                                  ))}
                                  {/* Input Fields */}
                                  <TableCell>
                                    <div className="relative">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">Rp</span>
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        className="pl-8"
                                        value={combination.price}
                                        onChange={(e) => handleVariantTableInputChange(combination.combinationId, 'price', e.target.value)}
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={combination.quantity}
                                      onChange={(e) => handleVariantTableInputChange(combination.combinationId, 'quantity', e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      placeholder="Masukkan SKU"
                                      value={combination.sku}
                                      onChange={(e) => handleVariantTableInputChange(combination.combinationId, 'sku', e.target.value)}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1">
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        className="flex-1"
                                        value={combination.weight}
                                        onChange={(e) => handleVariantTableInputChange(combination.combinationId, 'weight', e.target.value)}
                                      />
                                      <Select
                                        value={combination.weightUnit}
                                        onValueChange={(value) => handleWeightUnitChange(combination.combinationId, value as 'g' | 'kg')}
                                      >
                                        <SelectTrigger className="w-[60px] shrink-0">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="g">g</SelectItem>
                                          <SelectItem value="kg">kg</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {/* TODO: Implement Delete Row Functionality */}
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleRemoveVariantCombination(combination.combinationId)}>
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Hapus Varian</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </ScrollArea>
                      </Card>
                    </div>
                  )}

                  {/* Purchase Limit Switch */}
                  <Separator />

                  {/* Batas Pembelian Pelanggan Switch */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <Label htmlFor="purchase-limit" className="font-medium">Batas pembelian pelanggan</Label>
                      <p className="text-xs text-muted-foreground">Tentukan batas jumlah pembelian minimum dan maksimum per pesanan untuk setiap varian produk (SKU).</p>
                    </div>
                    <Switch id="purchase-limit" checked={purchaseLimit} onCheckedChange={setPurchaseLimit} />
                  </div>

                  {/* Purchase Limit Inputs (Conditional) */}
                  {purchaseLimit && (
                    <div className="space-y-2 pl-4 border-l-2 border-primary">
                      <Label htmlFor="min-purchase" className="flex items-center text-sm">
                        Batas minimum
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Jumlah minimum item yang harus dibeli pelanggan per pesanan.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </Label>
                      <Input id="min-purchase" type="number" placeholder="1-20" className="w-40" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pengiriman */}
              <Card ref={shippingRef} id="pengiriman">
                <CardHeader>
                  <CardTitle>Pengiriman</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Berat Paket */}
                  <div className="space-y-2">
                    <Label htmlFor="package-weight" className="flex items-center">
                      <span className="text-red-500 mr-1">*</span>Berat paket
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Masukkan berat produk setelah dikemas.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="g">
                        <SelectTrigger id="weight-unit" className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="g">Gram (g)</SelectItem>
                          <SelectItem value="kg">Kilogram (kg)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input id="package-weight" type="number" placeholder="Masukkan berat paket" className="flex-1" />
                    </div>
                  </div>

                  {/* Dimensi Paket */}
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      Dimensi Paket
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Ukuran paket setelah dikemas (opsional).</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <p className="text-xs text-muted-foreground">Pastikan berat dan dimensi kotak akurat karena akan digunakan untuk menghitung biaya pengiriman dan metode pengiriman.</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="relative">
                        <Input id="package-height" type="number" placeholder="Tinggi" className="pr-10" />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">cm</span>
                      </div>
                      <div className="relative">
                        <Input id="package-width" type="number" placeholder="Lebar" className="pr-10" />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">cm</span>
                      </div>
                      <div className="relative">
                        <Input id="package-length" type="number" placeholder="Panjang" className="pr-10" />
                        <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-muted-foreground">cm</span>
                      </div>
                    </div>
                  </div>

                  {/* Opsi Pengiriman */}
                  <div className="space-y-2">
                    <Label className="flex items-center">
                      <span className="text-red-500 mr-1">*</span>Opsi Pengiriman
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3 w-3 text-muted-foreground ml-1 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Pilih opsi pengiriman yang tersedia.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </Label>
                    <div className="p-4 border rounded-md space-y-4 bg-muted/20">
                      {/* Bayar di tempat (COD) */}
                      <div className="flex items-center justify-between">
                        <Label htmlFor="cod-switch" className="font-normal">Bayar di tempat (COD)</Label>
                        <Switch id="cod-switch" />
                      </div>
                      <Separator />
                      {/* Asuransi */}
                      <div className="space-y-2">
                        <Label className="font-normal">Asuransi</Label>
                        <RadioGroup defaultValue="optional" className="flex items-center gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="required" id="insurance-required" />
                            <Label htmlFor="insurance-required" className="font-normal">Wajib</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="optional" id="insurance-optional" />
                            <Label htmlFor="insurance-optional" className="font-normal">Opsional</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* End Pengiriman */}

              {/* SKU Mapping Ecommerce */}
              <Card ref={skuMappingRef} id="sku-mapping">
                <CardHeader>
                  <CardTitle>SKU Mapping Ecommerce</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* SKU Mapping Toggle Switch */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sku-mapping-switch" className="font-medium">Aktifkan SKU Mapping</Label>
                      <p className="text-xs text-muted-foreground">Aktifkan untuk memetakan SKU produk ke berbagai platform e-commerce.</p>
                    </div>
                    <Switch id="sku-mapping-switch" checked={enableSkuMapping} onCheckedChange={setEnableSkuMapping} />
                  </div>
                  
                  {enableSkuMapping && <>
                    {/* SKU Mapping Options */}
                    <div className="space-y-3 p-4 border rounded-md bg-muted/20">
                      <Label className="font-medium">Opsi Aktivasi SKU Mapping</Label>
                      <RadioGroup value={skuMappingOption} onValueChange={(value) => setSkuMappingOption(value as "all" | "channel" | "store")} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="all" id="sku-mapping-all" />
                          <Label htmlFor="sku-mapping-all" className="font-normal">Aktifkan Semua Toko</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="channel" id="sku-mapping-channel" />
                          <Label htmlFor="sku-mapping-channel" className="font-normal">Aktifkan Berdasarkan Channel</Label>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowChannelDialog(true)}
                            className="ml-2 h-7 text-xs"
                            disabled={skuMappingOption !== "channel"}
                          >
                            Pilih Channel
                          </Button>
                          {selectedChannels.length > 0 && (
                            <span className="text-xs text-muted-foreground ml-2">
                              {selectedChannels.length} channel dipilih
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="store" id="sku-mapping-store" />
                          <Label htmlFor="sku-mapping-store" className="font-normal">Aktifkan Berdasarkan Toko</Label>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowStoreDialog(true)}
                            className="ml-2 h-7 text-xs"
                            disabled={skuMappingOption !== "store"}
                          >
                            Pilih Toko
                          </Button>
                          {selectedStores.length > 0 && (
                            <span className="text-xs text-muted-foreground ml-2">
                              {selectedStores.length} toko dipilih
                            </span>
                          )}
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Channel Selection Dialog */}
                    {showChannelDialog && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Pilih Channel</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowChannelDialog(false)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-2 max-h-80 overflow-y-auto py-2">
                            {["Shopee", "Tokopedia", "TikTok Shop", "Lazada", "Bukalapak", "Blibli"].map((channel) => (
                              <div key={channel} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                                <Checkbox 
                                  id={`channel-${channel}`} 
                                  checked={selectedChannels.includes(channel)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedChannels([...selectedChannels, channel]);
                                    } else {
                                      setSelectedChannels(selectedChannels.filter(c => c !== channel));
                                    }
                                  }}
                                />
                                <Label htmlFor={`channel-${channel}`} className="font-normal cursor-pointer flex-1">{channel}</Label>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end space-x-2 mt-4 pt-2 border-t">
                            <Button variant="outline" onClick={() => setShowChannelDialog(false)}>Batal</Button>
                            <Button onClick={() => setShowChannelDialog(false)}>Simpan</Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Store Selection Dialog */}
                    {showStoreDialog && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Pilih Toko</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowStoreDialog(false)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-2 max-h-80 overflow-y-auto py-2">
                            {["Toko Utama Shopee", "Toko Cabang Shopee", "Toko Utama Tokopedia", "Toko Cabang Tokopedia", "TikTok Shop Official", "Lazada Official Store"].map((store) => (
                              <div key={store} className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                                <Checkbox 
                                  id={`store-${store}`} 
                                  checked={selectedStores.includes(store)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedStores([...selectedStores, store]);
                                    } else {
                                      setSelectedStores(selectedStores.filter(s => s !== store));
                                    }
                                  }}
                                />
                                <Label htmlFor={`store-${store}`} className="font-normal cursor-pointer flex-1">{store}</Label>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end space-x-2 mt-4 pt-2 border-t">
                            <Button variant="outline" onClick={() => setShowStoreDialog(false)}>Batal</Button>
                            <Button onClick={() => setShowStoreDialog(false)}>Simpan</Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid gap-4">
                      <div className="pt-2">
                        <p className="text-sm text-muted-foreground">
                          Mapping SKU membantu menghubungkan produk ini dengan SKU yang sama di berbagai platform e-commerce untuk sinkronisasi stok dan pesanan.
                        </p>
                      </div>
                      
                      {/* Channel-specific additional details */}
                      {skuMappingOption === "channel" && (
                        <>
                          {/* TikTok Shop specific details */}
                          {selectedChannels.includes("TikTok Shop") && (
                            <div className="space-y-4 mt-2">
                              <Separator className="my-2" />
                              <h4 className="font-medium text-sm">Detail Tambahan TikTok Shop</h4>
                              
                              {/* Kondisi Produk */}
                              <div className="space-y-2">
                                <Label htmlFor="tiktok-product-condition">Kondisi Produk</Label>
                                <Select defaultValue="new">
                                  <SelectTrigger id="tiktok-product-condition">
                                    <SelectValue placeholder="Pilih kondisi produk" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="new">Baru</SelectItem>
                                    <SelectItem value="used">Bekas</SelectItem>
                                    <SelectItem value="refurbished">Refurbished</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              {/* Asuransi */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="tiktok-insurance-switch">Asuransi Pengiriman</Label>
                                  <Switch id="tiktok-insurance-switch" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Aktifkan asuransi pengiriman untuk melindungi produk dari kerusakan atau kehilangan selama pengiriman.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Shopee specific details */}
                          {selectedChannels.includes("Shopee") && (
                            <div className="space-y-4 mt-2">
                              <Separator className="my-2" />
                              <h4 className="font-medium text-sm">Detail Tambahan Shopee</h4>
                              
                              {/* Program Gratis Ongkir */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="shopee-free-shipping-switch">Program Gratis Ongkir</Label>
                                  <Switch id="shopee-free-shipping-switch" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Ikut serta dalam program gratis ongkir Shopee untuk meningkatkan daya tarik produk.
                                </p>
                              </div>
                              
                              {/* Garansi Produk */}
                              <div className="space-y-2">
                                <Label htmlFor="shopee-warranty">Garansi Produk</Label>
                                <Select defaultValue="none">
                                  <SelectTrigger id="shopee-warranty">
                                    <SelectValue placeholder="Pilih jenis garansi" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="none">Tidak Ada Garansi</SelectItem>
                                    <SelectItem value="7days">7 Hari</SelectItem>
                                    <SelectItem value="14days">14 Hari</SelectItem>
                                    <SelectItem value="30days">30 Hari</SelectItem>
                                    <SelectItem value="1year">1 Tahun</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}

                          {/* Tokopedia specific details */}
                          {selectedChannels.includes("Tokopedia") && (
                            <div className="space-y-4 mt-2">
                              <Separator className="my-2" />
                              <h4 className="font-medium text-sm">Detail Tambahan Tokopedia</h4>
                              
                              {/* Power Merchant */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="tokopedia-power-merchant-switch">Power Merchant</Label>
                                  <Switch id="tokopedia-power-merchant-switch" />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Aktifkan untuk menampilkan produk ini di program Power Merchant Tokopedia.
                                </p>
                              </div>
                              
                              {/* Preorder */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label htmlFor="tokopedia-preorder-switch">Preorder</Label>
                                  <Switch id="tokopedia-preorder-switch" />
                                </div>
                                <div className="pt-2">
                                  <Label htmlFor="tokopedia-preorder-days" className="text-xs mb-1 block">Lama Pengiriman (Hari)</Label>
                                  <Input 
                                    id="tokopedia-preorder-days" 
                                    type="number" 
                                    min="1" 
                                    max="30" 
                                    placeholder="1-30 hari" 
                                    className="h-8" 
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                  }
                </CardContent>
              </Card>
              {/* End SKU Mapping Ecommerce */}
            </div>
          </ScrollArea>
        </main>

        {/* Right Preview */}
        <aside className="w-80 hidden lg:block shrink-0">
          <Card className="sticky top-18">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Pratinjau
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-pointer" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Placeholder Preview Content */}
              <div className="border rounded-md p-4 space-y-3 bg-muted/20">
                <div className="flex justify-between items-center mb-2">
                   <p className="text-sm font-medium">Detail produk</p>
                   <div className="flex gap-2 text-muted-foreground">
                      <ImageIcon className="h-4 w-4 cursor-pointer hover:text-primary"/>
                      <Package className="h-4 w-4 cursor-pointer hover:text-primary"/>
                      <Truck className="h-4 w-4 cursor-pointer hover:text-primary"/>
                   </div>
                </div>
                <div className="aspect-square bg-muted rounded-md flex items-center justify-center mb-3">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                  <span className="absolute text-xs text-muted-foreground/50">Tambahkan gambar</span>
                </div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-6 bg-muted rounded w-1/3 mt-2"></div>
                <Separator className="my-4"/>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Pilih opsi</span>
                    <span className="text-xs text-primary cursor-pointer hover:underline">Spesifikasi &gt;</span>
                </div>
                <div className="border rounded p-2 text-xs text-center text-muted-foreground bg-background">Default</div>
                 <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1" disabled>Tambah ke...</Button>
                    <Button size="sm" className="flex-1 bg-gray-300 hover:bg-gray-300" disabled>Beli sekarang</Button>
                 </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default AddProductPage;
"use client"

import React, { useRef, useState, useCallback } from 'react'; // Import useState
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
import { toast } from "sonner"; // Import toast from sonner
import VariantsEditor from './variants-editor';

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

// Import SkuMappingCard
import SkuMappingCard from './sku-mapping-card';
import ShippingSection from './shipping-section';
import ImagesSection from './images-section';
import CostPriceSection from './cost-price-section';
import SalesInfoSection from './sales-info-section';

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
  const [productId, setProductId] = useState<string>("temp-product-id"); // Menambahkan state untuk productId

  const [productName, setProductName] = useState<string>(""); // State for product name
  const [productDescription, setProductDescription] = useState<string>(""); // State for product description
  const [defaultPrice, setDefaultPrice] = useState<string>(""); // State for default price when no variants
  const [defaultQuantity, setDefaultQuantity] = useState<string>(""); // State for default quantity when no variants
  const [selectedPreviewOptionId, setSelectedPreviewOptionId] = useState<string | null>(null); // State for selected variant option in preview

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [additionalImages, setAdditionalImages] = useState<{[key: string]: File | null}>({});
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<{[key: string]: string | null}>({});
  const [isDraggingMain, setIsDraggingMain] = useState(false);
  const [isDraggingAdditional, setIsDraggingAdditional] = useState<string | null>(null);

  // Fungsi untuk menangani pengiriman formulir
  const handleSubmit = async () => {
    // Validasi data formulir
    if (!mainImage) {
      console.error('Gambar utama produk wajib diisi');
      toast.error('Gambar utama produk wajib diisi');
      return;
    }

    // Validasi nama produk
    if (!productName.trim()) {
      toast.error('Nama produk wajib diisi');
      return;
    }

    // Validasi deskripsi produk
    if (!productDescription.trim()) {
      toast.error('Deskripsi produk wajib diisi');
      return;
    }

    // Validasi harga
    if (!addVariant && !defaultPrice.trim()) {
      toast.error('Harga produk wajib diisi');
      return;
    }

    // Validasi varian jika diaktifkan
    if (addVariant) {
      // Validasi apakah ada varian yang dibuat
      if (variants.length === 0) {
        toast.error('Minimal satu varian harus ditambahkan');
        return;
      }

      // Validasi apakah semua varian memiliki nama
      const unnamedVariant = variants.find(v => !v.name.trim());
      if (unnamedVariant) {
        toast.error('Semua varian harus memiliki nama');
        return;
      }

      // Validasi apakah semua kombinasi varian memiliki harga dan kuantitas
      const invalidCombination = variantTableData.find(combo => !combo.price.trim() || !combo.quantity.trim() || !combo.weight.trim());
      if (invalidCombination) {
        toast.error('Semua kombinasi varian harus memiliki harga, kuantitas, dan berat');
        return;
      }
    }

    // Menampilkan loading state
    toast.loading('Sedang mengunggah gambar dan menyimpan produk...');
    
    try {
      // 1. Unggah gambar terlebih dahulu
      const imageUrls = await uploadImages();
      
      // 2. Siapkan data produk dengan URL gambar
      const productData = {
        productName: productName,
        productDescription: productDescription,
        defaultPrice: defaultPrice ? defaultPrice.replace(/[.,]/g, '') : '0', // Convert string to number
        defaultQuantity: defaultQuantity, // Menambahkan kuantitas untuk produk tanpa varian
        addVariant: addVariant,
        variants: await processVariantsWithImages(variants),
        variantCombinations: variantTableData,
        skuMapping: enableSkuMapping ? {
          option: skuMappingOption,
          channels: selectedChannels,
          stores: selectedStores
        } : null,
        purchaseLimit: purchaseLimit,
        mainImage: imageUrls.main,
        additionalImages: imageUrls.additional
      };

      console.log('Mengirim data produk ke API:', productData);

      // 3. Kirim data ke API
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Produk berhasil dibuat:', result);
      toast.dismiss(); // Dismiss loading toast
      toast.success('Produk berhasil ditambahkan!');
      router.push('/products/management'); // Redirect on success

    } catch (error) {
      console.error('Gagal mengirim data produk:', error);
      toast.dismiss(); // Dismiss loading toast
      let errorMessage = 'Gagal menambahkan produk. Silakan coba lagi.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(`Error: ${errorMessage}`);
    }
  };

  // Fungsi untuk mengunggah gambar
  const uploadImages = async () => {
    const imageUrls = {
      main: '',
      additional: {} as Record<string, string>
    };
    
    // Unggah gambar utama
    if (mainImage) {
      const mainImageUrl = await uploadImage(mainImage, 'main');
      imageUrls.main = mainImageUrl;
    }
    
    // Unggah gambar tambahan
    for (const [key, file] of Object.entries(additionalImages)) {
      if (file) {
        const additionalImageUrl = await uploadImage(file, `additional-${key}`);
        imageUrls.additional[key] = additionalImageUrl;
      }
    }
    
    return imageUrls;
  };
  
  // Fungsi untuk mengunggah satu gambar
  const uploadImage = async (file: File, prefix: string) => {
    // Buat FormData untuk mengunggah file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('prefix', prefix);
    formData.append('productId', productId);
    
    // Kirim file ke endpoint upload
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Gagal mengunggah gambar');
    }
    
    const data = await response.json();
    return data.url; // URL gambar yang sudah diunggah
  };

  // Fungsi untuk memproses varian dengan gambar, memastikan URL gambar dikirim ke backend
  const processVariantsWithImages = async (variantsToProcess: Variant[]) => {
    const processedApiVariants = await Promise.all(
      variantsToProcess.map(async (variant) => {
        const processedApiOptions = await Promise.all(
          variant.options.map(async (option) => {
            let imageUrl: string | null = null; // Default ke null
            // Periksa apakah option.image adalah objek File yang perlu diunggah
            if (option.image instanceof File) {
              try {
                imageUrl = await uploadImage(option.image, `variant-${variant.id}-option-${option.id}`);
              } catch (error) {
                console.error(`Gagal mengunggah gambar untuk opsi ${option.value}:`, error);
                // imageUrl akan tetap null jika unggahan gagal
              }
            }
            // Struktur data untuk backend saat membuat ProductVariantOption
            return {
              value: option.value,
              image: imageUrl, // Kirim URL gambar (string) atau null
            };
          })
        );
        // Struktur data untuk backend saat membuat ProductVariant
        return {
          name: variant.name, // Backend menggunakan variant.name
          options: processedApiOptions,
        };
      })
    );
    return processedApiVariants;
  };

  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>, title: string) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(title); // Update active section on click
  };

  // Handle main image upload
  const handleMainImageUpload = (file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      // Tambahkan notifikasi error jika diperlukan
      console.error('Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.');
      toast.error('Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('Ukuran file terlalu besar. Maksimal 5MB.');
      toast.error('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }
    
    setMainImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setMainImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle additional image upload
  const handleAdditionalImageUpload = (label: string, file: File) => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      console.error('Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.');
      toast.error('Format file tidak didukung. Gunakan JPG, JPEG, atau PNG.');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('Ukuran file terlalu besar. Maksimal 5MB.');
      toast.error('Ukuran file terlalu besar. Maksimal 5MB.');
      return;
    }
    
    setAdditionalImages(prev => ({
      ...prev,
      [label]: file
    }));
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setAdditionalImagePreviews(prev => ({
        ...prev,
        [label]: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };
  
  // Handle drag events for main image
  const handleDragEnterMain = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMain(true);
  }, []);
  
  const handleDragLeaveMain = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMain(false);
  }, []);
  
  const handleDragOverMain = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingMain) {
      setIsDraggingMain(true);
    }
  }, [isDraggingMain]);
  
  const handleDropMain = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingMain(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleMainImageUpload(file);
      e.dataTransfer.clearData();
    }
  }, []);
  
  // Handle drag events for additional images
  const handleDragEnterAdditional = useCallback((e: React.DragEvent, label: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAdditional(label);
  }, []);
  
  const handleDragLeaveAdditional = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAdditional(null);
  }, []);
  
  const handleDragOverAdditional = useCallback((e: React.DragEvent, label: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDraggingAdditional !== label) {
      setIsDraggingAdditional(label);
    }
  }, [isDraggingAdditional]);
  
  const handleDropAdditional = useCallback((e: React.DragEvent, label: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingAdditional(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleAdditionalImageUpload(label, file);
      e.dataTransfer.clearData();
    }
  }, []);
  
  // Handle file input change for main image
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleMainImageUpload(file);
    }
  };
  
  // Handle file input change for additional images
  const handleAdditionalImageChange = (e: React.ChangeEvent<HTMLInputElement>, label: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleAdditionalImageUpload(label, file);
    }
  };
  
  // Remove main image
  const handleRemoveMainImage = () => {
    setMainImage(null);
    setMainImagePreview(null);
  };
  
  // Remove additional image
  const handleRemoveAdditionalImage = (label: string) => {
    setAdditionalImages(prev => {
      const newImages = {...prev};
      delete newImages[label];
      return newImages;
    });
    
    setAdditionalImagePreviews(prev => {
      const newPreviews = {...prev};
      delete newPreviews[label];
      return newPreviews;
    });
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
    const trimmedName = name.trim().toLowerCase();
    // Check if the name already exists in other variants (case-insensitive)
    const isDuplicate = variants.some(
      (v) => v.id !== variantId && v.name.trim().toLowerCase() === trimmedName
    );

    if (trimmedName && isDuplicate) {
      toast.error(`Nama varian "${name}" sudah digunakan.`);
      // Optionally prevent the update or revert
      // return; // Uncomment to prevent update if name is duplicate
    }

    setVariants(prevVariants =>
      prevVariants.map(v => (v.id === variantId ? { ...v, name: name } : v))
    );
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
      const newVariants = [...prevVariants]; // Create a mutable copy
      const variantIndex = newVariants.findIndex(v => v.id === variantId);

      if (variantIndex === -1) return prevVariants; // Variant not found

      const currentVariant = newVariants[variantIndex];
      const optionIndex = currentVariant.options.findIndex(opt => opt.id === optionId);

      if (optionIndex === -1) return prevVariants; // Option not found

      // Check for duplicates within the same variant, excluding the current option being edited
      const trimmedValue = value.trim().toLowerCase();
      const isDuplicate = currentVariant.options.some(
        (opt) => opt.id !== optionId && opt.value.trim().toLowerCase() === trimmedValue
      );

      if (trimmedValue && isDuplicate) {
        toast.error(`Nilai opsi "${value}" sudah ada untuk varian ini.`);
        // Optionally revert the value or prevent further action
        // For now, we just show the error and allow the state update, 
        // but the user is notified.
        // To prevent update: return prevVariants;
      }

      const isLastOption = optionIndex === currentVariant.options.length - 1;
      const wasEmpty = currentVariant.options[optionIndex]?.value === '';

      // Update the specific option
      const updatedOptions = currentVariant.options.map(opt =>
        opt.id === optionId ? { ...opt, value: value.slice(0, 50), charCount: value.slice(0, 50).length } : opt
      );

      // Update the variant with new options
      newVariants[variantIndex] = { ...currentVariant, options: updatedOptions };

      // If typing in the last empty option and it's not a duplicate, add a new one
      if (isLastOption && wasEmpty && value.length > 0 && !isDuplicate && currentVariant.options.length < 50) {
        const newOption: VariantOption = { id: `option-${Date.now()}`, value: '', image: null, charCount: 0 };
        newVariants[variantIndex].options.push(newOption);
      }

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
          <Button size="sm" onClick={handleSubmit}><SendHorizonal className="h-4 w-4 mr-1"/> Kirim</Button>
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
                    <ImagesSection 
                      mainImagePreview={mainImagePreview}
                      isDraggingMain={isDraggingMain}
                      onDragEnterMain={handleDragEnterMain}
                      onDragLeaveMain={handleDragLeaveMain}
                      onDragOverMain={handleDragOverMain}
                      onDropMain={handleDropMain}
                      onMainImageChange={handleMainImageChange}
                      onRemoveMainImage={handleRemoveMainImage}
                      additionalImagePreviews={additionalImagePreviews}
                      isDraggingAdditional={isDraggingAdditional}
                      onDragEnterAdditional={handleDragEnterAdditional}
                      onDragLeaveAdditional={handleDragLeaveAdditional}
                      onDragOverAdditional={handleDragOverAdditional}
                      onDropAdditional={handleDropAdditional}
                      onAdditionalImageChange={handleAdditionalImageChange}
                      onRemoveAdditionalImage={handleRemoveAdditionalImage}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-name" className="flex items-center"><span className="text-red-500 mr-1">*</span>Nama produk</Label>
                    <Input 
                      id="product-name" 
                      placeholder="[Merek] + [Konten] + [Lingkup penggunaan] + [Tipe produk] + [Fungsi/Fitur Utama]" 
                      maxLength={255} 
                      value={productName} // Bind value to state
                      onChange={(e) => setProductName(e.target.value)} // Update state on change
                    />
                    <p className="text-xs text-muted-foreground text-right">{productName.length}/255</p>
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
                    <Textarea 
                      id="product-description" 
                      placeholder="Masukkan deskripsi produk yang menarik..." 
                      rows={8} 
                      value={productDescription} 
                      onChange={(e) => setProductDescription(e.target.value)}
                    />
                  </div>
                  {/* Add more fields like attributes, brand, etc. here */}
                </CardContent>
              </Card>

              {/* Card Harga Modal */}
              <CostPriceSection 
                ref={costPriceRef}
                showManualCostPrice={showManualCostPrice}
                onToggleShowManualCostPrice={(checked: boolean) => setShowManualCostPrice(Boolean(checked))}
              />
              {/* End Card Harga Modal */}

              {/* Info Penjualan */}
              <Card ref={salesInfoRef} id="info-penjualan">
                <CardHeader>
                  <CardTitle>Info penjualan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                <SalesInfoSection
                  addVariant={addVariant}
                  onToggleAddVariant={(checked: boolean) => {
                    setAddVariant(checked);
                    if (checked && variants.length === 0) {
                      handleAddVariantSection();
                    } else if (!checked) {
                      setVariants([]);
                    }
                  }}
                  defaultPrice={defaultPrice}
                  onDefaultPriceChange={(value: string) => setDefaultPrice(value)}
                  defaultQuantity={defaultQuantity}
                  onDefaultQuantityChange={(value: string) => setDefaultQuantity(value)}
                />
                  {/* Variant Creation Forms (Conditional & Mapped) */}
                  {addVariant && (
                    <VariantsEditor
                      addVariant={addVariant}
                      variants={variants}
                      variantTableData={variantTableData}
                      onAddVariantSection={handleAddVariantSection}
                      onRemoveVariantSection={handleRemoveVariantSection}
                      onVariantNameChange={handleVariantNameChange}
                      onRemoveVariantOption={handleRemoveVariantOption}
                      onVariantOptionValueChange={handleVariantOptionValueChange}
                      onVariantOptionImageChange={handleVariantOptionImageChange}
                      onVariantTableInputChange={handleVariantTableInputChange}
                      onWeightUnitChange={handleWeightUnitChange}
                      onRemoveVariantCombination={handleRemoveVariantCombination}
                    />
                  )}

                  {/* Button to Add New Variant Section */}
                  {/* Moved inside VariantsEditor */}

                  {/* Variant Combination Table (List Varian) */}
                  {/* Moved inside VariantsEditor */}
                  {false && (
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
                                ))}<TableHead className="min-w-[150px]"><span className="text-red-500 mr-1">*</span>Harga jual <TooltipProvider><Tooltip><TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground ml-1 inline-block cursor-help" /></TooltipTrigger><TooltipContent><p>Harga jual akhir produk.</p></TooltipContent></Tooltip></TooltipProvider></TableHead><TableHead className="min-w-[120px]"><span className="text-red-500 mr-1">*</span>Kuantitas <TooltipProvider><Tooltip><TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground ml-1 inline-block cursor-help" /></TooltipTrigger><TooltipContent><p>Jumlah stok tersedia.</p></TooltipContent></Tooltip></TooltipProvider></TableHead><TableHead className="min-w-[150px]">SKU Penjual <TooltipProvider><Tooltip><TooltipTrigger asChild><HelpCircle className="h-3 w-3 text-muted-foreground ml-1 inline-block cursor-help" /></TooltipTrigger><TooltipContent><p>Kode unik SKU untuk varian ini.</p></TooltipContent></Tooltip></TooltipProvider></TableHead><TableHead className="min-w-[180px]"><span className="text-red-500 mr-1">*</span>Berat dengan kemasan</TableHead><TableHead className="w-[50px]"></TableHead>{/* For Delete Button */}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {variantTableData.map((combination) => (
                                <TableRow key={combination.combinationId}>
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
              <ShippingSection ref={shippingRef} id="pengiriman" />
              {/* End Pengiriman */}

                  {/* SKU Mapping Card */}
                  <div ref={skuMappingRef} id="sku-mapping">
                    <SkuMappingCard 
                      productId={productId} 
                      selectedChannels={selectedChannels}
                      selectedStores={selectedStores}
                      skuMappingOption={skuMappingOption}
                      enableSkuMapping={enableSkuMapping}
                      onEnableSkuMappingChange={(checked: boolean) => setEnableSkuMapping(checked)}
                      onSkuMappingOptionChange={setSkuMappingOption}
                      onSelectedChannelsChange={setSelectedChannels}
                      onSelectedStoresChange={setSelectedStores}
                    />
                  </div>

            </div>
          </ScrollArea>
        </main>

        {/* Right Preview */}
        <aside className="w-80 hidden lg:block shrink-0">
          <Card className="sticky top-18">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                Pratinjau
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Pratinjau ini akan diperbarui secara otomatis saat Anda mengisi formulir.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Dynamic Preview Content */}
              <div className="border rounded-md p-4 space-y-3 bg-muted/20">
                <div className="flex justify-between items-center mb-2">
                   <p className="text-sm font-medium">Detail produk</p>
                   {/* Icons can be made dynamic later if needed */}
                   <div className="flex gap-2 text-muted-foreground">
                      <ImageIcon className="h-4 w-4 cursor-pointer hover:text-primary"/>
                      <Package className="h-4 w-4 cursor-pointer hover:text-primary"/>
                      <Truck className="h-4 w-4 cursor-pointer hover:text-primary"/>
                   </div>
                </div>
                {/* Main Image Preview */}
                <div className="aspect-square bg-muted rounded-md flex items-center justify-center mb-3 relative overflow-hidden">
                  {mainImagePreview ? (
                    <img src={mainImagePreview} alt="Pratinjau Gambar Utama" className="object-contain w-full h-full" />
                  ) : (
                    <>
                      <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                      <span className="absolute text-xs text-muted-foreground/50">Gambar utama</span>
                    </>
                  )}
                </div>
                {/* Product Name Preview */}
                <div className="h-auto text-sm font-medium truncate" title={productName || "Nama Produk Akan Muncul di Sini"}>
                  {productName || <span className="text-muted-foreground">Nama Produk...</span>}
                </div>
                {/* Product Description Preview */}
                <div className="h-auto text-xs text-muted-foreground truncate" title={productDescription || "Deskripsi Singkat Akan Muncul di Sini"}>
                  {productDescription || <span className="text-muted-foreground">Deskripsi singkat...</span>}
                </div>
                {/* Price Preview (Handles default or variant price) */}
                <div className="text-lg font-semibold mt-1">
                  {(() => {
                    if (addVariant && variants.length > 0 && variantTableData.length > 0) {
                      let priceToShow = variantTableData[0]?.price; // Default to first combination's price
                      if (selectedPreviewOptionId) {
                        // Find the combination matching the selected preview option (assuming it's from the first variant)
                        const firstVariantName = variants[0]?.name;
                        const selectedOption = variants[0]?.options.find(opt => opt.id === selectedPreviewOptionId);
                        if (firstVariantName && selectedOption) {
                          const matchingCombination = variantTableData.find(combo => combo.options[firstVariantName] === selectedOption.value);
                          if (matchingCombination) {
                            priceToShow = matchingCombination.price;
                          }
                        }
                      }
                      return priceToShow ? `Rp ${formatNumberWithSeparator(Number(priceToShow))}` : <span className="text-muted-foreground">Rp ...</span>;
                    } else if (!addVariant && defaultPrice) {
                      return `Rp ${formatNumberWithSeparator(Number(defaultPrice))}`;
                    } else {
                      return <span className="text-muted-foreground">Rp ...</span>;
                    }
                  })()}
                </div>
                <Separator className="my-4"/>
                {/* Variant Selection Preview (Basic structure) */}
                {addVariant && variants.length > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Pilih {variants[0]?.name || 'varian'}</span>
                        {/* Link to spec can be added later */}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {variants[0]?.options.filter(opt => opt.value).slice(0, 5).map(opt => (
                        <Button 
                          key={opt.id} 
                          variant={selectedPreviewOptionId === opt.id ? "default" : "outline"} // Highlight selected
                          size="sm" 
                          className="text-xs h-7 px-2"
                          onClick={() => setSelectedPreviewOptionId(opt.id)} // Set selected on click
                        >
                          {opt.value}
                        </Button>
                      ))}
                      {variants[0]?.options.length > 5 && <span className="text-xs text-muted-foreground self-center">...</span>}
                    </div>
                  </>
                )}
                {!addVariant && (
                  <>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Pilih opsi</span>
                        <span className="text-xs text-primary cursor-pointer hover:underline">Spesifikasi &gt;</span>
                    </div>
                    <div className="border rounded p-2 text-xs text-center text-muted-foreground bg-background">Default</div>
                  </>
                )}
                 <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 text-xs h-7 px-2">Tambah ke Keranjang</Button>
                    <Button size="sm" className="flex-1 text-xs h-7 px-2">Beli sekarang</Button>
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
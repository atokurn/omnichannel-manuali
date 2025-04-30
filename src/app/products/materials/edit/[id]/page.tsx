'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';
import { MaterialStatus } from '@prisma/client';
import Image from 'next/image'; // Import Image
import { cn } from '@/lib/utils'; // Import cn
import { Upload, X } from 'lucide-react'; // Import Upload and X icons
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// --- Zod Schema (mirip dengan API, tapi sesuaikan untuk form) ---
const DynamicPriceSchema = z.object({
  id: z.string().optional(), // Penting untuk update
  supplier: z.string().min(1, { message: 'Nama supplier tidak boleh kosong' }),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Harga harus berupa angka positif',
  }),
});

const MaterialFormSchema = z.object({
  name: z.string().min(1, { message: 'Nama material tidak boleh kosong' }),
  code: z.string().min(1, { message: 'Kode material tidak boleh kosong' }),
  unit: z.string().min(1, { message: 'Satuan harus dipilih' }),
  // initialStock tidak di-edit di sini, mungkin perlu field terpisah atau logika lain
  basePrice: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Harga dasar harus berupa angka positif',
  }),
  description: z.string().optional().nullable(),
  status: z.enum([MaterialStatus.AKTIF, MaterialStatus.NONAKTIF]),
  isDynamicPrice: z.boolean(),
  imageUrl: z.string().url({ message: 'URL gambar tidak valid' }).optional().nullable(), // Add imageUrl
  dynamicPrices: z.array(DynamicPriceSchema).optional(),
});

type MaterialFormValues = z.infer<typeof MaterialFormSchema>;

export default function EditMaterialPage() {
  const router = useRouter();
  const params = useParams();
  const materialId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // State for image preview
  const [imageFile, setImageFile] = useState<File | null>(null); // State for the image file
  const [isDragging, setIsDragging] = useState(false); // State for drag-and-drop
  const [isRemovingImage, setIsRemovingImage] = useState(false); // State to track explicit image removal

  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(MaterialFormSchema),
    defaultValues: {
      name: '',
      code: '',
      unit: '',
      basePrice: '',
      description: '',
      status: MaterialStatus.AKTIF,
      isDynamicPrice: false,
      dynamicPrices: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'dynamicPrices',
  });

  const isDynamicPrice = form.watch('isDynamicPrice');

  // --- Image Handling Functions ---
  const processFile = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setIsRemovingImage(false); // If a new file is selected, we are not removing
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Clear image URL error if any
      form.clearErrors('imageUrl');
    } else {
      // Handle invalid file type
      setImageFile(null);
      // Don't clear preview immediately if it was just an invalid drop
      if (file) { // Only show error if a file was actually selected/dropped
        form.setError('imageUrl', { type: 'manual', message: 'Hanya file gambar yang diperbolehkan.' });
        toast.error('File Tidak Valid', { description: 'Hanya file gambar yang diperbolehkan.' });
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    processFile(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setIsRemovingImage(true); // Mark that the user wants to remove the image
    form.setValue('imageUrl', null); // Update form value
    form.clearErrors('imageUrl');
  };

  // Drag and Drop Handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
        return;
    }
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    processFile(file);
  };

  // --- Fetch existing material data --- 
  useEffect(() => {
    if (!materialId) return;
    setIsFetching(true);
    setFetchError(null);
    const fetchMaterial = async () => {
      try {
        const response = await fetch(`/api/products/materials/${materialId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal mengambil data material');
        }
        const data = await response.json();
        // Reset form with fetched data
        form.reset({
          name: data.name,
          code: data.code,
          unit: data.unit,
          basePrice: data.basePrice, // API sudah format ke string
          description: data.description || '',
          status: data.status,
          isDynamicPrice: data.isDynamicPrice,
          imageUrl: data.imageUrl || null, // Set imageUrl from fetched data
          dynamicPrices: data.dynamicPrices || [], // API sudah format price ke string
        });
        // Set initial image preview if imageUrl exists
        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
        }
      } catch (err: any) {
        setFetchError(err.message || 'Terjadi kesalahan saat memuat data');
        toast.error('Error', { description: err.message || 'Gagal memuat data material.' });
      } finally {
        setIsFetching(false);
      }
    };
    fetchMaterial();
  }, [materialId, form]);

  // --- Handle form submission --- 
  const onSubmit: SubmitHandler<MaterialFormValues> = async (formDataFromHook) => {
    setIsLoading(true);
    let finalImageUrl = form.getValues('imageUrl'); // Get current URL from form state (initially fetched)

    // 1. Handle Image Upload if a new file exists
    if (imageFile) {
      const formDataUpload = new FormData();
      formDataUpload.append('file', imageFile);
      try {
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formDataUpload });
        const uploadResult = await uploadRes.json();
        if (!uploadRes.ok || !uploadResult.success) {
          throw new Error(uploadResult.message || 'Upload failed');
        }
        finalImageUrl = uploadResult.url; // Update URL with the newly uploaded one
        console.log("New image uploaded, URL:", finalImageUrl);
      } catch (uploadError: any) {
        toast.error('Error Upload', { description: `Gagal mengunggah gambar baru: ${uploadError.message}` });
        setIsLoading(false);
        return; // Stop submission
      }
    } else if (isRemovingImage) {
      // 2. Handle Image Removal if flagged
      finalImageUrl = null;
      console.log("Image marked for removal.");
    }
    // If no new file and not removing, finalImageUrl remains the initially fetched URL

    // 3. Prepare payload for PUT request
    const payload = {
      ...formDataFromHook, // Use data passed by react-hook-form's handleSubmit
      imageUrl: finalImageUrl, // Use the determined final image URL
    };

    // Remove dynamicPrices if isDynamicPrice is false
    if (!payload.isDynamicPrice) {
        payload.dynamicPrices = []; // Ensure empty array is sent if toggled off
    }

    // 4. Send PUT request
    try {
      const response = await fetch(`/api/products/materials/${materialId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle validation errors from API
        if (response.status === 400 && result.errors) {
          const errors = result.errors;
          Object.keys(errors).forEach((key) => {
            // Need to handle nested errors for dynamicPrices potentially
            if (key === 'dynamicPrices' && typeof errors[key] === 'object') {
                 Object.keys(errors[key]).forEach(indexStr => {
                    const index = parseInt(indexStr, 10);
                    if (!isNaN(index) && typeof errors[key][index] === 'object') {
                        Object.keys(errors[key][index]).forEach(field => {
                            form.setError(`dynamicPrices.${index}.${field as 'supplier' | 'price'}`, {
                                type: 'manual',
                                message: errors[key][index][field]?.join(', ') || 'Error',
                            });
                        });
                    }
                 });
            } else {
                 form.setError(key as keyof MaterialFormValues, {
                    type: 'manual',
                    message: errors[key]?.join(', ') || 'Error tidak diketahui',
                 });
            }
          });
          toast.error('Error Validasi', { description: 'Silakan periksa kembali isian form.' });
        } else {
          // Handle other errors (e.g., 404, 409, 500)
          toast.error('Gagal Memperbarui', { description: result.message || 'Terjadi kesalahan.' });
        }
      } else {
        toast.success('Sukses', { description: 'Material berhasil diperbarui.' });
        router.push('/products/materials'); // Redirect back to list
        router.refresh(); // Refresh server components to reflect changes
      }
    } catch (err: any) {
      toast.error('Error Jaringan', { description: err.message || 'Tidak dapat terhubung ke server.' });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Conditional Rendering based on Fetching State --- 
  // if (isFetching) { // Keep this logic, but render Skeleton instead of full loader
  //   return (
  //     <div className="flex flex-1 justify-center items-center p-4">
  //       <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  //       <span className="ml-2">Memuat data material...</span>
  //     </div>
  //   );
  // }

  if (fetchError) {
    return (
      <div className="flex flex-1 justify-center items-center p-4 text-red-600">
        {fetchError}
      </div>
    );
  }

  // --- Main Render --- 
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Header section */} 
      <div className="flex items-center gap-4 mb-4">
         {/* Back button */} 
         <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>...</Button>
         {/* Title */} 
         <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            {isFetching ? <Skeleton className="h-6 w-48" /> : `Edit Material: ${form.getValues('name') || '...'}`}
         </h1>
         {/* Action Buttons */} 
         <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button variant="outline" size="sm" onClick={() => router.back()} disabled={isFetching || isLoading}>Batal</Button>
            <Button size="sm" type="submit" form="edit-material-form" disabled={isLoading || isFetching}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Simpan Perubahan
            </Button>
         </div>
      </div>

      <form id="edit-material-form" onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
        {/* Left Column: Material Details & Pricing */} 
        <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
          {/* --- Material Details Card --- */} 
          <Card>
            <CardHeader>
              {isFetching ? (
                <>
                  <Skeleton className="h-6 w-1/3 mb-1" />
                  <Skeleton className="h-4 w-2/3" />
                </>
              ) : (
                <>
                  <CardTitle>Detail Material</CardTitle>
                  <CardDescription>Informasi dasar material.</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              {isFetching ? (
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                  </div>
                  <Skeleton className="h-10" />
                  <Skeleton className="h-20" />
                </div>
              ) : (
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="name">Nama Material</Label>
                      <Input id="name" {...form.register('name')} />
                      {form.formState.errors.name && <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="code">Kode Material</Label>
                      <Input id="code" {...form.register('code')} />
                      {form.formState.errors.code && <p className="text-sm text-red-600 mt-1">{form.formState.errors.code.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="unit">Satuan</Label>
                      <Input id="unit" {...form.register('unit')} placeholder="Contoh: KG, PCS" />
                      {form.formState.errors.unit && <p className="text-sm text-red-600 mt-1">{form.formState.errors.unit.message}</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Deskripsi (Opsional)</Label>
                    <Textarea id="description" {...form.register('description')} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* --- Pricing Card --- */} 
          <Card>
            <CardHeader>
              {isFetching ? (
                <>
                  <Skeleton className="h-6 w-1/4 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </>
              ) : (
                <>
                  <CardTitle>Pengaturan Harga</CardTitle>
                  <CardDescription>Atur harga dasar dan opsi harga dinamis.</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              {isFetching ? (
                <div className="grid gap-6">
                  <Skeleton className="h-10" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                  {/* Optionally add skeleton for dynamic price table if needed */}
                </div>
              ) : (
                <div className="grid gap-6">
                  <div>
                    <Label htmlFor="basePrice">Harga Dasar (Rp)</Label>
                    <Input id="basePrice" type="number" step="any" {...form.register('basePrice')} />
                    {form.formState.errors.basePrice && <p className="text-sm text-red-600 mt-1">{form.formState.errors.basePrice.message}</p>}
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <Label htmlFor="isDynamicPrice" className="flex flex-col space-y-1">
                      <span>Harga Dinamis</span>
                      <span className="font-normal leading-snug text-muted-foreground">
                        Aktifkan jika harga berbeda tergantung supplier.
                      </span>
                    </Label>
                    <Switch
                      id="isDynamicPrice"
                      checked={isDynamicPrice}
                      onCheckedChange={(checked) => form.setValue('isDynamicPrice', checked)}
                    />
                  </div>
                  {isDynamicPrice && (
                    <div className="space-y-4">
                      <Label>Daftar Harga Supplier</Label>
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-2 border-t pt-4">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            {/* Supplier Input */}
                            {/* Price Input */}
                          </div>
                          <Button type="button" variant="outline" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-100" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button type="button" variant="outline" onClick={() => append({ supplier: '', price: '' })}>
                        Tambah Harga Supplier
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Image & Status */} 
        <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
          {/* --- Image Upload Card --- */} 
          <Card
            className={cn(
              'overflow-hidden',
              isDragging && 'border-primary border-dashed bg-muted/50'
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <CardHeader>
              {isFetching ? (
                <>
                  <Skeleton className="h-6 w-1/2 mb-1" />
                  <Skeleton className="h-4 w-full" />
                </>
              ) : (
                <>
                  <CardTitle>Gambar Material</CardTitle>
                  <CardDescription>Unggah, jatuhkan, atau hapus gambar.</CardDescription>
                </>
              )}
            </CardHeader>
            <CardContent>
              {isFetching ? (
                <Skeleton className="h-32 w-full rounded-lg" />
              ) : (
                <div className="grid gap-3">
                  <Label
                    htmlFor="imageUrlInput"
                    className={cn(
                      'relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer',
                      'hover:bg-muted/50',
                      isDragging ? 'border-primary bg-primary/10' : 'border-border',
                      form.formState.errors.imageUrl ? 'border-red-500' : ''
                    )}
                  >
                    {imagePreview ? (
                      <>
                        <Image
                          src={imagePreview}
                          alt="Pratinjau Gambar"
                          layout="fill"
                          objectFit="contain"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 z-10"
                          onClick={(e) => { e.preventDefault(); handleRemoveImage(); }}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Hapus Gambar</span>
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Klik untuk unggah</span> atau jatuhkan
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF</p>
                      </div>
                    )}
                  </Label>
                  <Input
                    id="imageUrlInput"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                  {form.formState.errors.imageUrl && <p className="text-sm text-red-500 mt-1">{form.formState.errors.imageUrl.message}</p>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* --- Status Card --- */} 
          <Card>
            <CardHeader>
              {isFetching ? (
                <Skeleton className="h-6 w-1/4" />
              ) : (
                <CardTitle>Status</CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {isFetching ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  onValueChange={(value) => form.setValue('status', value as MaterialStatus)}
                  value={form.watch('status')}
                  disabled={isLoading}
                >
                  <SelectTrigger id="status" aria-label="Select status">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MaterialStatus.AKTIF}>Aktif</SelectItem>
                    <SelectItem value={MaterialStatus.NONAKTIF}>Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Mobile Save/Cancel Buttons */} 
        <div className="flex items-center justify-center gap-2 md:hidden mt-6">
           <Button variant="outline" size="sm" onClick={() => router.back()} disabled={isFetching || isLoading}>Batal</Button>
           <Button size="sm" type="submit" form="edit-material-form" disabled={isLoading || isFetching}>
             {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
             Simpan Perubahan
           </Button>
        </div>
      </form>
    </div>
  );
}
'use client';

import { useState, DragEvent } from 'react'; // Import DragEvent
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Save, Trash2, Upload } from 'lucide-react'; // Add Upload icon
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
// import { useToast } from '@/components/ui/use-toast'; // Remove useToast import
import { toast } from 'sonner'; // Import toast from sonner
import { MaterialStatus } from '@prisma/client'; // Import MaterialStatus
import Image from 'next/image'; // Import Image component
import { cn } from '@/lib/utils'; // Import cn for conditional classes

// Interface untuk data form material
interface MaterialFormData {
  name: string;
  code: string;
  unit: string;
  initialStock: string; // Keep as string for input, convert on submit
  basePrice: string; // Keep as string for input, convert on submit
  description: string;
  status: MaterialStatus; // Use enum type
  isDynamicPrice: boolean;
  imageUrl?: string; // Add optional imageUrl
}

// Data dummy untuk satuan
const unitOptions = [
  { id: 'pcs', name: 'Pcs' },
  { id: 'kg', name: 'Kilogram' },
  { id: 'g', name: 'Gram' },
  { id: 'l', name: 'Liter' },
  { id: 'ml', name: 'Mililiter' },
  { id: 'box', name: 'Box' },
  { id: 'pack', name: 'Pack' },
];

// Interface untuk harga dinamis
interface DynamicPrice {
  id: number;
  supplier: string;
  price: string; // Keep as string for input, convert on submit
}

// Interface for form errors
interface FormErrors {
  name?: string[];
  code?: string[];
  unit?: string[];
  initialStock?: string[];
  basePrice?: string[];
  description?: string[];
  status?: string[];
  isDynamicPrice?: string[];
  imageUrl?: string[]; // Add imageUrl errors
  dynamicPrices?: { [key: number]: { supplier?: string[]; price?: string[] } };
  general?: string; // For general errors like API failure
}

export default function AddMaterialPage() {
  const router = useRouter();
  // const { toast } = useToast(); // Remove useToast initialization
  const [formData, setFormData] = useState<MaterialFormData>({
    name: '',
    code: '',
    unit: '',
    initialStock: '',
    basePrice: '',
    description: '',
    status: MaterialStatus.AKTIF, // Default to AKTIF enum
    isDynamicPrice: false,
    imageUrl: '', // Initialize imageUrl
  });
  const [dynamicPrices, setDynamicPrices] = useState<DynamicPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({}); // State for errors
  const [imagePreview, setImagePreview] = useState<string | null>(null); // State for image preview
  const [imageFile, setImageFile] = useState<File | null>(null); // State for the image file
  const [isDragging, setIsDragging] = useState(false); // State for drag-and-drop

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const processFile = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Clear image URL error if any
      if (formErrors.imageUrl) {
        setFormErrors((prev) => ({ ...prev, imageUrl: undefined }));
      }
    } else {
      // Handle invalid file type
      setImageFile(null);
      setImagePreview(null);
      if (file) { // Only show error if a file was actually selected/dropped
        setFormErrors((prev) => ({ ...prev, imageUrl: ['Hanya file gambar yang diperbolehkan.'] }));
        toast.error('File Tidak Valid', { description: 'Hanya file gambar yang diperbolehkan.' });
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    processFile(file);
  };

  // Drag and Drop Handlers
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set isDragging to false if the leave event is not going to a child element
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
        return;
    }
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true); // Keep dragging state active while over the element
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    processFile(file);
  };

  const handleSelectChange = (name: keyof MaterialFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value as MaterialStatus })); // Cast value for status
    // Clear error for this field when user selects
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isDynamicPrice: checked }));
    if (!checked) {
      setDynamicPrices([]);
    }
    // Clear error for this field
    if (formErrors.isDynamicPrice) {
      setFormErrors((prev) => ({ ...prev, isDynamicPrice: undefined }));
    }
    if (formErrors.dynamicPrices) {
        setFormErrors((prev) => ({ ...prev, dynamicPrices: undefined }));
    }
  };

  const addDynamicPriceRow = () => {
    setDynamicPrices((prev) => [...prev, { id: Date.now(), supplier: '', price: '' }]);
  };

  const handleDynamicPriceChange = (index: number, field: keyof Omit<DynamicPrice, 'id'>, value: string) => {
    setDynamicPrices((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
    // Clear specific dynamic price error
    if (formErrors.dynamicPrices?.[index]?.[field]) {
        setFormErrors(prev => {
            const newErrors = { ...prev };
            if (newErrors.dynamicPrices?.[index]) {
                newErrors.dynamicPrices[index][field] = undefined;
                // Clean up empty error objects
                if (!newErrors.dynamicPrices[index].supplier && !newErrors.dynamicPrices[index].price) {
                    delete newErrors.dynamicPrices[index];
                }
                if (Object.keys(newErrors.dynamicPrices).length === 0) {
                    delete newErrors.dynamicPrices;
                }
            }
            return newErrors;
        });
    }
  };

  const removeDynamicPriceRow = (id: number) => {
    setDynamicPrices((prev) => prev.filter((item) => item.id !== id));
    // Clear errors related to the removed row if necessary (though validation happens on submit)
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setFormErrors({}); // Clear previous errors

    let uploadedImageUrl = formData.imageUrl; // Keep existing if no new image

    // --- Actual Image Upload Logic ---
    if (imageFile) {
      const formDataUpload = new FormData();
      formDataUpload.append('file', imageFile);

      try {
        const uploadRes = await fetch('/api/upload', { // Call the upload endpoint
          method: 'POST',
          body: formDataUpload,
        });
        const uploadResult = await uploadRes.json();

        if (!uploadRes.ok || !uploadResult.success) {
          throw new Error(uploadResult.message || 'Upload failed');
        }

        uploadedImageUrl = uploadResult.url; // Get URL from upload API response
        console.log("Image uploaded successfully, URL:", uploadedImageUrl);

      } catch (uploadError: any) {
        setFormErrors({ general: `Gagal mengunggah gambar: ${uploadError.message}` });
        setIsLoading(false);
        toast.error('Error Upload', { description: `Gagal mengunggah gambar: ${uploadError.message}` });
        return; // Stop submission if image upload fails
      }
    }
    // --- End Image Upload Logic ---

    const payload = {
      ...formData,
      imageUrl: uploadedImageUrl, // Use the potentially updated image URL
      dynamicPrices: formData.isDynamicPrice ? dynamicPrices : [],
    };

    // Remove imageUrl from payload if it's empty or just the initial empty string
    // Keep the imageUrl even if it's an empty string if the user explicitly removed an image (future feature)
    // For now, we only add it if it exists.
    if (!payload.imageUrl) {
      delete payload.imageUrl;
    }

    try {
      const response = await fetch('/api/products/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400 && result.errors) {
          // Handle validation errors
          setFormErrors(result.errors);
          toast.error('Gagal Menyimpan', {
            description: 'Periksa kembali isian form Anda.',
          });
        } else if (response.status === 409) {
          setFormErrors({ code: [result.message || 'Kode material sudah digunakan.'] });
          toast.error('Gagal Menyimpan', {
            description: result.message || 'Kode material sudah digunakan.',
          });
        } else {
          setFormErrors({ general: result.message || 'Terjadi kesalahan pada server.' });
          toast.error('Gagal Menyimpan', {
            description: result.message || 'Terjadi kesalahan pada server.',
          });
        }
        // No need to throw error here as we are handling the state update
      } else {
        // Success
        toast.success('Sukses!', {
          description: 'Material baru berhasil disimpan.',
        });
        router.push('/products/materials'); // Redirect after successful save
      }

    } catch (error) {
      console.error('Failed to save material:', error);
      // If it's not a validation/conflict error already handled, show a general error
      // Avoid overwriting specific upload errors
      if (!formErrors.general && !Object.keys(formErrors).some(k => k !== 'general')) {
        setFormErrors({ general: 'Tidak dapat terhubung ke server.' });
        toast.error('Error', {
          description: 'Tidak dapat terhubung ke server.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Kembali</span>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Tambah Material Baru
          </h1>
          <div className="hidden items-center gap-2 md:ml-auto md:flex">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              Batal
            </Button>
            <Button size="sm" type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : <><Save className="h-4 w-4 mr-2" /> Simpan Material</>}
            </Button>
          </div>
        </div>

        {/* Display general errors */} 
        {formErrors.general && (
            <p className="text-sm text-red-500 mb-4">{formErrors.general}</p>
        )}

        <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Detail Material</CardTitle>
                <CardDescription>
                  Masukkan informasi dasar tentang material produk.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="name">Nama Material</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      className={`w-full ${formErrors.name ? 'border-red-500' : ''}`}
                      placeholder="Contoh: Kain Katun Jepang"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                    {formErrors.name && <p className="text-sm text-red-500">{formErrors.name[0]}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-3">
                      <Label htmlFor="code">Kode Material</Label>
                      <Input
                        id="code"
                        name="code"
                        type="text"
                        placeholder="Contoh: KTN-JPG-01"
                        className={`${formErrors.code ? 'border-red-500' : ''}`}
                        value={formData.code}
                        onChange={handleInputChange}
                        required
                      />
                      {formErrors.code && <p className="text-sm text-red-500">{formErrors.code[0]}</p>}
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="unit">Satuan</Label>
                      <Select name="unit" onValueChange={(value) => handleSelectChange('unit', value)} value={formData.unit} required>
                        <SelectTrigger id="unit" aria-label="Pilih Satuan" className={`${formErrors.unit ? 'border-red-500' : ''}`}>
                          <SelectValue placeholder="Pilih Satuan" />
                        </SelectTrigger>
                        <SelectContent>
                          {unitOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.unit && <p className="text-sm text-red-500">{formErrors.unit[0]}</p>}
                    </div>
                  </div>
                   <div className="grid gap-3">
                      <Label htmlFor="initialStock">Stok Awal</Label>
                      <Input
                        id="initialStock"
                        name="initialStock"
                        type="number"
                        placeholder="Masukkan jumlah stok awal"
                        className={`${formErrors.initialStock ? 'border-red-500' : ''}`}
                        value={formData.initialStock}
                        onChange={handleInputChange}
                        required
                      />
                      {formErrors.initialStock && <p className="text-sm text-red-500">{formErrors.initialStock[0]}</p>}
                    </div>
                  <div className="grid gap-3">
                    <Label htmlFor="description">Deskripsi (Opsional)</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Deskripsi singkat material"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`min-h-32 ${formErrors.description ? 'border-red-500' : ''}`}
                    />
                     {formErrors.description && <p className="text-sm text-red-500">{formErrors.description[0]}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Harga</CardTitle>
                <CardDescription>
                  Atur harga dasar dan opsi harga dinamis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="basePrice">Harga Dasar per Satuan</Label>
                    <Input
                      id="basePrice"
                      name="basePrice"
                      type="number"
                      placeholder="Contoh: 15000"
                      className={`${formErrors.basePrice ? 'border-red-500' : ''}`}
                      value={formData.basePrice}
                      onChange={handleInputChange}
                      required
                    />
                     {formErrors.basePrice && <p className="text-sm text-red-500">{formErrors.basePrice[0]}</p>}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isDynamicPrice"
                      checked={formData.isDynamicPrice}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="isDynamicPrice">Gunakan Harga Dinamis Berdasarkan Supplier</Label>
                  </div>
                  {formErrors.isDynamicPrice && <p className="text-sm text-red-500">{formErrors.isDynamicPrice[0]}</p>}

                  {formData.isDynamicPrice && (
                    <div className="mt-4 border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <Label>Harga per Supplier</Label>
                        <Button type="button" size="sm" variant="outline" onClick={addDynamicPriceRow}>
                          <Plus className="h-4 w-4 mr-2" /> Tambah Supplier
                        </Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Supplier</TableHead>
                            <TableHead>Harga</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dynamicPrices.map((price, index) => (
                            <TableRow key={price.id}>
                              <TableCell>
                                <Input
                                  type="text"
                                  placeholder="Nama Supplier"
                                  className={`${formErrors.dynamicPrices?.[index]?.supplier ? 'border-red-500' : ''}`}
                                  value={price.supplier}
                                  onChange={(e) => handleDynamicPriceChange(index, 'supplier', e.target.value)}
                                  required
                                />
                                {formErrors.dynamicPrices?.[index]?.supplier && <p className="text-sm text-red-500">{formErrors.dynamicPrices[index].supplier[0]}</p>}
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  placeholder="Harga"
                                  className={`${formErrors.dynamicPrices?.[index]?.price ? 'border-red-500' : ''}`}
                                  value={price.price}
                                  onChange={(e) => handleDynamicPriceChange(index, 'price', e.target.value)}
                                  required
                                />
                                {formErrors.dynamicPrices?.[index]?.price && <p className="text-sm text-red-500">{formErrors.dynamicPrices[index].price[0]}</p>}
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeDynamicPriceRow(price.id)}
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
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
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
                <CardTitle>Gambar Material</CardTitle>
                <CardDescription>Unggah atau jatuhkan gambar untuk material ini.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Label
                    htmlFor="imageUrl"
                    className={cn(
                      'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer',
                      'hover:bg-muted/50',
                      isDragging ? 'border-primary bg-primary/10' : 'border-border',
                      formErrors.imageUrl ? 'border-red-500' : ''
                    )}
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={imagePreview}
                          alt="Pratinjau Gambar"
                          layout="fill"
                          objectFit="contain" // Use contain to show the whole image
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Klik untuk unggah</span> atau jatuhkan gambar
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF (MAX. 800x400px)</p>
                      </div>
                    )}
                  </Label>
                  <Input
                    id="imageUrl"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sr-only" // Hide the default input, use the label as the trigger
                  />
                  {formErrors.imageUrl && <p className="text-sm text-red-500 mt-1">{formErrors.imageUrl[0]}</p>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Material</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" onValueChange={(value) => handleSelectChange('status', value as MaterialStatus)} value={formData.status} required>
                      <SelectTrigger id="status" aria-label="Pilih Status" className={`${formErrors.status ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={MaterialStatus.AKTIF}>Aktif</SelectItem>
                        <SelectItem value={MaterialStatus.NONAKTIF}>Nonaktif</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.status && <p className="text-sm text-red-500">{formErrors.status[0]}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ... (footer buttons remain the same) ... */}
      </form>
    </div>
  );
}
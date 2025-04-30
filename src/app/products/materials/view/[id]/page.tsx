'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, X } from 'lucide-react';
import { MaterialStatus } from '@prisma/client';
import { FormattedMaterial, FormattedDynamicPrice } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogClose, DialogTitle } from '@/components/ui/dialog';

// Helper function to format currency
const formatCurrency = (amount: number | string) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numericAmount);
};

interface MaterialDetail extends Omit<FormattedMaterial, 'dynamicPrices'> {
    dynamicPrices: FormattedDynamicPrice[];
}

export default function ViewMaterialPage() {
  const router = useRouter();
  const params = useParams();
  const materialId = params.id as string;

  const [material, setMaterial] = useState<MaterialDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageOpen, setIsImageOpen] = useState(false);

  useEffect(() => {
    if (!materialId) return;

    const fetchMaterial = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/products/materials/${materialId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Gagal mengambil data material');
        }
        const data: MaterialDetail = await response.json();
        setMaterial(data);
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan saat memuat data');
        toast.error('Error', { description: err.message || 'Gagal memuat data material.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaterial();
  }, [materialId]);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center mb-4">
        <Button variant="outline" size="icon" className="mr-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">Detail Material Produk</h1>
      </div>

      <Card>
        {isLoading ? (
          // Skeleton loading state
          <>
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image skeleton */}
              <div className="flex justify-center mb-4">
                <Skeleton className="w-48 h-48 rounded-md" />
              </div>
              
              {/* Details skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
              
              {/* Dynamic prices skeleton */}
              <div>
                <Skeleton className="h-6 w-40 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
              </div>
              
              <div className="flex justify-end mt-6">
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </>
        ) : error ? (
          <div className="flex flex-1 justify-center items-center p-4 text-red-600">
            {error}
          </div>
        ) : !material ? (
          <div className="flex flex-1 justify-center items-center p-4">
            Material tidak ditemukan.
          </div>
        ) : (
          // Actual content when data is loaded
          <>
            <CardHeader>
              <CardTitle>{material.name}</CardTitle>
              <CardDescription>Kode: {material.code}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Section */}
              <div className="flex justify-center mb-4">
                <div 
                  className="relative w-48 h-48 overflow-hidden rounded-md border cursor-pointer"
                  onClick={() => setIsImageOpen(true)}
                >
                  <Image
                    src={material.imageUrl || '/placeholder.svg'}
                    alt={material.name || 'Gambar Material'}
                    layout="fill"
                    objectFit="contain"
                    className="bg-muted"
                  />
                </div>
              </div>
              
              {/* Image Fullscreen Dialog */}
              <Dialog open={isImageOpen} onOpenChange={setIsImageOpen}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none">
                  <DialogTitle className="sr-only">Material Image</DialogTitle>
                  <div className="relative w-full h-[80vh] bg-black flex items-center justify-center">
                    <DialogClose className="absolute top-2 right-2 z-10">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70 cursor-pointer">
                        <X className="h-4 w-4" />
                      </div>
                    </DialogClose>
                    <Image
                      src={material?.imageUrl || '/placeholder.svg'}
                      alt={material?.name || 'Gambar Material'}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                </DialogContent>
              </Dialog>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Satuan</p>
                  <p>{material.unit}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Harga Dasar</p>
                  <p>{formatCurrency(material.basePrice)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stok Awal</p>
                  <p>{material.initialStock}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={material.status === MaterialStatus.AKTIF ? 'default' : 'secondary'}>
                    {material.status}
                  </Badge>
                </div>
                {material.description && (
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Deskripsi</p>
                    <p className="whitespace-pre-wrap">{material.description}</p>
                  </div>
                )}
              </div>

              {/* Dynamic Prices Section */}
              <div>
                <h3 className="text-lg font-semibold mb-2 mt-4">Harga Dinamis</h3>
                {material.isDynamicPrice ? (
                  material.dynamicPrices && material.dynamicPrices.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Supplier</TableHead>
                          <TableHead className="text-right">Harga (Rp)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {material.dynamicPrices.map((dp) => (
                          <TableRow key={dp.id}>
                            <TableCell>{dp.supplier}</TableCell>
                            <TableCell className="text-right">{formatCurrency(dp.price)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">Tidak ada harga dinamis yang ditambahkan.</p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">Harga dinamis tidak diaktifkan untuk material ini.</p>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => router.push(`/products/materials/edit/${material.id}`)}>
                  Edit Material
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

// Define types if not already globally available
// You might want to move these to a central types file (e.g., src/lib/types.ts)
/*
export interface FormattedDynamicPrice {
  id: string;
  supplier: string;
  price: string; // Keep as string if API returns string
  materialId: string;
}

export interface FormattedMaterial {
  id: string;
  name: string;
  code: string;
  unit: string;
  initialStock: string; // Keep as string if API returns string
  basePrice: string; // Keep as string if API returns string
  description: string | null;
  status: MaterialStatus;
  isDynamicPrice: boolean;
  createdAt: string; // Or Date
  updatedAt: string; // Or Date
  dynamicPrices?: FormattedDynamicPrice[]; // Optional if not always included
}
*/
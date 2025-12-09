'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function ProductViewPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [product, setProduct] = useState<any | null>(null);
    const [batches, setBatches] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingBatches, setIsLoadingBatches] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/products/${id}`);
                if (!res.ok) throw new Error('Gagal memuat produk');
                const data = await res.json();
                setProduct(data);
            } catch (err: any) {
                toast.error(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const fetchBatches = async () => {
        if (batches.length > 0) return;
        setIsLoadingBatches(true);
        try {
            const res = await fetch(`/api/products/${id}/batches`);
            if (res.ok) {
                const data = await res.json();
                setBatches(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingBatches(false);
        }
    };

    if (isLoading) return <div className="p-8">Memuat detail...</div>;
    if (!product) return <div className="p-8">Produk tidak ditemukan</div>;

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push('/products')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            {product.name}
                            <Badge variant={product.status === 'In Stock' ? 'default' : 'secondary'}>
                                {product.status}
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground">{product.sku || '-'}</p>
                    </div>
                </div>
                <Button onClick={() => router.push(`/products/management/edit/${id}`)}> {/* Assuming edit path */}
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
            </div>

            <Tabs defaultValue="detail" className="w-full" onValueChange={(val) => {
                if (val === 'batches') fetchBatches();
            }}>
                <TabsList>
                    <TabsTrigger value="detail">Detail Informasi</TabsTrigger>
                    <TabsTrigger value="batches">Stok Batches (FIFO)</TabsTrigger>
                </TabsList>

                <TabsContent value="detail" className="mt-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>Info Produk</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Kategori</div>
                                    <div>{product.category?.name || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Harga Jual</div>
                                    <div className="text-lg font-bold">Rp {product.price?.toLocaleString()}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Stok Total</div>
                                    <div className="text-lg font-bold">{product.stock}</div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Inventaris Gudang</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {product.inventories && product.inventories.length > 0 ? (
                                        product.inventories.map((inv: any) => (
                                            <div key={inv.id} className="flex justify-between border-b pb-1 last:border-0">
                                                <span>{inv.warehouse?.name}</span>
                                                <span className="font-mono">{inv.quantity}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-muted-foreground">Belum ada inventaris</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="batches" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Batch Stok Produk Jadi</CardTitle>
                            <CardDescription>
                                Daftar batch produk yang tersedia untuk penjualan (FIFO).
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Batch Code</TableHead>
                                        <TableHead>Sumber</TableHead>
                                        <TableHead>Gudang</TableHead>
                                        <TableHead>Qty Awal</TableHead>
                                        <TableHead>Qty Sisa</TableHead>
                                        <TableHead>HPP (Cost)</TableHead>
                                        <TableHead>Tgl Masuk</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingBatches ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-4">Memuat data batch...</TableCell>
                                        </TableRow>
                                    ) : batches.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">Tidak ada data batch.</TableCell>
                                        </TableRow>
                                    ) : (
                                        batches.map((b) => (
                                            <TableRow key={b.id}>
                                                <TableCell className="font-mono">{b.batchCode}</TableCell>
                                                <TableCell><Badge variant="outline">{b.source}</Badge></TableCell>
                                                <TableCell>{b.warehouseName}</TableCell>
                                                <TableCell>{b.qtyTotal}</TableCell>
                                                <TableCell className="font-bold">{b.qtyRemaining}</TableCell>
                                                <TableCell>Rp {b.costPerUnit?.toLocaleString()}</TableCell>
                                                <TableCell>{format(new Date(b.receivedAt), 'dd MMM yyyy')}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from "@/components/ui/combobox";
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
    id: string;
    name: string;
}

interface Warehouse {
    id: string;
    name: string;
}

export default function StartProductionPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [formData, setFormData] = useState({
        productId: '',
        warehouseId: '',
        plannedQty: '1'
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Load products and warehouses
        const fetchData = async () => {
            try {
                const [prodRes, warehouseRes] = await Promise.all([
                    fetch('/api/products?limit=100'),
                    fetch('/api/warehouses')
                ]);

                if (prodRes.ok) {
                    const data = await prodRes.json();
                    // Api returns { data: [], pagination: ... }
                    setProducts(data.data.map((p: any) => ({ id: p.id, name: p.name })));
                }

                if (warehouseRes.ok) {
                    const data = await warehouseRes.json();
                    setWarehouses(data);
                    if (data.length > 0) {
                        setFormData(prev => ({ ...prev, warehouseId: data[0].id }));
                    }
                }

            } catch (err) {
                console.error('Failed to load data', err);
                toast.error('Gagal memuat data');
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = {
                productId: formData.productId,
                warehouseId: formData.warehouseId,
                plannedQty: parseInt(formData.plannedQty)
            };

            const res = await fetch('/api/production', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.message || 'Gagal memulai produksi');
            }

            toast.success('Produksi dimulai!');
            router.push('/production');

        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-semibold">Mulai Produksi Baru</h1>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detail Produksi</CardTitle>
                            <CardDescription>Pilih produk dan tentukan jumlah yang akan diproduksi.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label>Produk</Label>
                                    <Combobox
                                        options={products.map(p => ({ value: p.id, label: p.name }))}
                                        value={formData.productId}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, productId: val }))}
                                        placeholder="Pilih Produk"
                                        searchPlaceholder="Cari produk..."
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <Label>Gudang Material</Label>
                                    <CardDescription className="mt-[-8px] text-xs">Material akan diambil dari gudang ini (FIFO).</CardDescription>
                                    <Combobox
                                        options={warehouses.map(w => ({ value: w.id, label: w.name }))}
                                        value={formData.warehouseId}
                                        onValueChange={(val) => setFormData(prev => ({ ...prev, warehouseId: val }))}
                                        placeholder="Pilih Gudang"
                                        searchPlaceholder="Cari gudang..."
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <Label>Jumlah Rencana</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={formData.plannedQty}
                                        onChange={(e) => setFormData(prev => ({ ...prev, plannedQty: e.target.value }))}
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button variant="outline" type="button" onClick={() => router.back()}>Batal</Button>
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? 'Memproses...' : <><Save className="mr-2 h-4 w-4" /> Mulai Produksi</>}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Helper info sidebar could go here */}
                <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            <p>
                                Sistem otomatis akan memeriksa stok material (BOM) yang dibutuhkan dari gudang yang dipilih.
                            </p>
                            <br />
                            <p>
                                Jika stok material tidak mencukupi, proses akan gagal. Pastikan stok tersedia sebelum memulai.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

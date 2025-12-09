'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Combobox } from "@/components/ui/combobox";

export default function ProductionDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [batch, setBatch] = useState<any | null>(null);
    const [warehouses, setWarehouses] = useState<{ id: string, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Completion Form State
    const [completeForm, setCompleteForm] = useState({
        actualProducedQty: '',
        targetWarehouseId: '',
        overheadCost: '0'
    });
    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/production/${id}`);
            if (res.ok) {
                const data = await res.json();
                setBatch(data);
                if (data.producedQty) {
                    setCompleteForm(prev => ({ ...prev, actualProducedQty: data.producedQty.toString() }));
                } else {
                    setCompleteForm(prev => ({ ...prev, actualProducedQty: data.plannedQty.toString() }));
                }
            } else {
                toast.error('Gagal memuat detail batch');
            }

            const whRes = await fetch('/api/warehouses');
            if (whRes.ok) {
                const whData = await whRes.json();
                setWarehouses(whData);
                if (whData.length > 0) {
                    setCompleteForm(prev => ({ ...prev, targetWarehouseId: whData[0].id }));
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCompleting(true);

        try {
            const payload = {
                actualProducedQty: parseInt(completeForm.actualProducedQty),
                targetWarehouseId: completeForm.targetWarehouseId,
                targetShelfId: 'Default', // Hardcoded for now until Shelf Management
                overheadCost: parseFloat(completeForm.overheadCost)
            };

            const res = await fetch(`/api/production/${id}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.message || 'Gagal menyelesaikan produksi');
            }

            toast.success('Produksi diselesaikan!');
            fetchData(); // Reload

        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsCompleting(false);
        }
    };

    if (isLoading) return <div className="p-8">Memuat detail...</div>;
    if (!batch) return <div className="p-8">Batch tidak ditemukan</div>;

    const isCompleted = batch.status === 'COMPLETED';

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.push('/production')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        Batch {batch.batchCode}
                        {batch.status === 'COMPLETED' && <Badge className="bg-green-500">Selesai</Badge>}
                        {batch.status === 'IN_PROGRESS' && <Badge className="bg-blue-500">Dalam Proses</Badge>}
                    </h1>
                    <p className="text-muted-foreground">{batch.product?.name}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Detail Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ringkasan Produksi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Rencana Qty</Label>
                                    <div className="text-lg font-semibold">{batch.plannedQty} {batch.product?.unit}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Hasil Qty</Label>
                                    <div className="text-lg font-semibold">{batch.producedQty ?? '-'} {batch.product?.unit}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Mulai</Label>
                                    <div>{batch.startedAt ? format(new Date(batch.startedAt), 'dd MMM yyyy, HH:mm') : '-'}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Selesai</Label>
                                    <div>{batch.completedAt ? format(new Date(batch.completedAt), 'dd MMM yyyy, HH:mm') : '-'}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cost Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Rincian Biaya</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span>Total Biaya Material</span>
                                <span>Rp {batch.totalMaterialCost?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Biaya Overhead</span>
                                <span>Rp {batch.overheadCost?.toLocaleString() ?? 0}</span>
                            </div>
                            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                                <span>Total Biaya Produksi</span>
                                <span>Rp {batch.totalCost?.toLocaleString() ?? '-'}</span>
                            </div>
                            {isCompleted && (
                                <div className="flex justify-between font-bold text-green-600 bg-green-50 p-2 rounded">
                                    <span>HPP per Unit</span>
                                    <span>Rp {batch.hppPerUnit?.toLocaleString()}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Completion Form */}
                <div>
                    {!isCompleted ? (
                        <Card className="border-blue-200 bg-blue-50/20">
                            <CardHeader>
                                <CardTitle>Selesaikan Produksi</CardTitle>
                                <CardDescription>Input hasil akhir untuk menutup batch ini.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleComplete} className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label>Jumlah Produk Jadi (Actual Qty)</Label>
                                        <Input
                                            type="number"
                                            value={completeForm.actualProducedQty}
                                            onChange={(e) => setCompleteForm(prev => ({ ...prev, actualProducedQty: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Gudang Tujuan (Stok Masuk)</Label>
                                        <Combobox
                                            options={warehouses.map(w => ({ value: w.id, label: w.name }))}
                                            value={completeForm.targetWarehouseId}
                                            onValueChange={(val) => setCompleteForm(prev => ({ ...prev, targetWarehouseId: val }))}
                                            placeholder="Pilih Gudang"
                                            searchPlaceholder="Cari gudang..."
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Biaya Overhead (Tenaga Kerja, Listrik, dll)</Label>
                                        <Input
                                            type="number"
                                            value={completeForm.overheadCost}
                                            onChange={(e) => setCompleteForm(prev => ({ ...prev, overheadCost: e.target.value }))}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isCompleting}>
                                        {isCompleting ? 'Menyimpan...' : <><CheckCircle className="mr-2 h-4 w-4" /> Selesaikan & Masuk Stok</>}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="bg-green-50/50 border-green-100">
                            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                                <h3 className="text-xl font-semibold text-green-700">Produksi Selesai</h3>
                                <p className="text-green-600">Produk telah masuk ke stok gudang.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Material Usage Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Penggunaan Material</CardTitle>
                    <CardDescription>Detail material yang dikonsumsi (FIFO).</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Material</TableHead>
                                <TableHead>Batch Asal</TableHead>
                                <TableHead>Qty Dipakai</TableHead>
                                <TableHead>Biaya Satuan</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {batch.materialUsages?.map((usage: any) => (
                                <TableRow key={usage.id}>
                                    <TableCell>{usage.materialStockBatch?.material?.name} ({usage.materialStockBatch?.material?.code})</TableCell>
                                    <TableCell className="font-mono text-xs">{usage.materialStockBatch?.batchCode}</TableCell>
                                    <TableCell>{usage.qtyUsed} {usage.materialStockBatch?.material?.unit}</TableCell>
                                    <TableCell>Rp {usage.costAtUsage?.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">Rp {(usage.qtyUsed * usage.costAtUsage).toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

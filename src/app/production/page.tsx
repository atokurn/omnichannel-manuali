'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Package, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface ProductionBatch {
    id: string;
    batchCode: string;
    productName: string;
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    plannedQty: number;
    producedQty: number | null;
    createdAt: string;
}

export default function ProductionPage() {
    const router = useRouter();
    const [batches, setBatches] = useState<ProductionBatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchBatches();
    }, []);

    const fetchBatches = async () => {
        try {
            const res = await fetch('/api/production?limit=20');
            if (res.ok) {
                const data = await res.json();
                setBatches(data);
            }
        } catch (error) {
            console.error('Failed to fetch batches', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <Badge className="bg-green-500">Selesai</Badge>;
            case 'IN_PROGRESS':
                return <Badge className="bg-blue-500">Dalam Proses</Badge>;
            case 'CANCELLED':
                return <Badge variant="destructive">Dibatalkan</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Produksi</h1>
                    <p className="text-muted-foreground">
                        Kelola proses produksi dan batch manufaktur.
                    </p>
                </div>
                <Button onClick={() => router.push('/production/add')}>
                    <Plus className="mr-2 h-4 w-4" /> Mulai Produksi
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daftar Produksi</CardTitle>
                    <CardDescription>
                        Riwayat batch produksi yang sedang berjalan dan selesai.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Batch Code</TableHead>
                                <TableHead>Produk</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Qty Rencana</TableHead>
                                <TableHead>Qty Hasil</TableHead>
                                <TableHead>Tanggal Mulai</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        Memuat data...
                                    </TableCell>
                                </TableRow>
                            ) : batches.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        Belum ada data produksi.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                batches.map((batch) => (
                                    <TableRow key={batch.id}>
                                        <TableCell className="font-medium">{batch.batchCode}</TableCell>
                                        <TableCell>{batch.productName}</TableCell>
                                        <TableCell>{getStatusBadge(batch.status)}</TableCell>
                                        <TableCell>{batch.plannedQty}</TableCell>
                                        <TableCell>{batch.producedQty ?? '-'}</TableCell>
                                        <TableCell>{format(new Date(batch.createdAt), 'dd MMM yyyy, HH:mm')}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => router.push(`/production/${batch.id}`)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getProductionBatches } from '@/lib/services/production-service';
import { ProductionTable } from './production-table';
import { ProductionTableSkeleton } from './production-table-skeleton';

// Server Component - Fetches data on server
async function ProductionContent() {
    const batches = await getProductionBatches(20);
    return <ProductionTable batches={batches} />;
}

// Main Page - Server Component with Suspense
export default function ProductionPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Produksi</h1>
                    <p className="text-muted-foreground">
                        Kelola proses produksi dan batch manufaktur.
                    </p>
                </div>
                <Button asChild>
                    <Link href="/production/add">
                        <Plus className="mr-2 h-4 w-4" /> Mulai Produksi
                    </Link>
                </Button>
            </div>

            <Suspense fallback={<ProductionTableSkeleton />}>
                <ProductionContent />
            </Suspense>
        </div>
    );
}

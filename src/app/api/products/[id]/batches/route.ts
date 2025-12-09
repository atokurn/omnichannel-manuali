import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { productStockBatches } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const tenantId = request.headers.get('X-Tenant-Id');
        if (!tenantId) return NextResponse.json({ message: 'Tenant ID required' }, { status: 400 });

        const { id } = params;

        const batches = await db.query.productStockBatches.findMany({
            where: eq(productStockBatches.productId, id),
            orderBy: [desc(productStockBatches.receivedAt)],
            with: {
                warehouse: {
                    columns: { name: true }
                }
            }
        });

        const formatted = batches.map(b => ({
            id: b.id,
            batchCode: b.batchCode,
            qtyTotal: b.qtyTotal,
            qtyRemaining: b.qtyRemaining,
            costPerUnit: b.costPerUnit,
            source: b.source,
            receivedAt: b.receivedAt.toISOString(),
            warehouseName: b.warehouse.name
        }));

        return NextResponse.json(formatted);

    } catch (error) {
        console.error('Failed to fetch product batches:', error);
        return NextResponse.json({ message: 'Failed to fetch batches' }, { status: 500 });
    }
}

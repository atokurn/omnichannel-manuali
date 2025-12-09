import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { materialStockBatches } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const tenantId = request.headers.get('X-Tenant-Id');
        if (!tenantId) return NextResponse.json({ message: 'Tenant ID required' }, { status: 400 });

        const { id } = params;

        const batches = await db.query.materialStockBatches.findMany({
            where: eq(materialStockBatches.materialId, id),
            orderBy: [desc(materialStockBatches.receivedAt)],
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
            receivedAt: b.receivedAt.toISOString(),
            expirationDate: b.expirationDate ? b.expirationDate.toISOString() : null,
            warehouseName: b.warehouse.name
        }));

        return NextResponse.json(formatted);

    } catch (error) {
        console.error('Failed to fetch material batches:', error);
        return NextResponse.json({ message: 'Failed to fetch batches' }, { status: 500 });
    }
}

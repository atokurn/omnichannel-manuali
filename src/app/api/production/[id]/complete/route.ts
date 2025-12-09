import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { ProductionService } from '@/lib/services/production-service';

const CompleteProductionSchema = z.object({
    actualProducedQty: z.number().int().nonnegative(),
    targetWarehouseId: z.string().min(1),
    targetShelfId: z.string().min(1), // Should be optional if shelves not used, but enforcing for now
    overheadCost: z.number().nonnegative().optional().default(0),
});

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const tenantId = request.headers.get('X-Tenant-Id');
        if (!tenantId) return NextResponse.json({ message: 'Tenant ID required' }, { status: 400 });

        const { id } = params;
        const body = await request.json();
        const validation = CompleteProductionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { actualProducedQty, targetWarehouseId, targetShelfId, overheadCost } = validation.data;

        const updatedBatch = await ProductionService.completeProduction(
            tenantId,
            id,
            actualProducedQty,
            targetWarehouseId,
            targetShelfId,
            overheadCost
        );

        return NextResponse.json(updatedBatch, { status: 200 });

    } catch (error: any) {
        console.error('Failed to complete production:', error);
        return NextResponse.json({ message: error.message || 'Failed to complete production' }, { status: 500 });
    }
}

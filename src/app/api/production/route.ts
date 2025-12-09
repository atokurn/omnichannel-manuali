import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { productionBatches } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { ProductionService } from '@/lib/services/production-service';
import redisClient, { ensureRedisConnection } from '@/lib/redis';

// Validation Schema
const StartProductionSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    warehouseId: z.string().min(1, 'Warehouse ID is required'),
    plannedQty: z.number().int().positive('Quantity must be positive integer'),
});

export async function POST(request: NextRequest) {
    try {
        const tenantId = request.headers.get('X-Tenant-Id');
        if (!tenantId) return NextResponse.json({ message: 'Tenant ID required' }, { status: 400 });

        const body = await request.json();
        const validation = StartProductionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { productId, warehouseId, plannedQty } = validation.data;

        // Call Service
        const newBatch = await ProductionService.startProduction(
            tenantId,
            warehouseId,
            productId,
            plannedQty
        );

        return NextResponse.json(newBatch, { status: 201 });

    } catch (error: any) {
        console.error('Failed to start production:', error);
        return NextResponse.json({ message: error.message || 'Failed to start production' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const tenantId = request.headers.get('X-Tenant-Id');
        if (!tenantId) return NextResponse.json({ message: 'Tenant ID required' }, { status: 400 });

        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '50');

        const batches = await db.query.productionBatches.findMany({
            where: eq(productionBatches.tenantId, tenantId),
            orderBy: [desc(productionBatches.createdAt)],
            limit: limit,
            with: {
                product: {
                    columns: { name: true }
                }
            }
        });

        // Format
        const formatted = batches.map(b => ({
            id: b.id,
            batchCode: b.batchCode,
            productName: b.product.name,
            status: b.status,
            plannedQty: b.plannedQty,
            producedQty: b.producedQty,
            createdAt: b.createdAt.toISOString()
        }));

        return NextResponse.json(formatted);

    } catch (error) {
        console.error('Failed to fetch production batches:', error);
        return NextResponse.json({ message: 'Failed to fetch batches' }, { status: 500 });
    }
}

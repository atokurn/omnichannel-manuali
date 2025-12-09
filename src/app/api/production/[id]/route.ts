import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { productionBatches, productionMaterialUsages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const tenantId = request.headers.get('X-Tenant-Id');
        if (!tenantId) return NextResponse.json({ message: 'Tenant ID required' }, { status: 400 });

        const { id } = params;

        const batch = await db.query.productionBatches.findFirst({
            where: eq(productionBatches.id, id),
            with: {
                product: {
                    columns: { name: true, unit: true }
                },
                materialUsages: {
                    with: {
                        materialStockBatch: {
                            with: {
                                material: {
                                    columns: { name: true, unit: true, code: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!batch) {
            return NextResponse.json({ message: 'Batch not found' }, { status: 404 });
        }

        // Verify tenant
        if (batch.tenantId !== tenantId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        return NextResponse.json(batch, { status: 200 });

    } catch (error) {
        console.error('Failed to fetch production batch detail:', error);
        return NextResponse.json({ message: 'Failed to fetch batch detail' }, { status: 500 });
    }
}

import { materialStockBatches } from '@/lib/db/schema';
import { eq, and, gt, asc } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { NodePgQueryResultHKT } from 'drizzle-orm/node-postgres';

// Define transaction type for reusability
type Transaction = PgTransaction<NodePgQueryResultHKT, typeof import('@/lib/db/schema'), any>;

export interface MaterialUsageResult {
    materialBatchId: string;
    qtyUsed: number;
    costAtUsage: number;
}

export class MaterialService {
    /**
     * Consumes material from stock batches using FIFO method.
     * MUST be run within a transaction to ensure integrity.
     */
    static async consumeFIFO(
        tx: Transaction,
        tenantId: string,
        warehouseId: string,
        materialId: string,
        quantityNeeded: number
    ): Promise<MaterialUsageResult[]> {
        if (quantityNeeded <= 0) return [];

        // 1. Fetch available batches ordered by receivedAt ASC (First In)
        const batches = await tx.query.materialStockBatches.findMany({
            where: and(
                eq(materialStockBatches.materialId, materialId),
                eq(materialStockBatches.warehouseId, warehouseId),
                gt(materialStockBatches.qtyRemaining, 0)
            ),
            orderBy: [asc(materialStockBatches.receivedAt)]
        });

        let remainingToConsume = quantityNeeded;
        const usageResults: MaterialUsageResult[] = [];

        for (const batch of batches) {
            if (remainingToConsume <= 0) break;

            const available = batch.qtyRemaining;
            const toTake = Math.min(remainingToConsume, available);

            // 2. Update batch quantity
            await tx.update(materialStockBatches)
                .set({
                    qtyRemaining: available - toTake,
                    updatedAt: new Date()
                })
                .where(eq(materialStockBatches.id, batch.id));

            // 3. Record usage
            usageResults.push({
                materialBatchId: batch.id,
                qtyUsed: toTake,
                costAtUsage: batch.costPerUnit
            });

            remainingToConsume -= toTake;
        }

        // 4. Check if demand was met
        if (remainingToConsume > 0.0001) { // Floating point tolerance
            throw new Error(`Insufficient stock for material ${materialId} in warehouse ${warehouseId}. Missing: ${remainingToConsume}`);
        }

        return usageResults;
    }
}

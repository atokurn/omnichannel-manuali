
import { db } from '@/lib/db';
import {
    productStockBatches,
    products,
    inventories,
    productStockBatchSourceEnum
} from '@/lib/db/schema';
import { eq, and, gt, asc } from 'drizzle-orm';
import { ExtractTablesWithRelations } from 'drizzle-orm';

// Helper type for usage result
export interface ProductUsageResult {
    productBatchId: string;
    qtyTaken: number;
    costPerUnit: number;
}

export class ProductService {
    /**
     * Consumes product stock based on FIFO.
     * Needs to be running inside a transaction usually.
     */
    static async consumeFIFO(
        tx: any, // Drizzle transaction
        tenantId: string,
        warehouseId: string,
        productId: string,
        quantityNeeded: number
    ): Promise<ProductUsageResult[]> {

        // 1. Fetch available batches with qty > 0, ordered by receivedAt ASC (FIFO)
        const batches = await tx.query.productStockBatches.findMany({
            where: and(
                eq(productStockBatches.productId, productId),
                eq(productStockBatches.warehouseId, warehouseId),
                gt(productStockBatches.qtyRemaining, 0)
            ),
            orderBy: [asc(productStockBatches.receivedAt)]
        });

        let remainingToConsume = quantityNeeded;
        const usageResults: ProductUsageResult[] = [];

        for (const batch of batches) {
            if (remainingToConsume <= 0) break;

            const available = batch.qtyRemaining;
            const toTake = Math.min(available, remainingToConsume);

            // Update batch
            await tx.update(productStockBatches)
                .set({
                    qtyRemaining: available - toTake,
                    // updatedAt: new Date() // specific column if exists, generic logic
                })
                .where(eq(productStockBatches.id, batch.id));

            usageResults.push({
                productBatchId: batch.id,
                qtyTaken: toTake,
                costPerUnit: batch.costPerUnit
            });

            remainingToConsume -= toTake;
        }

        if (remainingToConsume > 0.0001) {
            // Option: allow negative stock? Or throw error.
            // For strict ERP, throw error.
            throw new Error(`Insufficient product stock for Product ID ${productId} in warehouse ${warehouseId}.Missing: ${remainingToConsume} `);
        }

        // Update aggregate inventory
        // Find existing inventory record
        const inventory = await tx.query.inventories.findFirst({
            where: and(
                eq(inventories.productId, productId),
                eq(inventories.warehouseId, warehouseId)
            )
        });

        if (inventory) {
            await tx.update(inventories)
                .set({
                    quantity: inventory.quantity - quantityNeeded,
                    lastUpdated: new Date()
                })
                .where(eq(inventories.id, inventory.id));
        } else {
            // Should verify if this case is possible? If we have batches, we should have inventory record.
            // If not, maybe create it with negative? Or just log warning.
            // For now assume consistency.
        }

        return usageResults;
    }
}

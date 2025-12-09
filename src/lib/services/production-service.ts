import { db } from '@/lib/db';
import {
    productCompositions,
    compositionMaterials,
    productionBatches,
    productionMaterialUsages,
    productStockBatches,
    materials,
    products,
    inventories,
    productionStatusEnum,
    productStockBatchSourceEnum
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { MaterialService } from './material-service';
import { nanoid } from 'nanoid';

export class ProductionService {
    /**
     * Starts a production run:
     * 1. Fetches BOM.
     * 2. Consumes materials (FIFO).
     * 3. Creates ProductionBatch (IN_PROGRESS).
     * 4. detailed material usage records.
     */
    static async startProduction(
        tenantId: string,
        warehouseId: string,
        productId: string,
        plannedQty: number
    ) {
        return await db.transaction(async (tx) => {
            // 1. Fetch BOM (Product Composition)
            // Look for non-template composition for this product
            // If multiple, pick latest? Or assumes 1 active composition per product.
            const composition = await tx.query.productCompositions.findFirst({
                where: and(
                    eq(productCompositions.productId, productId),
                    eq(productCompositions.tenantId, tenantId),
                    eq(productCompositions.isTemplate, false)
                ),
                with: {
                    materials: true
                }
            });

            if (!composition || composition.materials.length === 0) {
                throw new Error('Composition (BOM) not found for this product.');
            }

            const batchCode = `PRD-${Date.now()}`;
            let totalMaterialCost = 0;
            const materialUsagesToInsert = [];

            // 2. Consume Materials
            for (const item of composition.materials) {
                const qtyNeeded = item.quantity * plannedQty;

                // Consume FIFO
                const usageResults = await MaterialService.consumeFIFO(
                    tx,
                    tenantId,
                    warehouseId,
                    item.materialId,
                    qtyNeeded
                );

                for (const usage of usageResults) {
                    const cost = usage.qtyUsed * usage.costAtUsage;
                    totalMaterialCost += cost;

                    materialUsagesToInsert.push({
                        materialBatchId: usage.materialBatchId,
                        qtyUsed: usage.qtyUsed,
                        costAtUsage: usage.costAtUsage
                    });
                }
            }

            // 3. Create Production Batch
            const [newBatch] = await tx.insert(productionBatches).values({
                id: crypto.randomUUID(),
                tenantId,
                batchCode,
                productId,
                plannedQty,
                producedQty: 0, // Not finished yet
                status: 'IN_PROGRESS',
                startedAt: new Date(),
                totalMaterialCost: totalMaterialCost,
                overheadCost: 0, // Can be updated later
                totalCost: totalMaterialCost, // Initial cost is just materials
                hppPerUnit: 0,
            }).returning();

            // 4. Insert Usage Records
            if (materialUsagesToInsert.length > 0) {
                await tx.insert(productionMaterialUsages).values(
                    materialUsagesToInsert.map(u => ({
                        id: crypto.randomUUID(),
                        productionBatchId: newBatch.id,
                        materialBatchId: u.materialBatchId,
                        qtyUsed: u.qtyUsed,
                        costAtUsage: u.costAtUsage
                    }))
                );
            }

            return newBatch;
        });
    }

    /**
     * Completes a production run:
     * 1. Updates ProductionBatch status to COMPLETED.
     * 2. Sets producedQty (actual output).
     * 3. Calculates final HPP.
     * 4. Creates ProductStockBatch (Finished Goods).
     * 5. Updates aggregate inventory.
     */
    static async completeProduction(
        tenantId: string,
        productionBatchId: string,
        actualProducedQty: number,
        targetWarehouseId: string,
        targetShelfId: string,
        overheadCost: number = 0
    ) {
        return await db.transaction(async (tx) => {
            const batch = await tx.query.productionBatches.findFirst({
                where: and(
                    eq(productionBatches.id, productionBatchId),
                    eq(productionBatches.tenantId, tenantId)
                )
            });

            if (!batch) throw new Error('Production Batch not found');
            if (batch.status === 'COMPLETED') throw new Error('Batch already completed');

            // Calculate costs
            const totalCost = (batch.totalMaterialCost || 0) + overheadCost;
            const hppPerUnit = actualProducedQty > 0 ? totalCost / actualProducedQty : 0;

            // 1. Update Batch
            const [updatedBatch] = await tx.update(productionBatches)
                .set({
                    status: 'COMPLETED',
                    producedQty: actualProducedQty,
                    completedAt: new Date(),
                    overheadCost,
                    totalCost,
                    hppPerUnit,
                    updatedAt: new Date()
                })
                .where(eq(productionBatches.id, productionBatchId))
                .returning();

            // 2. Create Product Stock Batch (Finished Goods)
            const productBatchCode = batch.batchCode;

            await tx.insert(productStockBatches).values({
                id: crypto.randomUUID(),
                productId: batch.productId,
                warehouseId: targetWarehouseId,
                batchCode: productBatchCode,
                source: 'PRODUCTION',
                referenceId: batch.id,
                qtyTotal: actualProducedQty,
                qtyRemaining: actualProducedQty,
                costPerUnit: hppPerUnit,
                receivedAt: new Date(),
            });

            // 3. Update Aggregate Inventory
            // Check if inventory record exists for this product+warehouse+shelf
            const existingInventory = await tx.query.inventories.findFirst({
                where: and(
                    eq(inventories.productId, batch.productId),
                    eq(inventories.warehouseId, targetWarehouseId),
                    eq(inventories.shelfId, targetShelfId)
                )
            });

            if (existingInventory) {
                await tx.update(inventories)
                    .set({
                        quantity: existingInventory.quantity + actualProducedQty,
                        lastUpdated: new Date()
                    })
                    .where(eq(inventories.id, existingInventory.id));
            } else {
                await tx.insert(inventories).values({
                    id: crypto.randomUUID(),
                    productId: batch.productId,
                    warehouseId: targetWarehouseId,
                    shelfId: targetShelfId,
                    quantity: actualProducedQty,
                });
            }

            return updatedBatch;
        });
    }
}

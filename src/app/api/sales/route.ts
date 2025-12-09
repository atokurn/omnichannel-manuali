
import { NextResponse, NextRequest } from 'next/server';
import { db } from '@/lib/db';
import {
    transactions,
    transactionItems,
    transactionItemBatchUsages,
    transactionTypeEnum
} from '@/lib/db/schema';
import { ProductService } from '@/lib/services/product-service';
import { z } from 'zod';

const SaleItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number().nonnegative(), // Selling Price
});

const SaleSchema = z.object({
    orderId: z.string().min(1),
    date: z.string().datetime().optional(), // ISO String
    warehouseId: z.string().min(1),
    items: z.array(SaleItemSchema).min(1),
    // Optional financial fields
    notes: z.string().optional()
});

export async function POST(request: NextRequest) {
    const tenantId = request.headers.get('X-Tenant-Id');
    if (!tenantId) return NextResponse.json({ message: 'Tenant ID required' }, { status: 400 });

    try {
        const body = await request.json();
        const validation = SaleSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { orderId, date, warehouseId, items, notes } = validation.data;
        // createdById should be fetched from session/headers. 
        // For now hardcoding or assuming user context is passed?
        // Using a placeholder or requesting X-User-Id header if pattern dictates.
        const userId = request.headers.get('X-User-Id');
        if (!userId) return NextResponse.json({ message: "User ID required" }, { status: 400 });


        const result = await db.transaction(async (tx) => {
            // 1. Create Transaction
            const [newTransaction] = await tx.insert(transactions).values({
                id: crypto.randomUUID(),
                tenantId,
                type: 'SALE',
                status: 'COMPLETED',
                date: date ? new Date(date) : new Date(),
                warehouseId,
                createdById: userId,
                notes: notes || `Order ${orderId}`
            }).returning();

            // 2. Process Items
            for (const item of items) {
                // Consume Stock FIFO
                const usageResults = await ProductService.consumeFIFO(
                    tx,
                    tenantId,
                    warehouseId,
                    item.productId,
                    item.quantity
                );

                // Calculate COGS for this line item
                const totalCogs = usageResults.reduce((sum, u) => sum + (u.qtyTaken * u.costPerUnit), 0);

                // Create Transaction Item
                const [newItem] = await tx.insert(transactionItems).values({
                    id: crypto.randomUUID(),
                    transactionId: newTransaction.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    cogs: totalCogs
                }).returning();

                // Create Batch Usage Records
                if (usageResults.length > 0) {
                    await tx.insert(transactionItemBatchUsages).values(
                        usageResults.map(u => ({
                            id: crypto.randomUUID(),
                            transactionItemId: newItem.id,
                            productStockBatchId: u.productBatchId,
                            qtyUsed: u.qtyTaken,
                            costAtUsage: u.costPerUnit
                        }))
                    );
                }
            }
            return newTransaction;
        });

        return NextResponse.json({ message: 'Sale recorded successfully', transaction: result }, { status: 201 });

    } catch (error: any) {
        console.error('Failed to process sale:', error);
        return NextResponse.json({ message: error.message || 'Failed to process sale' }, { status: 500 });
    }
}

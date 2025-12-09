import { db } from '@/lib/db';
import {
    products,
    warehouses,
    productStockBatches,
    tenants,
    users
} from '@/lib/db/schema';
import { ProductService } from '@/lib/services/product-service';
import { eq } from 'drizzle-orm';

async function main() {
    console.log("Starting FIFO Verification...");

    const tenantId = "test-tenant-fifo";
    const userId = "test-user-fifo";
    const warehouseId = "test-wh-fifo";
    const productId = "test-prod-fifo";
    const batchA = "BATCH-A"; // Oldest
    const batchB = "BATCH-B"; // Newest

    try {
        // Clean up previous run
        await cleanup(tenantId);

        // Setup
        await db.insert(tenants).values({
            id: tenantId,
            name: "Test Tenant",
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await db.insert(users).values({
            id: userId,
            tenantId,
            name: "Test User",
            email: "test@fifo.com",
            password: "hash",
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await db.insert(warehouses).values({
            id: warehouseId,
            tenantId,
            name: "Test WH",
            location: "Test Loc",
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await db.insert(products).values({
            id: productId,
            tenantId,
            name: "Test Product",
            price: 10000,
            stock: 0,
            createdById: userId,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        // Insert Batches
        // Batch A: 10 units @ 1000, Received Yesterday
        await db.insert(productStockBatches).values({
            id: "batch-a-id",
            productId,
            warehouseId,
            batchCode: batchA,
            source: 'PURCHASE',
            qtyTotal: 10,
            qtyRemaining: 10,
            costPerUnit: 1000,
            receivedAt: new Date(Date.now() - 86400000) // Yesterday
        });

        // Batch B: 10 units @ 1200, Received Today
        await db.insert(productStockBatches).values({
            id: "batch-b-id",
            productId,
            warehouseId,
            batchCode: batchB, // Newest
            source: 'PURCHASE',
            qtyTotal: 10,
            qtyRemaining: 10,
            costPerUnit: 1200,
            receivedAt: new Date() // Today
        });

        console.log("Setup complete. Batches created.");

        // TEST 1: Consume 5 units (Should come from Batch A)
        console.log("TEST 1: Consuming 5 units...");
        await db.transaction(async (tx) => {
            const results = await ProductService.consumeFIFO(tx, tenantId, warehouseId, productId, 5);
            console.log("Results 1:", results);

            if (results.length !== 1) throw new Error("Expected 1 batch used");
            if (results[0].productBatchId !== "batch-a-id") throw new Error("Expected Batch A to be used");
            if (results[0].qtyTaken !== 5) throw new Error("Expected 5 units taken");
        });

        // Verify state
        let bA = await db.query.productStockBatches.findFirst({ where: eq(productStockBatches.id, "batch-a-id") });
        if (bA?.qtyRemaining !== 5) throw new Error(`Batch A should have 5 remaining, got ${bA?.qtyRemaining}`);

        // TEST 2: Consume 10 units (Should take 5 from A, 5 from B)
        console.log("TEST 2: Consuming 10 units...");
        await db.transaction(async (tx) => {
            const results = await ProductService.consumeFIFO(tx, tenantId, warehouseId, productId, 10);
            console.log("Results 2:", results);

            if (results.length !== 2) throw new Error("Expected 2 batches used");
            // Should be ordered
            if (results[0].productBatchId !== "batch-a-id" || results[0].qtyTaken !== 5) throw new Error("Expected remaining 5 from A");
            if (results[1].productBatchId !== "batch-b-id" || results[1].qtyTaken !== 5) throw new Error("Expected 5 from B");
        });

        // Verify state
        bA = await db.query.productStockBatches.findFirst({ where: eq(productStockBatches.id, "batch-a-id") });
        let bB = await db.query.productStockBatches.findFirst({ where: eq(productStockBatches.id, "batch-b-id") });

        if (bA?.qtyRemaining !== 0) throw new Error("Batch A should be empty");
        if (bB?.qtyRemaining !== 5) throw new Error("Batch B should have 5 remaining");

        console.log("SUCCESS: FIFO Logic Verified!");

    } catch (e) {
        console.error("FAILED:", e);
    } finally {
        await cleanup(tenantId);
        process.exit(0);
    }
}

async function cleanup(tenantId: string) {
    // Delete tenant cascades to most things? Schema says tenantId references tenant.
    // Ideally we assume cascade delete or we delete manually.
    // For safety, let's delete manually from bottom up for this tenant.
    await db.delete(productStockBatches).where(eq(productStockBatches.id, 'batch-a-id'));
    await db.delete(productStockBatches).where(eq(productStockBatches.id, 'batch-b-id'));
    // ... delete other stuff if needed ...
    await db.delete(products).where(eq(products.id, 'test-prod-fifo'));
    await db.delete(warehouses).where(eq(warehouses.id, 'test-wh-fifo'));
    await db.delete(users).where(eq(users.id, 'test-user-fifo'));
    await db.delete(tenants).where(eq(tenants.id, 'test-tenant-fifo'));
}

main();

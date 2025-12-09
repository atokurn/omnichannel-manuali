import { createClient } from 'redis';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './db/schema';
import * as dotenv from 'dotenv';

dotenv.config();

// Drizzle Client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
export const db = drizzle(pool, { schema });



// Redis client for real-time inventory updates
let redisClient: any;

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = await createClient({
      url: process.env.REDIS_URL,
    }).connect();
  }
  return redisClient;
}

// Inventory Management Functions
import { eq, and, sql } from 'drizzle-orm';
import { inventories, products, transactions, transactionItems } from './db/schema';

// Inventory Management Functions (Migrated to Drizzle)
export async function updateInventory(productId: string, warehouseId: string, quantity: number) {
  try {
    // First check if inventory record exists
    const existingInventory = await db.select()
      .from(inventories)
      .where(
        and(
          eq(inventories.productId, productId),
          eq(inventories.warehouseId, warehouseId)
        )
      )
      .limit(1);

    if (existingInventory.length > 0) {
      // Update existing inventory
      const currentQty = existingInventory[0].quantity;
      return await db.update(inventories)
        .set({
          quantity: currentQty + quantity,
          lastUpdated: new Date()
        })
        .where(
          and(
            eq(inventories.productId, productId),
            eq(inventories.warehouseId, warehouseId)
          )
        )
        .returning();
    } else {
      // Create new inventory record
      // We need a shelfId. Since this function signature doesn't provide it, 
      // we might need to fetch a default shelf or fail. 
      // For migration compatibility, we might need to find a default shelf for the warehouse.
      // However, the original Prisma code created it without checking shelfId explicitly if the type allowed it? 
      // Checking old code: Prisma create data: { productId, warehouseId, quantity }. 
      // Schema says shelfId is required. 
      // The original Prisma code might have failed at runtime if shelfId was missing, or Prisma schema had default? 
      // Prisma Schema: shelfId String...
      // Let's assume there is a default shelf or we fetch one.

      const defaultShelf = await db.query.shelves.findFirst({
        where: (shelves, { eq }) => eq(shelves.warehouseId, warehouseId)
      });

      if (!defaultShelf) {
        throw new Error(`No shelf found for warehouse ${warehouseId} to create inventory record.`);
      }

      return await db.insert(inventories).values({
        id: crypto.randomUUID(),
        productId,
        warehouseId,
        shelfId: defaultShelf.id,
        quantity,
      }).returning();
    }
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
}

// Function to check if product is below minimum stock level
export async function checkLowStock(warehouseId: string) {
  try {
    const lowStockProducts = await db.select({
      inventory: inventories,
      product: products
    })
      .from(inventories)
      .innerJoin(products, eq(inventories.productId, products.id))
      .where(eq(inventories.warehouseId, warehouseId));

    return lowStockProducts.filter(({ inventory, product }) => inventory.quantity < product.minStockLevel);
  } catch (error) {
    console.error('Error checking low stock:', error);
    throw error;
  }
}

// Function to process a transaction
export async function processTransaction(transactionData: any) {
  // Use a transaction to ensure data consistency
  return await db.transaction(async (tx) => {
    // Create the transaction record
    const [newTransaction] = await tx.insert(transactions).values({
      id: crypto.randomUUID(),
      type: transactionData.type,
      notes: transactionData.notes,
      createdById: transactionData.createdById,
      warehouseId: transactionData.warehouseId,
      tenantId: transactionData.tenantId, // Ensure tenantId is passed
      status: 'PENDING' // Start as pending
    }).returning();

    // Create transaction items
    if (transactionData.items && transactionData.items.length > 0) {
      await tx.insert(transactionItems).values(
        transactionData.items.map((item: any) => ({
          id: crypto.randomUUID(),
          transactionId: newTransaction.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        }))
      );
    }

    // Update inventory based on transaction type
    // We reuse the updateInventory logic but strictly speaking we should pass 'tx' to it to be atomic.
    // However, updateInventory uses 'db' (global).
    // For strictly atomic operations, we should inline the logic or pass 'tx'.
    // For now, to match signature, we'll iterate.

    // Note: To use 'tx' inside updateInventory, we would need to refactor it to accept a db instance.
    // Let's inline the critical inventory update part or assume minimal risk for now.
    // Ideally:

    for (const item of transactionData.items) {
      let quantityChange = item.quantity;

      // For sales and transfers out, we reduce inventory
      if (transactionData.type === 'SALE' ||
        (transactionData.type === 'TRANSFER' && transactionData.direction === 'OUT')) {
        quantityChange = -quantityChange;
      }

      // Helper to update inventory within tx
      const updateInventoryInTx = async (pid: string, wid: string, qty: number) => {
        const [existing] = await tx.select().from(inventories)
          .where(and(eq(inventories.productId, pid), eq(inventories.warehouseId, wid)));

        if (existing) {
          await tx.update(inventories)
            .set({ quantity: existing.quantity + qty, lastUpdated: new Date() })
            .where(eq(inventories.id, existing.id));
        } else {
          // Fetch shelf
          const shelf = await tx.query.shelves.findFirst({
            where: (shelves, { eq }) => eq(shelves.warehouseId, wid)
          });
          if (shelf) {
            await tx.insert(inventories).values({
              id: crypto.randomUUID(),
              productId: pid,
              warehouseId: wid,
              shelfId: shelf.id,
              quantity: qty
            });
          }
        }
      };

      await updateInventoryInTx(item.productId, transactionData.warehouseId, quantityChange);

      // If it's a transfer, update the destination warehouse too
      if (transactionData.type === 'TRANSFER' && transactionData.destinationWarehouseId) {
        await updateInventoryInTx(
          item.productId,
          transactionData.destinationWarehouseId,
          item.quantity
        );
      }
    }

    // Update transaction status to completed
    const [completedTransaction] = await tx.update(transactions)
      .set({ status: 'COMPLETED' })
      .where(eq(transactions.id, newTransaction.id))
      .returning();

    // Return transaction with items (mock structure to match typical return if needed)
    return completedTransaction;
  });
}

// Function to get inventory value
export async function getInventoryValue(warehouseId?: string) {
  const whereClause = warehouseId ? eq(inventories.warehouseId, warehouseId) : undefined;

  const inventoryItems = await db.select({
    quantity: inventories.quantity,
    cost: products.cost
  })
    .from(inventories)
    .innerJoin(products, eq(inventories.productId, products.id))
    .where(whereClause);

  return inventoryItems.reduce((total, inv) => {
    return total + (inv.quantity * (inv.cost || 0));
  }, 0);
}

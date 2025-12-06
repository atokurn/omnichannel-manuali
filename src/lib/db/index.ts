import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import { Redis } from 'redis';

// Import schema
import * as schema from './schema';

// Drizzle client instance
export const db = drizzle(sql, { schema });

// Redis client for real-time inventory updates
let redisClient: any;

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = await Redis.createClient({
      url: process.env.REDIS_URL,
    }).connect();
  }
  return redisClient;
}

// Inventory Management Functions
export async function updateInventory(productId: string, warehouseId: string, quantity: number) {
  try {
    // First check if inventory record exists using Drizzle
    const existingInventory = await db.query.inventory.findFirst({
      where: (inventory, { and, eq }) => and(
        eq(inventory.productId, productId),
        eq(inventory.warehouseId, warehouseId)
      )
    });

    if (existingInventory) {
      // Update existing inventory
      return await db
        .update(schema.inventory)
        .set({
          quantity: existingInventory.quantity + quantity,
        })
        .where(
          sql`${schema.inventory.productId} = ${productId} AND ${schema.inventory.warehouseId} = ${warehouseId}`
        )
        .returning();
    } else {
      // Create new inventory record
      return await db
        .insert(schema.inventory)
        .values({
          productId,
          warehouseId,
          quantity,
        })
        .returning();
    }
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
}

// Function to check if product is below minimum stock level
export async function checkLowStock(warehouseId: string) {
  try {
    const lowStockProducts = await db.query.inventory.findMany({
      where: (inventory, { eq }) => eq(inventory.warehouseId, warehouseId),
      with: {
        product: true,
      },
    });

    return lowStockProducts.filter(inv => inv.quantity < inv.product.minStockLevel);
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
    const transaction = await tx
      .insert(schema.transactions)
      .values({
        type: transactionData.type,
        notes: transactionData.notes,
        createdById: transactionData.createdById,
        warehouseId: transactionData.warehouseId,
      })
      .returning();

    // Create transaction items
    const transactionItems = await Promise.all(
      transactionData.items.map(async (item: any) => {
        return await tx
          .insert(schema.transactionItems)
          .values({
            transactionId: transaction[0].id,
            quantity: item.quantity,
            price: item.price,
            productId: item.productId,
          })
          .returning();
      })
    );

    // Update inventory based on transaction type
    for (const item of transactionItems.flat()) {
      let quantityChange = item.quantity;
      
      // For sales and transfers out, we reduce inventory
      if (transactionData.type === 'SALE' || 
         (transactionData.type === 'TRANSFER' && transactionData.direction === 'OUT')) {
        quantityChange = -quantityChange;
      }

      await updateInventory(item.productId!, transactionData.warehouseId, quantityChange);
      
      // If it's a transfer, update the destination warehouse too
      if (transactionData.type === 'TRANSFER' && transactionData.destinationWarehouseId) {
        await updateInventory(
          item.productId!, 
          transactionData.destinationWarehouseId, 
          item.quantity
        );
      }
    }

    // Update transaction status to completed
    return await tx
      .update(schema.transactions)
      .set({ status: 'COMPLETED' })
      .where(sql`${schema.transactions.id} = ${transaction[0].id}`)
      .returning();
  });
}

// Function to get inventory value
export async function getInventoryValue(warehouseId?: string) {
  const whereClause = warehouseId 
    ? (inventory: any, { eq }: any) => eq(inventory.warehouseId, warehouseId)
    : undefined;
  
  const inventories = await db.query.inventory.findMany({
    where: whereClause,
    with: {
      product: true,
    },
  });

  return inventories.reduce((total, inv) => {
    return total + (inv.quantity * (inv.product.cost || 0));
  }, 0);
}
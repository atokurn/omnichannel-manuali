import { PrismaClient } from '@prisma/client';
import { Redis } from 'redis';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

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
    // First check if inventory record exists
    const existingInventory = await prisma.inventory.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
    });

    if (existingInventory) {
      // Update existing inventory
      return await prisma.inventory.update({
        where: {
          productId_warehouseId: {
            productId,
            warehouseId,
          },
        },
        data: {
          quantity: existingInventory.quantity + quantity,
        },
      });
    } else {
      // Create new inventory record
      return await prisma.inventory.create({
        data: {
          productId,
          warehouseId,
          quantity,
        },
      });
    }
  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
}

// Function to check if product is below minimum stock level
export async function checkLowStock(warehouseId: string) {
  try {
    const lowStockProducts = await prisma.inventory.findMany({
      where: {
        warehouseId,
      },
      include: {
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
  return await prisma.$transaction(async (tx) => {
    // Create the transaction record
    const transaction = await tx.transaction.create({
      data: {
        type: transactionData.type,
        notes: transactionData.notes,
        createdById: transactionData.createdById,
        warehouseId: transactionData.warehouseId,
        items: {
          create: transactionData.items.map((item: any) => ({
            quantity: item.quantity,
            price: item.price,
            productId: item.productId,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Update inventory based on transaction type
    for (const item of transaction.items) {
      let quantityChange = item.quantity;
      
      // For sales and transfers out, we reduce inventory
      if (transactionData.type === 'SALE' || 
         (transactionData.type === 'TRANSFER' && transactionData.direction === 'OUT')) {
        quantityChange = -quantityChange;
      }

      await updateInventory(item.productId, transactionData.warehouseId, quantityChange);
      
      // If it's a transfer, update the destination warehouse too
      if (transactionData.type === 'TRANSFER' && transactionData.destinationWarehouseId) {
        await updateInventory(
          item.productId, 
          transactionData.destinationWarehouseId, 
          item.quantity
        );
      }
    }

    // Update transaction status to completed
    return await tx.transaction.update({
      where: { id: transaction.id },
      data: { status: 'COMPLETED' },
    });
  });
}

// Function to get inventory value
export async function getInventoryValue(warehouseId?: string) {
  const whereClause = warehouseId ? { warehouseId } : {};
  
  const inventories = await prisma.inventory.findMany({
    where: whereClause,
    include: {
      product: true,
    },
  });

  return inventories.reduce((total, inv) => {
    return total + (inv.quantity * inv.product.cost);
  }, 0);
}
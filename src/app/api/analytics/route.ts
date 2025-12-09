import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { inventories, transactions, transactionItems, products } from '@/lib/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

// Enum values based on schema definition
const TransactionType = {
  PURCHASE: 'PURCHASE',
  SALE: 'SALE',
  TRANSFER: 'TRANSFER',
  ADJUSTMENT: 'ADJUSTMENT'
} as const;

export async function GET() {
  try {
    // 1. Calculate Total Inventory Value
    // We need all inventory items and their product cost
    const inventoryItems = await db.query.inventories.findMany({
      with: {
        product: {
          columns: { cost: true }
        }
      }
    });

    const totalInventoryValue = inventoryItems.reduce((sum, item) => {
      // Use 'cost' from product as proxy for purchasePrice. 
      // If cost is null, assume 0.
      return sum + (item.quantity * (item.product?.cost ?? 0));
    }, 0);

    // 2. Find Low Stock Products
    // We need to compare inventory quantity vs product minStockLevel.
    // Inventory is per warehouse/shelf. Product minStockLevel is global (per product).
    // So we should aggregate inventory by product first?
    // Or check if ANY inventory entry is low? 
    // Usually "Low Stock" means "Total stock for product across all warehouses < minStockLevel".
    // Efficient way: Fetch all products with inventories.

    // We fetch products and their inventories.
    const allProducts = await db.query.products.findMany({
      columns: { id: true, name: true, minStockLevel: true },
      with: {
        inventories: {
          columns: { quantity: true }
        }
      }
    });

    const lowStockProducts = allProducts.filter(product => {
      const totalQuantity = product.inventories.reduce((acc, inv) => acc + inv.quantity, 0);
      return totalQuantity < product.minStockLevel;
    }).map(p => ({
      ...p,
      totalQuantity: p.inventories.reduce((acc, inv) => acc + inv.quantity, 0)
    }));

    const lowStockProductsCount = lowStockProducts.length;

    // 3. Get Recent Transactions (last 10)
    const recentTransactionsData = await db.query.transactions.findMany({
      orderBy: [desc(transactions.date)],
      limit: 10,
      with: {
        createdBy: { columns: { name: true } }
      }
    });

    // 4. Calculate Monthly Stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyTransactions = await db.query.transactions.findMany({
      where: (transactions, { and, gte, lte }) => and(
        gte(transactions.date, startOfMonth),
        lte(transactions.date, endOfMonth)
      ),
      with: {
        items: true
      }
    });

    let monthlySales = 0;
    let monthlyPurchasesCost = 0;

    monthlyTransactions.forEach(transaction => {
      // Calculate total amount for this transaction from items
      const transactionTotal = transaction.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

      if (transaction.type === TransactionType.SALE) {
        monthlySales += transactionTotal;
      } else if (transaction.type === TransactionType.PURCHASE) {
        monthlyPurchasesCost += transactionTotal;
      }
    });

    const monthlyProfit = monthlySales - monthlyPurchasesCost;

    const analyticsData = {
      totalInventoryValue,
      lowStockProductsCount,
      lowStockProducts: lowStockProducts.slice(0, 5),
      recentTransactions: recentTransactionsData,
      monthlyStats: {
        sales: monthlySales,
        purchases: monthlyPurchasesCost,
        profit: monthlyProfit,
      },
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error("[ANALYTICS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
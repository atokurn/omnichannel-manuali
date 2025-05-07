import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db'; // Reverted to named import
import { TransactionType } from '@prisma/client';

export async function GET() {
  try {
    // Calculate Total Inventory Value
    const inventoryItems = await prisma.inventoryItem.findMany({
      include: {
        product: {
          select: { purchasePrice: true },
        },
      },
    });
    const totalInventoryValue = inventoryItems.reduce((sum, item) => {
      return sum + item.quantity * (item.product.purchasePrice ?? 0);
    }, 0);

    // Find Low Stock Products
    // The incorrect block has been removed.

    // Correcting Low Stock Logic - Prisma cannot directly compare column to column in `where` like this.
    // Fetch all items and filter in application code, or use raw SQL if performance is critical.
    const allItems = await prisma.inventoryItem.findMany({
        include: {
            product: {
                select: { id: true, name: true, minStockLevel: true }
            }
        }
    });
    const filteredLowStockProducts = allItems.filter(item => item.quantity < item.product.minStockLevel); // Corrected variable name
    const lowStockProductsCount = filteredLowStockProducts.length;
    const lowStockProducts = filteredLowStockProducts; // Already includes product details

    // Get Recent Transactions (last 10)
    const recentTransactions = await prisma.transaction.findMany({
      orderBy: {
        date: 'desc',
      },
      take: 10, // Fetch more if needed by the dashboard slice
    });

    // Calculate Monthly Stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyTransactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    let monthlySales = 0;
    let monthlyPurchasesCost = 0;

    monthlyTransactions.forEach(transaction => {
      if (transaction.type === TransactionType.SALE) {
        monthlySales += transaction.totalAmount ?? 0;
      } else if (transaction.type === TransactionType.PURCHASE) {
        // Calculate cost of goods for purchases
        transaction.items.forEach(item => {
            monthlyPurchasesCost += item.quantity * (item.product.purchasePrice ?? 0);
        });
      }
      // Note: Profit calculation might need more complex logic depending on COGS method
    });
    
    // Simplified profit calculation (Sales - Purchase Costs in the period)
    // A more accurate profit calculation would involve Cost of Goods Sold (COGS)
    // based on the specific items sold during the month, which is more complex.
    const monthlyProfit = monthlySales - monthlyPurchasesCost; 

    const analyticsData = {
      totalInventoryValue,
      lowStockProductsCount,
      lowStockProducts: lowStockProducts.slice(0, 5), // Return only top 5 for dashboard preview
      recentTransactions: recentTransactions.slice(0, 5), // Return only top 5 for dashboard preview
      monthlyStats: {
        sales: monthlySales,
        purchases: monthlyPurchasesCost, // Renamed for clarity, represents cost
        profit: monthlyProfit,
      },
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error("[ANALYTICS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
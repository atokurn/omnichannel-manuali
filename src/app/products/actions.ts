'use server'

import { db } from '@/lib/db';
import { products, categories, inventories, transactions, transactionItems } from '@/lib/db/schema';
import { eq, ilike, sql, desc, count } from 'drizzle-orm';

// --- PRODUCT LISTING ---
export interface ProductData {
    id: string;
    name: string;
    sku: string | null;
    categoryName: string | null;
    price: number;
    stock: number;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock';
    mainImage: string | null;
}

export async function getProducts(
    tenantId: string,
    page: number = 1,
    pageSize: number = 10,
    search: string = ''
) {
    const offset = (page - 1) * pageSize;

    // Build where clause
    const searchFilter = search
        ? sql`(${products.name} ILIKE ${'%' + search + '%'} OR ${products.sku} ILIKE ${'%' + search + '%'})`
        : undefined;

    const whereClause = searchFilter
        ? sql`${products.tenantId} = ${tenantId} AND ${searchFilter}`
        : sql`${products.tenantId} = ${tenantId}`;

    // Main query
    const data = await db
        .select({
            id: products.id,
            name: products.name,
            sku: products.sku,
            categoryName: categories.name,
            price: products.price,
            mainImage: products.mainImage,
            minStockLevel: products.minStockLevel,
            totalStock: sql<number>`COALESCE(SUM(${inventories.quantity}), 0)`
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(inventories, eq(products.id, inventories.productId))
        .where(whereClause)
        .groupBy(products.id, products.name, products.sku, categories.name, products.price, products.mainImage, products.minStockLevel)
        .orderBy(desc(products.createdAt))
        .limit(pageSize)
        .offset(offset);

    // Count query for pagination
    const countResult = await db
        .select({ count: count() })
        .from(products)
        .where(whereClause);

    const totalItems = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalItems / pageSize);

    // Transform to ProductData
    const formattedData: ProductData[] = data.map(item => {
        const stock = Number(item.totalStock);
        let status: ProductData['status'] = 'In Stock';
        if (stock === 0) status = 'Out of Stock';
        else if (stock < item.minStockLevel) status = 'Low Stock';

        return {
            id: item.id,
            name: item.name,
            sku: item.sku,
            categoryName: item.categoryName,
            price: item.price,
            stock,
            status,
            mainImage: item.mainImage
        };
    });

    return {
        data: formattedData,
        metadata: {
            currentPage: page,
            pageSize,
            totalItems,
            totalPages
        }
    };
}

// --- DASHBOARD METRICS ---
export interface DashboardMetrics {
    totalStockValue: number;
    lowStockCount: number;
    lowStockItems: any[];
    stockForecast: any[];
    bestSellers: any[];
}

export async function getDashboardMetrics(tenantId: string): Promise<DashboardMetrics> {
    // 1. Total Stock Value
    const stockValueResult = await db
        .select({
            totalValue: sql<number>`sum(${inventories.quantity} * COALESCE(${products.cost}, 0))`
        })
        .from(inventories)
        .innerJoin(products, eq(inventories.productId, products.id))
        .where(eq(products.tenantId, tenantId));

    const totalStockValue = stockValueResult[0]?.totalValue || 0;

    // 2. Low Stock Items
    const lowStockItems = await db
        .select({
            id: products.id,
            name: products.name,
            sku: products.sku,
            minStock: products.minStockLevel,
            currentStock: sql<number>`CAST(SUM(${inventories.quantity}) AS INTEGER)`
        })
        .from(products)
        .leftJoin(inventories, eq(products.id, inventories.productId))
        .where(eq(products.tenantId, tenantId))
        .groupBy(products.id)
        .having(sql`SUM(${inventories.quantity}) < ${products.minStockLevel}`)
        .limit(10);

    // 3. Stock Forecast (Simple Linear from Sales)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesData = await db
        .select({
            date: sql<string>`DATE(${transactions.date})`,
            sales: count(transactions.id)
        })
        .from(transactions)
        .where(
            sql`${transactions.tenantId} = ${tenantId} AND ${transactions.type} = 'SALE' AND ${transactions.date} >= ${thirtyDaysAgo.toISOString()}`
        )
        .groupBy(sql`DATE(${transactions.date})`)
        .orderBy(sql`DATE(${transactions.date})`);

    const stockForecast = salesData.map(d => ({
        name: d.date,
        sales: Number(d.sales)
    }));

    // 4. Best Sellers
    const bestSellers = await db
        .select({
            productId: products.id,
            productName: products.name,
            totalSold: sql<number>`sum(${transactionItems.quantity})`
        })
        .from(transactionItems)
        .innerJoin(transactions, eq(transactionItems.transactionId, transactions.id))
        .innerJoin(products, eq(transactionItems.productId, products.id))
        .where(
            sql`${transactions.tenantId} = ${tenantId} AND ${transactions.type} = 'SALE'`
        )
        .groupBy(products.id, products.name)
        .orderBy(desc(sql`sum(${transactionItems.quantity})`))
        .limit(5);

    return {
        totalStockValue: Number(totalStockValue),
        lowStockCount: lowStockItems.length,
        lowStockItems,
        stockForecast,
        bestSellers: bestSellers.map(b => ({ ...b, totalSold: Number(b.totalSold) }))
    };
}

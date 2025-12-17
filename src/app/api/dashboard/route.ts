import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import {
    products,
    materials,
    productVariantCombinations,
    transactions,
    transactionItems
} from '@/lib/db/schema'
import { eq, and, sql, gte, desc, lte } from 'drizzle-orm'

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const tenantId = user.tenantId
        const today = new Date()
        const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

        // Get total products count
        const [productsResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(products)
            .where(eq(products.tenantId, tenantId))

        // Get low stock products
        const lowStockProducts = await db
            .select({
                id: products.id,
                name: products.name,
                sku: products.sku,
                minStockLevel: products.minStockLevel,
            })
            .from(products)
            .where(
                and(
                    eq(products.tenantId, tenantId),
                    eq(products.hasVariants, false)
                )
            )

        // Get variants with low stock
        const lowStockVariants = await db
            .select({
                id: productVariantCombinations.id,
                productId: productVariantCombinations.productId,
                sku: productVariantCombinations.sku,
                quantity: productVariantCombinations.quantity,
                options: productVariantCombinations.options,
            })
            .from(productVariantCombinations)
            .innerJoin(products, eq(productVariantCombinations.productId, products.id))
            .where(eq(products.tenantId, tenantId))

        // Get low stock materials
        const lowStockMaterials = await db
            .select({
                id: materials.id,
                name: materials.name,
                code: materials.code,
                initialStock: materials.initialStock,
                minStockLevel: materials.minStockLevel,
            })
            .from(materials)
            .where(eq(materials.tenantId, tenantId))

        // Filter materials that are below min stock
        const lowStockMaterialsFiltered = lowStockMaterials.filter(
            (m) => m.initialStock <= m.minStockLevel
        )

        // Get total materials count
        const [materialsResult] = await db
            .select({ count: sql<number>`count(*)` })
            .from(materials)
            .where(eq(materials.tenantId, tenantId))

        // Get recent transactions (last 30 days)
        const recentSales = await db
            .select({
                id: transactions.id,
                date: transactions.date,
                type: transactions.type,
                status: transactions.status,
            })
            .from(transactions)
            .where(
                and(
                    eq(transactions.tenantId, tenantId),
                    eq(transactions.type, 'SALE'),
                    eq(transactions.status, 'COMPLETED'),
                    gte(transactions.date, thirtyDaysAgo)
                )
            )

        // Get transaction items with revenue for recent sales
        const salesWithItems = await Promise.all(
            recentSales.map(async (sale) => {
                const items = await db
                    .select({
                        quantity: transactionItems.quantity,
                        price: transactionItems.price,
                    })
                    .from(transactionItems)
                    .where(eq(transactionItems.transactionId, sale.id))

                const totalRevenue = items.reduce(
                    (sum, item) => sum + item.quantity * item.price,
                    0
                )
                const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

                return {
                    ...sale,
                    totalRevenue,
                    totalItems,
                }
            })
        )

        // Calculate totals
        const totalRevenue = salesWithItems.reduce((sum, s) => sum + s.totalRevenue, 0)
        const totalSalesCount = salesWithItems.reduce((sum, s) => sum + s.totalItems, 0)

        // Get sales data grouped by date for chart
        const salesByDate = salesWithItems.reduce(
            (acc, sale) => {
                const dateStr = sale.date.toISOString().split('T')[0]
                if (!acc[dateStr]) {
                    acc[dateStr] = { sales: 0, revenue: 0 }
                }
                acc[dateStr].sales += sale.totalItems
                acc[dateStr].revenue += sale.totalRevenue
                return acc
            },
            {} as Record<string, { sales: number; revenue: number }>
        )

        // Generate chart data for last 7 days
        const chartData = []
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
            const dateStr = date.toISOString().split('T')[0]
            const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' })

            chartData.push({
                date: dayName,
                sales: salesByDate[dateStr]?.sales || 0,
                revenue: Math.round((salesByDate[dateStr]?.revenue || 0) / 1000), // in thousands
            })
        }

        // Build low stock items list
        const lowStockItems = [
            ...lowStockMaterialsFiltered.map((m) => ({
                id: m.id,
                name: m.name,
                sku: m.code,
                currentStock: m.initialStock,
                minStock: m.minStockLevel,
                type: 'material' as const,
            })),
        ]

        // Mock top products (would need actual sales aggregation)
        const topProducts = [
            {
                id: '1',
                name: 'Sample Product 1',
                sku: 'SKU-001',
                salesCount: 45,
                revenue: 2250000,
                trend: 12,
            },
            {
                id: '2',
                name: 'Sample Product 2',
                sku: 'SKU-002',
                salesCount: 38,
                revenue: 1900000,
                trend: 8,
            },
            {
                id: '3',
                name: 'Sample Product 3',
                sku: 'SKU-003',
                salesCount: 32,
                revenue: 1600000,
                trend: -5,
            },
            {
                id: '4',
                name: 'Sample Product 4',
                sku: 'SKU-004',
                salesCount: 28,
                revenue: 1400000,
                trend: 15,
            },
            {
                id: '5',
                name: 'Sample Product 5',
                sku: 'SKU-005',
                salesCount: 22,
                revenue: 1100000,
                trend: 3,
            },
        ]

        return NextResponse.json({
            kpi: {
                totalProducts: productsResult.count,
                totalMaterials: materialsResult.count,
                totalSales: totalSalesCount,
                totalRevenue: totalRevenue,
                lowStockCount: lowStockItems.length,
            },
            chartData,
            lowStockItems,
            topProducts,
        })
    } catch (error) {
        console.error('Dashboard API error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch dashboard data' },
            { status: 500 }
        )
    }
}

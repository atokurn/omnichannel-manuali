"use client"

import { useEffect, useState } from "react"
import {
    Package,
    Boxes,
    ShoppingCart,
    DollarSign,
    AlertTriangle,
    Factory,
    RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { KpiCard, KpiCardsGrid } from "@/components/dashboard/kpi-card"
import { SalesChart } from "@/components/dashboard/sales-chart"
import { LowStockWidget } from "@/components/dashboard/low-stock-widget"
import { TopProductsWidget } from "@/components/dashboard/top-products-widget"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface DashboardData {
    kpi: {
        totalProducts: number
        totalMaterials: number
        totalSales: number
        totalRevenue: number
        lowStockCount: number
    }
    chartData: Array<{
        date: string
        sales: number
        revenue: number
    }>
    lowStockItems: Array<{
        id: string
        name: string
        sku: string
        currentStock: number
        minStock: number
        type: "product" | "material"
    }>
    topProducts: Array<{
        id: string
        name: string
        sku: string
        salesCount: number
        revenue: number
        trend: number
    }>
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-[380px] rounded-lg" />
                <Skeleton className="h-[380px] rounded-lg" />
            </div>
            <Skeleton className="h-[350px] rounded-lg" />
        </div>
    )
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchDashboardData = async (showToast = false) => {
        try {
            if (showToast) setRefreshing(true)
            else setLoading(true)

            const response = await fetch("/api/dashboard")
            if (!response.ok) throw new Error("Failed to fetch dashboard data")

            const result = await response.json()
            setData(result)

            if (showToast) {
                toast.success("Dashboard refreshed")
            }
        } catch (error) {
            console.error("Dashboard error:", error)
            toast.error("Failed to load dashboard data")
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <main className="flex-1 p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Overview of your inventory and sales performance
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchDashboardData(true)}
                    disabled={refreshing}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                </Button>
            </div>

            {loading ? (
                <DashboardSkeleton />
            ) : data ? (
                <>
                    {/* KPI Cards */}
                    <KpiCardsGrid>
                        <KpiCard
                            title="Total Products"
                            value={data.kpi.totalProducts.toLocaleString()}
                            icon={Package}
                            description="Active products"
                            trend={{ value: 5.2, isPositive: true }}
                        />
                        <KpiCard
                            title="Raw Materials"
                            value={data.kpi.totalMaterials.toLocaleString()}
                            icon={Boxes}
                            description="Registered materials"
                        />
                        <KpiCard
                            title="Total Sales"
                            value={data.kpi.totalSales.toLocaleString()}
                            icon={ShoppingCart}
                            description="Last 30 days"
                            trend={{ value: 12.5, isPositive: true }}
                        />
                        <KpiCard
                            title="Revenue"
                            value={formatCurrency(data.kpi.totalRevenue)}
                            icon={DollarSign}
                            description="Last 30 days"
                            trend={{ value: 8.3, isPositive: true }}
                        />
                    </KpiCardsGrid>

                    {/* Charts Row */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        <SalesChart data={data.chartData} />
                        <TopProductsWidget products={data.topProducts} />
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="grid gap-4 lg:grid-cols-2">
                        <LowStockWidget items={data.lowStockItems} />

                        {/* Quick Actions Card */}
                        <div className="rounded-lg border bg-card p-6">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Factory className="h-4 w-4" />
                                Quick Actions
                            </h3>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Button variant="outline" className="justify-start" asChild>
                                    <a href="/products/management">
                                        <Package className="h-4 w-4 mr-2" />
                                        Add Product
                                    </a>
                                </Button>
                                <Button variant="outline" className="justify-start" asChild>
                                    <a href="/products/materials">
                                        <Boxes className="h-4 w-4 mr-2" />
                                        Add Material
                                    </a>
                                </Button>
                                <Button variant="outline" className="justify-start" asChild>
                                    <a href="/inventory/stock/stock-in">
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Stock In
                                    </a>
                                </Button>
                                <Button variant="outline" className="justify-start" asChild>
                                    <a href="/production/add">
                                        <Factory className="h-4 w-4 mr-2" />
                                        New Production
                                    </a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mb-4" />
                    <p>Failed to load dashboard data</p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => fetchDashboardData()}
                    >
                        Try Again
                    </Button>
                </div>
            )}
        </main>
    )
}

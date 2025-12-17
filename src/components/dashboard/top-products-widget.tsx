"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Package } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface TopProduct {
    id: string
    name: string
    sku: string
    salesCount: number
    revenue: number
    trend: number
}

interface TopProductsWidgetProps {
    products: TopProduct[]
    title?: string
}

export function TopProductsWidget({ products, title = "Top Selling Products" }: TopProductsWidgetProps) {
    const maxSales = Math.max(...products.map((p) => p.salesCount), 1)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    {title}
                </CardTitle>
                <Badge variant="secondary" className="font-normal">
                    Last 30 days
                </Badge>
            </CardHeader>
            <CardContent>
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[280px] text-muted-foreground">
                        <Package className="h-10 w-10 mb-2" />
                        <p className="text-sm">Belum ada data penjualan</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {products.slice(0, 5).map((product, index) => (
                            <div key={product.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                            {index + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">{product.sku}</p>
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <p className="text-sm font-semibold">{product.salesCount} sold</p>
                                        <p className="text-xs text-muted-foreground">{formatCurrency(product.revenue)}</p>
                                    </div>
                                </div>
                                <Progress
                                    value={(product.salesCount / maxSales) * 100}
                                    className="h-1.5"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

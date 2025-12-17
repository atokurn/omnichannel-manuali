"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Package } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface LowStockItem {
    id: string
    name: string
    sku: string
    currentStock: number
    minStock: number
    type: "product" | "material"
}

interface LowStockWidgetProps {
    items: LowStockItem[]
    title?: string
}

export function LowStockWidget({ items, title = "Low Stock Alerts" }: LowStockWidgetProps) {
    const criticalItems = items.filter((item) => item.currentStock <= item.minStock * 0.5)
    const warningItems = items.filter(
        (item) => item.currentStock > item.minStock * 0.5 && item.currentStock <= item.minStock
    )

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    {title}
                </CardTitle>
                <Badge variant="secondary" className="font-normal">
                    {items.length} items
                </Badge>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[280px] pr-4">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                            <Package className="h-10 w-10 mb-2" />
                            <p className="text-sm">Tidak ada item dengan stok rendah</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => {
                                const isCritical = item.currentStock <= item.minStock * 0.5
                                const percentage = Math.round((item.currentStock / item.minStock) * 100)

                                return (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                SKU: {item.sku} • {item.type === "material" ? "Material" : "Product"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className={`text-sm font-semibold ${isCritical ? "text-red-500" : "text-amber-500"}`}>
                                                    {item.currentStock} / {item.minStock}
                                                </p>
                                                <p className="text-xs text-muted-foreground">{percentage}%</p>
                                            </div>
                                            <Badge
                                                variant={isCritical ? "destructive" : "default"}
                                                className="text-xs"
                                            >
                                                {isCritical ? "Critical" : "Low"}
                                            </Badge>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

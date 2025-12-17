"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"

interface SalesChartProps {
    data: Array<{
        date: string
        sales: number
        revenue: number
    }>
    title?: string
}

export function SalesChart({ data, title = "Sales Overview" }: SalesChartProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="date"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--popover))",
                                    borderColor: "hsl(var(--border))",
                                    borderRadius: "8px",
                                }}
                                labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="sales"
                                stroke="hsl(var(--primary))"
                                fillOpacity={1}
                                fill="url(#colorSales)"
                                strokeWidth={2}
                                name="Sales"
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="hsl(142, 76%, 36%)"
                                fillOpacity={1}
                                fill="url(#colorRevenue)"
                                strokeWidth={2}
                                name="Revenue (K)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}

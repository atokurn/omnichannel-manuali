"use client"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend
} from 'recharts';

export function ClientForecastChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return <div className="flex h-[300px] items-center justify-center text-muted-foreground">Tidak ada data transaksi.</div>;
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="name"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => {
                            // Format date nicely if needed, e.g. "DD MMM"
                            const date = new Date(value);
                            return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                    />
                    <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px' }}
                        itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#8884d8"
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                        name="Penjualan"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

export function ClientBestSellersChart({ data }: { data: any[] }) {
    if (!data || data.length === 0) {
        return <div className="flex h-[300px] items-center justify-center text-muted-foreground">Belum ada data penjualan.</div>;
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="productName"
                        type="category"
                        width={100}
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ backgroundColor: 'var(--background)', borderRadius: '8px' }}
                    />
                    <Bar dataKey="totalSold" fill="#82ca9d" radius={[0, 4, 4, 0]} name="Terjual" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

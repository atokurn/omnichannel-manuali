import { getProducts, getDashboardMetrics } from "./actions";
import { ProductTable } from "./product-table";
import { columns } from "./columns";
import { ClientForecastChart, ClientBestSellersChart } from "./charts";
import { headers } from "next/headers";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";

export default async function ProductsPage(props: {
  searchParams?: Promise<{
    page?: string;
    search?: string;
  }>
}) {
  const searchParams = await props.searchParams;
  const headerList = await headers();
  const tenantId = headerList.get("X-Tenant-Id") || "default-tenant-id";

  // Parse params
  const page = Number(searchParams?.page) || 1;
  const search = searchParams?.search || "";

  // Fetch Data in Parallel
  const [productData, metrics] = await Promise.all([
    getProducts(tenantId, page, 10, search),
    getDashboardMetrics(tenantId)
  ]);

  const { data, metadata } = productData;

  const currencyFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  });

  return (
    <div className="flex flex-1 flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Products & Inventory</h2>
        <p className="text-muted-foreground">Monitor stock performance and manage your catalog.</p>
      </div>

      {/* --- DASHBOARD WIDGETS --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-xs bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nilai Stok</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currencyFormatter.format(metrics.totalStockValue)}</div>
            <p className="text-xs text-muted-foreground">Estimasi aset saat ini</p>
          </CardContent>
        </Card>
        <Card className="shadow-xs bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stok Menipis</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${metrics.lowStockCount > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Item di bawah minimum</p>
          </CardContent>
        </Card>
        <Card className="shadow-xs bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SKU</CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metadata.totalItems}</div>
            <p className="text-xs text-muted-foreground">Produk terdaftar</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm bg-card">
          <CardHeader>
            <CardTitle>Forecast Stok Habis</CardTitle>
            <CardDescription>Proyeksi penjualan (30 hari terakhir)</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ClientForecastChart data={metrics.stockForecast} />
          </CardContent>
        </Card>
        <Card className="col-span-3 shadow-sm bg-card">
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
            <CardDescription>Top 5 item penjualan tertinggi</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientBestSellersChart data={metrics.bestSellers} />
          </CardContent>
        </Card>
      </div>

      {/* --- PRODUCT TABLE --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold tracking-tight">Catalog</h3>
        </div>
        <Suspense fallback={<div className="h-96 w-full animate-pulse bg-muted rounded-md" />}>
          <ProductTable
            columns={columns}
            data={data}
            pageCount={metadata.totalPages}
          />
        </Suspense>
      </div>
    </div>
  );
}

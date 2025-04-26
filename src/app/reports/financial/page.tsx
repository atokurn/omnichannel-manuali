'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, BarChart3, DollarSign, TrendingUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FinancialReport {
  startDate: string;
  endDate: string;
  revenue: number;
  cost: number;
  profit: number;
  salesByCategory: {
    category: string;
    amount: number;
  }[];
  salesCount: number;
  purchaseCount: number;
}

interface Warehouse {
  id: string;
  name: string;
}

export default function FinancialReportPage() {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: getDefaultStartDate(),
    endDate: getDefaultEndDate(),
    warehouseId: '',
  });

  function getDefaultStartDate() {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  }

  function getDefaultEndDate() {
    return new Date().toISOString().split('T')[0];
  }

  useEffect(() => {
    async function fetchWarehouses() {
      try {
        const response = await fetch('/api/warehouses');
        if (!response.ok) {
          throw new Error('Failed to fetch warehouses');
        }
        const data = await response.json();
        setWarehouses(data);
      } catch (err) {
        console.error('Error fetching warehouses:', err);
      }
    }

    fetchWarehouses();
  }, []);

  async function fetchReport() {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        ...(filters.warehouseId && { warehouseId: filters.warehouseId }),
      });

      const response = await fetch(`/api/financial-reports?${queryParams}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch financial report');
      }

      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Error generating report');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  }

  function handleWarehouseChange(value: string) {
    setFilters(prev => ({
      ...prev,
      warehouseId: value
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    fetchReport();
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Financial Reports</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
          <CardDescription>Select date range and warehouse to generate report</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse (Optional)</Label>
                <Select value={filters.warehouseId} onValueChange={handleWarehouseChange}>
                  <SelectTrigger id="warehouse">
                    <SelectValue placeholder="All Warehouses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Warehouses</SelectItem>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {report && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${report.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {report.salesCount} sales
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${report.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {report.purchaseCount} purchases
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                <TrendingUp className={`h-4 w-4 ${report.profit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${report.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  ${Math.abs(report.profit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {report.profit >= 0 ? 'Profit' : 'Loss'} for selected period
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>Revenue breakdown by product category</CardDescription>
            </CardHeader>
            <CardContent>
              {report.salesByCategory.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No sales data available for this period</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">% of Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.salesByCategory.map((category, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{category.category}</TableCell>
                        <TableCell className="text-right">
                          ${category.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          {((category.amount / report.revenue) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
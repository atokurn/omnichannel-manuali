/**
 * Stock Service
 * 
 * Service untuk mengelola data stock-in dan stock-out
 * Mempersiapkan struktur untuk integrasi dengan database dan caching
 */

import { cache } from 'react';

// Tipe data untuk Stock Item (base)
export interface StockItemBase {
  id: string;
  sku: string;
  productName: string;
  warehouse: {
    id: string;
    name: string;
  };
  quantity: number;
  date: string;
  creator: {
    id: string;
    name: string;
  };
}

// Tipe data untuk Stock In
export interface StockInItem extends StockItemBase {
  type: string;
}

// Tipe data untuk Stock Out
export interface StockOutItem extends StockItemBase {
  reason: string;
}

// Data dummy untuk Stock In
const dummyStockInData: StockInItem[] = [
  {
    id: "1",
    sku: "PRD-001",
    productName: "Laptop Asus",
    warehouse: {
      id: "1",
      name: "Gudang Pusat"
    },
    quantity: 10,
    date: "2023-10-15T08:30:00Z",
    creator: {
      id: "1",
      name: "John Doe"
    },
    type: "Pembelian"
  },
  {
    id: "2",
    sku: "PRD-002",
    productName: "Mouse Logitech",
    warehouse: {
      id: "1",
      name: "Gudang Pusat"
    },
    quantity: 50,
    date: "2023-10-16T10:15:00Z",
    creator: {
      id: "2",
      name: "Jane Smith"
    },
    type: "Transfer"
  },
  {
    id: "3",
    sku: "PRD-003",
    productName: "Keyboard Mechanical",
    warehouse: {
      id: "2",
      name: "Gudang Cabang"
    },
    quantity: 25,
    date: "2023-10-17T14:45:00Z",
    creator: {
      id: "1",
      name: "John Doe"
    },
    type: "Pembelian"
  },
  {
    id: "4",
    sku: "PRD-004",
    productName: "Monitor LED 24\"",
    warehouse: {
      id: "2",
      name: "Gudang Cabang"
    },
    quantity: 15,
    date: "2023-10-18T09:20:00Z",
    creator: {
      id: "3",
      name: "Robert Johnson"
    },
    type: "Retur"
  },
  {
    id: "5",
    sku: "PRD-005",
    productName: "Headset Gaming",
    warehouse: {
      id: "1",
      name: "Gudang Pusat"
    },
    quantity: 30,
    date: "2023-10-19T11:10:00Z",
    creator: {
      id: "2",
      name: "Jane Smith"
    },
    type: "Pembelian"
  }
];

// Data dummy untuk Stock Out
const dummyStockOutData: StockOutItem[] = [
  {
    id: "1",
    sku: "PRD-001",
    productName: "Laptop Asus",
    warehouse: {
      id: "1",
      name: "Gudang Pusat"
    },
    quantity: 5,
    date: "2023-10-16T09:30:00Z",
    creator: {
      id: "1",
      name: "John Doe"
    },
    reason: "Penjualan"
  },
  {
    id: "2",
    sku: "PRD-002",
    productName: "Mouse Logitech",
    warehouse: {
      id: "1",
      name: "Gudang Pusat"
    },
    quantity: 20,
    date: "2023-10-17T11:15:00Z",
    creator: {
      id: "2",
      name: "Jane Smith"
    },
    reason: "Penjualan"
  },
  {
    id: "3",
    sku: "PRD-003",
    productName: "Keyboard Mechanical",
    warehouse: {
      id: "2",
      name: "Gudang Cabang"
    },
    quantity: 10,
    date: "2023-10-18T15:45:00Z",
    creator: {
      id: "1",
      name: "John Doe"
    },
    reason: "Transfer"
  },
  {
    id: "4",
    sku: "PRD-004",
    productName: "Monitor LED 24\"",
    warehouse: {
      id: "2",
      name: "Gudang Cabang"
    },
    quantity: 8,
    date: "2023-10-19T10:20:00Z",
    creator: {
      id: "3",
      name: "Robert Johnson"
    },
    reason: "Penjualan"
  },
  {
    id: "5",
    sku: "PRD-005",
    productName: "Headset Gaming",
    warehouse: {
      id: "1",
      name: "Gudang Pusat"
    },
    quantity: 15,
    date: "2023-10-20T12:10:00Z",
    creator: {
      id: "2",
      name: "Jane Smith"
    },
    reason: "Rusak"
  }
];

// Data dummy untuk warehouse
export const dummyWarehouses = [
  { id: "1", name: "Gudang Pusat" },
  { id: "2", name: "Gudang Cabang" },
];

/**
 * Fungsi untuk mendapatkan data stock-in
 * Menggunakan cache untuk optimasi performa
 * 
 * Nantinya akan diintegrasikan dengan database dan Redis
 */
export const getStockInData = cache(async (warehouseId?: string) => {
  // Simulasi delay seperti fetching dari database
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Filter berdasarkan warehouse jika ada
  if (warehouseId && warehouseId !== "all") {
    return dummyStockInData.filter(item => item.warehouse.id === warehouseId);
  }
  
  return dummyStockInData;
});

/**
 * Fungsi untuk mendapatkan data stock-out
 * Menggunakan cache untuk optimasi performa
 * 
 * Nantinya akan diintegrasikan dengan database dan Redis
 */
export const getStockOutData = cache(async (warehouseId?: string) => {
  // Simulasi delay seperti fetching dari database
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Filter berdasarkan warehouse jika ada
  if (warehouseId && warehouseId !== "all") {
    return dummyStockOutData.filter(item => item.warehouse.id === warehouseId);
  }
  
  return dummyStockOutData;
});

/**
 * Fungsi untuk mendapatkan data warehouse
 * Menggunakan cache untuk optimasi performa
 * 
 * Nantinya akan diintegrasikan dengan database dan Redis
 */
export const getWarehouses = cache(async () => {
  // Simulasi delay seperti fetching dari database
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return dummyWarehouses;
});
import { cache } from 'react';

// Definisi tipe data untuk Warehouse
export interface Warehouse {
  id: string;
  name: string;
  address?: string;
  city?: string;
  capacity?: number;
  manager?: string;
  totalSku: number;
  defaultShipping: boolean;
  defaultReturning: boolean;
  createdAt: string;
}

// Data dummy untuk Warehouses dengan informasi lebih lengkap
export const dummyWarehousesData: Warehouse[] = [
  {
    id: "1",
    name: "Gudang Pusat",
    address: "Jl. Industri No. 123",
    city: "Jakarta",
    capacity: 5000,
    manager: "John Doe",
    totalSku: 120,
    defaultShipping: true,
    defaultReturning: false,
    createdAt: "2022-01-15T08:30:00Z"
  },
  {
    id: "2",
    name: "Gudang Cabang",
    address: "Jl. Raya Bandung No. 45",
    city: "Bandung",
    capacity: 3000,
    manager: "Jane Smith",
    totalSku: 85,
    defaultShipping: false,
    defaultReturning: true,
    createdAt: "2022-03-20T10:15:00Z"
  },
  {
    id: "3",
    name: "Gudang Distribusi Timur",
    address: "Jl. Pahlawan No. 78",
    city: "Surabaya",
    capacity: 4000,
    manager: "Robert Johnson",
    totalSku: 95,
    defaultShipping: false,
    defaultReturning: false,
    createdAt: "2022-05-10T09:45:00Z"
  },
  {
    id: "4",
    name: "Gudang Penyimpanan Khusus",
    address: "Jl. Industri Selatan No. 12",
    city: "Bekasi",
    capacity: 2000,
    manager: "Michael Brown",
    totalSku: 45,
    defaultShipping: false,
    defaultReturning: false,
    createdAt: "2022-07-05T14:20:00Z"
  },
  {
    id: "5",
    name: "Gudang Transit",
    address: "Jl. Logistik No. 56",
    city: "Tangerang",
    capacity: 1500,
    manager: "Sarah Wilson",
    totalSku: 30,
    defaultShipping: false,
    defaultReturning: false,
    createdAt: "2022-09-18T11:30:00Z"
  }
];

/**
 * Fungsi untuk mendapatkan data warehouse
 * Menggunakan cache untuk optimasi performa
 * 
 * Nantinya akan diintegrasikan dengan database dan Redis
 */
export const getWarehouses = cache(async (status?: string) => {
  // Simulasi delay seperti fetching dari database
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Filter tidak lagi berdasarkan status karena sudah dihapus
  if (status && status !== "all") {
    return dummyWarehousesData;
  }
  
  return dummyWarehousesData;
});

/**
 * Fungsi untuk mendapatkan warehouse berdasarkan ID
 */
export const getWarehouseById = cache(async (id: string) => {
  // Simulasi delay seperti fetching dari database
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return dummyWarehousesData.find(warehouse => warehouse.id === id);
});
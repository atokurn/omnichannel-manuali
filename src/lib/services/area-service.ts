import { cache } from 'react';

// Definisi tipe data untuk Area
export interface Area {
  id: string;
  name: string;
  warehouseId: string;
  warehouseName: string;
  capacity: number;
  totalSku: number;
  type: string;
  status: string;
  createdAt: string;
}

// Data dummy untuk Area dengan informasi lengkap
export const dummyAreasData: Area[] = [
  {
    id: "1",
    name: "Area Elektronik",
    warehouseId: "1",
    warehouseName: "Gudang Pusat",
    capacity: 1000,
    totalSku: 45,
    type: "Penyimpanan",
    status: "Aktif",
    createdAt: "2022-02-15T08:30:00Z"
  },
  {
    id: "2",
    name: "Area Pakaian",
    warehouseId: "1",
    warehouseName: "Gudang Pusat",
    capacity: 800,
    totalSku: 30,
    type: "Penyimpanan",
    status: "Aktif",
    createdAt: "2022-02-20T10:15:00Z"
  },
  {
    id: "3",
    name: "Area Makanan",
    warehouseId: "2",
    warehouseName: "Gudang Cabang",
    capacity: 600,
    totalSku: 25,
    type: "Penyimpanan",
    status: "Aktif",
    createdAt: "2022-03-10T09:45:00Z"
  },
  {
    id: "4",
    name: "Area Penerimaan",
    warehouseId: "3",
    warehouseName: "Gudang Distribusi Timur",
    capacity: 400,
    totalSku: 0,
    type: "Penerimaan",
    status: "Aktif",
    createdAt: "2022-04-05T14:20:00Z"
  },
  {
    id: "5",
    name: "Area Pengiriman",
    warehouseId: "4",
    warehouseName: "Gudang Penyimpanan Khusus",
    capacity: 300,
    totalSku: 0,
    type: "Pengiriman",
    status: "Aktif",
    createdAt: "2022-05-18T11:30:00Z"
  },
  {
    id: "6",
    name: "Area Peralatan",
    warehouseId: "5",
    warehouseName: "Gudang Transit",
    capacity: 250,
    totalSku: 15,
    type: "Penyimpanan",
    status: "Nonaktif",
    createdAt: "2022-06-22T13:45:00Z"
  }
];

/**
 * Fungsi untuk mendapatkan semua data area
 * Menggunakan cache untuk optimasi performa
 * 
 * Nantinya akan diintegrasikan dengan database dan Redis
 */
export const getAreas = cache(async () => {
  // Simulasi delay seperti fetching dari database
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return dummyAreasData;
});

/**
 * Fungsi untuk mendapatkan area berdasarkan ID
 */
export const getAreaById = cache(async (id: string) => {
  // Simulasi delay seperti fetching dari database
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return dummyAreasData.find(area => area.id === id);
});

/**
 * Fungsi untuk mendapatkan area berdasarkan warehouse ID
 */
export const getAreasByWarehouse = cache(async (warehouseId: string | null) => {
  // Simulasi delay seperti fetching dari database
  await new Promise(resolve => setTimeout(resolve, 200));
  
  if (!warehouseId || warehouseId === "all") {
    return dummyAreasData;
  }
  
  return dummyAreasData.filter(area => area.warehouseId === warehouseId);
});
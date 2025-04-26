import { cache } from 'react';

// Definisi tipe data untuk Shelf (Rak)
export interface Shelf {
  id: string;
  name: string;
  areaId: string;
  areaName: string;
  warehouseId: string;
  warehouseName: string;
  capacity: number;
  totalSku: number;
  position: string;
  status: string;
  createdAt: string;
}

// Data dummy untuk Shelves dengan informasi lengkap
export const dummyShelvesData: Shelf[] = [
  {
    id: "1",
    name: "Rak A-1",
    areaId: "1",
    areaName: "Area Elektronik",
    warehouseId: "1",
    warehouseName: "Gudang Pusat",
    capacity: 200,
    totalSku: 15,
    position: "Baris 1, Kolom A",
    status: "Aktif",
    createdAt: "2022-03-15T08:30:00Z"
  },
  {
    id: "2",
    name: "Rak A-2",
    areaId: "1",
    areaName: "Area Elektronik",
    warehouseId: "1",
    warehouseName: "Gudang Pusat",
    capacity: 200,
    totalSku: 12,
    position: "Baris 1, Kolom B",
    status: "Aktif",
    createdAt: "2022-03-16T10:15:00Z"
  },
  {
    id: "3",
    name: "Rak B-1",
    areaId: "2",
    areaName: "Area Pakaian",
    warehouseId: "1",
    warehouseName: "Gudang Pusat",
    capacity: 150,
    totalSku: 20,
    position: "Baris 2, Kolom A",
    status: "Aktif",
    createdAt: "2022-03-20T09:45:00Z"
  },
  {
    id: "4",
    name: "Rak C-1",
    areaId: "3",
    areaName: "Area Makanan",
    warehouseId: "2",
    warehouseName: "Gudang Cabang",
    capacity: 100,
    totalSku: 8,
    position: "Baris 1, Kolom A",
    status: "Aktif",
    createdAt: "2022-04-05T14:20:00Z"
  },
  {
    id: "5",
    name: "Rak D-1",
    areaId: "6",
    areaName: "Area Peralatan",
    warehouseId: "5",
    warehouseName: "Gudang Transit",
    capacity: 120,
    totalSku: 5,
    position: "Baris 1, Kolom A",
    status: "Nonaktif",
    createdAt: "2022-05-18T11:30:00Z"
  },
  {
    id: "6",
    name: "Rak B-2",
    areaId: "2",
    areaName: "Area Pakaian",
    warehouseId: "1",
    warehouseName: "Gudang Pusat",
    capacity: 150,
    totalSku: 18,
    position: "Baris 2, Kolom B",
    status: "Aktif",
    createdAt: "2022-03-22T13:45:00Z"
  }
];

/**
 * Fungsi untuk mendapatkan semua data rak
 * Menggunakan cache untuk optimasi performa
 * 
 * Nantinya akan diintegrasikan dengan database dan Redis
 */
export const getShelves = cache(async () => {
  // Simulasi delay seperti fetching dari database
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return dummyShelvesData;
});

/**
 * Fungsi untuk mendapatkan rak berdasarkan ID
 */
export const getShelfById = cache(async (id: string) => {
  // Simulasi delay seperti fetching dari database
  await new Promise(resolve => setTimeout(resolve, 200));
  
  return dummyShelvesData.find(shelf => shelf.id === id);
});

/**
 * Fungsi untuk mendapatkan rak berdasarkan area
 */
export const getShelvesByArea = (areaId: string) => {
  if (areaId === "all") {
    return dummyShelvesData;
  }
  
  return dummyShelvesData.filter(shelf => shelf.areaId === areaId);
};

/**
 * Fungsi untuk mendapatkan rak berdasarkan warehouse
 */
export const getShelvesByWarehouse = (warehouseId: string) => {
  if (warehouseId === "all") {
    return dummyShelvesData;
  }
  
  return dummyShelvesData.filter(shelf => shelf.warehouseId === warehouseId);
};
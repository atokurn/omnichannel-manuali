'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, LayoutGrid } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dummyWarehousesData } from "@/lib/services/warehouse-service";

interface AddAreaDialogProps {
  onAddArea?: (area: any) => void;
}

export function AddAreaDialog({ onAddArea }: AddAreaDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    warehouseId: '',
    capacity: '',
    type: 'Penyimpanan',
    status: 'Aktif'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi sederhana
    if (!formData.name) {
      alert('Nama area harus diisi');
      return;
    }

    if (!formData.warehouseId) {
      alert('Gudang harus dipilih');
      return;
    }

    // Temukan nama warehouse berdasarkan ID
    const selectedWarehouse = dummyWarehousesData.find(w => w.id === formData.warehouseId);
    const warehouseName = selectedWarehouse ? selectedWarehouse.name : '';

    // Buat objek area baru
    const newArea = {
      ...formData,
      id: Date.now().toString(), // Generate ID sementara
      warehouseName: warehouseName,
      totalSku: 0, // Area baru belum memiliki SKU
      capacity: formData.capacity ? parseInt(formData.capacity) : 0,
      createdAt: new Date().toISOString()
    };

    // Panggil callback jika ada
    if (onAddArea) {
      onAddArea(newArea);
    }

    // Reset form dan tutup dialog
    setFormData({
      name: '',
      warehouseId: '',
      capacity: '',
      type: 'Penyimpanan',
      status: 'Aktif'
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Area
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Area Baru</DialogTitle>
            <DialogDescription>
              Isi informasi detail untuk area penyimpanan baru.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama Area
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Nama area"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="warehouseId" className="text-right">
                Gudang
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.warehouseId}
                  onValueChange={(value) => handleSelectChange('warehouseId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih gudang" />
                  </SelectTrigger>
                  <SelectContent>
                    {dummyWarehousesData.map(warehouse => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="capacity" className="text-right">
                Kapasitas (m²)
              </Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Kapasitas dalam m²"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Tipe Area
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Penyimpanan">Penyimpanan</SelectItem>
                    <SelectItem value="Penerimaan">Penerimaan</SelectItem>
                    <SelectItem value="Pengiriman">Pengiriman</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <div className="col-span-3">
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aktif">Aktif</SelectItem>
                    <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
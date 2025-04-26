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
import { Building2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface AddWarehouseDialogProps {
  onAddWarehouse?: (warehouse: any) => void;
}

export function AddWarehouseDialog({ onAddWarehouse }: AddWarehouseDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    capacity: '',
    manager: '',
    defaultShipping: false,
    defaultReturning: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi sederhana
    if (!formData.name) {
      alert('Nama warehouse harus diisi');
      return;
    }

    // Buat objek warehouse baru
    const newWarehouse = {
      ...formData,
      id: Date.now().toString(), // Generate ID sementara
      totalSku: 0, // Warehouse baru belum memiliki SKU
      capacity: formData.capacity ? parseInt(formData.capacity) : 0,
      createdAt: new Date().toISOString()
    };

    // Panggil callback jika ada
    if (onAddWarehouse) {
      onAddWarehouse(newWarehouse);
    }

    // Reset form dan tutup dialog
    setFormData({
      name: '',
      address: '',
      city: '',
      capacity: '',
      manager: '',
      defaultShipping: false,
      defaultReturning: false
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Building2 className="mr-2 h-4 w-4" />
          Tambah Warehouse
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Warehouse Baru</DialogTitle>
            <DialogDescription>
              Isi informasi detail untuk warehouse baru.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Nama warehouse"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Alamat
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Alamat lengkap"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="city" className="text-right">
                Kota
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Kota"
              />
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
              <Label htmlFor="manager" className="text-right">
                Manager
              </Label>
              <Input
                id="manager"
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Nama manager"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right">
                <Label>Default</Label>
              </div>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="defaultShipping" 
                    checked={formData.defaultShipping}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('defaultShipping', checked as boolean)
                    }
                  />
                  <Label htmlFor="defaultShipping">Default untuk pengiriman</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="defaultReturning" 
                    checked={formData.defaultReturning}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange('defaultReturning', checked as boolean)
                    }
                  />
                  <Label htmlFor="defaultReturning">Default untuk pengembalian</Label>
                </div>
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
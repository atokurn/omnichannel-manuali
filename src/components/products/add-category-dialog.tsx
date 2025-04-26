"use client"

import * as React from "react";
import { useState } from "react";
import { Plus } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea"; // Menggunakan Textarea untuk deskripsi

// Definisikan tipe untuk data kategori jika diperlukan
interface CategoryData {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface AddCategoryDialogProps {
  onAddCategory?: (newCategory: CategoryData) => void;
}

export function AddCategoryDialog({ onAddCategory }: AddCategoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi sederhana
    if (!formData.name) {
      alert('Nama kategori harus diisi');
      return;
    }

    // Buat objek kategori baru
    const newCategory = {
      ...formData,
      id: Date.now().toString(), // Generate ID sementara
      createdAt: new Date().toISOString()
    };

    // Panggil callback jika ada
    if (onAddCategory) {
      onAddCategory(newCategory);
    }

    // Reset form dan tutup dialog
    setFormData({
      name: '',
      description: '',
    });
    setOpen(false);
    // Tambahkan logika untuk mengirim data ke backend di sini
    console.log("Category data to submit:", newCategory);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          Tambah Kategori
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Tambah Kategori Baru</DialogTitle>
            <DialogDescription>
              Isi informasi detail untuk kategori produk baru.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nama Kategori
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Nama kategori"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4"> {/* Ubah items-center menjadi items-start untuk Textarea */} 
              <Label htmlFor="description" className="text-right pt-2"> {/* Tambahkan padding top untuk label */} 
                Deskripsi
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="col-span-3"
                placeholder="Deskripsi singkat kategori (opsional)"
                rows={3} // Atur jumlah baris awal
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button type="submit">Simpan</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
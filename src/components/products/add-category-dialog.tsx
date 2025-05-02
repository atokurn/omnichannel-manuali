"use client"

import * as React from "react";
import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
import { Alert, AlertDescription } from "@/components/ui/alert";

// Definisikan tipe untuk data kategori jika diperlukan
interface CategoryData {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

interface AddCategoryDialogProps {
  onAddCategory?: (newCategory: CategoryData) => void;
  onSuccess?: () => void;
}

export function AddCategoryDialog({ onAddCategory, onSuccess }: AddCategoryDialogProps) {
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validasi sederhana
    if (!formData.name) {
      setError('Nama kategori harus diisi');
      return;
    }

    setIsSubmitting(true);

    try {
      // Kirim data ke API
      const response = await fetch('/api/products/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan kategori');
      }

      const savedCategory = await response.json();
      
      // Panggil callback jika ada
      if (onAddCategory) {
        onAddCategory(savedCategory);
      }

      // Reset form dan tutup dialog
      setFormData({
        name: '',
        description: '',
      });
      setOpen(false);
      
      // Tampilkan notifikasi sukses menggunakan toast
      toast.success('Sukses', { description: 'Kategori berhasil disimpan' });
      
      // Panggil callback onSuccess jika disediakan
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error saving category:', err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan kategori');
      toast.error('Error', { description: err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan kategori' });
    } finally {
      setIsSubmitting(false);
    }
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
          {error && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Batal</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
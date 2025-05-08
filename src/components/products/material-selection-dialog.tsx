"use client";

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { Loader2 } from 'lucide-react';

interface Material {
  id: string;
  code: string; // Assuming code exists
  name: string;
  category?: string; // Assuming category exists
  type?: string; // Assuming type exists
  stock: number; // Assuming stock exists
  unit: string;
  basePrice: number;
}

interface MaterialSelectionDialogProps {
  trigger: React.ReactNode;
  onSelect: (selectedMaterials: Material[]) => void;
  initialSelectedIds?: string[];
}

const getColumns = (): ColumnDef<Material>[] => [
  {
    accessorKey: "code",
    header: "CODE/SKU",
  },
  {
    accessorKey: "name",
    header: "NAME",
  },
  {
    accessorKey: "category",
    header: "CATEGORY",
    cell: ({ row }) => row.original.category || '-', // Handle potentially missing data
  },
  {
    accessorKey: "type",
    header: "TYPE",
    cell: ({ row }) => row.original.type || 'material', // Default to 'material'
  },
  {
    accessorKey: "stock",
    header: "STOCK",
  },
  {
    accessorKey: "basePrice",
    header: "BUY PRICE",
    cell: ({ row }) => `Rp ${row.original.basePrice.toLocaleString('id-ID')}`,
  },
  // Add Sell Price if available
  // {
  //   accessorKey: "sellPrice",
  //   header: "SELL PRICE",
  //   cell: ({ row }) => `Rp ${row.original.sellPrice?.toLocaleString('id-ID') || 0}`,
  // },
];

export function MaterialSelectionDialog({ trigger, onSelect, initialSelectedIds = [] }: MaterialSelectionDialogProps) {
  const { tenantId } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const fetchMaterials = async (page = pagination.page, limit = pagination.limit, search = searchTerm) => {
    if (!tenantId) {
      setError("Tenant ID tidak ditemukan.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/products/materials?page=${page}&limit=${limit}&search=${search}`, {
        headers: {
          'X-Tenant-Id': tenantId,
        },
      });
      if (!response.ok) {
        throw new Error('Gagal mengambil data material');
      }
      const result = await response.json();
      // Assuming the API returns data in the expected Material format
      // Add dummy data for missing fields for now
      const formattedMaterials = result.data.map((m: any) => ({
        ...m,
        code: m.code || `MAT-${m.id.substring(0, 3)}`, // Placeholder code
        category: m.category || 'Uncategorized', // Placeholder category
        type: m.type || 'material', // Placeholder type
        stock: m.stock ?? Math.floor(Math.random() * 1000), // Placeholder stock
        basePrice: m.basePrice || 0,
      }));
      setMaterials(formattedMaterials);
      setPagination(result.pagination);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
      toast.error('Error', { description: err.message || 'Gagal memuat data material.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && tenantId) {
      fetchMaterials(1, pagination.limit, ''); // Fetch on open
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, tenantId]);

  // Efek untuk menginisialisasi rowSelection setelah materials diambil
  useEffect(() => {
    if (materials.length > 0 && initialSelectedIds.length > 0) {
      console.log('Materials loaded:', materials.length, 'items');
      console.log('Initializing selection with IDs:', initialSelectedIds);
      
      const initialSelection: RowSelectionState = {};
      initialSelectedIds.forEach(id => {
        const index = materials.findIndex(m => m.id === id);
        console.log(`Material ID ${id}: found at index ${index}`);
        if (index !== -1) {
          initialSelection[index] = true;
        }
      });
      
      console.log('Setting row selection:', initialSelection);
      setRowSelection(initialSelection);
    }
  }, [materials, initialSelectedIds]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (isOpen && tenantId) {
        fetchMaterials(1, pagination.limit, searchTerm);
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, isOpen, tenantId, pagination.limit]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchMaterials(newPage, pagination.limit, searchTerm);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPagination(prev => ({ ...prev, limit: newSize, page: 1 }));
    fetchMaterials(1, newSize, searchTerm);
  };

  const handleSave = () => {
    const selectedMaterialData = Object.keys(rowSelection)
      .map(index => materials[parseInt(index)])
      .filter(Boolean); // Filter out undefined if index is out of bounds
    onSelect(selectedMaterialData);
    setIsOpen(false);
  };

  const columns = getColumns();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[80vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Materials</DialogTitle>
          <DialogDescription>
            Choose materials to add to your product composition.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center py-4">
          <Input
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
          {/* Add Filters here if needed */}
        </div>
        <div className="flex-grow overflow-auto">
          {isLoading ? (
            <DataTableSkeleton columnCount={6} rowCount={10} />
          ) : error ? (
            <div className="text-center py-10 text-red-600">{error}</div>
          ) : (
            <DataTable
              columns={columns}
              data={materials}
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              currentPage={pagination.page}
              pageCount={pagination.totalPages}
              pageSize={pagination.limit}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              enableRowSelection // Enable row selection
            />
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
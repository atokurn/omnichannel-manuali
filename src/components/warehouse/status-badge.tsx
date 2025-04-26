import { Badge } from "@/components/ui/badge";

type StatusType = 'active' | 'inactive' | 'maintenance';

interface StatusBadgeProps {
  status: StatusType;
}

/**
 * Komponen untuk menampilkan status warehouse dengan warna yang sesuai
 * Menggunakan Badge dari shadcn/ui dengan variant yang berbeda berdasarkan status
 */
export function StatusBadge({ status }: StatusBadgeProps) {
  // Menentukan variant badge berdasarkan status
  let variant = "secondary";
  
  if (status === "active") variant = "success";
  if (status === "inactive") variant = "outline";
  if (status === "maintenance") variant = "warning";
  
  return <Badge variant={variant as any}>{status}</Badge>;
}
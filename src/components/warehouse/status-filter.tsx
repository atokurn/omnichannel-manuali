import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StatusFilterProps {
  onStatusChange: (status: string) => void;
}

/**
 * Komponen untuk memfilter warehouse berdasarkan status
 * Menggunakan Select dari shadcn/ui
 */
export function StatusFilter({ onStatusChange }: StatusFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Select onValueChange={onStatusChange} defaultValue="all">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="maintenance">Maintenance</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
"use client";

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DataTable } from '@/components/data-table/data-table';
import { DataTableSkeleton } from '@/components/data-table/data-table-skeleton';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Import Card components

// Define the Role type based on expected data
interface Role {
  id: string;
  name: string;
  description: string | null;
  // Add other relevant fields like userCount, createdAt etc.
}

// Dummy data - replace with actual API call
const fetchRoles = async (page: number, limit: number): Promise<{ data: Role[], pageCount: number }> => {
  console.log(`Fetching roles: page=${page}, limit=${limit}`);
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Example data
  const allRoles: Role[] = [
    { id: '1', name: 'Admin', description: 'Full access to all features' },
    { id: '2', name: 'Member', description: 'Limited access for team members' },
    { id: '3', name: 'Viewer', description: 'Read-only access' },
    { id: '4', name: 'Inventory Manager', description: 'Manage products and stock' },
    { id: '5', name: 'Order Processor', description: 'Handle order fulfillment' },
  ];

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = allRoles.slice(start, end);
  const pageCount = Math.ceil(allRoles.length / limit);

  return { data: paginatedData, pageCount };
};

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const loadRoles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, pageCount: totalPages } = await fetchRoles(currentPage, pageSize);
        setRoles(data);
        setPageCount(totalPages);
      } catch (err) {
        console.error("Error fetching roles:", err);
        setError(err instanceof Error ? err.message : 'Failed to load roles.');
      } finally {
        setIsLoading(false);
      }
    };

    loadRoles();
  }, [currentPage, pageSize]);

  // Define columns for the DataTable
  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "name",
      header: "Role Name",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description || '-', // Handle null description
    },
    // Add more columns as needed (e.g., user count)
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const role = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => console.log('Edit role:', role.id)} // Replace with actual navigation/modal
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => console.log('Delete role:', role.id)} // Replace with actual delete logic
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when size changes
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
    <Card> {/* Wrap content in Card */}
      <CardHeader className="flex flex-row items-center justify-between"> {/* Use CardHeader */}
        <div>
          <CardTitle className="text-lg font-semibold md:text-2xl">Roles & Permissions</CardTitle>
          <CardDescription>Manage roles and their permissions.</CardDescription> {/* Optional: Add description */}
        </div>
        <Link href="/settings/account/roles/add">
          <Button>Add Role</Button>
        </Link>
      </CardHeader>

      <CardContent> {/* Use CardContent */}
        {error && (
          <div className="mb-4 rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <DataTableSkeleton columnCount={columns.length} rowCount={pageSize} showToolbar={false} />
        ) : (
          <DataTable
            columns={columns}
            data={roles}
            pageCount={pageCount}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
            // Add searchKey if needed: searchKey="name"
          />
        )}
      </CardContent>
    </Card>
  </main>
  );
}
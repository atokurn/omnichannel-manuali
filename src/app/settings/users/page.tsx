'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { DataTable } from '@/components/table/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, FileEdit, Trash2, UserPlus } from 'lucide-react';
import { AddUserDialog } from '@/components/settings/add-user-dialog';
import { EditUserDialog } from '@/components/settings/edit-user-dialog';
import { ViewUserDialog } from '@/components/settings/view-user-dialog';
import { DeleteUserDialog } from '@/components/settings/delete-user-dialog';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  lastLogin: string | null;
  roles: { id: string; name: string }[];
}

export default function UsersPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Dialog states
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isViewUserOpen, setIsViewUserOpen] = useState(false);
  const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }
  
  const columns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "roles",
      header: "Roles",
      cell: ({ row }: any) => {
        const roles = row.original.roles;
        return (
          <div className="space-x-1">
            {roles.map((role: any) => (
              <span key={role.id} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {role.name}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => (
        <div className={`font-medium ${row.original.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
          {row.original.status === 'active' ? 'Active' : 'Inactive'}
        </div>
      ),
    },
    {
      accessorKey: "lastLogin",
      header: "Last Login",
      cell: ({ row }: any) => {
        return row.original.lastLogin ? new Date(row.original.lastLogin).toLocaleString() : 'Never';
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        return (
          <div className="flex items-center gap-2">
            {hasPermission('user', 'read') && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setSelectedUser(row.original);
                  setIsViewUserOpen(true);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            {hasPermission('user', 'update') && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setSelectedUser(row.original);
                  setIsEditUserOpen(true);
                }}
              >
                <FileEdit className="h-4 w-4" />
              </Button>
            )}
            {hasPermission('user', 'delete') && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => {
                  setSelectedUser(row.original);
                  setIsDeleteUserOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];
  
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage users in your organization</CardDescription>
          </div>
          {hasPermission('user', 'create') && (
            <Button onClick={() => router.push('/settings/users/add')}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={users} 
            searchKey="name"
            pageCount={1}
            currentPage={1}
            onPageChange={() => {}}
            pageSize={10}
            onPageSizeChange={() => {}}
          />
        </CardContent>
      </Card>
      
      {/* Dialogs */}
      {isAddUserOpen && (
        <AddUserDialog 
          open={isAddUserOpen} 
          onClose={() => setIsAddUserOpen(false)}
          onUserAdded={() => {
            fetchUsers();
            setIsAddUserOpen(false);
          }}
        />
      )}
      
      {isEditUserOpen && selectedUser && (
        <EditUserDialog 
          open={isEditUserOpen} 
          user={selectedUser}
          onClose={() => {
            setIsEditUserOpen(false);
            setSelectedUser(null);
          }}
          onUserUpdated={() => {
            fetchUsers();
            setIsEditUserOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
      
      {isViewUserOpen && selectedUser && (
        <ViewUserDialog 
          open={isViewUserOpen} 
          user={selectedUser}
          onClose={() => {
            setIsViewUserOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
      
      {isDeleteUserOpen && selectedUser && (
        <DeleteUserDialog 
          open={isDeleteUserOpen} 
          user={selectedUser}
          onClose={() => {
            setIsDeleteUserOpen(false);
            setSelectedUser(null);
          }}
          onUserDeleted={() => {
            fetchUsers();
            setIsDeleteUserOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
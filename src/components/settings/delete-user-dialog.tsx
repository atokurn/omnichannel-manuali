'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  email: string;
}

interface DeleteUserDialogProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onUserDeleted: () => void;
}

export function DeleteUserDialog({ open, user, onClose, onUserDeleted }: DeleteUserDialogProps) {
  const [loading, setLoading] = useState(false);
  
  async function handleDelete() {
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        toast.success('User deleted successfully');
        onUserDeleted();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Failed to delete user', error);
      toast.error('Failed to delete user');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the user <strong>{user.name}</strong> ({user.email})? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
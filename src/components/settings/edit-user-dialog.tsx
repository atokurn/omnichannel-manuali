'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  roleId?: string;
  roles: { id: string; name: string }[];
}

interface EditUserDialogProps {
  open: boolean;
  user: User;
  onClose: () => void;
  onUserUpdated: () => void;
}

export function EditUserDialog({ open, user, onClose, onUserUpdated }: EditUserDialogProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [roleId, setRoleId] = useState(user.roles[0]?.id || '');
  const [status, setStatus] = useState(user.status === 'active');
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  
  // Fetch roles when dialog opens
  useEffect(() => {
    fetchRoles();
  }, []);
  
  async function fetchRoles() {
    try {
      setLoadingRoles(true);
      const res = await fetch('/api/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data.roles);
      }
    } catch (error) {
      console.error('Failed to fetch roles', error);
      toast.error('Failed to fetch roles');
    } finally {
      setLoadingRoles(false);
    }
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!name || !email || !roleId) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          roleId,
          status: status ? 'active' : 'inactive'
        }),
      });
      
      if (res.ok) {
        toast.success('User updated successfully');
        onUserUpdated();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Failed to update user', error);
      toast.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update user information for {user.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={roleId}
                onValueChange={setRoleId}
                disabled={loadingRoles}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Active
              </Label>
              <div className="col-span-3 flex items-center space-x-2">
                <Switch
                  id="status"
                  checked={status}
                  onCheckedChange={setStatus}
                />
                <span className="text-sm text-muted-foreground">
                  {status ? 'User is active' : 'User is inactive'}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
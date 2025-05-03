'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
}

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

export function AddUserDialog({ open, onClose, onUserAdded }: AddUserDialogProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  
  // Fetch roles when dialog opens
  useState(() => {
    fetchRoles();
  });
  
  async function fetchRoles() {
    try {
      setLoadingRoles(true);
      const res = await fetch('/api/roles');
      if (res.ok) {
        const data = await res.json();
        setRoles(data.roles);
        // Set default role if available
        if (data.roles.length > 0) {
          const defaultRole = data.roles.find((role: Role) => role.name === 'User') || data.roles[0];
          setRoleId(defaultRole.id);
        }
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
    
    if (!name || !email || !password || !roleId) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, roleId }),
      });
      
      if (res.ok) {
        toast.success('User added successfully');
        onUserAdded();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to add user');
      }
    } catch (error) {
      console.error('Failed to add user', error);
      toast.error('Failed to add user');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user for your organization.
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
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
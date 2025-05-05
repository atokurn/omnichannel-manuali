'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
}

export default function AddUserPage() {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  
  // Check permission
  useEffect(() => {
    if (!hasPermission('user', 'create')) {
      toast.error('You do not have permission to add users');
      router.push('/settings/users');
    }
  }, [hasPermission, router]);
  
  // Fetch roles when page loads
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
        router.push('/settings/users');
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
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Add New User</CardTitle>
            <CardDescription>Create a new user for your organization</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={() => router.push('/settings/users')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={roleId}
                  onValueChange={setRoleId}
                  disabled={loadingRoles}
                >
                  <SelectTrigger>
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push('/settings/users')}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : 'Save User'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
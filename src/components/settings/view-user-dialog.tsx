'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  lastLogin: string | null;
  roles: { id: string; name: string }[];
}

interface ViewUserDialogProps {
  open: boolean;
  user: User;
  onClose: () => void;
}

export function ViewUserDialog({ open, user, onClose }: ViewUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            View details for user {user.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right font-medium">Name:</div>
            <div className="col-span-3">{user.name}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right font-medium">Email:</div>
            <div className="col-span-3">{user.email}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right font-medium">Status:</div>
            <div className="col-span-3">
              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${user.status === 'active' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-700/10' : 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-700/10'}`}>
                {user.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right font-medium">Last Login:</div>
            <div className="col-span-3">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <div className="text-right font-medium">Roles:</div>
            <div className="col-span-3 flex flex-wrap gap-1">
              {user.roles.map((role) => (
                <span key={role.id} className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {role.name}
                </span>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
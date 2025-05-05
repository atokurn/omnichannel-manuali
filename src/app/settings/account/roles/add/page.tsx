"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Placeholder data - replace with actual data fetching
const modules = [
  { id: 'all', name: 'All' },
  { id: 'finance', name: 'Finance' },
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'products', name: 'Products' },
  { id: 'orders', name: 'Orders' },
  { id: 'transaction', name: 'Transaction' },
  { id: 'inventory', name: 'Inventory' },
  { id: 'settings', name: 'Settings' },
];

const permissionsByModule: { [key: string]: { id: string; name: string }[] } = {
  products: [
    { id: 'prod_view', name: 'Products' },
    { id: 'prod_copy', name: 'Copy Listings' },
    { id: 'prod_draft', name: 'Draft' },
    { id: 'prod_discount', name: 'Discount Promotions' },
    { id: 'prod_gallery', name: 'Gallery' },
    { id: 'prod_template', name: 'Product Template' },
    { id: 'prod_bundle', name: 'Bundle Deal' },
    { id: 'prod_shopee_flash', name: 'Shopee - Store Flash Deal' },
    { id: 'prod_boost', name: 'Boost Management' },
    { id: 'prod_publish', name: 'Publishing' },
    { id: 'prod_unpublished', name: 'Unpublished' },
    { id: 'prod_shop_cat', name: 'Shop Category' },
    { id: 'prod_lazada_opp', name: 'Lazada - Opportunity Center' },
    { id: 'prod_shopee_video', name: 'Shopee Video Center' },
    { id: 'prod_scrape', name: 'Scrape Products' },
    { id: 'prod_failed', name: 'Failed' },
    { id: 'prod_tiktok_global', name: 'TikTok-全球产品' }, // Example non-english
    { id: 'prod_info_link', name: 'Information Linkage' },
    { id: 'prod_tiktok_discount', name: 'TikTok Product Discount' },
    { id: 'prod_master', name: 'Master Product Management' },
    { id: 'prod_1688', name: '1688 Sourcing' },
    { id: 'prod_active', name: 'Active' },
    { id: 'prod_shopee_global', name: 'Shopee-全球产品' }, // Example non-english
    { id: 'prod_link_record', name: 'Linkage Record' },
    { id: 'prod_tiktok_flash', name: 'TikTok Flash Deal' },
    { id: 'prod_shopee_ads', name: 'Shopee Ads' },
  ],
  // Add other modules permissions here
  finance: [],
  dashboard: [],
  orders: [],
  transaction: [],
  inventory: [],
  settings: [],
};

export default function AddRolePage() {
  const [roleName, setRoleName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedModule, setSelectedModule] = useState<string | null>('products'); // Default to products
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const handleModuleSelect = (moduleId: string) => {
    if (moduleId === 'all') {
      // Handle 'All' selection logic if needed (e.g., show all permissions)
      setSelectedModule(null); // Or implement specific logic
    } else {
      setSelectedModule(moduleId);
    }
  };

  const handlePermissionChange = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAllModulePermissions = (moduleId: string | null) => {
    if (!moduleId || !permissionsByModule[moduleId]) return;
    const modulePermIds = permissionsByModule[moduleId].map(p => p.id);
    const allSelected = modulePermIds.every(id => selectedPermissions.includes(id));

    if (allSelected) {
      // Deselect all
      setSelectedPermissions(prev => prev.filter(id => !modulePermIds.includes(id)));
    } else {
      // Select all
      setSelectedPermissions(prev => [...new Set([...prev, ...modulePermIds])]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to save the role
    console.log('Saving role:', { roleName, description, selectedPermissions });
    // Redirect or show success message
  };

  const currentPermissions = selectedModule ? permissionsByModule[selectedModule] || [] : [];
  const areAllCurrentModulePermissionsSelected = selectedModule ? currentPermissions.every(p => selectedPermissions.includes(p.id)) && currentPermissions.length > 0 : false;


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       <div className="flex items-center gap-4 mb-4">
         <Link href="/settings/account/roles">
            <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
            </Button>
         </Link>
        <h1 className="text-lg font-semibold md:text-2xl">Add New Role</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="roleName">Role Name *</Label>
            <Input
              id="roleName"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              placeholder="Enter a brief description for this role"
            />
            <p className="text-right text-sm text-muted-foreground mt-1">
              {description.length} / 500
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permission Settings</CardTitle>
          <CardDescription>Changing permissions need to take effect after re-log in</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-6">
          {/* Modules List */}
          <div className="w-1/4 border-r pr-6">
            <h3 className="font-semibold mb-3">Modules</h3>
            <div className="space-y-2">
              {modules.map((module) => (
                <div key={module.id} className="flex items-center">
                  <Checkbox
                    id={`module-${module.id}`}
                    checked={selectedModule === module.id}
                    onCheckedChange={() => handleModuleSelect(module.id)}
                    className="mr-2"
                    // Disable 'All' checkbox for now or implement its logic
                    disabled={module.id === 'all'}
                  />
                  <Label htmlFor={`module-${module.id}`} className={`cursor-pointer ${selectedModule === module.id ? 'font-bold' : ''}`}>
                    {module.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Permissions */}
          <div className="w-3/4">
             <div className="flex items-center mb-3">
                 <Checkbox
                    id={`select-all-${selectedModule}`}
                    checked={areAllCurrentModulePermissionsSelected}
                    onCheckedChange={() => handleSelectAllModulePermissions(selectedModule)}
                    className="mr-2"
                    disabled={!selectedModule || currentPermissions.length === 0}
                  />
                  <Label htmlFor={`select-all-${selectedModule}`} className="font-semibold cursor-pointer">
                    Select All {selectedModule ? `(${permissionsByModule[selectedModule]?.length || 0})` : ''}
                  </Label>
             </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
              {currentPermissions.length > 0 ? (
                currentPermissions.map((permission) => (
                  <div key={permission.id} className="flex items-center">
                    <Checkbox
                      id={`perm-${permission.id}`}
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={() => handlePermissionChange(permission.id)}
                      className="mr-2"
                    />
                    <Label htmlFor={`perm-${permission.id}`} className="text-sm font-normal cursor-pointer">
                      {permission.name}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground col-span-full">
                  {selectedModule ? 'No permissions defined for this module.' : 'Select a module to see permissions.'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
         <Link href="/settings/account/roles">
            <Button type="button" variant="outline">Cancel</Button>
         </Link>
        <Button type="submit">Save Role</Button>
      </div>
    </form>
  );
}
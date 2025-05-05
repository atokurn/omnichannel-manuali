'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  // Add more states for other fields if needed (City, State, Postcode, Country)
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      // Assuming user.name is 'FirstName LastName'
      const nameParts = user.name?.split(' ') || ['', ''];
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      // Set other fields if available in user object
      // setPhone(user.phone || ''); 
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to update user profile
      // Example:
      // const response = await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ firstName, lastName, email, phone /*, other fields */ }),
      // });
      // if (!response.ok) throw new Error('Failed to update profile');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      console.log('Updated profile:', { firstName, lastName, email, phone });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="items-center">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="mt-2 h-6 w-3/4" />
                <Skeleton className="mt-1 h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          </div>
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2">
            <Skeleton className="mb-4 h-10 w-full" /> 
            <Card>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
                 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
                <Skeleton className="h-10 w-24 self-start" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div>Please log in to view account settings.</div>; // Or redirect
  }

  const getInitials = (name: string | undefined) => {
    if (!name) return '';
    const names = name.split(' ');
    return names.map((n) => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-4 p-4 md:p-2">
      <h1 className="text-lg font-semibold md:text-2xl">Settings</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Sidebar - Simplified Profile Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="items-center text-center flex justify-center flex-col"> {/* Added flex justify-center flex-col */} 
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatarUrl || undefined} alt={user.name || 'User'} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <CardTitle className="mt-2">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              {/* Add Tenant Name if available */}
              {user.tenant && <CardDescription className="mt-1">{user.tenant.name}</CardDescription>}
            </CardHeader>
            {/* Optional: Add other sidebar content if needed */}
            {/* <CardContent className="space-y-2">
              <Button variant="outline" className="w-full">View Public Profile</Button>
            </CardContent> */}
          </Card>
        </div>

        {/* Right Content Area - Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="account">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="company" disabled>Company</TabsTrigger> {/* Placeholder */} 
              <TabsTrigger value="notifications" disabled>Notifications</TabsTrigger> {/* Placeholder */}
            </TabsList>

            {/* Account Settings Tab */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                       <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1800-000-0000" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                      </div>
                    </div>
                    {/* Add City, State, Postcode, Country fields here if needed */}
                    {/* Example:
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State/County</Label>
                        <Input id="state" />
                      </div>
                    </div>
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="postcode">Postcode</Label>
                        <Input id="postcode" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" /> 
                      </div>
                    </div>
                    */}
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Placeholder for Company Settings Tab */}
            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle>Company Settings</CardTitle>
                  <CardDescription>Manage your company details (Placeholder).</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Company settings content goes here.</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Placeholder for Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Manage your notification preferences (Placeholder).</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Notification settings content goes here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
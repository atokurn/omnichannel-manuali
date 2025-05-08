'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface User {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  tenant: {
    id: string;
    name: string;
    plan: string;
    status: string;
  };
  roles: {
    id: string;
    name: string;
    permissions: {
      id: string;
      name: string;
      resource: string;
      action: string;
    }[];
  }[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fetcher function for React Query
const fetchCurrentUser = async (): Promise<User | null> => {
  try {
    const res = await fetch('/api/auth/me', {
      credentials: 'include',
    });
    if (!res.ok) {
      if (res.status === 401) {
        return null; // Not authenticated
      }
      throw new Error('Failed to fetch user');
    }
    const data = await res.json();
    return data.user;
  } catch (error) {
    console.error('Failed to fetch user', error);
    return null;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Use React Query to fetch and cache user data
  const { data: user, isLoading: loading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: fetchCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
  
  async function login(email: string, password: string) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }
      
      // Invalidate and refetch the currentUser query after successful login
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error', error);
      throw error;
    }
  }
  
  async function logout() {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST',
        credentials: 'include',
      });
      // Invalidate the currentUser query after logout
      queryClient.setQueryData(['currentUser'], null);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  }
  
  function hasPermission(resource: string, action: string) {
    if (!user) return false;
    
    return user.roles.some(role => 
      role.permissions.some(
        permission => 
          (permission.resource === resource || permission.resource === '*') && 
          (permission.action === action || permission.action === 'manage')
      )
    );
  }
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
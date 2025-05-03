'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    // Fetch current user on mount
    fetchCurrentUser();
  }, []);
  
  async function fetchCurrentUser() {
    try {
      setLoading(true);
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user', error);
    } finally {
      setLoading(false);
    }
  }
  
  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const data = await res.json();
      setUser(data.user);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }
  
  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error', error);
    }
  }
  
  function hasPermission(resource: string, action: string) {
    if (!user) return false;
    
    // Periksa apakah pengguna memiliki izin yang diperlukan
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
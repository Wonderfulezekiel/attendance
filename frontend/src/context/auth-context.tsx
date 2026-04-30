'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'student' | 'lecturer' | 'admin';
  avatar_url?: string;
  matric_number?: string;
  staff_number?: string;
  student_id?: string;
  lecturer_id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      // Try to restore user from localStorage first for instant load
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch { /* ignore parse errors */ }
      }
      
      if (token) {
        try {
          // Reset auth state before making the call
          api.resetAuthState();
          const userData = await api.get('/auth/me');
          setUser(userData);
          // Cache the user data for instant restore on refresh
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.warn('Auth verification failed (token invalid or expired)');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          // Redirect to login if on a protected route
          const path = window.location.pathname;
          if (path !== '/login' && path !== '/register' && path !== '/') {
            router.push('/login');
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [router]);

  const login = (token: string, userData: User) => {
    // Reset auth failure flag so API calls work again
    api.resetAuthState();
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    router.push(`/${userData.role}/dashboard`);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (e) {
      // Ignore logout errors
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    api.resetAuthState();
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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

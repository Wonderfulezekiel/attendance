'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth } from '@/context/auth-context';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  
  if (!user) return null; // Will be handled by ProtectedRoute

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-background flex flex-col md:flex-row">
        <Sidebar
          role="student"
          userName={user.full_name}
          userEmail={user.email}
        />

        <div className="flex-1 min-w-0 min-h-screen flex flex-col">
          <Header
            role="student"
            userName={user.full_name}
            notificationCount={3}
          />

          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-8 bg-dot-pattern">
            {children}
          </main>
        </div>

        <MobileNav role="student" />
      </div>
    </ProtectedRoute>
  );
}

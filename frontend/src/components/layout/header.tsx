'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  Bell,
  LogOut,
  Settings,
  User,
  ScanLine,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Dropdown } from '@/components/ui/dropdown';
import { SearchInput } from '@/components/ui/search-input';
import { navConfig } from '@/components/layout/sidebar';
import type { UserRole } from '@/types';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';

interface HeaderProps {
  role: UserRole;
  userName: string;
  title?: string;
  notificationCount?: number;
}

export function Header({
  role,
  userName,
  title,
  notificationCount = 0,
}: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [realNotificationCount, setRealNotificationCount] = useState(notificationCount);
  const [search, setSearch] = useState('');

  // Fetch real notifications based on role
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        if (role === 'student') {
          const res = await api.get('/alerts/my-alerts');
          const unread = (res || []).filter((a: any) => !a.is_read && !a.read).length;
          setRealNotificationCount(unread);
        } else if (role === 'lecturer') {
          const res = await api.get('/alerts/lecturer-alerts');
          setRealNotificationCount(res?.length || 0);
        } else if (role === 'admin') {
          const res = await api.get('/admin/alerts');
          setRealNotificationCount(res?.filter((a: any) => a.status === 'active').length || 0);
        }
      } catch (e) {
        console.error('Failed to fetch alerts:', e);
      }
    };
    fetchAlerts();
  }, [role]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    
    // Simple navigation based on role
    if (role === 'admin') {
      router.push(`/admin/users?search=${encodeURIComponent(search)}`);
    } else if (role === 'lecturer') {
      router.push(`/lecturer/dashboard?search=${encodeURIComponent(search)}`);
    } else if (role === 'student') {
      router.push(`/student/courses?search=${encodeURIComponent(search)}`);
    }
  };

  const getAlertLink = () => {
    if (role === 'student') return '/student/alerts';
    if (role === 'lecturer') return '/lecturer/dashboard';
    return '/admin/alerts';
  };

  const userMenuItems = [
    {
      label: 'Profile',
      icon: <User className="w-4 h-4" />,
      onClick: () => {},
    },
    {
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => {},
    },
    { label: '', onClick: () => {}, divider: true },
    {
      label: 'Sign Out',
      icon: <LogOut className="w-4 h-4" />,
      onClick: logout,
      danger: true,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-md border-b border-border/50 flex items-center px-4 md:px-6 gap-4">
        {/* Mobile brand - Centered */}
        <div className="md:hidden absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="w-7 h-7 bg-primary text-primary-foreground flex items-center justify-center rounded-sm">
              <ScanLine className="w-4 h-4" />
            </div>
            <span className="text-base font-bold text-foreground">
              Attendance
            </span>
          </div>
        </div>

        {/* Title */}
        {title && (
          <h1 className="hidden md:block text-lg font-semibold text-foreground">
            {title}
          </h1>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search (desktop only) */}
        <form onSubmit={handleSearch} className="hidden lg:block">
          <SearchInput
            placeholder="Search..."
            containerClassName="w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        {/* Notifications (desktop only) */}
        <Link href={getAlertLink()} className="hidden md:block relative p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted hover:bg-muted/80 transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
          {realNotificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center rounded-full bg-accent text-[9px] font-bold text-primary">
              {realNotificationCount > 9 ? '9+' : realNotificationCount}
            </span>
          )}
        </Link>

        {/* User menu */}
        <div className="block pointer-events-auto relative z-50">
          <Dropdown
            trigger={
              <div className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted hover:bg-muted/80 transition-colors cursor-pointer">
                <Avatar name={userName} size="sm" />
                <span className="hidden sm:block text-sm font-medium text-foreground">
                  {userName}
                </span>
              </div>
            }
            items={userMenuItems}
          />
        </div>
      </header>
    </>
  );
}

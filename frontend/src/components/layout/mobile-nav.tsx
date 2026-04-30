'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  QrCode,
  History,
  Bell,
  Users,
  Radio,
  FileBarChart,
  BarChart3,
  User,
} from 'lucide-react';
import type { UserRole } from '@/types';

const mobileNavConfig: Record<UserRole, { label: string; href: string; icon: React.ReactNode }[]> = {
  student: [
    { label: 'Home', href: '/student/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Courses', href: '/student/courses', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Attend', href: '/student/attendance', icon: <QrCode className="w-5 h-5" /> },
    { label: 'History', href: '/student/history', icon: <History className="w-5 h-5" /> },
    { label: 'Alerts', href: '/student/alerts', icon: <Bell className="w-5 h-5" /> },
    { label: 'Profile', href: '#', icon: <User className="w-5 h-5" /> },
  ],
  lecturer: [
    { label: 'Home', href: '/lecturer/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Sessions', href: '/lecturer/sessions', icon: <Radio className="w-5 h-5" /> },
    { label: 'Create', href: '/lecturer/create-session', icon: <QrCode className="w-5 h-5" /> },
    { label: 'Live', href: '/lecturer/live', icon: <Radio className="w-5 h-5" /> },
    { label: 'Reports', href: '/lecturer/reports', icon: <FileBarChart className="w-5 h-5" /> },
    { label: 'Profile', href: '#', icon: <User className="w-5 h-5" /> },
  ],
  admin: [
    { label: 'Home', href: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Courses', href: '/admin/courses', icon: <BookOpen className="w-5 h-5" /> },
    { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Alerts', href: '/admin/alerts', icon: <Bell className="w-5 h-5" /> },
    { label: 'Profile', href: '#', icon: <User className="w-5 h-5" /> },
  ],
};

interface MobileNavProps {
  role: UserRole;
}

export function MobileNav({ role }: MobileNavProps) {
  const pathname = usePathname();
  const items = mobileNavConfig[role];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/50">
      <div className="flex items-center justify-start sm:justify-around overflow-x-auto hide-scrollbar px-2 py-1.5 gap-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md transition-colors min-w-[56px]',
                isActive
                  ? 'text-primary/80'
                  : 'text-muted-foreground hover:text-muted-foreground'
              )}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

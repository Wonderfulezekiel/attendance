'use client';

import React, { useState } from 'react';
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
  PlusCircle,
  Radio,
  FileBarChart,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ScanLine,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import type { UserRole, NavItem } from '@/types';

const iconMap: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard className="w-5 h-5" />,
  courses: <BookOpen className="w-5 h-5" />,
  attendance: <QrCode className="w-5 h-5" />,
  history: <History className="w-5 h-5" />,
  alerts: <Bell className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
  sessions: <Radio className="w-5 h-5" />,
  'create-session': <PlusCircle className="w-5 h-5" />,
  live: <Radio className="w-5 h-5" />,
  reports: <FileBarChart className="w-5 h-5" />,
  analytics: <BarChart3 className="w-5 h-5" />,
};

const navConfig: Record<UserRole, NavItem[]> = {
  student: [
    { label: 'Dashboard', href: '/student/dashboard', icon: 'dashboard' },
    { label: 'My Courses', href: '/student/courses', icon: 'courses' },
    { label: 'Mark Attendance', href: '/student/attendance', icon: 'attendance' },
    { label: 'History', href: '/student/history', icon: 'history' },
    { label: 'Alerts', href: '/student/alerts', icon: 'alerts', badge: 3 },
  ],
  lecturer: [
    { label: 'Dashboard', href: '/lecturer/dashboard', icon: 'dashboard' },
    { label: 'Sessions', href: '/lecturer/sessions', icon: 'sessions' },
    { label: 'New Session', href: '/lecturer/create-session', icon: 'create-session' },
    { label: 'Live View', href: '/lecturer/live', icon: 'live' },
    { label: 'Reports', href: '/lecturer/reports', icon: 'reports' },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Users', href: '/admin/users', icon: 'users' },
    { label: 'Courses', href: '/admin/courses', icon: 'courses' },
    { label: 'Analytics', href: '/admin/analytics', icon: 'analytics' },
    { label: 'Alerts', href: '/admin/alerts', icon: 'alerts' },
  ],
};

interface SidebarProps {
  role: UserRole;
  userName: string;
  userEmail: string;
}

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const items = navConfig[role];

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col h-screen bg-card border-r border-border/50 transition-all duration-300 ease-in-out sticky top-0 shrink-0 z-40',
        collapsed ? 'w-[var(--sidebar-collapsed)]' : 'w-[var(--sidebar-width)]'
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border/50 shrink-0">
        <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-sm shrink-0">
          <ScanLine className="w-5 h-5" />
        </div>
        {!collapsed && (
          <span className="text-lg font-bold text-foreground tracking-tight">
            Attendance
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-primary/12 text-primary/80 border-l-2 border-primary/80'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted hover:bg-muted/80 border-l-2 border-transparent'
              )}
              title={collapsed ? item.label : undefined}
            >
              <span className={cn('shrink-0', isActive && 'text-primary/80')}>
                {iconMap[item.icon]}
              </span>
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="w-5 h-5 flex items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border/50 p-3 shrink-0">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <Avatar name={userName} size="sm" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-popover border border-border flex items-center justify-center text-muted-foreground hover:text-primary/80 hover:border-primary/50 transition-colors cursor-pointer z-50"
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </aside>
  );
}

export { navConfig, iconMap };

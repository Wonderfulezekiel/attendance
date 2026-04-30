'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Users, BookOpen, AlertTriangle, ShieldCheck, TrendingUp, CheckCircle, Clock, GraduationCap, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AttendanceChart } from '@/components/charts/attendance-chart';
import { getRelativeTime, getGreeting } from '@/lib/utils';
import { api } from '@/lib/api';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const departmentData = [
    { label: 'Computer Science', value: 85 },
    { label: 'Software Eng.', value: 78 },
    { label: 'Cyber Security', value: 82 },
    { label: 'Info Tech', value: 71 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, alertsData] = await Promise.all([
          api.get('/reports/dashboard-stats'),
          api.get('/admin/alerts')
        ]);
        setStats(statsData);
        setRecentAlerts((alertsData || []).slice(0, 4));
      } catch (error) {
        console.warn('Failed to fetch admin dashboard data (likely unauthenticated):', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title={`${getGreeting()}, ${user?.full_name?.split(' ')[0] || 'Admin'}`}
        description="Platform overview and key metrics."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        <StatCard label="Total Students" value={stats?.total_students || 0} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Total Lecturers" value={stats?.total_lecturers || 0} icon={<UserCheck className="w-5 h-5" />} />
        <StatCard label="Active Courses" value={stats?.active_courses || 0} icon={<BookOpen className="w-5 h-5" />} />
        <StatCard label="System Attendance" value={stats?.overall_attendance || '0%'} change="+2% vs last semester" changeType="positive" icon={<TrendingUp className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Department comparison */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Attendance by Department</CardTitle>
            <Badge variant="gray" size="sm">Last 30 days</Badge>
          </CardHeader>
          <AttendanceChart data={departmentData} />
        </Card>

        {/* Recent alerts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <Link href="/admin/alerts" className="text-xs text-primary/80 hover:text-primary/60 transition-colors">
              View all
            </Link>
          </CardHeader>
          <div className="space-y-2">
            {recentAlerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted hover:bg-muted/80 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${alert.type === 'critical' ? 'bg-destructive/15 text-destructive' : 'bg-amber-500/15 text-amber-500'}`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{alert.student}</p>
                  <p className="text-xs text-muted-foreground">{alert.course}</p>
                </div>
                <Badge variant={alert.type === 'critical' ? 'red' : 'amber'} size="sm">{alert.percent}%</Badge>
              </div>
            ))}
            {recentAlerts.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-sm">No active alerts.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

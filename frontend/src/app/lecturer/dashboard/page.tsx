'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { AttendanceChart } from '@/components/charts/attendance-chart';
import { formatDateTime, getGreeting } from '@/lib/utils';
import { Radio, Users, TrendingUp, AlertTriangle, PlusCircle } from 'lucide-react';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function LecturerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [todaySessions, setTodaySessions] = useState<any[]>([]);
  const [atRisk, setAtRisk] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, sessionsData, alertsData] = await Promise.all([
          api.get('/reports/dashboard-stats'),
          api.get('/sessions'),
          api.get('/alerts/lecturer-alerts').catch(() => [])
        ]);
        setStats(statsData);
        
        // Filter sessions for today
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
        const todaySess = (sessionsData || []).filter((s: any) => s.start_time >= startOfDay);
        
        setTodaySessions(todaySess.map((s: any) => ({
          id: s.id,
          course: s.courses?.course_code || 'Unknown',
          title: s.courses?.course_title || 'Unknown',
          code: s.session_code,
          status: s.status,
          students: s.students_attended || 0,
          total: s.total_students || 0,
          time: s.start_time
        })));

        // Use real at-risk students data
        setAtRisk(alertsData || []);

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
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
        title={`${getGreeting()}, ${user?.full_name?.split(' ')[0] || 'Lecturer'}`}
        description="Here is what is happening across your courses today."
        actions={
          <Link href="/lecturer/create-session">
            <Button icon={<PlusCircle className="w-4 h-4" />}>Start Session</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
        <StatCard label="Total Sessions" value={stats?.total_sessions || 0} icon={<Radio className="w-5 h-5" />} />
        <StatCard label="Students Monitored" value={stats?.students_monitored || 0} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Avg Attendance" value={stats?.avg_attendance || '0%'} icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard label="At-Risk Students" value={stats?.at_risk_students || 0} changeType={stats?.at_risk_students > 0 ? "negative" : "positive"} icon={<AlertTriangle className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Today's sessions */}
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>Today&apos;s Sessions</CardTitle></CardHeader>
          <div className="space-y-3">
            {todaySessions.map((s) => (
              <div key={s.id} className="flex items-center gap-4 p-3 rounded-md bg-background/50 border border-border/50 hover:border-border transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${s.status === 'active' ? 'bg-primary/15 text-primary/80 animate-pulse-teal' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}>
                  <Radio className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                    <span className="text-sm font-semibold text-foreground shrink-0">{s.course}</span>
                    <span className="text-xs sm:text-sm text-muted-foreground truncate">{s.title}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 sm:mt-0.5">
                    <span className="text-xs font-mono text-primary/80 shrink-0">{s.code}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{s.students}/{s.total} students</span>
                  </div>
                </div>
                <Badge variant={s.status === 'active' ? 'teal' : 'gray'} dot>{s.status === 'active' ? 'Active' : 'Ended'}</Badge>
              </div>
            ))}
            {todaySessions.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-sm">No sessions today.</div>
            )}
          </div>
        </Card>

        {/* At risk */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>At-Risk Students</CardTitle></CardHeader>
          <div className="space-y-2">
            {atRisk.map((s, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted hover:bg-muted/80 transition-colors">
                <Avatar name={s.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.matric} · {s.course}</p>
                </div>
                <Badge variant={s.percent < 65 ? 'red' : 'amber'} size="sm">{s.percent}%</Badge>
              </div>
            ))}
            {atRisk.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-sm">No at-risk students currently.</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';
import { AttendanceChart } from '@/components/charts/attendance-chart';
import { getGreeting, formatDateTime } from '@/lib/utils';
import { CheckCircle, Clock, QrCode, TrendingUp, BookOpen, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [courseAttendance, setCourseAttendance] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, coursesData, activityData] = await Promise.all([
          api.get('/reports/dashboard-stats'),
          api.get('/attendance/course-summary'),
          api.get('/attendance/student/me')
        ]);
        setStats(statsData);
        setCourseAttendance(coursesData || []);
        
        // Get top 5 recent activities
        setRecentActivity((activityData || []).slice(0, 5).map((a: any) => ({
          id: a.id,
          course: a.attendance_sessions?.courses?.course_title || 'Unknown',
          date: a.check_in_time,
          status: a.status === 'present' ? 'present' : 'absent',
        })));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const hasWarning = courseAttendance.some((c) => c.percent < 75);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      {hasWarning && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
          <div className="flex items-start gap-3 flex-1">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm font-medium">
              Warning: Your attendance in one or more courses has dropped below the 75% threshold.
            </div>
          </div>
          <Link href="/student/alerts" className="w-full sm:w-auto mt-2 sm:mt-0">
            <Button variant="danger" size="sm" className="w-full sm:w-auto">
              View Alerts
            </Button>
          </Link>
        </div>
      )}

      <PageHeader
        title={`${getGreeting()}, ${user?.full_name?.split(' ')[0] || 'Student'}`}
        description="Here's your attendance overview for this semester."
        actions={
          <Link href="/student/attendance">
            <Button icon={<QrCode className="w-4 h-4" />}>
              Mark Attendance
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 stagger-children">
        <StatCard label="Overall Attendance" value={stats?.overall_attendance || '0%'} change="+2% vs last month" changeType="positive" icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard label="Courses Enrolled" value={stats?.courses_enrolled || 0} icon={<BookOpen className="w-5 h-5" />} />
        <StatCard label="Active Alerts" value={stats?.active_alerts || 0} change={hasWarning ? 'Needs attention' : 'All good'} changeType={hasWarning ? 'negative' : 'positive'} icon={<AlertTriangle className="w-5 h-5" />} />
      </div>

      {/* Course Attendance + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Course attendance - takes more space */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Course Attendance</CardTitle>
            <Link href="/student/courses" className="text-xs text-primary/80 hover:text-primary/60 transition-colors">
              View all
            </Link>
          </CardHeader>
          <div className="space-y-5">
            {courseAttendance.map((c, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground font-medium truncate max-w-[70%]">
                    {c.title}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">
                      {c.attended}/{c.total}
                    </span>
                    <Badge
                      variant={c.percent >= 75 ? 'green' : c.percent >= 60 ? 'amber' : 'red'}
                      size="sm"
                    >
                      {c.percent}%
                    </Badge>
                  </div>
                </div>
                <ProgressBar value={c.percent} />
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <Link href="/student/history" className="text-xs text-primary/80 hover:text-primary/60 transition-colors">
              View all
            </Link>
          </CardHeader>
          <div className="space-y-2">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted hover:bg-muted/80 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    item.status === 'present'
                      ? 'bg-primary/15 text-primary'
                      : 'bg-destructive/15 text-destructive'
                  }`}
                >
                  {item.status === 'present' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground font-medium">
                    {item.course}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(item.date)}
                  </p>
                </div>
                <Badge
                  variant={item.status === 'present' ? 'green' : 'red'}
                  size="sm"
                >
                  {item.status === 'present' ? 'Present' : 'Absent'}
                </Badge>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No recent activity.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

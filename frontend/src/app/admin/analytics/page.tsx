'use client';

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AttendanceChart } from '@/components/charts/attendance-chart';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Download, TrendingUp, Users, BookOpen, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { exportCSV, exportPDF } from '@/lib/export';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setData(res);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading analytics...</div>;
  }

  // Use real API data
  const courseComparison = data?.courseComparison?.length ? data.courseComparison : [
    { label: 'No data yet', value: 0 }
  ];
  
  const weeklyTrend = data?.weeklyTrend?.length ? data.weeklyTrend : [
    { label: 'No data yet', value: 0 }
  ];

  const overallAvg = data?.overallAvg ?? 0;
  const totalStudents = data?.totalStudents ?? 0;
  const totalLecturers = data?.totalLecturers ?? 0;
  const atRiskCount = data?.atRiskCount ?? 0;

  // Find best and worst performing courses
  const sortedCourses = [...courseComparison].sort((a, b) => b.value - a.value);
  const bestCourse = sortedCourses[0]?.label?.split(' - ')[0] || 'N/A';
  const bestCourseAvg = sortedCourses[0]?.value ?? 0;
  const worstCourse = sortedCourses.length > 1 ? sortedCourses[sortedCourses.length - 1]?.label?.split(' - ')[0] : 'N/A';
  const worstCourseAvg = sortedCourses.length > 1 ? sortedCourses[sortedCourses.length - 1]?.value : 0;

  const handleExportReport = () => {
    if (!courseComparison.length) return;
    exportPDF(
      'System Analytics Report',
      ['Course', 'Average Attendance %'],
      courseComparison.map((c: any) => [c.label, `${c.value}%`]),
      'system_analytics'
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="System Analytics"
        description="Deep dive into university-wide attendance metrics and trends."
        actions={
          <Button variant="secondary" icon={<Download className="w-4 h-4" />} onClick={handleExportReport}>
            Export Full Report
          </Button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger-children">
        <StatCard label="Overall Average" value={`${overallAvg}%`} icon={<TrendingUp className="w-5 h-5 text-green-500" />} />
        <StatCard label="Total Students" value={totalStudents} icon={<Users className="w-5 h-5 text-teal-500" />} />
        <StatCard label="Total Lecturers" value={totalLecturers} icon={<BookOpen className="w-5 h-5 text-blue-500" />} />
        <StatCard label="At-Risk Students" value={atRiskCount} changeType={atRiskCount > 0 ? 'negative' : 'positive'} icon={<AlertTriangle className="w-5 h-5 text-amber-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="flex-col items-start gap-1">
            <CardTitle>Attendance by Course</CardTitle>
            <p className="text-sm text-muted-foreground">Average attendance percentage for each course</p>
          </CardHeader>
          <div className="p-6 pt-0 h-80">
            <AttendanceChart data={courseComparison} />
          </div>
        </Card>

        <Card>
          <CardHeader className="flex-col items-start gap-1">
            <CardTitle>Weekly Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Overall attendance trend over the last 4 weeks</p>
          </CardHeader>
          <div className="p-6 pt-0 h-80">
            <AttendanceChart data={weeklyTrend} />
          </div>
        </Card>
      </div>

      {/* Course Breakdown */}
      <Card>
        <CardHeader className="flex-col items-start gap-1 mb-0">
          <CardTitle>Course Performance Breakdown</CardTitle>
          <p className="text-sm text-muted-foreground">Attendance statistics for each registered course</p>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-y border-border/50">
              <tr>
                <th className="px-6 py-4 font-medium">Course</th>
                <th className="px-6 py-4 font-medium text-right">Avg Attendance</th>
                <th className="px-6 py-4 font-medium">Progress</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {courseComparison.map((course: any, i: number) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{course.label}</td>
                  <td className="px-6 py-4 text-right font-medium text-foreground">{course.value}%</td>
                  <td className="px-6 py-4 w-32">
                    <ProgressBar value={course.value} size="sm" />
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={course.value >= 80 ? 'green' : course.value >= 75 ? 'teal' : 'red'}>
                      {course.value >= 80 ? 'Excellent' : course.value >= 75 ? 'Good' : 'Needs Review'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

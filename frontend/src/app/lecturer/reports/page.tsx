'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { AttendanceChart } from '@/components/charts/attendance-chart';
import { Avatar } from '@/components/ui/avatar';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Download, FileText } from 'lucide-react';
import { exportCSV, exportPDF } from '@/lib/export';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function ReportsPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [reportData, setReportData] = useState<{ sessionData: any[], studentReport: any[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api.get('/courses');
        const formatted = (data || []).map((c: any) => ({
          value: c.id,
          label: `${c.course_code} — ${c.course_title}`
        }));
        setCourses(formatted);
        if (formatted.length > 0) {
          setSelectedCourse(formatted[0].value);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchReport = async () => {
      if (!selectedCourse) return;
      try {
        const data = await api.get(`/reports/course-report/${selectedCourse}`);
        setReportData(data);
      } catch (error) {
        console.error('Failed to fetch report:', error);
      }
    };
    fetchReport();
  }, [selectedCourse]);

  const handleExportCSV = () => {
    if (!reportData?.studentReport?.length) return;
    const courseName = courses.find(c => c.value === selectedCourse)?.label || 'Report';
    exportCSV(
      reportData.studentReport.map(s => ({
        'Student Name': s.name,
        'Matric Number': s.matric,
        'Classes Attended': s.attended,
        'Total Classes': s.total,
        'Attendance %': `${s.percent}%`
      })),
      `attendance_report_${courseName.replace(/[^a-zA-Z0-9]/g, '_')}`
    );
  };

  const handleExportPDF = () => {
    if (!reportData?.studentReport?.length) return;
    const courseName = courses.find(c => c.value === selectedCourse)?.label || 'Report';
    exportPDF(
      `Attendance Report — ${courseName}`,
      ['Student', 'Matric No.', 'Attended', 'Total', '%'],
      reportData.studentReport.map(s => [s.name, s.matric, String(s.attended), String(s.total), `${s.percent}%`]),
      `attendance_report`
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading reports...</div>;
  }

  const sessionData = reportData?.sessionData || [];
  const studentReport = reportData?.studentReport || [];

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Attendance Reports"
        description="View and export attendance data for your courses."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExportCSV}>CSV</Button>
            <Button variant="secondary" size="sm" icon={<FileText className="w-4 h-4" />} onClick={handleExportPDF}>PDF</Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <Select
          options={courses}
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="w-64"
        />
        <Select
          options={[
            { value: 'all', label: 'All Time' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
          ]}
          className="w-40"
        />
      </div>

      {/* Attendance trend */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Attendance by Session</CardTitle></CardHeader>
        <AttendanceChart data={sessionData} />
      </Card>

      {/* Per-student report */}
      <Card>
        <CardHeader>
          <CardTitle>Student Attendance</CardTitle>
          <Badge variant="gray" size="sm">{studentReport.length} students</Badge>
        </CardHeader>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-2.5">Student</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-2.5">Matric No.</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-2.5">Attended</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-4 py-2.5">Progress</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase px-4 py-2.5">%</th>
              </tr>
            </thead>
            <tbody>
              {studentReport.map((s, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 flex items-center gap-2.5">
                    <Avatar name={s.name} size="sm" />
                    <span className="text-foreground font-medium">{s.name}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{s.matric}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.attended}/{s.total}</td>
                  <td className="px-4 py-3 w-32"><ProgressBar value={s.percent} size="sm" /></td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant={s.percent >= 75 ? 'green' : s.percent >= 60 ? 'amber' : 'red'} size="sm">{s.percent}%</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden space-y-2">
          {studentReport.map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-md bg-background/50">
              <Avatar name={s.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.matric} · {s.attended}/{s.total} classes</p>
              </div>
              <Badge variant={s.percent >= 75 ? 'green' : s.percent >= 60 ? 'amber' : 'red'} size="sm">{s.percent}%</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

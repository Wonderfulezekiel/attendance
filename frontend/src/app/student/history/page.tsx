'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate, formatTime } from '@/lib/utils';
import { Download, CheckCircle, XCircle } from 'lucide-react';
import { Select } from '@/components/ui/input';
import { exportCSV } from '@/lib/export';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function AttendanceHistory() {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.get('/attendance/student/me');
        const formatted = (data || []).map((r: any) => ({
          id: r.id,
          course: r.attendance_sessions?.courses?.course_code || 'Unknown',
          title: r.attendance_sessions?.courses?.course_title || 'Unknown',
          date: r.check_in_time,
          session: r.attendance_sessions?.session_code || 'Unknown',
          status: r.status
        }));
        setHistoryData(formatted);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const courses = Array.from(new Set(historyData.map(h => h.course)));
  const options = [
    { value: 'all', label: 'All Courses' },
    ...courses.map(c => ({ value: c, label: c }))
  ];

  const filteredHistory = filter === 'all' ? historyData : historyData.filter(h => h.course === filter);

  const handleExport = () => {
    if (!filteredHistory.length) return;
    exportCSV(
      filteredHistory.map(r => ({
        'Date': formatDate(r.date),
        'Course': `${r.course} - ${r.title}`,
        'Session Code': r.session,
        'Time': r.status === 'present' ? formatTime(r.date) : 'N/A',
        'Status': r.status === 'present' ? 'Present' : 'Absent'
      })),
      'my_attendance_history'
    );
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading history...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Attendance History"
        description="View your attendance records."
        actions={<Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />} onClick={handleExport}>Export</Button>}
      />

      <div className="mb-6">
        <Select
          options={options}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Desktop table */}
      <Card padding="none" className="hidden md:block overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Date</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Course</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Session</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Time</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((r) => (
              <tr key={r.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                <td className="px-5 py-3.5 text-foreground">{formatDate(r.date)}</td>
                <td className="px-5 py-3.5"><span className="text-foreground font-medium">{r.course}</span> <span className="text-muted-foreground">{r.title}</span></td>
                <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">{r.session}</td>
                <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">{r.status === 'present' ? formatTime(r.date) : '—'}</td>
                <td className="px-5 py-3.5"><Badge variant={r.status === 'present' ? 'green' : 'red'} dot size="sm">{r.status === 'present' ? 'Present' : 'Absent'}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filteredHistory.map((r) => (
          <Card key={r.id} padding="sm" className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${r.status === 'present' ? 'bg-primary/15 text-primary' : 'bg-destructive/15 text-destructive'}`}>
              {r.status === 'present' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{r.course} — {r.title}</p>
              <p className="text-xs text-muted-foreground">{formatDate(r.date)} · {r.session}</p>
            </div>
            <Badge variant={r.status === 'present' ? 'green' : 'red'} size="sm">{r.status === 'present' ? 'Present' : 'Absent'}</Badge>
          </Card>
        ))}
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm">No attendance records found.</p>
        </div>
      )}
    </div>
  );
}

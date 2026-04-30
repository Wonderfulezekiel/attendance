'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/input';
import { formatDate, formatTime } from '@/lib/utils';
import { Radio, Users } from 'lucide-react';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function LecturerSessions() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await api.get('/sessions');
        const formatted = (data || []).map((s: any) => ({
          id: s.id,
          course: s.courses?.course_code || 'Unknown',
          title: s.courses?.course_title || 'Unknown',
          code: s.session_code,
          date: s.start_time,
          duration: `${Math.round((new Date(s.expiry_time).getTime() - new Date(s.start_time).getTime()) / 60000)} min`,
          students: s.students_attended || 0,
          total: s.total_students || 0,
          status: s.status
        }));
        setSessions(formatted);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter((s) => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (search && !s.course.toLowerCase().includes(search.toLowerCase()) && !s.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading sessions...</div>;
  }
  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Sessions" description="Manage your attendance sessions." />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <SearchInput placeholder="Search sessions..." containerClassName="w-56" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select options={[{ value: 'all', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'ended', label: 'Ended' }]} className="w-36" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
      </div>

      <div className="space-y-3 stagger-children">
        {filteredSessions.map((s) => (
          <Card key={s.id} hover padding="md" className={s.status === 'active' ? 'border-primary/30 teal-glow' : ''}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${s.status === 'active' ? 'bg-primary/15 text-primary/80' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}>
                <Radio className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{s.course}</span>
                  <span className="text-xs font-mono text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded">{s.code}</span>
                  <Badge variant={s.status === 'active' ? 'teal' : s.status === 'ended' ? 'gray' : 'amber'} dot size="sm">{s.status}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{formatDate(s.date)}</span>
                  <span>{formatTime(s.date)}</span>
                  <span>{s.duration}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{s.students}/{s.total}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {filteredSessions.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm border rounded-md">No sessions found.</div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/input';
import { QRDisplay } from '@/components/attendance/qr-display';
import { SessionTimer } from '@/components/attendance/session-timer';
import { cn } from '@/lib/utils';
import { Radio, Clock, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const durationOptions = [
  { value: '15', label: '15 minutes' },
  { value: '30', label: '30 minutes' },
  { value: '45', label: '45 minutes' },
  { value: '60', label: '60 minutes' },
];

export default function CreateSessionPage() {
  const router = useRouter();
  const [step, setStep] = useState<'config' | 'active'>('config');
  const [course, setCourse] = useState('');
  const [duration, setDuration] = useState('30');
  const [loading, setLoading] = useState(false);
  const [courseOptions, setCourseOptions] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api.get('/courses');
        setCourseOptions([
          { value: '', label: 'Select a course...' },
          ...(data || []).map((c: any) => ({
            value: c.id,
            label: `${c.course_code} — ${c.course_title}`
          }))
        ]);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const handleCreate = async () => {
    if (!course) return;
    setLoading(true);
    try {
      const res = await api.post('/sessions', {
        course_id: course,
        duration_minutes: parseInt(duration),
      });
      router.push(`/lecturer/live?id=${res.id}`);
    } catch (error: any) {
      console.error('Failed to start session:', error);
      setErrorMsg(error.message || 'Failed to start session.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Start Session" description="Create a new attendance session for your course." />

      <Card padding="lg">
        <div className="space-y-5">
          <Select 
            label="Course" 
            options={courseOptions} 
            value={course} 
            onChange={(e) => setCourse(e.target.value)} 
            disabled={loadingCourses}
          />
          <Select label="Duration" options={durationOptions} value={duration} onChange={(e) => setDuration(e.target.value)} />

          <div className="p-4 bg-background rounded-md border border-border/50">
            <p className="text-sm text-foreground font-medium mb-1">Session Settings</p>
            <p className="text-xs text-muted-foreground mb-3">These settings will be applied to the session.</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/60" />QR code refreshes every 15 seconds</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/60" />Location verification enabled</li>
              <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary/60" />Students can only join while session is active</li>
            </ul>
          </div>

          {errorMsg && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {errorMsg}
            </div>
          )}

          <Button className="w-full" size="lg" onClick={handleCreate} disabled={!course || loading} loading={loading}>
            Start Session
          </Button>
        </div>
      </Card>
    </div>
  );
}

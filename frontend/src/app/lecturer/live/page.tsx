'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QRDisplay } from '@/components/attendance/qr-display';
import { SessionTimer } from '@/components/attendance/session-timer';
import { StudentList } from '@/components/attendance/student-list';
import { Badge } from '@/components/ui/badge';
import { Radio, StopCircle } from 'lucide-react';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function LiveViewPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [sessionData, setSessionData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const errorCountRef = useRef(0);

  const fetchSessionData = useCallback(async () => {
    try {
      if (id) {
        const [allSessions, studentsData] = await Promise.all([
          api.get('/sessions'),
          api.get(`/sessions/${id}/students`)
        ]);
        const session = allSessions.find((s: any) => s.id === id);
        if (session) setSessionData(session);
        setStudents(studentsData || []);
        errorCountRef.current = 0; // Reset error count on success
        setError('');
      } else {
        // Auto-find active session
        const allSessions = await api.get('/sessions');
        const activeSession = allSessions.find((s: any) => s.status === 'active');
        if (activeSession) {
          router.replace(`/lecturer/live?id=${activeSession.id}`);
        }
      }
    } catch (err: any) {
      errorCountRef.current++;
      console.error('Failed to fetch session data:', err);
      
      // If we get repeated auth errors, stop polling to prevent flood
      if (errorCountRef.current >= 3) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setError('Connection lost. Please refresh the page or log in again.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchSessionData();
    intervalRef.current = setInterval(fetchSessionData, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchSessionData]);

  const endSession = async () => {
    if (!id) return;
    try {
      await api.post(`/sessions/${id}/end`, {});
      if (intervalRef.current) clearInterval(intervalRef.current);
      router.push('/lecturer/dashboard');
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  if (!id) {
    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Checking for active sessions...</div>;
    return (
      <div className="p-12 text-center">
        <StopCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">No Active Session</h3>
        <p className="text-muted-foreground mb-6">There is currently no active live session.</p>
        <Button onClick={() => router.push('/lecturer/create-session')}>
          Start New Session
        </Button>
      </div>
    );
  }

  if (loading && !sessionData) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading live session...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Live Session"
        description={`${sessionData?.courses?.course_code} — ${sessionData?.courses?.course_title}`}
        actions={
          <div className="flex items-center gap-3">
            <Badge variant="teal" dot size="md">{sessionData?.status === 'active' ? 'Active' : 'Ended'}</Badge>
            {sessionData?.status === 'active' && (
              <Button variant="danger" size="sm" icon={<StopCircle className="w-4 h-4" />} onClick={endSession}>
                End Session
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
          {error}
          <Button variant="ghost" size="sm" className="ml-2" onClick={() => { errorCountRef.current = 0; setError(''); fetchSessionData(); intervalRef.current = setInterval(fetchSessionData, 5000); }}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — QR + Timer */}
        <div className="lg:col-span-2 space-y-4">
          {sessionData?.status === 'active' ? (
            <>
              <Card padding="lg" glow className="flex flex-col items-center">
                <QRDisplay
                  value={sessionData?.qr_code_value || ''}
                  sessionCode={sessionData?.session_code || ''}
                  size={180}
                />
              </Card>

              <Card padding="md" className="flex flex-col items-center py-6">
                <SessionTimer expiryTime={sessionData?.expiry_time} size="md" />
              </Card>
            </>
          ) : (
            <Card padding="lg" className="flex flex-col items-center justify-center text-center py-12">
              <StopCircle className="w-12 h-12 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium text-foreground">Session Ended</h3>
              <p className="text-sm text-muted-foreground">This attendance session is no longer active.</p>
            </Card>
          )}
        </div>

        {/* Right — Student list */}
        <Card className="lg:col-span-3">
          <StudentList
            students={students}
            totalEnrolled={sessionData?.total_students || 0}
          />
        </Card>
      </div>
    </div>
  );
}

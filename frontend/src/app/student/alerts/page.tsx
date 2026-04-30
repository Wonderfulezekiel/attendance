'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, BookOpen, CheckCircle } from 'lucide-react';
import { getRelativeTime } from '@/lib/utils';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function StudentAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const data = await api.get('/alerts/my-alerts');
      const formatted = (data || []).map((a: any) => ({
        id: a.id,
        course: a.courses?.course_code || 'Unknown',
        title: a.courses?.course_title || 'Unknown',
        percent: a.attendance_percentage || 0,
        message: a.message,
        type: a.alert_type,
        read: a.is_read,
        date: a.created_at
      }));
      setAlerts(formatted);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const markAllRead = async () => {
    try {
      const unread = alerts.filter(a => !a.read);
      await Promise.all(unread.map(a => api.put(`/alerts/${a.id}/read`, {})));
      await fetchAlerts();
    } catch (error) {
      console.error('Failed to mark read:', error);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading alerts...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Alerts"
        description="Attendance warnings and notifications."
        actions={<Button variant="ghost" size="sm" onClick={markAllRead} disabled={!alerts.some(a => !a.read)}>Mark all read</Button>}
      />

      <div className="space-y-3 stagger-children">
        {alerts.map((alert) => (
          <Card
            key={alert.id}
            padding="md"
            className={`${!alert.read ? 'border-l-2 border-l-accent' : ''}`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                alert.type === 'critical' ? 'bg-destructive/15 text-destructive' : 'bg-accent/15 text-accent-foreground'
              }`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">{alert.course} — {alert.title}</span>
                  <Badge variant={alert.type === 'critical' ? 'red' : 'amber'} size="sm">{alert.percent}%</Badge>
                  {!alert.read && <Badge variant="teal" size="sm">New</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1.5">{getRelativeTime(alert.date)}</p>
              </div>
            </div>
          </Card>
        ))}

        {alerts.length === 0 && (
          <div className="text-center py-16">
            <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="text-foreground font-medium">No alerts</p>
            <p className="text-sm text-muted-foreground">Your attendance is on track.</p>
          </div>
        )}
      </div>
    </div>
  );
}

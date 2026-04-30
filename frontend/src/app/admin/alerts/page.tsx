'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { cn, formatDate, getRelativeTime } from '@/lib/utils';
import { AlertTriangle, Bell, CheckCircle, Eye, Filter } from 'lucide-react';
import { api } from '@/lib/api';

export default function AlertMonitoring() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await api.get('/admin/alerts');
        setAlerts(data || []);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const filtered = alerts.filter(a => {
    const matchesSearch = !search || 
                          a.student.toLowerCase().includes(search.toLowerCase()) || 
                          a.matric.toLowerCase().includes(search.toLowerCase()) ||
                          a.course.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading alerts...</div>;
  }

  const activeCount = alerts.filter(a => a.status === 'active').length;
  const criticalCount = alerts.filter(a => a.type === 'critical').length;

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Alert Monitoring"
        description="Monitor and manage attendance threshold alerts system-wide."
        actions={<Button variant="secondary" size="sm">Mark All Reviewed</Button>}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 stagger-children">
        <StatCard label="Total Alerts" value={alerts.length} icon={<Bell className="w-5 h-5" />} />
        <StatCard label="Active Alerts" value={activeCount} change="Needs attention" changeType="negative" icon={<AlertTriangle className="w-5 h-5" />} />
        <StatCard label="Critical" value={criticalCount} icon={<AlertTriangle className="w-5 h-5" />} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <SearchInput placeholder="Search student or course..." containerClassName="w-60" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'active', label: 'Active' },
            { value: 'reviewed', label: 'Reviewed' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-36"
        />
        <Select
          options={[
            { value: 'all', label: 'All Severity' },
            { value: 'critical', label: 'Critical' },
            { value: 'warning', label: 'Warning' },
          ]}
          className="w-36"
        />
      </div>

      {/* Alert list */}
      <div className="space-y-3 stagger-children">
        {filtered.map((alert) => (
          <Card
            key={alert.id}
            padding="md"
            hover
            className={cn(
              alert.status === 'active' && alert.type === 'critical' && 'border-l-2 border-l-destructive',
              alert.status === 'active' && alert.type === 'warning' && 'border-l-2 border-l-accent'
            )}
          >
            <div className="flex items-start gap-4">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
                alert.type === 'critical' ? 'bg-destructive/15 text-destructive' : 'bg-accent/15 text-accent-foreground'
              )}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-semibold text-foreground">{alert.student}</span>
                  <span className="text-xs text-muted-foreground font-mono">{alert.matric}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1.5">{alert.message}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="gray" size="sm">{alert.course}</Badge>
                  <Badge variant={alert.type === 'critical' ? 'red' : 'amber'} size="sm">{alert.percent}%</Badge>
                  <Badge variant={alert.status === 'active' ? 'teal' : 'gray'} dot size="sm">{alert.status}</Badge>
                  <span className="text-xs text-muted-foreground">{getRelativeTime(alert.date)}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlert(alert)}
                className="p-2 rounded-md text-muted-foreground hover:text-primary/80 hover:bg-muted hover:bg-muted/80 transition-colors cursor-pointer shrink-0"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedAlert} onClose={() => setSelectedAlert(null)} title="Alert Details" size="md">
        {selectedAlert && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={selectedAlert.student} size="lg" />
              <div>
                <p className="text-lg font-semibold text-foreground">{selectedAlert.student}</p>
                <p className="text-sm text-muted-foreground font-mono">{selectedAlert.matric}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-background rounded-md border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Course</p>
                <p className="text-sm font-medium text-foreground">{selectedAlert.course}</p>
              </div>
              <div className="p-3 bg-background rounded-md border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Attendance</p>
                <p className={cn('text-sm font-bold', selectedAlert.percent < 65 ? 'text-destructive' : 'text-accent-foreground')}>{selectedAlert.percent}%</p>
              </div>
              <div className="p-3 bg-background rounded-md border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Severity</p>
                <Badge variant={selectedAlert.type === 'critical' ? 'red' : 'amber'}>{selectedAlert.type}</Badge>
              </div>
              <div className="p-3 bg-background rounded-md border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Date</p>
                <p className="text-sm text-foreground">{formatDate(selectedAlert.date)}</p>
              </div>
            </div>

            <div className="p-3 bg-background rounded-md border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Message</p>
              <p className="text-sm text-muted-foreground">{selectedAlert.message}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setSelectedAlert(null)}>Close</Button>
              <Button variant="secondary" icon={<CheckCircle className="w-4 h-4" />}>Mark Reviewed</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

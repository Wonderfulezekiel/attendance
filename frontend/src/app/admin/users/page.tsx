'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { Input, Select } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { UserPlus, MoreVertical, Mail, Shield } from 'lucide-react';
import { api } from '@/lib/api';

type Tab = 'all' | 'students' | 'lecturers';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.get('/admin/users');
        setUsers(data || []);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    if (tab === 'students' && u.role !== 'student') return false;
    if (tab === 'lecturers' && u.role !== 'lecturer') return false;
    const q = search.toLowerCase();
    if (search && !u.name.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q) && !(u.identifier || '').toLowerCase().includes(q)) return false;
    return true;
  });

  const tabs: { value: Tab; label: string; count: number }[] = [
    { value: 'all', label: 'All Users', count: users.length },
    { value: 'students', label: 'Students', count: users.filter(u => u.role === 'student').length },
    { value: 'lecturers', label: 'Lecturers', count: users.filter(u => u.role === 'lecturer').length },
  ];

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading users...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="User Management"
        description="Manage students, lecturers, and system users."
        actions={<Button icon={<UserPlus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>Add User</Button>}
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border/50 rounded-md p-1 mb-6 w-fit">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-sm transition-all cursor-pointer flex items-center gap-2',
              tab === t.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-muted-foreground'
            )}
          >
            {t.label}
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', tab === t.value ? 'bg-white/20' : 'bg-muted hover:bg-muted/80')}>{t.count}</span>
          </button>
        ))}
      </div>

      <SearchInput placeholder="Search users..." containerClassName="max-w-sm mb-4" value={search} onChange={(e) => setSearch(e.target.value)} />

      {/* Desktop table */}
      <Card padding="none" className="hidden md:block overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">User</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Role</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Matric/Staff No.</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Department</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Status</th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-border/50/50 hover:bg-muted hover:bg-muted/80/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={u.name} size="sm" />
                    <div>
                      <p className="text-foreground font-medium">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant={u.role === 'lecturer' ? 'teal' : u.role === 'admin' ? 'amber' : 'gray'} size="sm">{u.role}</Badge>
                </td>
                <td className="px-5 py-3.5 text-muted-foreground font-mono text-xs">{u.identifier || '—'}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{u.dept}</td>
                <td className="px-5 py-3.5">
                  <Badge variant={u.status === 'active' ? 'green' : 'red'} dot size="sm">{u.status}</Badge>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted hover:bg-muted/80 transition-colors cursor-pointer">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((u) => (
          <Card key={u.id} padding="sm" className="flex items-center gap-3">
            <Avatar name={u.name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
              <p className="text-xs text-muted-foreground">{u.email}{u.identifier ? ` · ${u.identifier}` : ''}</p>
              <div className="flex gap-1.5 mt-1">
                <Badge variant={u.role === 'lecturer' ? 'teal' : 'gray'} size="sm">{u.role}</Badge>
                <Badge variant={u.status === 'active' ? 'green' : 'red'} dot size="sm">{u.status}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add User Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New User" size="md">
        <form className="space-y-4">
          <Input label="Full Name" placeholder="Enter full name" required id="add-user-name" />
          <Input label="Email" type="email" placeholder="user@university.edu" required id="add-user-email" icon={<Mail className="w-4 h-4" />} />
          <Select label="Role" options={[{ value: 'student', label: 'Student' }, { value: 'lecturer', label: 'Lecturer' }]} />
          <Input label="Department" placeholder="e.g. Computer Science" id="add-user-dept" />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" icon={<UserPlus className="w-4 h-4" />}>Add User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

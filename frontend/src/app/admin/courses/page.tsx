'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Modal } from '@/components/ui/modal';
import { Input, Select } from '@/components/ui/input';
import { PlusCircle, Users, MoreVertical } from 'lucide-react';
import { api } from '@/lib/api';

export default function CourseManagement() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [lecturers, setLecturers] = useState<any[]>([]);

  // Form state
  const [newCourse, setNewCourse] = useState({
    course_code: '',
    course_title: '',
    lecturer_id: '',
    semester: '1st',
    session_year: '2025/2026'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api.get('/courses');
        const formatted = (data || []).map((c: any) => ({
          id: c.id,
          code: c.course_code,
          title: c.course_title,
          lecturer: c.profiles?.full_name || 'Unassigned',
          enrolled: c.enrollments_count || 0,
          semester: c.semester || 'N/A',
          year: c.year || '2025/2026'
        }));
        setCourses(formatted);
        setCourses(formatted);

        // Fetch lecturers for the dropdown
        const usersData = await api.get('/admin/users');
        const lecturerUsers = (usersData || []).filter((u: any) => u.role === 'lecturer');
        setLecturers(lecturerUsers);
      } catch (error) {
        console.error('Failed to fetch courses or lecturers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Find the lecturer_id if possible. 
      // The users list gives us the user_id (profile id).
      // The course table expects lecturer_id which is the UUID from lecturers table, or we can adjust backend to handle user_id.
      // Wait, let's see how the backend expects lecturer_id. 
      // Let's just pass the user_id for now and we'll fix the backend if needed, or pass the profile ID.
      const payload = {
        ...newCourse,
        lecturer_id: newCourse.lecturer_id || null
      };
      
      const created = await api.post('/courses', payload);
      
      // Add to UI
      const newCourseFormatted = {
        id: created.id,
        code: created.course_code,
        title: created.course_title,
        lecturer: lecturers.find(l => l.id === created.lecturer_id)?.name || 'Assigned',
        enrolled: 0,
        semester: created.semester,
        year: created.session_year
      };
      setCourses([newCourseFormatted, ...courses]);
      setShowAddModal(false);
      setNewCourse({ course_code: '', course_title: '', lecturer_id: '', semester: '1st', session_year: '2025/2026' });
    } catch (error) {
      console.error('Failed to create course:', error);
      alert('Failed to create course. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = courses.filter(c => 
    !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading courses...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="Course Management"
        description="Manage courses, assign lecturers, and handle enrollments."
        actions={<Button icon={<PlusCircle className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>Add Course</Button>}
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <SearchInput placeholder="Search courses..." containerClassName="w-56" />
        <Select options={[{ value: 'all', label: 'All Semesters' }, { value: '1st', label: '1st Semester' }, { value: '2nd', label: '2nd Semester' }]} className="w-40" />
      </div>

      {/* Desktop table */}
      <Card padding="none" className="hidden md:block overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Code</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Title</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Lecturer</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Students</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Semester</th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-b border-border/50/50 hover:bg-muted hover:bg-muted/80/50 transition-colors">
                <td className="px-5 py-3.5">
                  <span className="font-mono font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded text-xs">{c.code}</span>
                </td>
                <td className="px-5 py-3.5 text-foreground font-medium">{c.title}</td>
                <td className="px-5 py-3.5 text-muted-foreground">{c.lecturer}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    {c.enrolled}
                  </div>
                </td>
                <td className="px-5 py-3.5"><Badge variant="gray" size="sm">{c.semester} — {c.year}</Badge></td>
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
        {courses.map((c) => (
          <Card key={c.id} hover padding="md">
            <div className="flex items-start justify-between mb-2">
              <span className="font-mono font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded text-xs">{c.code}</span>
              <Badge variant="gray" size="sm">{c.semester}</Badge>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-2">{c.title}</h3>
            <p className="text-xs text-muted-foreground mb-1">{c.lecturer}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> {c.enrolled} students</p>
          </Card>
        ))}
      </div>

      {/* Add Course Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Course" size="md">
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <Input 
            label="Course Code" 
            placeholder="e.g. CSC 401" 
            required 
            value={newCourse.course_code}
            onChange={(e) => setNewCourse({...newCourse, course_code: e.target.value})}
          />
          <Input 
            label="Course Title" 
            placeholder="e.g. Artificial Intelligence" 
            required 
            value={newCourse.course_title}
            onChange={(e) => setNewCourse({...newCourse, course_title: e.target.value})}
          />
          <Select 
            label="Assign Lecturer" 
            options={[
              { value: '', label: 'Select lecturer...' },
              ...lecturers.map(l => ({ value: l.id, label: l.name }))
            ]} 
            value={newCourse.lecturer_id}
            onChange={(e) => setNewCourse({...newCourse, lecturer_id: e.target.value})}
          />
          <Select 
            label="Semester" 
            options={[{ value: '1st', label: '1st Semester' }, { value: '2nd', label: '2nd Semester' }]} 
            value={newCourse.semester}
            onChange={(e) => setNewCourse({...newCourse, semester: e.target.value})}
          />
          <Input 
            label="Session Year" 
            placeholder="e.g. 2025/2026" 
            value={newCourse.session_year}
            onChange={(e) => setNewCourse({...newCourse, session_year: e.target.value})}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting} icon={<PlusCircle className="w-4 h-4" />}>Add Course</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

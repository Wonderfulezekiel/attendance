'use client';

import React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/search-input';
import { DonutChart } from '@/components/charts/donut-chart';
import { BookOpen, User, Clock } from 'lucide-react';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function StudentCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api.get('/attendance/course-summary');
        setCourses(data || []);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading courses...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="My Courses"
        description="View your enrolled courses and attendance progress."
      />

      <SearchInput
        placeholder="Search courses..."
        containerClassName="max-w-md mb-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
        {courses.map((course) => {
          const percent = course.percent || 0;
          return (
            <Card key={course.id} hover className="group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-semibold text-primary/80 bg-primary/10 px-2 py-0.5 rounded">
                      {course.code}
                    </span>
                    <Badge variant={percent >= 75 ? 'green' : percent >= 60 ? 'amber' : 'red'} size="sm">
                      {percent}%
                    </Badge>
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    {course.title}
                  </h3>
                </div>
                <DonutChart value={course.attended} max={course.total} size={64} strokeWidth={5} />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{course.lecturer}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{course.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>{course.semester} — {course.session_year}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                <span>{course.attended} of {course.total} classes attended</span>
                <span className="text-primary/80 opacity-0 group-hover:opacity-100 transition-opacity">
                  View details →
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

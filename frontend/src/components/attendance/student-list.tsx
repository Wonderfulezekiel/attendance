import React from 'react';
import { cn, formatTime } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface StudentItem {
  id: string;
  name: string;
  matric_number: string;
  check_in_time: string;
  status: 'present' | 'late';
}

interface StudentListProps {
  students: StudentItem[];
  totalEnrolled: number;
  className?: string;
}

export function StudentList({ students, totalEnrolled, className }: StudentListProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between px-1">
        <p className="text-sm font-medium text-muted-foreground">
          Checked In
        </p>
        <p className="text-sm font-mono text-primary/80">
          {students.length} / {totalEnrolled}
        </p>
      </div>

      {/* Progress */}
      <div className="w-full h-2 bg-muted hover:bg-muted/80 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${(students.length / totalEnrolled) * 100}%` }}
        />
      </div>

      {/* List */}
      <div className="space-y-1 max-h-[400px] overflow-y-auto">
        {students.map((student, i) => (
          <div
            key={student.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-popover/50 hover:bg-muted hover:bg-muted/80 transition-colors animate-fade-in-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <Avatar name={student.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {student.name}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {student.matric_number}
              </p>
            </div>
            <div className="text-right shrink-0">
              <Badge variant={student.status === 'present' ? 'green' : 'amber'} size="sm">
                {student.status === 'present' ? 'On time' : 'Late'}
              </Badge>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {formatTime(student.check_in_time)}
              </p>
            </div>
          </div>
        ))}

        {students.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Waiting for students to check in...
          </div>
        )}
      </div>
    </div>
  );
}

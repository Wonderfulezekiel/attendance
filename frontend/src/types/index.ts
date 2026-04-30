export type UserRole = 'admin' | 'lecturer' | 'student';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  created_at: string;
  avatar_url?: string;
}

export interface Student {
  id: string;
  user_id: string;
  user?: User;
  matric_number: string;
  department: string;
  level: string;
}

export interface Lecturer {
  id: string;
  user_id: string;
  user?: User;
  staff_number: string;
  department: string;
}

export interface Course {
  id: string;
  course_code: string;
  course_title: string;
  lecturer_id: string;
  lecturer?: Lecturer;
  semester: string;
  session_year: string;
  enrolled_count?: number;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  status: 'active' | 'dropped' | 'completed';
  student?: Student;
  course?: Course;
}

export type SessionStatus = 'active' | 'ended' | 'expired';

export interface AttendanceSession {
  id: string;
  course_id: string;
  course?: Course;
  lecturer_id: string;
  session_code: string;
  qr_code_value: string;
  start_time: string;
  expiry_time: string;
  status: SessionStatus;
  attendee_count?: number;
  total_enrolled?: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceRecord {
  id: string;
  session_id: string;
  session?: AttendanceSession;
  student_id: string;
  student?: Student;
  check_in_time: string;
  status: AttendanceStatus;
  created_at: string;
}

export type AlertType = 'warning' | 'critical';

export interface Alert {
  id: string;
  student_id: string;
  student?: Student;
  course_id: string;
  course?: Course;
  attendance_percentage: number;
  message: string;
  alert_type: AlertType;
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user?: User;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

export interface StatCardData {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
}

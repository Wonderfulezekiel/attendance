-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES
-- Extends Supabase auth.users
create table public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text not null,
    role text not null check (role in ('admin', 'lecturer', 'student')),
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Auto-create profile on auth.users insert via trigger
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'role');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. STUDENTS
create table public.students (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    matric_number text unique not null,
    department text,
    level text
);

-- 3. LECTURERS
create table public.lecturers (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    staff_number text unique not null,
    department text
);

-- 4. COURSES
create table public.courses (
    id uuid default uuid_generate_v4() primary key,
    course_code text not null,
    course_title text not null,
    lecturer_id uuid references public.lecturers(id) on delete set null,
    semester text,
    session_year text
);

-- 5. ENROLLMENTS
create table public.enrollments (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references public.students(id) on delete cascade not null,
    course_id uuid references public.courses(id) on delete cascade not null,
    status text check (status in ('active', 'dropped', 'completed')) default 'active',
    unique(student_id, course_id)
);

-- 6. ATTENDANCE SESSIONS
create table public.attendance_sessions (
    id uuid default uuid_generate_v4() primary key,
    course_id uuid references public.courses(id) on delete cascade not null,
    lecturer_id uuid references public.lecturers(id) on delete cascade not null,
    session_code text unique not null,
    qr_code_value text not null,
    start_time timestamp with time zone default timezone('utc'::text, now()) not null,
    expiry_time timestamp with time zone not null,
    status text check (status in ('active', 'ended', 'expired')) default 'active'
);

-- 7. ATTENDANCE RECORDS
create table public.attendance_records (
    id uuid default uuid_generate_v4() primary key,
    session_id uuid references public.attendance_sessions(id) on delete cascade not null,
    student_id uuid references public.students(id) on delete cascade not null,
    check_in_time timestamp with time zone default timezone('utc'::text, now()) not null,
    status text check (status in ('present', 'absent', 'late')) default 'present',
    unique(session_id, student_id)
);

-- 8. ALERTS
create table public.alerts (
    id uuid default uuid_generate_v4() primary key,
    student_id uuid references public.students(id) on delete cascade not null,
    course_id uuid references public.courses(id) on delete cascade not null,
    attendance_percentage numeric(5,2) not null,
    message text not null,
    alert_type text check (alert_type in ('warning', 'critical')) default 'warning',
    is_read boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. AUDIT LOGS
create table public.audit_logs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete set null,
    action text not null,
    entity_type text not null,
    entity_id text,
    timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add some basic Row Level Security (RLS) policies if needed, but we might rely on the backend using the service_role key to bypass RLS and handle logic in FastAPI to make it simpler, or we can use anon key and enforce RLS. For this app, since the backend is explicitly FastAPI, we can use the service role key or handle logic in the backend APIs.

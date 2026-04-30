# Product Document: Lecture Attendance QR/Code System

## 1. Product Overview

Build a web-based lecture attendance management system for a university environment. The system will allow lecturers to create attendance sessions using a unique QR code or session code, students to check in to class quickly, and administrators to monitor attendance trends and compliance. The system must enforce attendance rules, prevent duplicate attendance, and automatically alert students whose attendance falls below 75%.

This product is intended to go beyond basic CRUD by including session expiry logic, duplicate check-in prevention, attendance percentage calculations, threshold alerts, and reporting dashboards.

## 2. Goals

* Make attendance recording fast and reliable.
* Reduce manual attendance taking.
* Prevent attendance fraud and duplicate check-ins.
* Automatically calculate attendance percentages per student per course.
* Alert students and staff when attendance drops below the 75% threshold.
* Provide lecturers and administrators with useful attendance analytics and reports.

## 3. Tech Stack

### Frontend

* Next.js
* Tailwind CSS for styling
* React component-based UI
* Optional chart library for analytics dashboards

### Backend

* FastAPI (Python)
* REST API architecture
* Pydantic for request/response validation

### Database and Authentication

* Supabase PostgreSQL database
* Supabase Authentication for user sign-in and role-based access
* Supabase storage only if file uploads are ever added later

## 4. User Roles

### Admin

* Manage users, courses, lecturers, and student enrollment.
* View system-wide attendance reports.
* Monitor alert logs and attendance trends.

### Lecturer

* Create and manage attendance sessions.
* Generate QR codes or session codes.
* View student attendance per course.
* See warning lists for students below attendance threshold.
* Export attendance reports.

### Student

* Log in to the system.
* View enrolled courses.
* Scan QR code or enter session code to mark attendance.
* View personal attendance percentage and warnings.
* See attendance history by course.

## 5. Core Features

### 5.1 Authentication and Authorization

* User login via Supabase Auth.
* Role-based access control for Admin, Lecturer, and Student.
* Protected routes on the frontend.
* Protected API endpoints on the backend.
* Users only see data allowed for their role.

### 5.2 Course Management

* Create courses.
* Assign lecturers to courses.
* Enroll students into courses.
* View list of students registered for a course.
* Search and filter courses.

### 5.3 Attendance Session Creation

* Lecturer starts a session for a selected course.
* System generates a unique QR code or a unique session code.
* Session includes:

  * course ID
  * lecturer ID
  * start time
  * expiry time
  * session status
* Session should be time-limited to prevent reuse.

### 5.4 QR Code / Session Code Generation

* Generate a unique code for each attendance session.
* QR code should encode the session token or session ID securely.
* Session code can be displayed as a fallback for manual entry.
* QR code/session code should expire after a configured period.
* Each session code must be single-use for a student.

### 5.5 Attendance Check-In

* Students scan the QR code or enter the code manually.
* The system validates:

  * student enrollment in the course
  * active session status
  * session expiry time
  * duplicate attendance attempt
* Once valid, the attendance record is created.
* Attendance timestamp is saved automatically.

### 5.6 Duplicate Attendance Prevention

* A student must not be able to check in more than once for the same session.
* The backend must reject duplicate attendance attempts.
* Frontend should show a clear message if attendance has already been marked.

### 5.7 Attendance Percentage Calculation

* The system calculates attendance per student per course.
* Formula:

  * attendance percentage = (classes attended / total classes held) × 100
* The calculation should update automatically whenever a session ends or attendance is recorded.
* The system should store or compute the percentage for fast dashboard display.

### 5.8 75% Threshold Alert System

* If a student’s attendance falls below 75% in a course:

  * show warning on student dashboard
  * show warning on lecturer dashboard
  * create an alert record in the system
* Alerts should include course name, current attendance percentage, and a recommended action.
* Alerts can be in-app notifications, email notifications, or both if implemented.

### 5.9 Attendance Dashboard

#### Lecturer Dashboard

* Total sessions created.
* Attendance count for each session.
* List of students present/absent.
* Students below 75% attendance.
* Attendance charts and summaries.

#### Student Dashboard

* Personal attendance percentage per course.
* Session history.
* Warning status if below threshold.
* Upcoming class attendance links if allowed.

#### Admin Dashboard

* System-wide attendance statistics.
* Course attendance comparison.
* Lecturer activity summary.
* Student risk overview.

### 5.10 Reports and Export

* Generate attendance reports by course, date range, lecturer, or student.
* Export reports as CSV or PDF.
* Monthly and weekly attendance summaries.
* Optional graphical trend reports.

### 5.11 Attendance Validation Rules

* Only enrolled students can mark attendance.
* Attendance can only be recorded during an active session.
* Expired sessions must reject new check-ins.
* The system must log invalid attempts.
* Session creator may end a session manually before expiry.

### 5.12 Search and Filtering

* Search by student name, matric number, course, lecturer, or session code.
* Filter attendance by date, status, and course.
* Filter warning list by attendance percentage.

## 6. Key Workflows

### Workflow 1: Lecturer Starts Attendance

1. Lecturer logs in.
2. Lecturer selects a course.
3. Lecturer clicks “Start Session.”
4. System generates QR code and session code.
5. Session becomes active for a limited duration.
6. Students can now check in.

### Workflow 2: Student Marks Attendance

1. Student logs in.
2. Student opens attendance page.
3. Student scans QR code or enters session code.
4. System validates the code and student enrollment.
5. System saves attendance.
6. Student receives confirmation.

### Workflow 3: Attendance Threshold Monitoring

1. System recalculates attendance percentage.
2. If percentage is below 75%, the system flags the student.
3. Warning appears on dashboard.
4. Alert record is saved.

### Workflow 4: Lecturer Reviews Attendance

1. Lecturer opens dashboard.
2. Lecturer views session summary.
3. Lecturer sees student attendance list and below-threshold students.
4. Lecturer exports report if needed.

## 7. Data Entities

### Users

* id
* full_name
* email
* role
* created_at

### Students

* id
* user_id
* matric_number
* department
* level

### Lecturers

* id
* user_id
* staff_number
* department

### Courses

* id
* course_code
* course_title
* lecturer_id
* semester
* session_year

### Enrollments

* id
* student_id
* course_id
* status

### Attendance Sessions

* id
* course_id
* lecturer_id
* session_code
* qr_code_value
* start_time
* expiry_time
* status

### Attendance Records

* id
* session_id
* student_id
* check_in_time
* status
* created_at

### Alerts

* id
* student_id
* course_id
* attendance_percentage
* message
* alert_type
* created_at

### Audit Logs

* id
* user_id
* action
* entity_type
* entity_id
* timestamp

## 8. API Modules

### Authentication

* login
* logout
* get current user
* role check

### User Management

* create user
* update profile
* assign role
* list users

### Course Management

* create course
* update course
* list courses
* assign lecturer
* enroll students

### Session Management

* create session
* end session
* regenerate code if allowed
* fetch active session
* list session history

### Attendance Management

* submit attendance
* validate session
* prevent duplicates
* fetch attendance by course
* fetch attendance by student

### Reporting

* attendance summary
* threshold report
* export CSV/PDF
* monthly analytics

### Alerts

* create alert
* list alerts
* mark alert as read

## 9. Frontend Pages

### Public Pages

* Login
* Forgot password if enabled

### Student Pages

* Student dashboard
* My courses
* Mark attendance page
* Attendance history
* Alerts page

### Lecturer Pages

* Lecturer dashboard
* Course sessions page
* Create attendance session page
* Session live view
* Attendance report page

### Admin Pages

* Admin dashboard
* User management
* Course management
* Attendance analytics
* Alert monitoring

## 10. Business Rules

* A session must have a valid expiration time.
* A student may only check in once per session.
* Attendance must only be accepted for enrolled students.
* Attendance percentage must be calculated for each course independently.
* Students below 75% attendance must be flagged automatically.
* Lecture sessions should be accessible only to the assigned lecturer and enrolled students.

## 11. Security Requirements

* Use Supabase Auth for secure sign-in.
* Use role-based permissions on all sensitive pages and endpoints.
* Validate all input on the backend.
* Prevent unauthorized access to attendance records.
* Log important actions for auditing.
* Protect session codes from being guessable.
* Session tokens should be random and secure.

## 12. Non-Functional Requirements

* Fast attendance check-in response time.
* Responsive UI for desktop and mobile.
* Reliable handling of concurrent student check-ins.
* Clean error messages for invalid QR or expired session.
* Scalable database design for many students and courses.
* Maintainable code structure with separate frontend, backend, and database layers.

## 13. Recommended Folder Structure

### Frontend

* app/
* components/
* lib/
* hooks/
* services/
* styles/

### Backend

* app/
* routers/
* models/
* schemas/
* services/
* core/
* utils/
* tests/

### Database

* SQL migration files
* seed data
* policy definitions if needed

## 14. Suggested Advanced Additions

These are optional but useful for higher marks:

* Real-time attendance dashboard updates
* Email alerts for low attendance
* PDF report generation
* Charts for attendance trends
* Session history analytics
* Auto-close session after expiry
* Manual override by lecturer with audit log

## 15. Acceptance Criteria

The system will be considered complete when:

* A lecturer can create a session and generate a QR code or session code.
* A student can mark attendance successfully using the code.
* Duplicate attendance is prevented.
* Expired sessions are rejected.
* Attendance percentage is calculated correctly.
* Students below 75% are automatically flagged.
* Lecturers and admins can view reports and dashboards.
* The live system can be demonstrated clearly during defense.

## 16. Delivery Scope

The final build should include:

* Next.js frontend
* FastAPI backend
* Supabase database and authentication setup
* SQL schema or migration scripts
* Clear setup instructions
* Test cases for core workflows
* Documentation for the project report

## 17. Notes for the AI Engineer

Prioritize these in order:

1. Authentication and role control
2. Course and enrollment setup
3. Attendance session generation
4. QR/code check-in flow
5. Duplicate prevention and session expiry
6. Attendance percentage calculation
7. 75% alert logic
8. Dashboards and reporting
9. Tests and error handling

The most important proof of quality is not just saving attendance, but correctly handling session rules, attendance calculations, and alerts.

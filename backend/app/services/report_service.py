from app.database import supabase_admin, supabase_async_admin
from fastapi import HTTPException
import asyncio

async def get_dashboard_stats(current_user: dict):
    try:
        role = current_user['role']
        if role == 'student':
            student_id = current_user['student_id']
            enroll_res = await supabase_async_admin.table('enrollments').select('id', count='exact').eq('student_id', student_id).execute()
            alerts_res = await supabase_async_admin.table('alerts').select('id', count='exact').eq('student_id', student_id).eq('is_read', False).execute()
            
            # calculate overall attendance percentage
            # get all enrolled courses
            courses = await supabase_async_admin.table('enrollments').select('course_id').eq('student_id', student_id).execute()
            course_ids = [c['course_id'] for c in courses.data] if courses.data else []
            
            overall_attendance = "0%"
            if course_ids:
                # count total sessions for all enrolled courses
                total_sessions_res = await supabase_async_admin.table('attendance_sessions').select('id', count='exact').in_('course_id', course_ids).execute()
                total_sessions = total_sessions_res.count or 0
                
                # count attended sessions for this student
                attended_res = await supabase_async_admin.table('attendance_records').select('id', count='exact').eq('student_id', student_id).execute()
                attended = attended_res.count or 0
                
                if total_sessions > 0:
                    overall_attendance = f"{round((attended / total_sessions) * 100)}%"
                else:
                    overall_attendance = "100%" # No sessions yet

            return {
                "courses_enrolled": enroll_res.count or 0,
                "overall_attendance": overall_attendance,
                "active_alerts": alerts_res.count or 0
            }
            
        elif role == 'lecturer':
            lecturer_id = current_user['lecturer_id']
            courses_res = await supabase_async_admin.table('courses').select('id', count='exact').eq('lecturer_id', lecturer_id).execute()
            sessions_res = await supabase_async_admin.table('attendance_sessions').select('id', count='exact').eq('lecturer_id', lecturer_id).execute()
            
            # Average attendance for lecturer's courses
            courses = await supabase_async_admin.table('courses').select('id').eq('lecturer_id', lecturer_id).execute()
            course_ids = [c['id'] for c in courses.data] if courses.data else []
            
            avg_attendance = "0%"
            at_risk = 0
            students_monitored = 0
            
            if course_ids:
                total_sessions_res = await supabase_async_admin.table('attendance_sessions').select('id', count='exact').in_('course_id', course_ids).execute()
                total_sessions = total_sessions_res.count or 0
                
                if total_sessions > 0:
                    # Count enrollments
                    enrollments = await supabase_async_admin.table('enrollments').select('id', count='exact').in_('course_id', course_ids).execute()
                    students_monitored = enrollments.count or 0
                    
                    records = await supabase_async_admin.table('attendance_records').select('id, attendance_sessions!inner(course_id)').in_('attendance_sessions.course_id', course_ids).execute()
                    
                    total_expected = 0
                    for cid in course_ids:
                        c_enrolls_res = await supabase_async_admin.table('enrollments').select('id', count='exact').eq('course_id', cid).execute()
                        c_sessions_res = await supabase_async_admin.table('attendance_sessions').select('id', count='exact').eq('course_id', cid).execute()
                        c_enrolls = c_enrolls_res.count or 0
                        c_sessions = c_sessions_res.count or 0
                        total_expected += (c_enrolls * c_sessions)
                        
                    attended = len(records.data)
                    
                    if total_expected > 0:
                        avg_attendance = f"{round((attended / total_expected) * 100)}%"
                    
                    # Count at risk (students with < 75% in any course)
                    alerts_res = await supabase_async_admin.table('alerts').select('student_id').in_('course_id', course_ids).eq('alert_type', 'critical').execute()
                    unique_at_risk = set(a['student_id'] for a in alerts_res.data)
                    at_risk = len(unique_at_risk)

            return {
                "total_courses": courses_res.count or 0,
                "total_sessions": sessions_res.count or 0,
                "avg_attendance": avg_attendance,
                "students_monitored": students_monitored,
                "at_risk_students": at_risk
            }
            
        elif role == 'admin':
            students = (await supabase_async_admin.table('students').select('id', count='exact').execute()).count or 0
            lecturers = (await supabase_async_admin.table('lecturers').select('id', count='exact').execute()).count or 0
            courses = (await supabase_async_admin.table('courses').select('id', count='exact').execute()).count or 0
            
            # overall avg
            total_expected = 0
            attended = 0
            
            all_courses = await supabase_async_admin.table('courses').select('id').execute()
            if all_courses.data:
                course_ids = [c['id'] for c in all_courses.data]
                records = await supabase_async_admin.table('attendance_records').select('id', count='exact').execute()
                attended = records.count or 0
                
                for cid in course_ids:
                    c_enrolls_res = await supabase_async_admin.table('enrollments').select('id', count='exact').eq('course_id', cid).execute()
                    c_sessions_res = await supabase_async_admin.table('attendance_sessions').select('id', count='exact').eq('course_id', cid).execute()
                    total_expected += ((c_enrolls_res.count or 0) * (c_sessions_res.count or 0))
            
            overall = "0%"
            if total_expected > 0:
                overall = f"{round((attended / total_expected) * 100)}%"
                
            return {
                "total_students": students,
                "total_lecturers": lecturers,
                "active_courses": courses,
                "overall_attendance": overall
            }
            
        return {}
    except Exception as e:
        print("Stats error:", e)
        raise HTTPException(status_code=503, detail="Service busy. Please try again.")

async def get_course_report(course_id: str):
    try:
        # Get all sessions for course
        sessions_res = await supabase_async_admin.table('attendance_sessions').select('*').eq('course_id', course_id).order('start_time').execute()
        sessions = sessions_res.data
        
        # Get all enrollments
        enroll_res = await supabase_async_admin.table('enrollments').select('*, students(id, matric_number, profiles(full_name))').eq('course_id', course_id).execute()
        enrollments = enroll_res.data
        total_students = len(enrollments)
        
        # Build sessionData chart
        session_data = []
        for i, s in enumerate(sessions):
            attended_res = await supabase_async_admin.table('attendance_records').select('id', count='exact').eq('session_id', s['id']).execute()
            attended = attended_res.count or 0
            percent = round((attended / total_students) * 100) if total_students > 0 else 0
            date_str = s['start_time'][:10]
            session_data.append({
                "label": f"Session {i+1} — {date_str}",
                "value": percent
            })
            
        # Build studentReport
        student_report = []
        for e in enrollments:
            student = e.get('students', {})
            s_id = student.get('id')
            profile = student.get('profiles', {})
            name = profile.get('full_name', 'Unknown')
            matric = student.get('matric_number', 'Unknown')
            
            # Count attended sessions for this student in this course
            session_ids = [s['id'] for s in sessions]
            if session_ids:
                attended_res = await supabase_async_admin.table('attendance_records').select('id', count='exact').eq('student_id', s_id).in_('session_id', session_ids).execute()
                attended = attended_res.count or 0
            else:
                attended = 0
            total = len(sessions)
            percent = round((attended / total) * 100) if total > 0 else 100
            
            student_report.append({
                "name": name,
                "matric": matric,
                "attended": attended,
                "total": total,
                "percent": percent
            })
            
        return {
            "sessionData": session_data,
            "studentReport": student_report
        }
    except Exception as e:
        print("Error in get_course_report:", e)
        raise HTTPException(status_code=503, detail="Service busy. Please try again.")

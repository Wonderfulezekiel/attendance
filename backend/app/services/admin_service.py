from app.database import supabase_async_admin
from fastapi import HTTPException

async def get_all_users():
    try:
        # Get all profiles
        res = await supabase_async_admin.table('profiles').select('*').execute()
        profiles = res.data
        
        users = []
        for p in profiles:
            dept = 'N/A'
            matric_or_staff = ''
            
            if p['role'] == 'student':
                s_res = await supabase_async_admin.table('students').select('department, matric_number').eq('user_id', p['id']).execute()
                if s_res.data:
                    if s_res.data[0].get('department'):
                        dept = s_res.data[0]['department']
                    matric_or_staff = s_res.data[0].get('matric_number', '')
            elif p['role'] == 'lecturer':
                l_res = await supabase_async_admin.table('lecturers').select('department, staff_number').eq('user_id', p['id']).execute()
                if l_res.data:
                    if l_res.data[0].get('department'):
                        dept = l_res.data[0]['department']
                    matric_or_staff = l_res.data[0].get('staff_number', '')
                    
            users.append({
                "id": p['id'],
                "name": p['full_name'],
                "email": p.get('email', 'N/A'),
                "role": p['role'],
                "dept": dept,
                "status": "active",
                "identifier": matric_or_staff  # matric_number for students, staff_number for lecturers
            })
            
        return users
    except Exception as e:
        print("Error in get_all_users:", e)
        raise HTTPException(status_code=503, detail="Service busy. Please try again.")

async def get_all_alerts():
    try:
        # get all alerts with student info
        res = await supabase_async_admin.table('alerts').select('*, students(profiles(full_name), matric_number), courses(course_code, course_title)').order('created_at', desc=True).execute()
        
        alerts_list = []
        for a in res.data:
            s_data = a.get('students', {})
            c_data = a.get('courses', {})
            name = s_data.get('profiles', {}).get('full_name', 'Unknown') if s_data and s_data.get('profiles') else 'Unknown'
            matric = s_data.get('matric_number', 'Unknown') if s_data else 'Unknown'
            
            alerts_list.append({
                "id": a['id'],
                "student": name,
                "matric": matric,
                "course": c_data.get('course_code', 'Unknown'),
                "courseName": c_data.get('course_title', 'Unknown'),
                "percent": a.get('attendance_percentage', 0),
                "type": a.get('alert_type', 'warning'),
                "status": "reviewed" if a.get('is_read') else "active",
                "date": a['created_at'],
                "message": a.get('message', '')
            })
            
        return alerts_list
    except Exception as e:
        print("Error in get_all_alerts:", e)
        raise HTTPException(status_code=503, detail="Service busy. Please try again.")

async def get_analytics():
    try:
        # ---- Course Comparison (real data) ----
        courses_res = await supabase_async_admin.table('courses').select('id, course_code, course_title').execute()
        courses = courses_res.data
        
        course_comparison = []
        for c in courses:
            c_id = c['id']
            enrolls = await supabase_async_admin.table('enrollments').select('id', count='exact').eq('course_id', c_id).execute()
            e_count = enrolls.count or 0
            
            sessions = await supabase_async_admin.table('attendance_sessions').select('id', count='exact').eq('course_id', c_id).execute()
            s_count = sessions.count or 0
            
            records = await supabase_async_admin.table('attendance_records').select('id, attendance_sessions!inner(course_id)', count='exact').eq('attendance_sessions.course_id', c_id).execute()
            attended = records.count or 0
            
            total_possible = e_count * s_count
            avg = round((attended / total_possible) * 100) if total_possible > 0 else 0
            
            course_comparison.append({
                "label": f"{c['course_code']} - {c['course_title']}",
                "value": avg
            })

        # ---- Weekly Trend (real data from last 4 weeks of sessions) ----
        from datetime import datetime, timedelta
        weekly_trend = []
        now = datetime.utcnow()
        for week_offset in range(3, -1, -1):
            week_start = now - timedelta(weeks=week_offset + 1)
            week_end = now - timedelta(weeks=week_offset)
            
            # Get sessions in this week
            sessions_in_week = await supabase_async_admin.table('attendance_sessions').select('id, course_id').gte('start_time', week_start.isoformat()).lt('start_time', week_end.isoformat()).execute()
            
            if sessions_in_week.data:
                total_records = 0
                total_possible = 0
                for s in sessions_in_week.data:
                    records = await supabase_async_admin.table('attendance_records').select('id', count='exact').eq('session_id', s['id']).execute()
                    total_records += (records.count or 0)
                    
                    enrolls = await supabase_async_admin.table('enrollments').select('id', count='exact').eq('course_id', s['course_id']).execute()
                    total_possible += (enrolls.count or 0)
                
                avg_pct = round((total_records / total_possible) * 100) if total_possible > 0 else 0
            else:
                avg_pct = 0
            
            week_label = f"Week {4 - week_offset}"
            weekly_trend.append({"label": week_label, "value": avg_pct})

        # ---- Summary stats ----
        total_students = (await supabase_async_admin.table('students').select('id', count='exact').execute()).count or 0
        total_lecturers = (await supabase_async_admin.table('lecturers').select('id', count='exact').execute()).count or 0
        total_at_risk = (await supabase_async_admin.table('alerts').select('student_id').eq('is_read', False).execute())
        unique_at_risk = len(set(a['student_id'] for a in total_at_risk.data)) if total_at_risk.data else 0
        
        # Overall average across all courses
        overall_avg = 0
        if course_comparison:
            vals = [c['value'] for c in course_comparison if c['value'] > 0]
            overall_avg = round(sum(vals) / len(vals)) if vals else 0

        return {
            "courseComparison": course_comparison,
            "weeklyTrend": weekly_trend,
            "overallAvg": overall_avg,
            "totalStudents": total_students,
            "totalLecturers": total_lecturers,
            "atRiskCount": unique_at_risk,
        }
    except Exception as e:
        print("Error in get_analytics:", e)
        raise HTTPException(status_code=503, detail="Service busy. Please try again.")

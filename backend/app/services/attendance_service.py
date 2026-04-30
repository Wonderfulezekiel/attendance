from app.database import supabase_async_admin
from app.models.attendance_schemas import CheckInRequest
from fastapi import HTTPException
from datetime import datetime
import jwt
from app.config import settings

async def submit_attendance(data: CheckInRequest, student_id: str):
    try:
        session_id = None
        
        # 1. Resolve session ID based on type
        if data.type == 'code':
            # find active session with code
            res = await supabase_async_admin.table('attendance_sessions').select('*').eq('session_code', data.code).eq('status', 'active').execute()
            if not res.data:
                raise HTTPException(status_code=400, detail="Invalid or expired session code")
            session = res.data[0]
            session_id = session['id']
        elif data.type == 'qr':
            try:
                payload = jwt.decode(data.code, settings.jwt_secret, algorithms=["HS256"])
                session_id = payload.get("session_id")
            except jwt.ExpiredSignatureError:
                raise HTTPException(status_code=400, detail="QR code has expired")
            except jwt.PyJWTError:
                raise HTTPException(status_code=400, detail="Invalid QR code")
                
            res = await supabase_async_admin.table('attendance_sessions').select('*').eq('id', session_id).eq('status', 'active').execute()
            if not res.data:
                raise HTTPException(status_code=400, detail="Session is no longer active")
            session = res.data[0]
        else:
            raise HTTPException(status_code=400, detail="Invalid check-in type")

        # 2. Check Expiry Time
        expiry_time = datetime.fromisoformat(session['expiry_time'])
        if datetime.utcnow().replace(tzinfo=expiry_time.tzinfo) > expiry_time:
            # Auto update status to expired
            await supabase_async_admin.table('attendance_sessions').update({"status": "expired"}).eq('id', session_id).execute()
            raise HTTPException(status_code=400, detail="Session has expired")

        # 3. Check Enrollment, auto-enroll if they have the code
        enroll_res = await supabase_async_admin.table('enrollments').select('*').eq('student_id', student_id).eq('course_id', session['course_id']).execute()
        if not enroll_res.data:
            await supabase_async_admin.table('enrollments').insert({
                "student_id": student_id,
                "course_id": session['course_id'],
                "status": "active"
            }).execute()

        # 4. Create Record (Unique constraint handles duplicate prevention)
        record = {
            "session_id": session_id,
            "student_id": student_id,
            "check_in_time": datetime.utcnow().isoformat(),
            "status": "present"
        }
        rec_res = await supabase_async_admin.table('attendance_records').insert(record).execute()
        
        # 5. Recalculate percentage and trigger alert if needed
        await recalculate_and_check_alert(student_id, session['course_id'])

        return rec_res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        if "unique constraint" in str(e).lower() or "duplicate key" in str(e).lower():
            raise HTTPException(status_code=400, detail="You have already marked attendance for this session")
        print("Error in submit_attendance:", e)
        raise HTTPException(status_code=503, detail="Service busy. Please try again.")

async def recalculate_and_check_alert(student_id: str, course_id: str):
    try:
        # count total sessions for course
        total_sessions = await supabase_async_admin.table('attendance_sessions').select('id', count='exact').eq('course_id', course_id).execute()
        total_count = total_sessions.count or 0
        
        # count attended sessions for student in this course
        attended_res = await supabase_async_admin.table('attendance_records').select('*, attendance_sessions!inner(course_id)', count='exact').eq('student_id', student_id).eq('attendance_sessions.course_id', course_id).execute()
        attended_count = attended_res.count or 0

        if total_count == 0:
            return

        percentage = round((attended_count / total_count) * 100, 2)

        if percentage < 75.0:
            msg = f"Your attendance is at {percentage}%. Minimum required is 75%."
            
            # Check for existing unresolved alert
            existing_alert = await supabase_async_admin.table('alerts').select('*').eq('student_id', student_id).eq('course_id', course_id).eq('is_read', False).execute()
            
            if not existing_alert.data:
                await supabase_async_admin.table('alerts').insert({
                    "student_id": student_id,
                    "course_id": course_id,
                    "attendance_percentage": percentage,
                    "message": msg,
                    "alert_type": "warning" if percentage >= 60 else "critical"
                }).execute()
            else:
                await supabase_async_admin.table('alerts').update({
                    "attendance_percentage": percentage,
                    "message": msg,
                    "alert_type": "warning" if percentage >= 60 else "critical"
                }).eq('id', existing_alert.data[0]['id']).execute()

    except Exception as e:
        print("Error checking alert:", e)
        pass

async def get_student_records(student_id: str):
    try:
        res = await supabase_async_admin.table('attendance_records').select('*, attendance_sessions(*, courses(course_title, course_code))').eq('student_id', student_id).order('check_in_time', desc=True).execute()
        return res.data
    except Exception as e:
        print("Error in get_student_records:", e)
        raise HTTPException(status_code=503, detail="Service busy. Please try again.")

async def get_course_summary(student_id: str):
    try:
        # Get all enrolled courses
        enrolls = await supabase_async_admin.table('enrollments').select('courses(*)').eq('student_id', student_id).execute()
        courses = [e['courses'] for e in enrolls.data] if enrolls.data else []
        
        summary = []
        for c in courses:
            c_id = c['id']
            # Total sessions
            total_res = await supabase_async_admin.table('attendance_sessions').select('id', count='exact').eq('course_id', c_id).execute()
            total = total_res.count or 0
            
            # Attended sessions (filtered by course)
            attended_records = await supabase_async_admin.table('attendance_records').select('id, attendance_sessions!inner(course_id)').eq('student_id', student_id).eq('attendance_sessions.course_id', c_id).execute()
            attended = len(attended_records.data)
            
            percent = round((attended / total) * 100) if total > 0 else 100
            
            # get lecturer
            lecturer = await supabase_async_admin.table('lecturers').select('profiles(full_name)').eq('id', c['lecturer_id']).execute()
            lecturer_name = 'Unknown'
            if lecturer.data:
                prof_data = lecturer.data[0].get('profiles')
                if prof_data:
                    lecturer_name = prof_data.get('full_name', 'Unknown')
            
            summary.append({
                "id": c_id,
                "code": c['course_code'],
                "title": c['course_title'],
                "lecturer": lecturer_name,
                "semester": c.get('semester', 'N/A'),
                "session_year": c.get('session_year', 'N/A'),
                "attended": attended,
                "total": total,
                "percent": percent
            })
            
        return summary
    except Exception as e:
        print("Error in get_course_summary:", e)
        raise HTTPException(status_code=503, detail="Service busy. Please try again.")

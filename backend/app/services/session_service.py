from app.database import supabase_async_admin
from app.models.session_schemas import SessionCreate
from app.utils.qr_generator import generate_session_code, generate_qr_jwt
from fastapi import HTTPException
from datetime import datetime, timedelta
import uuid

async def create_session(data: SessionCreate, lecturer_id: str):
    try:
        # Check if course exists and belongs to lecturer
        course_res = await supabase_async_admin.table('courses').select('*').eq('id', data.course_id).execute()
        if not course_res.data:
            raise HTTPException(status_code=404, detail="Course not found")
        if course_res.data[0]['lecturer_id'] != lecturer_id:
            raise HTTPException(status_code=403, detail="Not authorized for this course")

        # Check if there is an active session
        active_res = await supabase_async_admin.table('attendance_sessions').select('*').eq('course_id', data.course_id).eq('status', 'active').execute()
        if active_res.data:
            raise HTTPException(status_code=400, detail="An active session already exists for this course")

        session_id = str(uuid.uuid4())
        session_code = generate_session_code()
        expiry_time = datetime.utcnow() + timedelta(minutes=data.duration_minutes)
        jwt_value = generate_qr_jwt(session_id, data.course_id)

        insert_data = {
            "id": session_id,
            "course_id": data.course_id,
            "lecturer_id": lecturer_id,
            "session_code": session_code,
            "qr_code_value": jwt_value,
            "start_time": datetime.utcnow().isoformat(),
            "expiry_time": expiry_time.isoformat(),
            "status": "active"
        }

        res = await supabase_async_admin.table('attendance_sessions').insert(insert_data).execute()
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        print("DB Error in create_session:", e)
        raise HTTPException(status_code=503, detail="Service busy. Please try again.")

async def end_session(session_id: str, lecturer_id: str):
    try:
        # verify session belongs to lecturer
        sess = await supabase_async_admin.table('attendance_sessions').select('*').eq('id', session_id).execute()
        if not sess.data or sess.data[0]['lecturer_id'] != lecturer_id:
            raise HTTPException(status_code=403, detail="Not authorized to end this session")
            
        res = await supabase_async_admin.table('attendance_sessions').update({"status": "ended"}).eq('id', session_id).execute()
        return res.data[0]
    except HTTPException:
        raise
    except Exception as e:
        print("DB Error in end_session:", e)
        raise HTTPException(status_code=503, detail="Service busy. Please try again.")

async def get_active_session(course_id: str):
    try:
        res = await supabase_async_admin.table('attendance_sessions').select('*').eq('course_id', course_id).eq('status', 'active').execute()
        if res.data:
            session = res.data[0]
            session['qr_code_value'] = generate_qr_jwt(session['id'], session['course_id'])
            return session
        return None
    except Exception as e:
        print("DB Error in get_active_session:", e)
        raise HTTPException(status_code=503, detail="Service busy. Please try again.")

async def get_sessions(lecturer_id: str):
    try:
        # Get all sessions for this lecturer, along with course info and student count
        res = await supabase_async_admin.table('attendance_sessions').select('*, courses(course_code, course_title)').eq('lecturer_id', lecturer_id).order('start_time', desc=True).execute()
        sessions = res.data
        
        # Calculate student counts for each session
        for session in sessions:
            c_id = session['course_id']
            # Total enrolled
            enrolls = await supabase_async_admin.table('enrollments').select('id', count='exact').eq('course_id', c_id).execute()
            session['total_students'] = enrolls.count or 0
            
            # Attended
            attended = await supabase_async_admin.table('attendance_records').select('id', count='exact').eq('session_id', session['id']).execute()
            session['students_attended'] = attended.count or 0
            
            # Dynamic QR code regeneration for active sessions (2 mins validity)
            if session['status'] == 'active':
                session['qr_code_value'] = generate_qr_jwt(session['id'], session['course_id'])
            
        return sessions
    except Exception as e:
        print("DB Error in get_sessions:", e)
        raise HTTPException(status_code=503, detail="Service busy. Please try again.")

async def get_session_students(session_id: str, lecturer_id: str):
    try:
        # verify session
        sess = await supabase_async_admin.table('attendance_sessions').select('*').eq('id', session_id).execute()
        if not sess.data or sess.data[0]['lecturer_id'] != lecturer_id:
            raise HTTPException(status_code=403, detail="Not authorized")
            
        records = await supabase_async_admin.table('attendance_records').select('*, students(profiles(full_name), matric_number)').eq('session_id', session_id).execute()
        
        results = []
        for r in records.data:
            student_data = r['students']
            full_name = student_data['profiles']['full_name'] if student_data and 'profiles' in student_data else 'Unknown'
            matric_number = student_data['matric_number'] if student_data else 'Unknown'
            
            results.append({
                "id": r['id'],
                "name": full_name,
                "matric_number": matric_number,
                "check_in_time": r['check_in_time'],
                "status": r['status']
            })
            
        return results
    except HTTPException:
        raise
    except Exception as e:
        print("DB Error in get_session_students:", e)
        raise HTTPException(status_code=503, detail="Service busy. Please try again.")

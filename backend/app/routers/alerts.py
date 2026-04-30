from fastapi import APIRouter, Depends, HTTPException
from app.database import supabase_async_admin
from app.dependencies import get_current_student, get_current_lecturer, get_current_user

router = APIRouter()

@router.get("/my-alerts")
async def get_my_alerts(current_user: dict = Depends(get_current_student)):
    try:
        res = await supabase_async_admin.table('alerts').select('*, courses(course_title, course_code)').eq('student_id', current_user['student_id']).order('created_at', desc=True).execute()
        return res.data
    except Exception as e:
        print("Error in get_my_alerts:", e)
        raise HTTPException(status_code=503, detail="Service busy. Please try again.")

@router.put("/{alert_id}/read")
async def mark_alert_read(alert_id: str, current_user: dict = Depends(get_current_student)):
    try:
        res = await supabase_async_admin.table('alerts').update({"is_read": True}).eq('id', alert_id).eq('student_id', current_user['student_id']).execute()
        return res.data
    except Exception as e:
        print("Error in mark_alert_read:", e)
        raise HTTPException(status_code=503, detail="Service busy. Please try again.")

@router.get("/lecturer-alerts")
async def get_lecturer_alerts(current_user: dict = Depends(get_current_lecturer)):
    """Get at-risk students for the lecturer's courses."""
    try:
        lecturer_id = current_user.get('lecturer_id')
        if not lecturer_id:
            return []
        
        # Get lecturer's courses
        courses_res = await supabase_async_admin.table('courses').select('id').eq('lecturer_id', lecturer_id).execute()
        if not courses_res.data:
            return []
        
        course_ids = [c['id'] for c in courses_res.data]
        
        # Get unresolved alerts for those courses
        alerts_res = await supabase_async_admin.table('alerts').select('*, students(profiles(full_name), matric_number), courses(course_code, course_title)').in_('course_id', course_ids).eq('is_read', False).order('attendance_percentage').execute()
        
        results = []
        for a in alerts_res.data:
            s_data = a.get('students', {})
            c_data = a.get('courses', {})
            name = s_data.get('profiles', {}).get('full_name', 'Unknown') if s_data and s_data.get('profiles') else 'Unknown'
            matric = s_data.get('matric_number', 'Unknown') if s_data else 'Unknown'
            
            results.append({
                "name": name,
                "matric": matric,
                "course": c_data.get('course_code', 'Unknown'),
                "percent": a.get('attendance_percentage', 0),
                "type": a.get('alert_type', 'warning'),
            })
        
        return results
    except Exception as e:
        print("Error in get_lecturer_alerts:", e)
        raise HTTPException(status_code=503, detail="Service busy. Please try again.")

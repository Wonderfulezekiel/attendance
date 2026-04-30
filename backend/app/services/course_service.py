from app.database import supabase_async_admin
from app.models.schemas import CourseCreate
from fastapi import HTTPException

async def create_course(data: CourseCreate):
    try:
        dumped = data.model_dump()
        # The frontend sends user_id as lecturer_id. We need to resolve the actual lecturer table ID.
        if dumped.get('lecturer_id'):
            lect_res = await supabase_async_admin.table('lecturers').select('id').eq('user_id', dumped['lecturer_id']).execute()
            if lect_res.data:
                dumped['lecturer_id'] = lect_res.data[0]['id']
            else:
                dumped['lecturer_id'] = None

        res = await supabase_async_admin.table('courses').insert(dumped).execute()
        return res.data[0]
    except Exception as e:
        print("Error in create_course:", e)
        raise HTTPException(status_code=503, detail="Service busy. Please try again.")

async def get_courses(user_info: dict):
    try:
        if user_info['role'] == 'admin':
            res = await supabase_async_admin.table('courses').select('*, lecturers(profiles(full_name))').execute()
            return res.data
        elif user_info['role'] == 'lecturer':
            res = await supabase_async_admin.table('courses').select('*').eq('lecturer_id', user_info['lecturer_id']).execute()
            return res.data
        elif user_info['role'] == 'student':
            res = await supabase_async_admin.table('enrollments').select('courses(*)').eq('student_id', user_info['student_id']).execute()
            return [e['courses'] for e in res.data]
    except Exception as e:
        print("Error in get_courses:", e)
        raise HTTPException(status_code=503, detail="Service busy. Please try again.")

async def enroll_student(course_id: str, student_id: str):
    try:
        res = await supabase_async_admin.table('enrollments').insert({
            "course_id": course_id,
            "student_id": student_id
        }).execute()
        return res.data[0]
    except Exception as e:
        print("Error in enroll_student:", e)
        raise HTTPException(status_code=503, detail="Service busy. Please try again.")

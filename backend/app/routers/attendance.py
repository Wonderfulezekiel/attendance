from fastapi import APIRouter, Depends, HTTPException
from app.models.attendance_schemas import CheckInRequest
from app.services import attendance_service
from app.dependencies import get_current_student, get_current_user

router = APIRouter()

@router.post("/check-in")
async def check_in(data: CheckInRequest, current_user: dict = Depends(get_current_student)):
    if 'student_id' not in current_user:
        raise HTTPException(status_code=400, detail="User is not a student profile")
    return await attendance_service.submit_attendance(data, current_user['student_id'])

@router.get("/student/me")
async def get_my_records(current_user: dict = Depends(get_current_student)):
    return await attendance_service.get_student_records(current_user['student_id'])

@router.get("/course-summary")
async def get_course_summary(current_user: dict = Depends(get_current_student)):
    return await attendance_service.get_course_summary(current_user['student_id'])

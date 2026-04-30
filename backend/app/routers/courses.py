from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import CourseCreate
from app.services import course_service
from app.dependencies import get_current_admin, get_current_user

router = APIRouter()

@router.post("")
async def create_course(data: CourseCreate, current_user: dict = Depends(get_current_admin)):
    course = await course_service.create_course(data)
    return course

@router.get("")
async def get_courses(current_user: dict = Depends(get_current_user)):
    return await course_service.get_courses(current_user)

@router.post("/{course_id}/enroll")
async def enroll_student(course_id: str, student_id: str, current_user: dict = Depends(get_current_admin)):
    return await course_service.enroll_student(course_id, student_id)

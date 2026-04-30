from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_current_user
from app.services import report_service

router = APIRouter()

@router.get("/dashboard-stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    return await report_service.get_dashboard_stats(current_user)

@router.get("/course-report/{course_id}")
async def get_course_report(course_id: str, current_user: dict = Depends(get_current_user)):
    return await report_service.get_course_report(course_id)

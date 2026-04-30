from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_current_admin
from app.services import admin_service

router = APIRouter()

@router.get("/users")
async def get_users(current_user: dict = Depends(get_current_admin)):
    return await admin_service.get_all_users()

@router.get("/alerts")
async def get_alerts(current_user: dict = Depends(get_current_admin)):
    return await admin_service.get_all_alerts()

@router.get("/analytics")
async def get_analytics(current_user: dict = Depends(get_current_admin)):
    return await admin_service.get_analytics()

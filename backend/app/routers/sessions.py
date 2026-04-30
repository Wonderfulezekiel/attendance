from fastapi import APIRouter, Depends, HTTPException
from app.models.session_schemas import SessionCreate, SessionResponse
from app.services import session_service
from app.dependencies import get_current_lecturer, get_current_user

router = APIRouter()

@router.post("", response_model=SessionResponse)
async def create_session(data: SessionCreate, current_user: dict = Depends(get_current_lecturer)):
    if 'lecturer_id' not in current_user:
        raise HTTPException(status_code=400, detail="User is not a lecturer profile")
    return await session_service.create_session(data, current_user['lecturer_id'])

@router.post("/{session_id}/end")
async def end_session(session_id: str, current_user: dict = Depends(get_current_lecturer)):
    if 'lecturer_id' not in current_user:
        raise HTTPException(status_code=400, detail="User is not a lecturer profile")
    return await session_service.end_session(session_id, current_user['lecturer_id'])

@router.get("/active/{course_id}")
async def get_active_session(course_id: str, current_user: dict = Depends(get_current_user)):
    return await session_service.get_active_session(course_id)

@router.get("")
async def get_sessions(current_user: dict = Depends(get_current_lecturer)):
    if 'lecturer_id' not in current_user:
        raise HTTPException(status_code=400, detail="User is not a lecturer profile")
    return await session_service.get_sessions(current_user['lecturer_id'])

@router.get("/{session_id}/students")
async def get_session_students(session_id: str, current_user: dict = Depends(get_current_lecturer)):
    if 'lecturer_id' not in current_user:
        raise HTTPException(status_code=400, detail="User is not a lecturer profile")
    return await session_service.get_session_students(session_id, current_user['lecturer_id'])

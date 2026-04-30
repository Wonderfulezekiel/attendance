from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class SessionCreate(BaseModel):
    course_id: str
    duration_minutes: int = 30

class SessionResponse(BaseModel):
    id: str
    course_id: str
    lecturer_id: str
    session_code: str
    qr_code_value: str
    start_time: datetime
    expiry_time: datetime
    status: str

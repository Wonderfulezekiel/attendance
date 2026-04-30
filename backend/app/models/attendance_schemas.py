from pydantic import BaseModel
from typing import Optional

class CheckInRequest(BaseModel):
    code: str  # Either session_code or qr_code_value (jwt)
    type: str  # 'code' or 'qr'

class AttendanceRecordResponse(BaseModel):
    id: str
    session_id: str
    student_id: str
    check_in_time: str
    status: str

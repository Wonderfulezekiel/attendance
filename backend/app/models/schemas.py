from pydantic import BaseModel, EmailStr
from typing import Optional, Any

# Auth Schemas
class RegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: str # 'student', 'lecturer', 'admin'
    # Role specific fields
    matric_number: Optional[str] = None
    department: Optional[str] = None
    level: Optional[str] = None
    staff_number: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Any

class UserProfile(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    avatar_url: Optional[str] = None
    # Add role specific info if needed
    matric_number: Optional[str] = None
    staff_number: Optional[str] = None

class CourseCreate(BaseModel):
    course_code: str
    course_title: str
    lecturer_id: Optional[str] = None
    semester: str
    session_year: str

class CourseResponse(BaseModel):
    id: str
    course_code: str
    course_title: str
    lecturer_id: Optional[str] = None
    semester: str
    session_year: str

class EnrollmentCreate(BaseModel):
    student_id: str
    course_id: str

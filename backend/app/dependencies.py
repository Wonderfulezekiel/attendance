from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from app.config import settings
from app.database import supabase_admin, supabase_async_admin

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        import httpx
        # We use an async HTTP request to Supabase to securely validate the token.
        # This completely prevents [WinError 10035] because it uses non-blocking asyncio,
        # unlike the synchronous supabase.auth.get_user() call.
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.get(
                f"{settings.supabase_url}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": settings.supabase_key
                }
            )
            
            if res.status_code != 200:
                raise credentials_exception
                
            user_data = res.json()
            user_id = user_data.get("id")
            email = user_data.get("email")
            
            if not user_id:
                raise credentials_exception
                
    except httpx.RequestError as e:
        print("Auth Verification Network Error:", type(e).__name__, e)
        raise HTTPException(status_code=503, detail="Service temporarily busy. Please retry.")
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        print("Auth Verification Error:", type(e).__name__, e)
        raise credentials_exception

    # ---- FETCH PROFILE FROM DB ----
    try:
        profile_res = await supabase_async_admin.table('profiles').select('*').eq('id', user_id).execute()
    except Exception as e:
        print("DB Error fetching profile:", e)
        raise HTTPException(status_code=500, detail="Database connection error")
    
    if not profile_res.data:
        raise credentials_exception
        
    profile = profile_res.data[0]
    
    user_info = {
        "id": profile['id'],
        "full_name": profile['full_name'],
        "email": email,
        "role": profile['role'],
        "avatar_url": profile.get('avatar_url')
    }
    
    # Add role-specific data
    if profile['role'] == 'student':
        try:
            student_res = await supabase_async_admin.table('students').select('id, matric_number').eq('user_id', user_id).execute()
            if student_res.data:
                user_info['matric_number'] = student_res.data[0].get('matric_number')
                user_info['student_id'] = student_res.data[0].get('id')
        except Exception as e:
            print("DB Error fetching student:", e)
            raise HTTPException(status_code=503, detail="Service busy. Please try again.")
    elif profile['role'] == 'lecturer':
        try:
            lecturer_res = await supabase_async_admin.table('lecturers').select('id, staff_number').eq('user_id', user_id).execute()
            if lecturer_res.data:
                user_info['staff_number'] = lecturer_res.data[0].get('staff_number')
                user_info['lecturer_id'] = lecturer_res.data[0].get('id')
        except Exception as e:
            print("DB Error fetching lecturer:", e)
            raise HTTPException(status_code=503, detail="Service busy. Please try again.")

    return user_info

async def get_current_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

async def get_current_lecturer(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "lecturer"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

async def get_current_student(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "student":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return current_user

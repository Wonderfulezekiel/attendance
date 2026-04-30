from app.database import supabase_admin, supabase
from app.models.schemas import RegisterRequest, LoginRequest
from fastapi import HTTPException

def register_user(data: RegisterRequest):
    try:
        # Create user in Supabase Auth
        # The trigger will auto-create the public.profiles row
        auth_res = supabase_admin.auth.admin.create_user({
            "email": data.email,
            "password": data.password,
            "email_confirm": True,
            "user_metadata": {
                "full_name": data.full_name,
                "role": data.role
            }
        })
        user = auth_res.user

        # Based on role, create student or lecturer record
        if data.role == 'student':
            if not data.matric_number:
                raise HTTPException(status_code=400, detail="matric_number is required for students")
            supabase_admin.table('students').insert({
                "user_id": user.id,
                "matric_number": data.matric_number,
                "department": data.department,
                "level": data.level
            }).execute()
        elif data.role == 'lecturer':
            if not data.staff_number:
                raise HTTPException(status_code=400, detail="staff_number is required for lecturers")
            supabase_admin.table('lecturers').insert({
                "user_id": user.id,
                "staff_number": data.staff_number,
                "department": data.department
            }).execute()

        return user
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

def login_user(data: LoginRequest):
    try:
        # We use standard sign in
        # We use supabase client directly because auth state is managed by client
        res = supabase.auth.sign_in_with_password({"email": data.email, "password": data.password})
        
        # Get profile
        profile_res = supabase_admin.table('profiles').select('*').eq('id', res.user.id).maybe_single().execute()
        profile = profile_res.data if profile_res else None
        
        if not profile:
            # If for some reason the database trigger failed, we still have the auth.user
            # but no profile. Return minimal info.
            profile = {
                'id': res.user.id,
                'full_name': res.user.user_metadata.get('full_name', 'Unknown'),
                'role': res.user.user_metadata.get('role', 'student'),
                'avatar_url': None
            }
        
        user_info = {
            "id": profile['id'],
            "full_name": profile['full_name'],
            "email": res.user.email,
            "role": profile['role'],
            "avatar_url": profile.get('avatar_url')
        }

        # Add role specific
        if profile['role'] == 'student':
            student_res = supabase_admin.table('students').select('*').eq('user_id', res.user.id).maybe_single().execute()
            if student_res and student_res.data:
                user_info['matric_number'] = student_res.data.get('matric_number')
        elif profile['role'] == 'lecturer':
            lecturer_res = supabase_admin.table('lecturers').select('*').eq('user_id', res.user.id).maybe_single().execute()
            if lecturer_res and lecturer_res.data:
                user_info['staff_number'] = lecturer_res.data.get('staff_number')

        return {
            "access_token": res.session.access_token,
            "user": user_info
        }
    except Exception as e:
        if type(e).__name__ == 'AuthApiError' or hasattr(e, 'message'):
            raise HTTPException(status_code=401, detail=getattr(e, 'message', str(e)))
        raise HTTPException(status_code=400, detail=str(e))

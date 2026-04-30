from fastapi import APIRouter, Depends, HTTPException
from app.models.schemas import RegisterRequest, LoginRequest, TokenResponse, UserProfile
from app.services import auth_service
from app.dependencies import get_current_user

router = APIRouter()

@router.post("/register")
def register(data: RegisterRequest):
    user = auth_service.register_user(data)
    return {"message": "User registered successfully", "user_id": user.id}

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest):
    return auth_service.login_user(data)

@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout():
    # Since we use JWT, actual logout is typically handled client-side by deleting the token.
    # Supabase provides an auth.sign_out() but it requires the token/session.
    # For now, we'll just return success. The client must discard the token.
    return {"message": "Logged out successfully"}

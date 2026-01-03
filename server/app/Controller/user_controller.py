from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta
from typing import List

from app.Models.database import get_db
from app.Schemas.user_schemas import (
    LoginRequest, UserProfileUpdate, PasswordUpdate, UserResponse, UserSimpleResponse
)
from app.utility.security import create_access_token, create_refresh_token, verify_token
from app.utility.encription import encrypt_user_data, decrypt_user_data
from app.Services.user_sevices import (
    authenticate_user, get_user_by_username,
    get_all_users_with_details, update_user_profile,
    update_user_password
)

router = APIRouter(prefix="/users-master", tags=["Authentication"])

# ----------------------------------------------------------------
# ✅ READ ALL USERS
# ----------------------------------------------------------------
@router.get("/", response_model=List[UserResponse])
async def read_all_users(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await get_all_users_with_details(db, skip, limit)

# ----------------------------------------------------------------
# ✅ LOGIN (set JWT + encrypted user data cookies)
# ----------------------------------------------------------------
@router.post("/login")
async def login_for_access_token(form_data: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    user = await authenticate_user(db, form_data.User_Name, form_data.User_Password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    if getattr(user, "IsLocked", False):
        raise HTTPException(status_code=401, detail="Account is locked")

    # JWT tokens
    access_token_expires = timedelta(minutes=30)
    refresh_token_expires = timedelta(days=7)
    access_token = create_access_token(data={"sub": user.User_Name, "uid": user.uid}, expires_delta=access_token_expires)
    refresh_token = create_refresh_token(data={"sub": user.User_Name, "type": "refresh"}, expires_delta=refresh_token_expires)

    # Encrypted user data cookie
    encrypted_user_data = encrypt_user_data({
        "uid": user.uid,
        "User_Id": user.User_Id,
        "User_Name": user.User_Name,
        "User_Type": user.User_Type,
    })

    # Set cookies
    response.set_cookie(key="access_token", value=access_token, httponly=True, samesite="lax", secure=False, max_age=1800)
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, samesite="lax", secure=False, max_age=604800)
    response.set_cookie(key="user_data", value=encrypted_user_data, httponly=False, samesite="lax", secure=False, max_age=1800)

    return {"message": "Login successful"}

# ----------------------------------------------------------------
# ✅ GET CURRENT USER (reads encrypted cookie)
# ----------------------------------------------------------------
@router.get("/me")
async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    username = payload.get("sub")
    user = await get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    encrypted_data = request.cookies.get("user_data")
    user_info = None
    if encrypted_data:
        user_info = decrypt_user_data(encrypted_data)
        if not user_info:
            raise HTTPException(status_code=400, detail="Invalid encrypted user data")

    return {
        "uid": user.uid,
        "User_Id": user.User_Id,
        "User_Name": user.User_Name,
        "User_Type": user.User_Type,
        "EmailId": user.EmailId,
        "user_data_cookie": user_info,
    }

# ----------------------------------------------------------------
# ✅ LOGOUT
# ----------------------------------------------------------------
@router.post("/logout")
async def logout_user(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    response.delete_cookie("user_data")
    return {"message": "Logged out successfully"}

# ----------------------------------------------------------------
# ✅ UPDATE PROFILE
# ----------------------------------------------------------------
@router.put("/profile/{uid}", response_model=UserSimpleResponse)
async def update_user_profile_api(uid: int, profile_data: UserProfileUpdate, db: AsyncSession = Depends(get_db)):
    update_dict = profile_data.dict(exclude_unset=True)
    user = await update_user_profile(db, uid, update_dict)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ----------------------------------------------------------------
# ✅ UPDATE PASSWORD
# ----------------------------------------------------------------
@router.put("/password/{uid}")
async def update_user_password_api(uid: int, password_data: PasswordUpdate, db: AsyncSession = Depends(get_db)):
    if password_data.new_password != password_data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    success = await update_user_password(db, uid, password_data.current_password, password_data.new_password)
    if not success:
        raise HTTPException(status_code=400, detail="Current password incorrect")
    return {"message": "Password updated successfully"}

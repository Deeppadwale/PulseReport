
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.Models.database import get_db
from app.Schemas.otpVerification_shemas import OTPCreateRequest, OTPVerifyRequest
from app.Services.otpVerification import (
    normalize_mobile,
    send_otp_service,
    verify_otp_and_get_user,
  
)

router = APIRouter(prefix="/otp", tags=["OTP Verification"])

STATIC_MOBILE = "8888118888"
STATIC_OTP = "987654"


@router.post("/send")
async def send_otp(
    request: OTPCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    success = await send_otp_service(db, request.mobile)
    if not success:
        raise HTTPException(status_code=404, detail="Mobile not registered")

    return {"message": "OTP sent successfully"}

@router.post("/verify")
async def verify_otp(
    request: OTPVerifyRequest,
    db: AsyncSession = Depends(get_db)
):
    mobile_norm = normalize_mobile(request.mobile)

    # STATIC MOBILE FLAG
    is_static = (
        mobile_norm == STATIC_MOBILE and
        request.otp_code == STATIC_OTP
    )

    if mobile_norm == STATIC_MOBILE and not is_static:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    success, family_id, member_id, user_name, user_type, family_name = await verify_otp_and_get_user(
        db,
        mobile_norm,
        request.otp_code,
        is_static=is_static
    )

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Mobile not registered or OTP invalid"
        )

    return {
        "message": "OTP verified successfully",
        "Family_id": family_id,
        "Member_id": member_id,
        "User_Name": user_name,
        "User_Type": user_type,
        "Family_Name": family_name
    }

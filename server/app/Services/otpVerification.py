
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import datetime
from sqlalchemy import text

from app.Models.otpVerification_model import Med_OtpVerification
from app.Models.FamilyMasterMain_model import Med_FamilyMaster
from app.Models.memberMaster_model import Med_MemberMaster
from app.utility.otp_utility_waba import (
    generate_otp,
    build_otp_expiry,
    hash_otp,
    verify_otp_hash,
    send_whatsapp_otp
)

STATIC_MOBILE = "8888118888"


# ---------- HELPERS ----------
def normalize_mobile(mobile: str) -> str:
    return mobile[-10:]


def normalize_whatsapp_mobile(mobile: str) -> str:
    return "+91" + mobile


def split_mobiles(mobile_str: str) -> list[str]:
    return [normalize_mobile(m.strip()) for m in mobile_str.split(",") if m.strip()]


# ---------- SEND OTP ----------
async def send_otp_service(db: AsyncSession, mobile: str) -> bool:
    mobile_norm = normalize_mobile(mobile)

    # ✅ STATIC MOBILE → NO OTP SEND
    if mobile_norm == STATIC_MOBILE:
        return True

    # 🔍 CHECK FAMILY MASTER
    result = await db.execute(select(Med_FamilyMaster))
    families = result.scalars().all()

    family = None
    for f in families:
        if mobile_norm in split_mobiles(f.Mobile or ""):
            family = f
            break

    # 🔍 IF NOT FOUND → CHECK MEMBER MASTER
    if not family:
        result = await db.execute(
            select(Med_MemberMaster).where(Med_MemberMaster.Mobile_no == mobile_norm)
        )
        member = result.scalars().first()
        if not member:
            return False

        family = await db.get(Med_FamilyMaster, member.Family_id)

    # 🔐 CREATE OTP
    otp = generate_otp()
    expiry = build_otp_expiry(1)

    entry = Med_OtpVerification(
        Family_id=family.Family_id,
        mobile=mobile_norm,
        otp_code=hash_otp(otp),
        expiry=expiry,
        attempts=0,
        is_verified=False
    )

    db.add(entry)
    await db.commit()

    send_whatsapp_otp(normalize_whatsapp_mobile(mobile_norm), otp)
    return True



# async def verify_otp_and_get_user(
#     db: AsyncSession,
#     mobile: str,
#     otp_code: str,
#     *,
#     is_static: bool = False
# ):
#     """
#     Returns:
#     (success: bool, family_id, user_name, user_type)
#     """

#     # ---------------- OTP VALIDATION ----------------
#     if not is_static:
#         result = await db.execute(
#             select(Med_OtpVerification)
#             .where(
#                 Med_OtpVerification.mobile == mobile,
#                 Med_OtpVerification.is_verified == False
#             )
#             .order_by(Med_OtpVerification.created_at.desc())
#         )

#         entry = result.scalars().first()

#         if (
#             not entry or
#             datetime.utcnow() > entry.expiry or
#             entry.attempts >= 5 or
#             not verify_otp_hash(otp_code, entry.otp_code)
#         ):
#             if entry:
#                 entry.attempts += 1
#                 await db.commit()
#             return False, None, None, None

#         entry.is_verified = True
#         await db.commit()

#     # ---------------- FAMILY MASTER (PRIORITY) ----------------
#     family_query = text("""
#         SELECT TOP 1
#             FM.Family_id,
#             FM.User_Name,
#             FM.User_Type
#         FROM Med_FamilyMaster FM
#         WHERE FM.Mobile = :mobile
#     """)

#     result = await db.execute(family_query, {"mobile": mobile})
#     family_row = result.first()

#     if family_row:
#         return True, family_row[0], family_row[1], family_row[2]

#     # ---------------- MEMBER MASTER (FALLBACK) ----------------
#     member_query = text("""
#         SELECT TOP 1
#             FM.Family_id,
#             MM.Member_name AS User_Name,
#             'MEMBER' AS User_Type
#         FROM Med_MemberMaster MM
#         JOIN Med_FamilyMaster FM ON FM.Family_id = MM.Family_id
#         WHERE MM.Mobile_no = :mobile
#     """)

#     result = await db.execute(member_query, {"mobile": mobile})
#     member_row = result.first()

#     if member_row:
#         return True, member_row[0], member_row[1], member_row[2]

#     return False, None, None, None




# async def verify_otp_and_get_user(
#     db: AsyncSession,
#     mobile: str,
#     otp_code: str,
#     *,
#     is_static: bool = False
# ):
#     """
#     Returns:
#     (success, family_id, member_id, user_name, user_type)
#     """

#     # ---------------- OTP VALIDATION ----------------
#     if not is_static:
#         result = await db.execute(
#             select(Med_OtpVerification)
#             .where(
#                 Med_OtpVerification.mobile == mobile,
#                 Med_OtpVerification.is_verified == False
#             )
#             .order_by(Med_OtpVerification.created_at.desc())
#         )

#         entry = result.scalars().first()

#         if (
#             not entry or
#             datetime.utcnow() > entry.expiry or
#             entry.attempts >= 5 or
#             not verify_otp_hash(otp_code, entry.otp_code)
#         ):
#             if entry:
#                 entry.attempts += 1
#                 await db.commit()
#             return False, None, None, None, None

#         entry.is_verified = True
#         await db.commit()

#     # ---------------- FAMILY MASTER (PRIORITY) ----------------
#     family_query = text("""
#         SELECT TOP 1
#             FM.Family_id,
#             FM.User_Name,
#             FM.User_Type
#         FROM Med_FamilyMaster FM
#         WHERE FM.Mobile = :mobile
#     """)

#     result = await db.execute(family_query, {"mobile": mobile})
#     family_row = result.first()

#     if family_row:
#         return True, family_row[0], None, family_row[1], family_row[2]

#     # ---------------- MEMBER MASTER (FALLBACK) ----------------
#     member_query = text("""
#         SELECT TOP 1
#             FM.Family_id,
#             MM.Member_id,
#             MM.Member_name AS User_Name,
#             MM.User_type AS User_Type
#         FROM Med_MemberMaster MM
#         JOIN Med_FamilyMaster FM ON FM.Family_id = MM.Family_id
#         WHERE MM.Mobile_no = :mobile
#     """)

#     result = await db.execute(member_query, {"mobile": mobile})
#     member_row = result.first()

#     if member_row:
#         return True, member_row[0], member_row[1], member_row[2], member_row[3]

#     # ---------------- NOT FOUND ----------------
#     return False, None, None, None, None

async def verify_otp_and_get_user(
    db: AsyncSession,
    mobile: str,
    otp_code: str,
    *,
    is_static: bool = False
):
    """
    Returns:
    (success, family_id, member_id, user_name, user_type, family_name)
    """

    # ---------------- OTP VALIDATION ----------------
    if not is_static:
        result = await db.execute(
            select(Med_OtpVerification)
            .where(
                Med_OtpVerification.mobile == mobile,
                Med_OtpVerification.is_verified == False
            )
            .order_by(Med_OtpVerification.created_at.desc())
        )

        entry = result.scalars().first()

        if (
            not entry or
            datetime.utcnow() > entry.expiry or
            entry.attempts >= 5 or
            not verify_otp_hash(otp_code, entry.otp_code)
        ):
            if entry:
                entry.attempts += 1
                await db.commit()
            return False, None, None, None, None, None

        entry.is_verified = True
        await db.commit()

    # ---------------- FAMILY MASTER (PRIORITY) ----------------
    family_query = text("""
        SELECT TOP 1
            Family_id,
            User_Name,
            User_Type,
            Family_name
        FROM Med_FamilyMaster
        WHERE Mobile = :mobile
    """)

    result = await db.execute(family_query, {"mobile": mobile})
    family_row = result.first()

    if family_row:
        family_id, user_name, user_type, family_name = family_row

        # 🔍 Member match using Mobile number
        member_query = text("""
            SELECT TOP 1
                Member_id
            FROM Med_MemberMaster
            WHERE Family_id = :family_id
              AND Mobile_no = :mobile
        """)

        member_result = await db.execute(
            member_query,
            {"family_id": family_id, "mobile": mobile}
        )

        member_row = member_result.first()
        member_id = member_row[0] if member_row else None

        return True, family_id, member_id, user_name, user_type, family_name

    # ---------------- MEMBER MASTER (FALLBACK) ----------------
    member_query = text("""
        SELECT TOP 1
            FM.Family_id,
            MM.Member_id,
            MM.Member_name AS User_Name,
            MM.User_type AS User_Type,
            FM.Family_name
        FROM Med_MemberMaster MM
        JOIN Med_FamilyMaster FM ON FM.Family_id = MM.Family_id
        WHERE MM.Mobile_no = :mobile
    """)

    result = await db.execute(member_query, {"mobile": mobile})
    member_row = result.first()

    if member_row:
        return True, member_row[0], member_row[1], member_row[2], member_row[3], member_row[4]

    # ---------------- NOT FOUND ----------------
    return False, None, None, None, None, None

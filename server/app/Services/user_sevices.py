from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.Models.user_model import TblUser, TblUserDetail

async def get_all_users_with_details(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(TblUser)
        .options(selectinload(TblUser.details))
        .order_by(TblUser.uid)
        .offset(skip)
        .limit(limit)
    )
    users = result.scalars().all()
    return users or []

async def get_user_by_username(db: AsyncSession, username: str) -> TblUser:
    result = await db.execute(
        select(TblUser).filter(TblUser.User_Name == username)
    )
    user = result.scalars().first()
    return user

async def get_user_by_uid(db: AsyncSession, uid: int) -> TblUser:
    result = await db.execute(
        select(TblUser)
        .options(selectinload(TblUser.details))
        .filter(TblUser.uid == uid)
    )
    user = result.scalars().first()
    return user

async def authenticate_user(db: AsyncSession, username: str, password: str) -> TblUser:
    user = await get_user_by_username(db, username)
    if not user:
        return False
    
    if user.User_Password != password:
        return False
    
    return user

async def update_user_profile(db: AsyncSession, uid: int, update_data: dict) -> TblUser:
    result = await db.execute(
        select(TblUser).filter(TblUser.uid == uid)
    )
    user = result.scalars().first()
    
    if not user:
        return None
    
    for key, value in update_data.items():
        if hasattr(user, key) and value is not None:
            setattr(user, key, value)
    
    await db.commit()
    await db.refresh(user)
    return user

async def update_user_password(db: AsyncSession, uid: int, current_password: str, new_password: str) -> bool:
    result = await db.execute(
        select(TblUser).filter(TblUser.uid == uid)
    )
    user = result.scalars().first()
    
    if not user:
        return False
    
    if user.User_Password != current_password:
        return False
    
    user.User_Password = new_password
    await db.commit()
    return True

async def get_user_with_details_dict(db: AsyncSession, uid: int) -> dict:
    result = await db.execute(
        select(TblUser)
        .options(selectinload(TblUser.details))
        .filter(TblUser.uid == uid)
    )
    user = result.scalars().first()
    
    if not user:
        return None
    
    user_dict = {
        "uid": user.uid,
        "User_Name": user.User_Name,
        "User_Type": user.User_Type,
        "EmailId": user.EmailId,
        "userfullname": user.userfullname,
        "Mobile": user.Mobile,
        "User_Id": user.User_Id,
        "details": [
            {
                "Detail_Id": detail.Detail_Id,
                "User_Id": detail.User_Id,
                "Program_Name": detail.Program_Name,
                "Tran_Type": detail.Tran_Type,
                "Permission": detail.Permission,
                "Company_Code": detail.Company_Code,
                "Created_By": detail.Created_By,
                "Modified_By": detail.Modified_By,
                "Created_Date": detail.Created_Date,
                "Modified_Date": detail.Modified_Date,
                "Year_Code": detail.Year_Code,
                "udid": detail.udid,
                "uid": detail.uid,
                "canView": detail.canView,
                "canEdit": detail.canEdit,
                "canSave": detail.canSave,
                "canDelete": detail.canDelete,
                "DND": detail.DND,
                "menuNames": detail.menuNames
            }
            for detail in user.details
        ] if user.details else []
    }
    
    return user_dict
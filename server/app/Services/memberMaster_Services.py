# import os
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy.future import select
# from sqlalchemy import func
# from datetime import date
# from typing import Optional
# from app.Models.memberMaster_model import Med_MemberMaster


# async def get_all_members(
#     db: AsyncSession,
#     skip: int = 0,
#     limit: int = 100,
#     family_id: Optional[int] = None
# ):
#     query = (
#         select(Med_MemberMaster)
#         .order_by(Med_MemberMaster.Member_id.desc())
#         .offset(skip)
#         .limit(limit)
#     )

#     if family_id is not None:
#         query = query.where(Med_MemberMaster.Family_id == family_id)

#     result = await db.execute(query)
#     return result.scalars().all()

# async def get_max_doc_no(db: AsyncSession) -> int:
#     result = await db.execute(select(func.max(Med_MemberMaster.doc_No)))
#     max_doc_no = result.scalar()
#     return max_doc_no or 0


# async def get_member_by_id(db: AsyncSession, member_id: int) -> Optional[Med_MemberMaster]:
#     result = await db.execute(select(Med_MemberMaster).filter(Med_MemberMaster.Member_id == member_id))
#     return result.scalars().first()


# async def get_member_by_mobile(db: AsyncSession, mobile_no: str) -> Optional[Med_MemberMaster]:
#     result = await db.execute(select(Med_MemberMaster).filter(Med_MemberMaster.Mobile_no == mobile_no))
#     return result.scalars().first()


# async def create_member(db: AsyncSession, member_data):
#     max_doc_no = await get_max_doc_no(db)
#     next_doc_no = max_doc_no + 1

#     data = member_data.dict()
#     data["doc_No"] = next_doc_no
#     data["Created_at"] = date.today()

#     new_member = Med_MemberMaster(**data)
#     db.add(new_member)
#     await db.commit()
#     await db.refresh(new_member)
#     return new_member


# async def update_member(db: AsyncSession, db_member: Med_MemberMaster, update_data, User_file_path=None, pan_file_path=None, adhar_file_path=None, insurance_file_path=None):
#     update_dict = update_data.dict(exclude_unset=True)


#     def replace_file(old_path, new_path):
#         if new_path:
#             if old_path and os.path.exists(old_path):
#                 os.remove(old_path)
#             return new_path
#         return old_path

#     db_member.User_Image = replace_file(db_member.User_Image, User_file_path)
#     db_member.pan_no = replace_file(db_member.pan_no, pan_file_path)
#     db_member.adhar_card = replace_file(db_member.adhar_card, adhar_file_path)
#     db_member.insurance = replace_file(db_member.insurance, insurance_file_path)

#     for key, value in update_dict.items():
#         setattr(db_member, key, value)

#     db.add(db_member)
#     await db.commit()
#     await db.refresh(db_member)
#     return db_member


# async def delete_member(db: AsyncSession, member_id: int):
#     db_member = await get_member_by_id(db, member_id)
#     if db_member:
   
#         for file_path in [db_member.pan_no, db_member.adhar_card, db_member.insurance]:
#             if file_path and os.path.exists(file_path):
#                 os.remove(file_path)
#         await db.delete(db_member)
#         await db.commit()
#     return db_member







import os
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import date
from typing import Optional

from app.Models.memberMaster_model import Med_MemberMaster

# ---------- GET ALL ----------
async def get_all_members(
    db: AsyncSession,
    family_id: Optional[int] = None
):
    query = select(Med_MemberMaster).order_by(Med_MemberMaster.Member_id.desc())
    if family_id:
        query = query.where(Med_MemberMaster.Family_id == family_id)

    result = await db.execute(query)
    return result.scalars().all()




async def get_max_doc_no(db: AsyncSession) -> int:
    result = await db.execute(select(func.max(Med_MemberMaster.doc_No)))
    max_doc_no = result.scalar()
    return max_doc_no or 0  


# ---------- GET BY ID ----------
async def get_member_by_id(db: AsyncSession, member_id: int):
    result = await db.execute(
        select(Med_MemberMaster)
        .where(Med_MemberMaster.Member_id == member_id)
    )
    return result.scalars().first()

from fastapi import HTTPException, status
from sqlalchemy import select

async def create_member(db: AsyncSession, member_data):
    # 🔒 CHECK MOBILE NUMBER DUPLICATE
    stmt = select(Med_MemberMaster).where(
        Med_MemberMaster.Mobile_no == member_data.Mobile_no
    )
    result = await db.execute(stmt)
    existing_member = result.scalars().first()

    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Mobile number already exists"
        )

    # 📄 AUTO DOC NUMBER
    result = await db.execute(select(func.max(Med_MemberMaster.doc_No)))
    max_doc = result.scalar() or 0

    data = member_data.dict()
    data["doc_No"] = max_doc + 1
    data["Created_at"] = date.today()

    member = Med_MemberMaster(**data)
    db.add(member)
    await db.commit()
    await db.refresh(member)

    return member

from fastapi import HTTPException, status
from sqlalchemy import select

async def update_member(
    db: AsyncSession,
    db_member: Med_MemberMaster,
    update_data,
    user_image_path=None,
    pan_file_path=None,
    adhar_file_path=None,
    insurance_file_path=None
):
    # 🔒 MOBILE NUMBER DUPLICATE CHECK
    if update_data.Mobile_no:
        stmt = select(Med_MemberMaster).where(
            Med_MemberMaster.Mobile_no == update_data.Mobile_no,
            Med_MemberMaster.Member_id != db_member.Member_id
        )
        result = await db.execute(stmt)
        if result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Mobile number already exists"
            )

    # 📁 FILE REPLACEMENT LOGIC
    def replace(old, new):
        if new:
            if old and os.path.isfile(old):
                try:
                    os.remove(old)
                except Exception:
                    pass
            return new
        return old

    db_member.User_Image = replace(db_member.User_Image, user_image_path)
    db_member.pan_no = replace(db_member.pan_no, pan_file_path)
    db_member.adhar_card = replace(db_member.adhar_card, adhar_file_path)
    db_member.insurance = replace(db_member.insurance, insurance_file_path)

    # 📝 UPDATE NORMAL FIELDS
    for k, v in update_data.dict(exclude_unset=True).items():
        setattr(db_member, k, v)

    await db.commit()
    await db.refresh(db_member)
    return db_member

# ---------- DELETE ----------
async def delete_member(db: AsyncSession, member_id: int):
    db_member = await get_member_by_id(db, member_id)
    if db_member:
   
        for file_path in [db_member.pan_no, db_member.adhar_card, db_member.insurance]:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
        await db.delete(db_member)
        await db.commit()
    return db_member
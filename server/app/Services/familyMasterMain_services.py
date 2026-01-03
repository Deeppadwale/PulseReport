from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.Models.FamilyMasterMain_model import Med_FamilyMaster
from app.Schemas.familyMasterMain_schemas import FamilyCreateSchema, LoginSchema

async def verify_user(db: AsyncSession, login_data: LoginSchema):
    result = await db.execute(
        select(Med_FamilyMaster).where(Med_FamilyMaster.User_Name == login_data.User_Name)
    )
    user = result.scalars().first()
    
    if user and user.User_Password == login_data.User_Password:
        return user  
    return None



async def create_family(db: AsyncSession, data: FamilyCreateSchema):
    family = Med_FamilyMaster(**data.dict())
    db.add(family)
    await db.commit()
    await db.refresh(family)
    return family

async def get_all_families(db: AsyncSession):
    result = await db.execute(select(Med_FamilyMaster))
    return result.scalars().all()


async def get_family_count(db):
    result = await db.execute(
        select(func.count()).select_from(Med_FamilyMaster)
    )
    return result.scalar()

async def get_family_by_id(db: AsyncSession, family_id: int):
    result = await db.execute(
        select(Med_FamilyMaster).where(Med_FamilyMaster.Family_id == family_id)
    )
    return result.scalars().first()


async def update_family(db: AsyncSession, family_id: int, data: FamilyCreateSchema):
    family = await get_family_by_id(db, family_id)
    if not family:
        return None

    for key, value in data.dict().items():
        setattr(family, key, value)

    await db.commit()
    await db.refresh(family)
    return family


async def delete_family(db: AsyncSession, family_id: int):
    family = await get_family_by_id(db, family_id)
    if not family:
        return False

    await db.delete(family)
    await db.commit()
    return True

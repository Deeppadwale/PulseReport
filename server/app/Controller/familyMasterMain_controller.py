from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.Models.database import get_db
from app.Schemas.familyMasterMain_schemas import FamilyCreateSchema, FamilyResponseSchema, LoginSchema
from app.Services.familyMasterMain_services import (
    create_family,
    get_all_families,
    get_family_by_id,
    get_family_count,
    update_family,
    delete_family,
    verify_user
)

router = APIRouter(
    prefix="/familiesMain",
    tags=["Family Master Main"]
)

@router.post("/login")
async def login_user(login_data: LoginSchema, db: AsyncSession = Depends(get_db)):
    user = await verify_user(db, login_data)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return {
        "message": "Login successful",
        "user_id": user.Family_id,
        "user_name": user.User_Name,
        "user_type": user.User_Type,
        "Family_id":user.Family_id 
    }


@router.post("/", response_model=FamilyResponseSchema)
async def create_family_api(
    data: FamilyCreateSchema,
    db: AsyncSession = Depends(get_db)
):
    return await create_family(db, data)

@router.get("/", response_model=List[FamilyResponseSchema])
async def get_all_families_api(
    db: AsyncSession = Depends(get_db)
):
    return await get_all_families(db)


@router.get("/count")
async def get_family_count_api(db: AsyncSession = Depends(get_db)):
    total = await get_family_count(db)
    return  total


@router.get("/{family_id}", response_model=FamilyResponseSchema)
async def get_family_by_id_api(
    family_id: int,
    db: AsyncSession = Depends(get_db)
):
    family = await get_family_by_id(db, family_id)
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
    return family


@router.put("/{family_id}", response_model=FamilyResponseSchema)
async def update_family_api(
    family_id: int,
    data: FamilyCreateSchema,
    db: AsyncSession = Depends(get_db)
):
    family = await update_family(db, family_id, data)
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
    return family


@router.delete("/{family_id}")
async def delete_family_api(
    family_id: int,
    db: AsyncSession = Depends(get_db)
):
    success = await delete_family(db, family_id)
    if not success:
        raise HTTPException(status_code=404, detail="Family not found")
    return {"message": "Family deleted successfully"}
      
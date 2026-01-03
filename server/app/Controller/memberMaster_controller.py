
import mimetypes
from fastapi import (
    APIRouter, Depends, HTTPException,
    status, UploadFile, File, Form
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from typing import List, Optional
from datetime import date
import os
from fastapi import Query, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.Models.database import get_db
from app.Models.memberMaster_model import Med_MemberMaster
from app.Services.memberMaster_Services import (
    get_all_members,
    get_member_by_id,
    create_member,
    update_member,
    delete_member
)
from app.Schemas.memberMaster_schemas import (
    MemberCreate,
    MemberUpdate,
    MemberResponse
)

router = APIRouter(prefix="/members", tags=["Members"])

# ---------- UPLOAD PATHS ----------
UPLOAD_ROOT = "upload"
USER_FOLDER = os.path.join(UPLOAD_ROOT, "userImages")
PAN_FOLDER = os.path.join(UPLOAD_ROOT, "pancard")
ADHAR_FOLDER = os.path.join(UPLOAD_ROOT, "adharcard")
INSURANCE_FOLDER = os.path.join(UPLOAD_ROOT, "insurance")

for folder in [USER_FOLDER, PAN_FOLDER, ADHAR_FOLDER, INSURANCE_FOLDER]:
    os.makedirs(folder, exist_ok=True)


@router.get("/count")
async def get_member_count(
    family_id: Optional[int] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(func.count(Med_MemberMaster.Member_id))

    if family_id is not None:
        stmt = stmt.where(Med_MemberMaster.Family_id == family_id)

    result = await db.execute(stmt)
    total = result.scalar() or 0

    return  total

# ---------- LIST ----------
@router.get("/", response_model=List[MemberResponse])
async def list_members(
    family_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    return await get_all_members(db, family_id=family_id)


@router.get("/max-doc-no")
async def get_max_doc_no_endpoint(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(func.max(Med_MemberMaster.doc_No)))
    max_doc_no = result.scalar()
    return  max_doc_no 

@router.post("/", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
async def create_new_member(
    Family_id: int = Form(...),
    Member_name: str = Form(...),
    Member_address: str = Form(...),
    Mobile_no: str = Form(...),
    Created_by: str = Form(...),
    User_Type:str=Form(...),
    other_details: Optional[str] = Form(None),
    blood_group: Optional[str] = Form(None),
    date_of_birth: Optional[date] = Form(None),

    user_image: Optional[UploadFile] = File(None),
    pan_file: Optional[UploadFile] = File(None),
    adhar_file: Optional[UploadFile] = File(None),
    insurance_file: Optional[UploadFile] = File(None),

    db: AsyncSession = Depends(get_db)
):
    def save_file(folder, file):
        if not file:
            return None
        path = os.path.join(folder, file.filename)
        with open(path, "wb") as f:
            f.write(file.file.read())
        return path

    user_image_path = save_file(USER_FOLDER, user_image)
    pan_path = save_file(PAN_FOLDER, pan_file)
    adhar_path = save_file(ADHAR_FOLDER, adhar_file)
    insurance_path = save_file(INSURANCE_FOLDER, insurance_file)

    member_data = MemberCreate(
        Family_id=Family_id,
        Member_name=Member_name,
        Member_address=Member_address,
        Mobile_no=Mobile_no,
        Created_by=Created_by,
        User_Type=User_Type,
        other_details=other_details,
        blood_group=blood_group,
        date_of_birth=date_of_birth,
        User_Image=user_image_path,
        pan_no=pan_path,
        adhar_card=adhar_path,
        insurance=insurance_path
    )

    return await create_member(db, member_data)

# ---------- UPDATE ----------
@router.put("/{member_id}", response_model=MemberResponse)
async def update_member_api(
    member_id: int,

    Member_name: Optional[str] = Form(None),
    Member_address: Optional[str] = Form(None),
    Mobile_no: Optional[str] = Form(None),
    other_details: Optional[str] = Form(None),
    User_Type:Optional[str]=Form(None),
    blood_group: Optional[str] = Form(None),
    date_of_birth: Optional[date] = Form(None),
    Modified_by: Optional[str] = Form(None),

    user_image: Optional[UploadFile] = File(None),
    pan_file: Optional[UploadFile] = File(None),
    adhar_file: Optional[UploadFile] = File(None),
    insurance_file: Optional[UploadFile] = File(None),

    db: AsyncSession = Depends(get_db)
):
    member = await get_member_by_id(db, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    def save_file(folder, file):
        if not file:
            return None
        path = os.path.join(folder, file.filename)
        with open(path, "wb") as f:
            f.write(file.file.read())
        return path

    user_image_path = save_file(USER_FOLDER, user_image)
    pan_path = save_file(PAN_FOLDER, pan_file)
    adhar_path = save_file(ADHAR_FOLDER, adhar_file)
    insurance_path = save_file(INSURANCE_FOLDER, insurance_file)

    update_data = MemberUpdate(
        Member_name=Member_name,
        Member_address=Member_address,
        Mobile_no=Mobile_no,
        other_details=other_details,
        User_Type=User_Type,
        blood_group=blood_group,
        date_of_birth=date_of_birth,
        Modified_by=Modified_by
    )

    return await update_member(
        db,
        member,
        update_data,
        user_image_path,
        pan_path,
        adhar_path,
        insurance_path
    )


DEFAULT_IMAGE_PATH = "assets/"

@router.get("/userimage", response_class=FileResponse)
async def get_user_image(
    member_id: int | None = Query(default=None),
    family_id: int | None = Query(default=None),
    db: AsyncSession = Depends(get_db)
):
    if member_id is None and family_id is None:
        raise HTTPException(status_code=400, detail="member_id or family_id is required")

    stmt = select(Med_MemberMaster)
    stmt = stmt.where(
        Med_MemberMaster.Member_id == member_id
        if member_id else
        Med_MemberMaster.Family_id == family_id
    )

    result = await db.execute(stmt)
    member = result.scalars().first()

    image_path = None

    if member and member.User_Image:
        image_path = member.User_Image.replace("\\", "/")

    # ✅ fallback to default image
    if not image_path or not os.path.isfile(image_path):
        image_path = DEFAULT_IMAGE_PATH

    mime_type, _ = mimetypes.guess_type(image_path)
    mime_type = mime_type or "image/png"

    return FileResponse(image_path, media_type=mime_type)



# ---------- GET MEMBER BY ID ----------
@router.get("/{member_id}", response_model=MemberResponse)
async def get_member(member_id: int, db: AsyncSession = Depends(get_db)):
    member = await get_member_by_id(db, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return member

from fastapi import Query




@router.delete("/{member_id}", status_code=status.HTTP_200_OK)
async def delete_member_api(
    member_id: int,
    db: AsyncSession = Depends(get_db)
):
    member = await delete_member(db, member_id)

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    return {"message": "Member deleted successfully"}

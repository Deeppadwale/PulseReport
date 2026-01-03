
from pydantic import BaseModel
from typing import Optional
from datetime import date


class MemberBase(BaseModel):
    Member_name: Optional[str] = None
    Member_address: Optional[str] = None
    Mobile_no: Optional[str] = None
    other_details: Optional[str] = None
    User_Image: Optional[str] = None
    User_Type:Optional[str]=None
    pan_no: Optional[str] = None
    adhar_card: Optional[str] = None
    insurance: Optional[str] = None
    blood_group: Optional[str] = None
    date_of_birth: Optional[date] = None
    Created_by: Optional[str] = None
    Modified_by: Optional[str] = None


class MemberCreate(MemberBase):
    Family_id: int  
    Member_name: str
    Member_address: str
    Mobile_no: str
    Created_by: str
    User_Type:str

class MemberUpdate(BaseModel):
    Member_name: Optional[str] = None
    Member_address: Optional[str] = None
    Mobile_no: Optional[str] = None
    other_details: Optional[str] = None
    User_Image: Optional[str] = None
    pan_no: Optional[str] = None
    adhar_card: Optional[str] = None
    insurance: Optional[str] = None
    blood_group: Optional[str] = None
    date_of_birth: Optional[date] = None
    Modified_by: Optional[str] = None
    User_Type:Optional[str]=None


class MemberResponse(MemberBase):
    Member_id: int
    doc_No: int
    Family_id: int
    Created_at: date

    class Config:
        orm_mode = True

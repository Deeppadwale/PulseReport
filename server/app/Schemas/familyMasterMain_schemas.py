from pydantic import BaseModel
from typing import Optional

class FamilyCreateSchema(BaseModel):
    Family_Name: str
    Family_Address: Optional[str] = None
    Email_Id: Optional[str] = None
    Email_Password: Optional[str] = None
    Mobile: Optional[str] = None  
    User_Name: str
    User_Password: str
    User_Type: str
    Created_by : Optional[str] = None
    Modified_by : Optional[str] = None


class FamilyResponseSchema(BaseModel):
    Family_id: int
    Family_Name: str
    Family_Address: Optional[str] = None
    Email_Id: Optional[str] = None
    Mobile: Optional[str] = None
    User_Name: str
    User_Type: str
    User_Password: str
    Created_by: Optional[str] = None
    Modified_by : Optional[str] = None


class LoginSchema(BaseModel):
    User_Name: str
    User_Password: str    

    class Config:
        from_attributes = True  

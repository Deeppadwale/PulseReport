from pydantic import BaseModel
from typing import List, Literal, Optional
from datetime import date


class UpcomingAppointmentDetailSchema(BaseModel):
    rowaction: Literal["add", "update", "delete"]
    upcommingAppointmentDetail_id: int | None = None
    Start_date: date | None = None
    End_date: date | None = None
    Morning: str | None = None
    AfterNoon: str | None = None
    Evening: str | None = None
    Medicine_name: str | None = None




class UpcomingAppointmentUpdateSchema(BaseModel):
    Appointment_date: date
    Member_id: int
    Family_id: int
    Doctor_name: str
    Hospital_name: str
    
    Modified_by: str | None = None
    details: list[UpcomingAppointmentDetailSchema]

class UpcomingAppointmentHeadSchema(BaseModel):
    doc_No: Optional[int] = None
    Appointment_date: date
    Member_id: int
    Family_id: int
    Doctor_name: str
    Hospital_name: Optional[str]
    Created_by: str
    Modified_by: Optional[str]
    details: List[UpcomingAppointmentDetailSchema]

class UpcomingAppointmentResponse(BaseModel):
    message: str
    upcommingAppointment_id: int
    added_ids: List[int] = []
    updated_ids: List[int] = []
    deleted_ids: List[int] = []


class UpcomingAppointmentDetailView(BaseModel):
    Start_date: date
    End_date: date
    Morning: str
    AfterNoon: str
    Evening: str
    Medicine_name: str

    class Config:
        orm_mode = True


class UpcomingAppointmentView(BaseModel):
    upcommingAppointment_id: int
    doc_No: int
    Appointment_date: date
    Member_id: int
    Family_id: int
    Doctor_name: str
    Hospital_name: Optional[str]
    uploaded_file_prescription: Optional[str]

    details: List[UpcomingAppointmentDetailView]

    class Config:
        orm_mode = True

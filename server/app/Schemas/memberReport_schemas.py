
from pydantic import BaseModel
from typing import List, Optional
from datetime import date


class MemberReportDetailSchema(BaseModel):
    rowaction: str
    detail_id: Optional[int]
    report_date: date
    Report_id: int
    
    Doctor_and_Hospital_name: Optional[str]
    file_key: Optional[str]


class MemberReportHeadSchema(BaseModel):
    Member_id: int
    doc_date:date
    Family_id: int
    purpose: str
    remarks: Optional[str]
    Created_by: str
    Modified_by: Optional[str]




class MemberReportResponse(BaseModel):
    message: str
    doc_No: int
    MemberReport_id: int
    added: int
    updated_ids: List[int]
    deleted_ids: List[int]



class MemberReportDetailViewSchema(BaseModel):
    detail_id: int
    report_date: date
    Report_id: int
    report_name:Optional[str]
    Doctor_and_Hospital_name: Optional[str]
    uploaded_file_report: Optional[str]

    class Config:
        orm_mode = True    

class MemberReportResponseview(BaseModel):
    MemberReport_id: int
    doc_No: int
    doc_date:date
    Member_id: int
    Family_id: int
    purpose: str
    remarks: Optional[str]
    Created_by: str
    Modified_by: Optional[str]
    Created_at: date
    Family_Name: Optional[str]
    Member_name: Optional[str]

    details: List[MemberReportDetailViewSchema] = []

    class Config:
        orm_mode = True
    


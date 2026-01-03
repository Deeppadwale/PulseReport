from pydantic import BaseModel
from typing import Optional


class ReportBase(BaseModel):
    report_name: Optional[str] = None
    Created_by: Optional[str] = None
    Modified_by: Optional[str] = None


class ReportCreate(ReportBase):
    """Schema for creating a new report."""
    report_name: str
    Created_by: str


class ReportUpdate(BaseModel):
    report_name: Optional[str] = None
    Modified_by: Optional[str] = None


class ReportResponse(ReportBase):
    Report_id: int
    doc_No: int

    class Config:
        orm_mode = True

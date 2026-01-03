from sqlalchemy import Column, Integer, Date
from sqlalchemy.dialects.mssql import NVARCHAR
from datetime import date
from app.Models.database import Base


class Med_ReportMaster(Base):
    __tablename__ = "Med_ReportMaster"

    Report_id = Column(Integer, primary_key=True, autoincrement=True)
    doc_No = Column(Integer, nullable=False)
    report_name = Column(NVARCHAR(100), nullable=False)
    Created_by = Column(NVARCHAR(50), nullable=False)
    Modified_by = Column(NVARCHAR(50), nullable=True)
    Created_at = Column(Date, nullable=False, default=date.today)

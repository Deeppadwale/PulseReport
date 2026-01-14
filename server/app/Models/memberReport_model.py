from sqlalchemy import NVARCHAR, Column, Integer, ForeignKey, Date, String
from sqlalchemy.orm import relationship
from datetime import date
from app.Models.database import Base


class Med_MemberReport(Base):
    __tablename__ = "Med_MemberReport"

    MemberReport_id = Column(Integer, primary_key=True ,index=True)
    doc_No = Column(Integer, nullable=False)
    doc_date = Column(Date, nullable=False)
    Member_id = Column(Integer, ForeignKey("Med_MemberMaster.Member_id"), nullable=False)
    Family_id = Column(Integer, nullable=False)
    purpose = Column(String(200), nullable=False)
    remarks = Column(String(500))
    Created_by = Column(String(50), nullable=False)
    Modified_by = Column(String(50))
    Created_at = Column(Date, default=date.today, nullable=False)

    details = relationship(
        "Med_MemberReportDetail",
        back_populates="report",
        cascade="all, delete-orphan",
        lazy="selectin"
    )


class Med_MemberReportDetail(Base):
    __tablename__ = "Med_MemberReportdetail"

    detail_id = Column(Integer, primary_key=True)
    MemberReport_id = Column(
        Integer,
        ForeignKey("Med_MemberReport.MemberReport_id"),
        nullable=False
    )
    report_date = Column(Date, nullable=False)
    Report_id = Column(Integer, ForeignKey("Med_ReportMaster.Report_id"), nullable=False)
    Doctor_and_Hospital_name = Column(String(500))
    uploaded_file_report = Column(String(200))
    Naration=Column(NVARCHAR(500))
    report = relationship("Med_MemberReport", back_populates="details")

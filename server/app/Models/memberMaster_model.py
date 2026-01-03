from sqlalchemy import CHAR, Column, Integer, Date, ForeignKey
from sqlalchemy.dialects.mssql import NVARCHAR
from app.Models.database import Base


class Med_MemberMaster(Base):
    __tablename__ = "Med_MemberMaster"

    Member_id = Column(Integer, primary_key=True, autoincrement=True)
    doc_No = Column(Integer, nullable=False)
    Member_name = Column(NVARCHAR(100), nullable=False)
    Member_address = Column(NVARCHAR(100), nullable=False)
    Mobile_no = Column(NVARCHAR(100), nullable=False)
    other_details = Column(NVARCHAR(500), nullable=True)
    User_Image = Column(NVARCHAR(500), nullable=True)
    pan_no = Column(NVARCHAR(500), nullable=True)
    adhar_card = Column(NVARCHAR(500), nullable=True)
    insurance = Column(NVARCHAR(500), nullable=True)
    User_Type = Column(CHAR(1), nullable=False) 
    blood_group = Column(NVARCHAR(10), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    Family_id = Column(Integer, ForeignKey("Med_FamilyMaster.Family_id"), nullable=False)
    Created_by = Column(NVARCHAR(50), nullable=False)
    Modified_by = Column(NVARCHAR(50), nullable=True)
    Created_at = Column(Date, nullable=False)      

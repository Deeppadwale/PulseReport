from sqlalchemy import Column, Integer, CHAR
from sqlalchemy.dialects.mssql import NVARCHAR
from app.Models.database import Base

class Med_FamilyMaster(Base):
    __tablename__ = "Med_FamilyMaster"  

    Family_id = Column(Integer, primary_key=True, autoincrement=True)
    Family_Name = Column(NVARCHAR(200), nullable=False)
    Family_Address = Column(NVARCHAR(500), nullable=True)
    Email_Id = Column(NVARCHAR(200), nullable=True)
    Email_Password = Column(NVARCHAR(200), nullable=True)
    Mobile = Column(NVARCHAR(500), nullable=True)  
    User_Name = Column(NVARCHAR(50), nullable=False)
    User_Password = Column(NVARCHAR(200), nullable=False)
    User_Type = Column(CHAR(1), nullable=False)
    Created_by = Column(NVARCHAR(50), nullable=False)
    Modified_by = Column(NVARCHAR(50), nullable=True)


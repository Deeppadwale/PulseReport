from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, CHAR
from sqlalchemy.orm import relationship
from .database import Base


class TblUser(Base):
    __tablename__ = "tbluser"

    User_Id = Column(Integer,  autoincrement=True)
    User_Name = Column(String(50), nullable=False)    
    User_Type = Column(CHAR(1), nullable=False)   
    Password = Column(String(50), nullable=False)
    EmailId = Column(String(50)) 
    EmailPassword = Column(String(500))
    smtpServerPort = Column(String(50))
    AuthoGroupID = Column(Integer)
    Ac_Code = Column(Integer)
    Company_Code = Column(Integer)
    Mobile = Column(String(100))
    LastActivityDate = Column(Date)
    RetryAttempts = Column(Integer)
    IsLocked = Column(Boolean)
    LockedDateTime = Column(Date)
    Branch_Code = Column(Integer)
    uid = Column(Integer,primary_key=True, unique=True)  
    userfullname = Column(String(50))
    User_Security = Column(CHAR(1))
    Mobile_Password = Column(String(50))
    Bank_Security = Column(CHAR(1))
    PaymentsPassword = Column(String(500))
    User_Password = Column(String(50))


    details = relationship("TblUserDetail", back_populates="user", cascade="all, delete-orphan",)

class TblUserDetail(Base): 
    __tablename__ = "tbluserdetail"

    Detail_Id = Column(Integer)
    User_Id = Column(Integer,  nullable=False)
    Program_Name = Column(String(255))
    Tran_Type = Column(String(2))
    Permission = Column(String(255))
    Company_Code = Column(Integer)
    Created_By = Column(String(45))
    Modified_By = Column(String(45))
    Created_Date = Column(Date)
    Modified_Date = Column(Date)
    Year_Code = Column(Integer)
    udid = Column(Integer,primary_key=True)
    uid = Column(Integer, ForeignKey("tbluser.uid"))  # linking via uid
    canView = Column(CHAR(1))
    canEdit = Column(CHAR(1))
    canSave = Column(CHAR(1))
    canDelete = Column(CHAR(1))
    DND = Column(CHAR(1))
    menuNames = Column(String(255))


    user = relationship("TblUser", back_populates="details")

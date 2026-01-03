
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Med_OtpVerification(Base):
    __tablename__ = "Med_OtpVerification"

    id = Column(Integer, primary_key=True, autoincrement=True)
    Family_id = Column(Integer, ForeignKey("Med_FamilyMaster.Family_id"), nullable=False)
    mobile = Column(String(20), nullable=False) 
    otp_code = Column(String(255), nullable=False)  
    expiry = Column(DateTime, nullable=False)
    attempts = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

   
    family = relationship("Med_FamilyMaster", backref="otp_entries")

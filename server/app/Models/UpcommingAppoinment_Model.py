from sqlalchemy import Column, Integer, ForeignKey, Date, String, CHAR
from sqlalchemy.orm import relationship
from datetime import date
from app.Models.database import Base


class Med_upcomingAppointment_head(Base):
    __tablename__ = "Med_upcomingAppointment_head"

    upcommingAppointment_id = Column(Integer, primary_key=True, index=True)
    doc_No = Column(Integer, nullable=False)
    Appointment_date = Column(Date, nullable=False)

    Member_id = Column(Integer, ForeignKey("Med_MemberMaster.Member_id"), nullable=False)
    Family_id = Column(Integer, nullable=False)

    Doctor_name = Column(String(200), nullable=False)
    Hospital_name = Column(String(500))

    Created_by = Column(String(50), nullable=False)
    Modified_by = Column(String(50))
    Created_at = Column(Date, default=date.today, nullable=False)

    uploaded_file_prescription = Column(String(200))

    details = relationship(
        "Med_upcomingAppointment_detail",
        back_populates="appointment",
        cascade="all, delete-orphan",
        lazy="selectin"
    )


class Med_upcomingAppointment_detail(Base):
    __tablename__ = "Med_upcomingAppointment_detail"

    upcommingAppointmentDetail_id = Column(Integer, primary_key=True, index=True)
    upcommingAppointment_id = Column(
        Integer,
        ForeignKey("Med_upcomingAppointment_head.upcommingAppointment_id"),
        nullable=False
    )

    Start_date = Column(Date, nullable=False)
    End_date = Column(Date, nullable=False)

    Morning = Column(CHAR(1), nullable=False)     # Y/N
    AfterNoon = Column(CHAR(1), nullable=False)
    Evening = Column(CHAR(1), nullable=False)

    Medicine_name = Column(String(200), nullable=False)

    appointment = relationship(
        "Med_upcomingAppointment_head",
        back_populates="details"
    )

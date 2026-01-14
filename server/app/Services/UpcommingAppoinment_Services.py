from datetime import date
import os
import uuid
from sqlalchemy import and_, desc, select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import UploadFile, HTTPException

from app.Models.UpcommingAppoinment_Model import (
    Med_upcomingAppointment_head,
    Med_upcomingAppointment_detail
)
from app.Schemas.UpcommingAppoinment_Schemas import (
    UpcomingAppointmentHeadSchema,
    UpcomingAppointmentUpdateSchema
)

# ===================== PRESCRIPTION FILE HANDLER =====================

UPLOAD_DIR = "upload/prescription"


async def save_prescription_file(file: UploadFile) -> str:
    os.makedirs(UPLOAD_DIR, exist_ok=True)  # Create folder if not exists
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)

    contents = await file.read()
    with open(path, "wb") as f:
        f.write(contents)

    return path


def delete_prescription_file(file_path: str):
    if file_path and os.path.exists(file_path):
        os.remove(file_path)





from sqlalchemy.orm import contains_eager



async def get_all_appointments(db: AsyncSession):
    result = await db.execute(
        select(Med_upcomingAppointment_head).options(
            selectinload(Med_upcomingAppointment_head.details)
        )
    )
    return result.scalars().all()

async def get_appointment_by_id(db: AsyncSession, appointment_id: int):
    result = await db.execute(
        select(Med_upcomingAppointment_head)
        .join(Med_upcomingAppointment_detail)
        .options(contains_eager(Med_upcomingAppointment_head.details))
        .where(Med_upcomingAppointment_head.upcommingAppointment_id == appointment_id)
        .order_by(desc(Med_upcomingAppointment_detail.upcommingAppointmentDetail_id))
    )

    appointment = result.unique().scalars().first()
    return appointment


from sqlalchemy import select, desc
from sqlalchemy.orm import contains_eager
from app.Models.UpcommingAppoinment_Model import Med_upcomingAppointment_head, Med_upcomingAppointment_detail
from app.Models.memberMaster_model import Med_MemberMaster
from sqlalchemy.ext.asyncio import AsyncSession

async def get_appointments_by_family(db: AsyncSession, family_id: int):
    stmt = (
        select(Med_upcomingAppointment_head, Med_MemberMaster.Member_name, Med_upcomingAppointment_detail)
        .outerjoin(Med_upcomingAppointment_detail,
                   Med_upcomingAppointment_head.upcommingAppointment_id == Med_upcomingAppointment_detail.upcommingAppointment_id)
        .outerjoin(Med_MemberMaster,
                   Med_upcomingAppointment_head.Member_id == Med_MemberMaster.Member_id)
        .options(
            contains_eager(Med_upcomingAppointment_head.details)
        )
        .where(Med_upcomingAppointment_head.Family_id == family_id)
        .order_by(
            desc(Med_upcomingAppointment_head.upcommingAppointment_id),
            desc(Med_upcomingAppointment_detail.upcommingAppointmentDetail_id)
        )
    )

    result = await db.execute(stmt)
    rows = result.unique().all() 
    # Merge details per head
    appointments_dict = {}
    for head, member_name, detail in rows:
        if head.upcommingAppointment_id not in appointments_dict:
            head.Member_name = member_name
            head.details = []
            appointments_dict[head.upcommingAppointment_id] = head
        if detail:
            appointments_dict[head.upcommingAppointment_id].details.append(detail)

    return list(appointments_dict.values())



async def create_upcoming_appointment(
    db: AsyncSession,
    payload_obj: UpcomingAppointmentHeadSchema,
    prescription_file: UploadFile | None = None
):
    # Auto doc_No = max + 1
    result = await db.execute(
        select(func.coalesce(func.max(Med_upcomingAppointment_head.doc_No), 0))
    )
    doc_no = result.scalar() + 1

    file_path = None
    if prescription_file:
        file_path = await save_prescription_file(prescription_file)

    head = Med_upcomingAppointment_head(
        doc_No=doc_no,
        Appointment_date=payload_obj.Appointment_date,
        Member_id=payload_obj.Member_id,
        Family_id=payload_obj.Family_id,
        Doctor_name=payload_obj.Doctor_name,
        Hospital_name=payload_obj.Hospital_name,
        Created_by=payload_obj.Created_by,
        Modified_by=payload_obj.Modified_by,
        uploaded_file_prescription=file_path
    )

    db.add(head)
    await db.flush()

    for row in payload_obj.details:
        if row.rowaction.lower() == "add":
            db.add(
                Med_upcomingAppointment_detail(
                    upcommingAppointment_id=head.upcommingAppointment_id,
                    Start_date=row.Start_date,
                    End_date=row.End_date,
                    Morning=row.Morning,
                    AfterNoon=row.AfterNoon,
                    Evening=row.Evening,
                    Medicine_name=row.Medicine_name,
                    Remark=row.Remark,           # <-- Added
                    cource_days=row.cource_days,
                    Reminder=row.Reminder or 'Y'
                )
            )

    await db.commit()
    await db.refresh(head)

    result = await db.execute(
        select(Med_upcomingAppointment_head)
        .options(selectinload(Med_upcomingAppointment_head.details))
        .where(
            Med_upcomingAppointment_head.upcommingAppointment_id
            == head.upcommingAppointment_id
        )
    )

    return result.scalars().first()


# ========================= UPDATE =========================

async def update_upcoming_appointment(
    db: AsyncSession,
    appointment_id: int,
    payload_obj: UpcomingAppointmentUpdateSchema,
    prescription_file: UploadFile | None = None
):
    head = await db.get(Med_upcomingAppointment_head, appointment_id)
    if not head:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Update head fields
    head.Appointment_date = payload_obj.Appointment_date
    head.Member_id = payload_obj.Member_id
    head.Family_id = payload_obj.Family_id
    head.Doctor_name = payload_obj.Doctor_name
    head.Hospital_name = payload_obj.Hospital_name
    head.Modified_by = payload_obj.Modified_by

    # Handle prescription file
    if prescription_file:
        # Delete old file if exists
        delete_prescription_file(head.uploaded_file_prescription)
        # Save new file
        head.uploaded_file_prescription = await save_prescription_file(prescription_file)

    added_ids, updated_ids, deleted_ids = [], [], []

    for row in payload_obj.details:
        action = row.rowaction.lower()

        if action == "add":
            detail = Med_upcomingAppointment_detail(
                upcommingAppointment_id=appointment_id,
                Start_date=row.Start_date,
                End_date=row.End_date,
                Morning=row.Morning,
                AfterNoon=row.AfterNoon,
                Evening=row.Evening,
                Medicine_name=row.Medicine_name,
                Remark=row.Remark,           # <-- Added
                cource_days=row.cource_days,
                Reminder=row.Reminder or 'Y'
            )
            db.add(detail)
            await db.flush()
            added_ids.append(detail.upcommingAppointmentDetail_id)

        elif action == "update":
            detail = await db.get(
                Med_upcomingAppointment_detail,
                row.upcommingAppointmentDetail_id
            )
            if detail:
                detail.Start_date = row.Start_date
                detail.End_date = row.End_date
                detail.Morning = row.Morning
                detail.AfterNoon = row.AfterNoon
                detail.Evening = row.Evening
                detail.Medicine_name = row.Medicine_name
                detail.Remark=row.Remark # <-- Added
                detail.cource_days=row.cource_days
                detail.Reminder = row.Reminder or 'Y'
                updated_ids.append(detail.upcommingAppointmentDetail_id)

        elif action == "delete":
            detail = await db.get(
                Med_upcomingAppointment_detail,
                row.upcommingAppointmentDetail_id
            )
            if detail:
                await db.delete(detail)
                deleted_ids.append(row.upcommingAppointmentDetail_id)

    await db.commit()
    await db.refresh(head)

    return {
        "message": "Appointment updated successfully",
        "appointment_id": appointment_id,
        "added_ids": added_ids,
        "updated_ids": updated_ids,
        "deleted_ids": deleted_ids
    }



async def delete_upcoming_appointment(db: AsyncSession, appointment_id: int):
    # Fetch appointment head
    head = await db.get(Med_upcomingAppointment_head, appointment_id)
    if not head:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Delete prescription file from OS if exists
    if head.uploaded_file_prescription:
        delete_prescription_file(head.uploaded_file_prescription)

    # Fetch all related detail records
    result = await db.execute(
        select(Med_upcomingAppointment_detail).where(
            Med_upcomingAppointment_detail.upcommingAppointment_id == appointment_id
        )
    )
    details = result.scalars().all()

    # Delete all detail records
    for detail in details:
        await db.delete(detail)  # use await for async deletion (if your ORM supports it)

    # Delete head record
    await db.delete(head)

    # Commit all changes
    await db.commit()

    return {"message": f"Appointment {appointment_id} and all related details deleted successfully."}



from datetime import date
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.Models.UpcommingAppoinment_Model import Med_upcomingAppointment_head


async def get_reminders(
    db: AsyncSession,
    member_id: Optional[int] = None,   # ✅ added
):
    """
    Fetch upcoming appointments where:
      - Reminder = 'Y'
      - End_date is today or tomorrow
      - Filter by member_id if provided
    """
    today = date.today()

    # Fetch all heads with details
    result = await db.execute(
        select(Med_upcomingAppointment_head)
        .options(selectinload(Med_upcomingAppointment_head.details))
    )

    appointments = result.scalars().all()
    response = []

    for head in appointments:

        # ✅ FILTER BY MEMBER_ID (IMPORTANT)
        if member_id is not None and head.Member_id != member_id:
            continue

        details_to_remind = []

        for d in head.details:
            if d.Reminder == "Y":
                days_diff = (d.End_date - today).days
                if days_diff in (0, 1):  # today or tomorrow
                    details_to_remind.append({
                        "upcommingAppointmentDetail_id": d.upcommingAppointmentDetail_id,
                        "Start_date": d.Start_date,
                        "End_date": d.End_date,
                        "Morning": d.Morning,
                        "AfterNoon": d.AfterNoon,
                        "Evening": d.Evening,
                        "Medicine_name": d.Medicine_name,
                        "Remark": d.Remark,      
                        "cource_days": d.cource_days,
                        "Reminder": "Y",
                    })

        if details_to_remind:
            response.append({
                "upcommingAppointment_id": head.upcommingAppointment_id,
                "doc_No": head.doc_No,
                "Appointment_date": head.Appointment_date,
                "Family_id": head.Family_id,
                "Member_id": head.Member_id,
                "Doctor_name": head.Doctor_name,
                "Hospital_name": head.Hospital_name,
                "uploaded_file_prescription": head.uploaded_file_prescription,
                "details": details_to_remind,
            })

    return response




async def update_reminder_flag_by_member(
    db: AsyncSession,
    member_id: int,
    detail_id: int,
    reminder_flag: str
):
    reminder_flag = reminder_flag.upper()
    if reminder_flag not in ["Y", "N"]:
        raise HTTPException(
            status_code=400,
            detail="Reminder flag must be 'Y' or 'N'"
        )

    # Join detail -> head to validate member ownership
    stmt = (
        select(Med_upcomingAppointment_detail)
        .join(
            Med_upcomingAppointment_head,
            Med_upcomingAppointment_detail.upcommingAppointment_id
            == Med_upcomingAppointment_head.upcommingAppointment_id
        )
        .where(
            Med_upcomingAppointment_detail.upcommingAppointmentDetail_id == detail_id,
            Med_upcomingAppointment_head.Member_id == member_id
        )
    )

    result = await db.execute(stmt)
    detail = result.scalar_one_or_none()

    if not detail:
        raise HTTPException(
            status_code=404,
            detail="Detail not found for this member"
        )

    # Update reminder flag
    detail.Reminder = reminder_flag
    await db.commit()
    await db.refresh(detail)

    return {
        "message": "Reminder flag updated successfully",
        "member_id": member_id,
        "upcommingAppointmentDetail_id": detail_id,
        "Reminder": detail.Reminder
    }
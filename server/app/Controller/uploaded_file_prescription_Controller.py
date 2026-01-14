import os
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, Form
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
import json

from app.Services.UpcommingAppoinment_Services import (
    UPLOAD_DIR,
    create_upcoming_appointment,
    delete_upcoming_appointment,
    get_all_appointments,
    get_appointment_by_id,
   
    get_appointments_by_family,
    get_reminders,
    update_reminder_flag_by_member,
    update_upcoming_appointment
)
from app.Schemas.UpcommingAppoinment_Schemas import (
    UpcomingAppointmentHeadSchema,
    UpcomingAppointmentUpdateSchema
)
from app.Models.database import get_db

router = APIRouter(
    prefix="/upcoming-appointment",
    tags=["Upcoming Appointment"]
)


@router.get("/")
async def read_all_appointments(db: AsyncSession = Depends(get_db)):
    return await get_all_appointments(db)

@router.get("/{appointment_id}")
async def read_appointment(appointment_id: int, db: AsyncSession = Depends(get_db)):
    appointment = await get_appointment_by_id(db, appointment_id)
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment



@router.get("/family/{family_id}")
async def read_appointments_by_family(
    family_id: int,
    db: AsyncSession = Depends(get_db)
):
    results = await get_appointments_by_family(db, family_id)

    response = []
    for head in results:
        response.append({
            "upcommingAppointment_id": head.upcommingAppointment_id,
            "doc_No": head.doc_No,
            "Appointment_date": head.Appointment_date,
            "Family_id": head.Family_id,
            "Member_id": head.Member_id,
            "Member_name": getattr(head, "Member_name", None),
            "Doctor_name": head.Doctor_name,
            "Hospital_name": head.Hospital_name,
            "uploaded_file_prescription": head.uploaded_file_prescription,
            "details": [
                {
                    "upcommingAppointmentDetail_id": d.upcommingAppointmentDetail_id,
                    "Start_date": d.Start_date,
                    "End_date": d.End_date,
                    "Morning": d.Morning,
                    "AfterNoon": d.AfterNoon,
                    "Evening": d.Evening,
                    "Medicine_name": d.Medicine_name,
                    "Remark":d.Remark,
                    "cource_days":d.cource_days,
                    "Reminder": getattr(d, "Reminder", "Y")

                }
                for d in sorted(head.details, key=lambda x: x.upcommingAppointmentDetail_id, reverse=True)
            ]
        })

    return response



@router.post("/")
async def create_appointment(
    payload: str = Form(...),                        
    prescription_file: UploadFile | None = File(None), 
    db: AsyncSession = Depends(get_db)
):
    """
    Create an upcoming appointment with optional prescription file.
    - payload: JSON string of UpcomingAppointmentHeadSchema
    - prescription_file: optional uploaded file
    """
    try:
        payload_dict = json.loads(payload)
    except json.JSONDecodeError:
        return {"error": "Invalid JSON payload"}

    payload_obj = UpcomingAppointmentHeadSchema(**payload_dict)

    appointment = await create_upcoming_appointment(
        db=db,
        payload_obj=payload_obj,
        prescription_file=prescription_file
    )

    for detail in appointment.details:
      if not getattr(detail, "Reminder", None):
        detail.Reminder = "Y"

    return {
        "message": "Appointment created successfully",
        "appointment": appointment
    }


@router.put("/{appointment_id}")
async def update_appointment(
    appointment_id: int,
    payload: str = Form(...),                         
    prescription_file: UploadFile | None = File(None), 
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing appointment with optional new prescription file.
    - payload: JSON string of UpcomingAppointmentUpdateSchema
    - prescription_file: optional uploaded file
    """
    try:
        payload_dict = json.loads(payload)
    except json.JSONDecodeError:
        return {"error": "Invalid JSON payload"}

    payload_obj = UpcomingAppointmentUpdateSchema(**payload_dict)

    result = await update_upcoming_appointment(
        db=db,
        appointment_id=appointment_id,
        payload_obj=payload_obj,
        prescription_file=prescription_file
    )

    return result

@router.delete("/{appointment_id}")
async def delete_appointment(appointment_id: int, db: AsyncSession = Depends(get_db)):
    return await delete_upcoming_appointment(db, appointment_id)


@router.get("/preview/{file_name}")
async def preview_file(file_name: str):
    file_path = os.path.join(UPLOAD_DIR, file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=file_path,
        media_type=None, 
        filename=file_name,
        headers={"Content-Disposition": f'inline; filename="{file_name}"'}
    )

@router.get("/download/{file_name}")
async def download_file(file_name: str):
    file_path = os.path.join(UPLOAD_DIR, file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=file_path,
        media_type="application/octet-stream",
        filename=file_name,
        headers={"Content-Disposition": f'attachment; filename="{file_name}"'}
    )



@router.get("/reminder/")
async def reminder_endpoint(
    member_id: int | None = None,
    db: AsyncSession = Depends(get_db),
):
    reminders = await get_reminders(db, member_id)
    return reminders








@router.put("/reminder/update")
async def update_reminder(
    member_id: int = Query(..., description="Member ID"),
    detail_id: int = Query(..., description="Appointment Detail ID"),
    reminder: str = Query(..., description="Y or N"),
    db: AsyncSession = Depends(get_db)
):
    """
    Update Reminder flag using member_id and detail_id
    """
    return await update_reminder_flag_by_member(
        db=db,
        member_id=member_id,
        detail_id=detail_id,
        reminder_flag=reminder
    )
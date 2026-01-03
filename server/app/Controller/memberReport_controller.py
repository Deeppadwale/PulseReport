import mimetypes
from typing import List
from fastapi import APIRouter, Form, File, Query, UploadFile, Depends, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
import fastapi_mail
from sqlalchemy.ext.asyncio import AsyncSession
from app.Models.database import get_db
from app.Services.memberReport_services import create_report, get_all_reports, get_report_by_id
import json
from app.Models.memberReport_model import Med_MemberReport, Med_MemberReportDetail
from app.Services.familyMasterMain_services import delete_family
from app.utility.file_handler_preview import delete_report_file, save_report_file,get_file_path
import os
import uuid
from fastapi import APIRouter, Form, File, UploadFile, Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from datetime import date, datetime
from app.Models.database import get_db
from app.Models.memberReport_model import Med_MemberReport, Med_MemberReportDetail
from app.Schemas.memberReport_schemas import MemberReportResponseview
from app.Services import memberReport_services
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi_mail import MessageSchema
from app.utility.email import fast_mail

router = APIRouter(prefix="/member-report", tags=["Member Report"])


@router.post("/create")
async def create_member_report(
    request: Request,
    payload: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    try:
        data = json.loads(payload)
    except json.JSONDecodeError: 
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    form = await request.form()
    files = {key: value for key, value in form.items() if hasattr(value, "filename")}
    return await create_report(db, data, files)


@router.put("/update")
async def update_member_report(
    request: Request,
    MemberReport_id: int = Query(...),  
    payload: str = Form(...),
    db: AsyncSession = Depends(get_db)
):
    try:
        data = json.loads(payload)
        head = data.get("head", {})
        detail_actions = data.get("details", [])

        form = await request.form()
        files = {k: v for k, v in form.items() if hasattr(v, "filename")}

     
        result = await db.execute(
            select(Med_MemberReport)
            .options(selectinload(Med_MemberReport.details))
            .where(Med_MemberReport.MemberReport_id == MemberReport_id)
        )
        report = result.scalars().first()
        if not report:
            raise HTTPException(status_code=404, detail="MemberReport not found")

     
        for field in [ "purpose", "remarks", "Modified_by"]:
            if field in head:
                setattr(report, field, head[field])

        if head.get("doc_date"):
            report.doc_date = datetime.strptime(
                head["doc_date"], "%Y-%m-%d"
            ).date()

        added_ids, updated_ids, deleted_ids = [], [], []

      
        for d in detail_actions:
            action = d.get("row_action")

            # ➕ ADD
            if action == "add":
                file_obj = files.get(d.get("file_key"))
                file_path = await save_report_file(file_obj) if file_obj else None

                new_detail = Med_MemberReportDetail(
                    MemberReport_id=report.MemberReport_id,
                    report_date=d["report_date"],
                    Report_id=d["Report_id"],
                    Doctor_and_Hospital_name=d.get("Doctor_and_Hospital_name"),
                    uploaded_file_report=file_path
                )
                report.details.append(new_detail)
                await db.flush()
                added_ids.append(new_detail.detail_id)

            # ✏️ UPDATE
            elif action == "update":
                detail_id = d.get("detail_id")
                existing = next((x for x in report.details if x.detail_id == detail_id), None)

                if existing:
                    for field in ["report_date", "Report_id", "Doctor_and_Hospital_name"]:
                        if field in d:
                            setattr(existing, field, d[field])

                    if d.get("file_key"):
                        new_file = files.get(d["file_key"])
                        if new_file:
                            if existing.uploaded_file_report:
                                delete_report_file(existing.uploaded_file_report)
                            existing.uploaded_file_report = await save_report_file(new_file)

                    updated_ids.append(detail_id)

         
            elif action == "delete":
                detail_id = d.get("detail_id")
                existing = next((x for x in report.details if x.detail_id == detail_id), None)

                if existing:
                    if existing.uploaded_file_report:
                        delete_report_file(existing.uploaded_file_report)
                    await db.delete(existing)
                    deleted_ids.append(detail_id)

        await db.commit()
        await db.refresh(report)

        return {
            "message": "Member Report updated successfully",
            "MemberReport_id": report.MemberReport_id,
            "added_ids": added_ids,
            "updated_ids": updated_ids,
            "deleted_ids": deleted_ids
        }

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))



@router.delete("/delete")
async def delete_member_report(
    MemberReport_id: int = Query(..., description="MemberReport ID"),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Med_MemberReport)
        .options(selectinload(Med_MemberReport.details))
        .where(Med_MemberReport.MemberReport_id == MemberReport_id)
    )
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="MemberReport not found")
    for detail in report.details:
        if detail.uploaded_file_report:
            delete_report_file(detail.uploaded_file_report)
    await db.delete(report)
    await db.commit()

    return {
        "message": "Member report deleted successfully",
        "MemberReport_id": MemberReport_id,
        "deleted_details": len(report.details)
    }

@router.get("/preview/{filename}")
async def preview_file(filename: str):
    try:
        filename = os.path.basename(filename)  
        file_path = get_file_path(filename)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")

    mime_type, _ = mimetypes.guess_type(file_path)
    mime_type = mime_type or "application/octet-stream"

    return FileResponse(
        path=file_path,
        media_type=mime_type,
        headers={
            "Content-Disposition": f'inline; filename="{filename}"'
        }
    )


@router.get("/download/{filename}")
async def download_file(filename: str):
    try:
        filename = os.path.basename(filename)
        file_path = get_file_path(filename)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=file_path,
        media_type="application/octet-stream",
        filename=filename,
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@router.get("/", response_model=List[MemberReportResponseview])
async def get_all(db: AsyncSession = Depends(get_db)):
    return await get_all_reports(db) 


@router.get("/byid/{report_id}", response_model=MemberReportResponseview)
async def get_by_id(report_id: int, db: AsyncSession = Depends(get_db)):
    return await get_report_by_id(db, report_id)


@router.get("/family/{family_id}", response_model=List[MemberReportResponseview])
async def get_by_family(family_id: int, db: AsyncSession = Depends(get_db)):
    reports = await memberReport_services.get_reports_by_family(db, family_id)
    return reports



@router.get("/userlist", response_model=List[MemberReportResponseview])
async def get_reports_by_member(
    member_id: int = Query(..., description="Member ID"),
    db: AsyncSession = Depends(get_db)
):
    return await memberReport_services.get_reports_by_member(
        db=db,
        member_id=member_id
    )


@router.post("/send-email-with-attachment")
async def send_email_with_attachment(
    email: str = Form(...),
    subject: str = Form(...),
    messagebody: str = Form(...),
    file: UploadFile = File(...)   
):
    try:
        message = MessageSchema(
            subject=subject,
            recipients=[email],
            body=messagebody,
            subtype="plain",
            attachments=[file]   
        )

        await fast_mail.send_message(message)

        return JSONResponse(
            status_code=200,
            content={"message": "Email sent successfully"}
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send email: {str(e)}"
        )

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.Models.database import get_db
from app.Schemas.reportMaster_schemas import (
    ReportCreate, ReportUpdate, ReportResponse
)
from app.Services.reportMaster_services import (
    create_report,
    get_all_reports,
    get_report_by_id,
    get_report_count,
    update_report,
    delete_report,
    get_max_doc_no,
    create_default_reports   
)

router = APIRouter(prefix="/reportmaster", tags=["Report Master"])

@router.get("/max-doc-no")
async def fetch_max_doc_no(db: AsyncSession = Depends(get_db)):
    return {"max_doc_no": await get_max_doc_no(db)}


@router.get("/count")
async def fetch_report_count(db: AsyncSession = Depends(get_db)):
    total = await get_report_count(db)
    return  total

@router.post("/", response_model=ReportResponse)
async def add_report(data: ReportCreate, db: AsyncSession = Depends(get_db)):
    return await create_report(db, data)


@router.get("/", response_model=list[ReportResponse])
async def list_reports(db: AsyncSession = Depends(get_db)):
    return await get_all_reports(db)


@router.get("/{report_id}", response_model=ReportResponse)
async def fetch_report(report_id: int, db: AsyncSession = Depends(get_db)):
    report = await get_report_by_id(db, report_id)
    if not report:
        raise HTTPException(404, "Report not found")
    return report


@router.put("/{report_id}", response_model=ReportResponse)
async def modify_report(report_id: int, data: ReportUpdate, db: AsyncSession = Depends(get_db)):
    updated = await update_report(db, report_id, data)
    if not updated:
        raise HTTPException(404, "Report not found")
    return updated

@router.delete("/{report_id}")
async def remove_report(report_id: int, db: AsyncSession = Depends(get_db)):
    deleted = await delete_report(db, report_id)
    if not deleted:
        raise HTTPException(404, "Report not found")
    return {"status": True, "message": "Report deleted successfully"}





@router.post("/add-default-reports")
async def add_default_reports(
    db: AsyncSession = Depends(get_db)
):
    reports = await create_default_reports(db)
    return {
        "status": True,
        "message": f"{len(reports)} medical reports added successfully"
    }

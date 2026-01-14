from sqlalchemy import select, func, text
from sqlalchemy.orm import selectinload
from app.Models.memberReport_model import Med_MemberReport, Med_MemberReportDetail
from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from app.utility.file_handler_preview import save_report_file
from app.Schemas.memberReport_schemas import MemberReportResponseview

async def create_report(db: AsyncSession, payload: dict, files: dict):

    result = await db.execute(select(func.coalesce(func.max(Med_MemberReport.doc_No), 0)))
    doc_no = result.scalar() + 1
    report = Med_MemberReport(
        doc_No=doc_no,
        Member_id=payload["Member_id"],
        doc_date=payload["doc_date"],
        Family_id=payload["Family_id"],
        purpose=payload["purpose"],
        remarks=payload.get("remarks"),
        Created_by=payload["Created_by"],
        Created_at=date.today()
    )

    for d in payload.get("details", []):
        if d.get("row_action") == "add":
            file_obj = files.get(d.get("file_key"))
            file_path = await save_report_file(file_obj) if file_obj else None
            report.details.append(
                Med_MemberReportDetail(
                    report_date=d["report_date"],
                    Report_id=d["Report_id"],
                    Naration=d.get("Naration"),
                    Doctor_and_Hospital_name=d.get("Doctor_and_Hospital_name"),
                    uploaded_file_report=file_path
                )
            )
    db.add(report)
    await db.commit()
    await db.refresh(report)

    result = await db.execute(
        select(Med_MemberReport)
        .options(selectinload(Med_MemberReport.details))
        .where(Med_MemberReport.MemberReport_id == report.MemberReport_id)
    )
    return result.scalars().first()


async def get_all_reports(db: AsyncSession):
    result = await db.execute(
        select(Med_MemberReport)
        .options(selectinload(Med_MemberReport.details))
        .order_by(Med_MemberReport.MemberReport_id.desc())
    )
    
    reports = result.scalars().all()
    
    for report in reports:
        report.details.sort(key=lambda d: d.detail_id, reverse=True)
    
    return reports


async def get_report_by_id(db: AsyncSession, report_id: int):
    
    result = await db.execute(
        select(Med_MemberReport)
        .options(selectinload(Med_MemberReport.details))
        .where(Med_MemberReport.MemberReport_id == report_id)
    )
    return result.scalars().first()




async def get_reports_by_family(db: AsyncSession, family_id: int):
    query = text("""
        SELECT
            mm.Member_name,
            rm.report_name,
            mr.MemberReport_id,
            mr.doc_No,
            mr.Member_id,
            mr.doc_date,
            mr.Family_id,
            mr.purpose,
            mr.remarks,
            mr.Created_by,
            mr.Modified_by,
            mr.Created_at,

            mrd.detail_id,
            mrd.Report_id,
            mrd.report_date,
            mrd.Naration,
            mrd.Doctor_and_Hospital_name,
            mrd.uploaded_file_report,

            fm.Family_Name
        FROM Med_MemberReport mr
        INNER JOIN Med_FamilyMaster fm
            ON mr.Family_id = fm.Family_id
        LEFT JOIN Med_MemberMaster mm
            ON mr.Member_id = mm.Member_id
        LEFT JOIN Med_MemberReportdetail mrd
            ON mr.MemberReport_id = mrd.MemberReport_id
        LEFT JOIN Med_ReportMaster rm
            ON mrd.Report_id = rm.Report_id
        WHERE mr.Family_id = :family_id
        ORDER BY mr.MemberReport_id DESC, mrd.detail_id DESC
    """)

    result = await db.execute(query, {"family_id": family_id})
    rows = result.mappings().all()

    reports: dict[int, MemberReportResponseview] = {}

    for row in rows:
        mr_id = row["MemberReport_id"]

        if mr_id not in reports:
            reports[mr_id] = MemberReportResponseview(
                MemberReport_id=row["MemberReport_id"],
                doc_No=row["doc_No"],
                Member_id=row["Member_id"],
                doc_date=row["doc_date"],
                Family_id=row["Family_id"],
                purpose=row["purpose"],
                remarks=row["remarks"],
                Created_by=row["Created_by"],
                Modified_by=row["Modified_by"],
                Created_at=row["Created_at"],
                Family_Name=row["Family_Name"],
                Member_name=row["Member_name"],
                report_name=row["report_name"],
                details=[]
            )

        if row["detail_id"] is not None:
            reports[mr_id].details.append(
                Med_MemberReportDetail(
                    detail_id=row["detail_id"],
                    MemberReport_id=row["MemberReport_id"],
                    report_date=row["report_date"],
                    Report_id=row["Report_id"],
                    Naration=row["Naration"],
                    Doctor_and_Hospital_name=row["Doctor_and_Hospital_name"],
                    uploaded_file_report=row["uploaded_file_report"],
                )
            )

    return list(reports.values())








from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.Schemas.memberReport_schemas import MemberReportResponseview,MemberReportDetailViewSchema
from app.Models.memberReport_model import Med_MemberReportDetail


async def get_reports_by_member(
    db: AsyncSession,
    member_id: int
):
    query = text("""
        SELECT
            mm.Member_name,
            rm.report_name,
            mr.MemberReport_id,
            mr.doc_No,
            mr.Member_id,
            mr.doc_date,
            mr.Family_id,
            mr.purpose,
            mr.remarks,
            mr.Created_by,
            mr.Modified_by,
            mr.Created_at,

            mrd.detail_id,
            mrd.Report_id,
            mrd.report_date,
            mrd.Naration,
            mrd.Doctor_and_Hospital_name,
            mrd.uploaded_file_report,

            fm.Family_Name
        FROM Med_MemberReport mr
        INNER JOIN Med_FamilyMaster fm
            ON mr.Family_id = fm.Family_id
        LEFT JOIN Med_MemberMaster mm
            ON mr.Member_id = mm.Member_id
        LEFT JOIN Med_MemberReportdetail mrd
            ON mr.MemberReport_id = mrd.MemberReport_id
        LEFT JOIN Med_ReportMaster rm
            ON mrd.Report_id = rm.Report_id
        WHERE mr.Member_id = :member_id
        ORDER BY mr.MemberReport_id DESC, mrd.detail_id DESC
    """)

    result = await db.execute(query, {"member_id": member_id})
    rows = result.mappings().all()

    reports: dict[int, MemberReportResponseview] = {}

    for row in rows:
        mr_id = row["MemberReport_id"]

        if mr_id not in reports:
            reports[mr_id] = MemberReportResponseview(
                MemberReport_id=row["MemberReport_id"],
                doc_No=row["doc_No"],
                Member_id=row["Member_id"],
                doc_date=row["doc_date"],
                Family_id=row["Family_id"],
                purpose=row["purpose"],
                remarks=row["remarks"],
                Created_by=row["Created_by"],
                Modified_by=row["Modified_by"],
                Created_at=row["Created_at"],
                Family_Name=row["Family_Name"],
                Member_name=row["Member_name"],
                report_name=row["report_name"],
                details=[]
            )

        if row["detail_id"] is not None:
            reports[mr_id].details.append(
                MemberReportDetailViewSchema(
                    detail_id=row["detail_id"],
                    MemberReport_id=row["MemberReport_id"],
                    report_date=row["report_date"],
                    report_name=row["report_name"],
                    Report_id=row["Report_id"],
                    Naration=row["Naration"],
                    Doctor_and_Hospital_name=row["Doctor_and_Hospital_name"],
                    uploaded_file_report=row["uploaded_file_report"],
                )
            )

    return list(reports.values())

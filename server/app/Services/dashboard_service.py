from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any, Optional

from app.Models.memberReport_model import (
    Med_MemberReport,
    Med_MemberReportDetail
)
from app.Models.UpcommingAppoinment_Model import (
    Med_upcomingAppointment_head,
    Med_upcomingAppointment_detail,
)
from app.Models.memberMaster_model import Med_MemberMaster
from app.Models.reposrMaster_model import Med_ReportMaster


async def get_detailed_recent_activity_service(
    db: AsyncSession,
    member_id: Optional[int] = None,
    limit: int = 10,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
) -> List[Dict[str, Any]]:

    activities: List[Dict[str, Any]] = []

    # ---------------- DEFAULT DATE RANGE ----------------
    if not start_date:
        start_date = date.today() - timedelta(days=30)
    if not end_date:
        end_date = date.today()

    # ====================================================
    # 1️⃣ REPORT CREATED (HEAD + DETAILS + REPORT TYPE)
    # ====================================================
    stmt = (
        select(
            Med_MemberReport,
            Med_MemberMaster
        )
        .join(Med_MemberMaster,
              Med_MemberReport.Member_id == Med_MemberMaster.Member_id)
        .where(Med_MemberReport.Created_at.between(start_date, end_date))
    )

    if member_id:
        stmt = stmt.where(Med_MemberReport.Member_id == member_id)

    result = await db.execute(stmt)

    for report, member in result.all():

        # Fetch details + report type
        detail_stmt = (
            select(
                Med_MemberReportDetail,
                Med_ReportMaster
            )
            .outerjoin(
                Med_ReportMaster,
                Med_MemberReportDetail.Report_id == Med_ReportMaster.Report_id
            )
            .where(Med_MemberReportDetail.MemberReport_id == report.MemberReport_id)
        )

        detail_result = await db.execute(detail_stmt)

        details = []
        for detail, report_master in detail_result.all():
            details.append({
                "detail_id": detail.detail_id,
                "report_date": detail.report_date,
                "Report_id": detail.Report_id,
                "Report_name": report_master.report_name if report_master else None,
                "Doctor_and_Hospital_name": detail.Doctor_and_Hospital_name,
                "uploaded_file_report": detail.uploaded_file_report,
                "Naration": detail.Naration
            })

        activities.append({
            "activity_type": "REPORT_CREATED",
            "activity_date": report.Created_at,
            "activity_id": report.MemberReport_id,
            "main_data": {
                "report_header": {
                    "MemberReport_id": report.MemberReport_id,
                    "doc_No": report.doc_No,
                    "doc_date": report.doc_date,
                    "purpose": report.purpose,
                    "remarks": report.remarks,
                },
                "member_info": {
                    "Member_id": member.Member_id,
                    "Member_name": member.Member_name,
                },
                "report_details": details
            }
        })

    # ====================================================
    # 2️⃣ REPORT UPLOADED (DETAIL + TYPE)
    # ====================================================
    stmt = (
        select(
            Med_MemberReportDetail,
            Med_MemberReport,
            Med_MemberMaster,
            Med_ReportMaster
        )
        .join(Med_MemberReport,
              Med_MemberReportDetail.MemberReport_id == Med_MemberReport.MemberReport_id)
        .join(Med_MemberMaster,
              Med_MemberReport.Member_id == Med_MemberMaster.Member_id)
        .outerjoin(Med_ReportMaster,
                   Med_MemberReportDetail.Report_id == Med_ReportMaster.Report_id)
        .where(Med_MemberReportDetail.report_date.between(start_date, end_date))
    )

    if member_id:
        stmt = stmt.where(Med_MemberReport.Member_id == member_id)

    result = await db.execute(stmt)

    for detail, report, member, report_master in result.all():
        activities.append({
            "activity_type": "REPORT_UPLOADED",
            "activity_date": detail.report_date,
            "activity_id": detail.detail_id,
            "main_data": {
                "report_detail": {
                    "detail_id": detail.detail_id,
                    "Report_id": detail.Report_id,
                    "Report_name": report_master.report_name if report_master else None,
                    "Doctor_and_Hospital_name": detail.Doctor_and_Hospital_name,
                    "uploaded_file_report": detail.uploaded_file_report,
                    "Naration": detail.Naration
                },
                "report_header": {
                    "MemberReport_id": report.MemberReport_id,
                    "doc_No": report.doc_No,
                    "doc_date": report.doc_date,
                    "remarks": report.remarks
                },
                "member_info": {
                    "Member_id": member.Member_id,
                    "Member_name": member.Member_name
                }
            }
        })

    # ====================================================
    # 3️⃣ APPOINTMENT CREATED (HEAD + DETAILS)
    # ====================================================
    stmt = (
        select(
            Med_upcomingAppointment_head,
            Med_MemberMaster
        )
        .join(Med_MemberMaster,
              Med_upcomingAppointment_head.Member_id == Med_MemberMaster.Member_id)
        .where(Med_upcomingAppointment_head.Created_at.between(start_date, end_date))
    )

    if member_id:
        stmt = stmt.where(Med_upcomingAppointment_head.Member_id == member_id)

    result = await db.execute(stmt)

    for appointment, member in result.all():

        detail_stmt = select(Med_upcomingAppointment_detail).where(
            Med_upcomingAppointment_detail.upcommingAppointment_id ==
            appointment.upcommingAppointment_id
        )

        details = (await db.execute(detail_stmt)).scalars().all()

        activities.append({
            "activity_type": "APPOINTMENT_CREATED",
            "activity_date": appointment.Created_at,
            "activity_id": appointment.upcommingAppointment_id,
            "main_data": {
                "appointment_header": {
                    "Doctor_name": appointment.Doctor_name,
                    "Hospital_name": appointment.Hospital_name,
                    "Appointment_date": appointment.Appointment_date,
                },
                "member_info": {
                    "Member_id": member.Member_id,
                    "Member_name": member.Member_name
                },
                "appointment_details": [
                    {
                        "Medicine_name": d.Medicine_name,
                        "Remark": d.Remark,
                        "cource_days": d.cource_days
                    } for d in details
                ]
            }
        })

    # ====================================================
    # 4️⃣ MEDICINE ADDED
    # ====================================================
    stmt = (
        select(
            Med_upcomingAppointment_detail,
            Med_upcomingAppointment_head,
            Med_MemberMaster
        )
        .join(Med_upcomingAppointment_head,
              Med_upcomingAppointment_detail.upcommingAppointment_id ==
              Med_upcomingAppointment_head.upcommingAppointment_id)
        .join(Med_MemberMaster,
              Med_upcomingAppointment_head.Member_id ==
              Med_MemberMaster.Member_id)
        .where(Med_upcomingAppointment_detail.Start_date.between(start_date, end_date))
    )

    if member_id:
        stmt = stmt.where(Med_upcomingAppointment_head.Member_id == member_id)

    result = await db.execute(stmt)

    for detail, appointment, member in result.all():
        activities.append({
            "activity_type": "MEDICINE_ADDED",
            "activity_date": detail.Start_date,
            "activity_id": detail.upcommingAppointmentDetail_id,
            "main_data": {
                "medicine_detail": {
                    "Medicine_name": detail.Medicine_name,
                    "Remark": detail.Remark,
                    "cource_days": detail.cource_days
                },
                "appointment_header": {
                    "Doctor_name": appointment.Doctor_name,
                    "Hospital_name": appointment.Hospital_name
                },
                "member_info": {
                    "Member_id": member.Member_id,
                    "Member_name": member.Member_name
                }
            }
        })

    # ====================================================
    # SORT & LIMIT
    # ====================================================
    activities.sort(key=lambda x: x["activity_date"], reverse=True)
    return activities[:limit]

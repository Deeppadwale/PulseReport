from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import date
from app.Models.reposrMaster_model import Med_ReportMaster
from app.Schemas.reportMaster_schemas import ReportCreate, ReportUpdate






DEFAULT_MEDICAL_REPORTS = [
    "Arterial Blood Gas (ABG)",
    "Serum Amylase",
    "Serum Lipase",
    "Blood Ketone",
    "C-Peptide",
    "Insulin Level",
    "Growth Hormone",
    "ACTH",
    "Cortisol Morning",
    "Cortisol Evening",
    "Prolactin",
    "FSH",
    "LH",
    "Estradiol",
    "Progesterone",
    "Testosterone Total",
    "Free Testosterone",
    "DHEA-S",
    "Anti-Mullerian Hormone",
    "Beta HCG",
    "TORCH Profile",
    "ANA Profile",
    "Anti-dsDNA",
    "Rheumatoid Factor",
    "Anti-CCP",
    "HLA-B27",
    "Serum Magnesium",
    "Serum Phosphorus",
    "Copper Test",
    "Ceruloplasmin",
    "Zinc Test",
    "Heavy Metal Screen",
    "Blood Culture",
    "Sputum Culture",
    "Throat Swab Culture",
    "Pus Culture",
    "AFB Smear",
    "AFB Culture",
    "GeneXpert MTB",
    "COVID RT-PCR",
    "COVID Antigen",
    "Allergy Profile",
    "IgE Total",
    "IgG",
    "IgA",
    "IgM",
    "Flow Cytometry",
    "Bone Marrow Test",
    "Histopathology",
    "FNAC"
]




async def create_default_reports(db: AsyncSession, created_by: str = "SYSTEM"):
    max_doc_no = await get_max_doc_no(db)
    reports = []

    for index, report_name in enumerate(DEFAULT_MEDICAL_REPORTS, start=1):
        reports.append(
            Med_ReportMaster(
                doc_No=max_doc_no + index,
                report_name=report_name,
                Created_by=created_by,
                Created_at=date.today()
            )
        )

    db.add_all(reports)
    await db.commit()
    return reports


async def get_max_doc_no(db: AsyncSession) -> int:
    result = await db.execute(select(func.max(Med_ReportMaster.doc_No)))
    max_doc = result.scalar()
    return max_doc or 0

async def get_report_count(db):
    result = await db.execute(
        select(func.count()).select_from(Med_ReportMaster)
    )
    return result.scalar()

async def create_report(db: AsyncSession, report_data: ReportCreate):
    next_doc_no = (await get_max_doc_no(db)) + 1
    new_report = Med_ReportMaster(
        doc_No=next_doc_no,
        Created_at=date.today(),
        **report_data.dict()
    )
    db.add(new_report)
    await db.commit()
    await db.refresh(new_report)
    return new_report



async def get_all_reports(db: AsyncSession):
    result = await db.execute(
        select(Med_ReportMaster).order_by(Med_ReportMaster.Report_id.desc())
    )
    return result.scalars().all()




async def get_report_by_id(db: AsyncSession, report_id: int):
    result = await db.execute(
        select(Med_ReportMaster).filter(Med_ReportMaster.Report_id == report_id)
    )
    return result.scalar_one_or_none()



async def update_report(db: AsyncSession, report_id: int, update_data: ReportUpdate):
    report = await get_report_by_id(db, report_id)
    if not report:
        return None
    for key, value in update_data.dict(exclude_unset=True).items():
        setattr(report, key, value)
    await db.commit()
    await db.refresh(report)
    return report


async def delete_report(db: AsyncSession, report_id: int):
    report = await get_report_by_id(db, report_id)
    if not report:
        return False
    await db.delete(report)
    await db.commit()
    return True





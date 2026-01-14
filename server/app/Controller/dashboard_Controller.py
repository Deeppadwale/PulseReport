from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date
from typing import Optional
from app.Models.database import get_db
from app.Services.dashboard_service import get_detailed_recent_activity_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/recent-activity/detailed")
async def get_detailed_recent_activity(
    member_id: int | None = Query(None),
    limit: int = Query(10, ge=1, le=100),
    start_date: Optional[date] = Query(None, description="Start date for filtering (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date for filtering (YYYY-MM-DD)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed recent activities with all fields from related tables
    """
    return await get_detailed_recent_activity_service(
        db=db,
        member_id=member_id,
        limit=limit,
        start_date=start_date,
        end_date=end_date
    )

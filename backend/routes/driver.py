from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, date

from backend.database import get_db
from backend.models import Driver, Delivery, DeliveryStatus
from backend.schemas import DriverScore

router = APIRouter(prefix="/driver", tags=["driver"])


@router.get("/{driver_id}/score", response_model=DriverScore)
async def get_driver_score(driver_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Driver).where(Driver.id == driver_id))
    driver = result.scalar_one_or_none()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    deliveries_result = await db.execute(
        select(Delivery)
        .where(Delivery.driver_id == driver_id)
        .order_by(Delivery.created_at.desc())
        .limit(10)
    )
    recent = deliveries_result.scalars().all()

    history = [
        {
            "id": d.id,
            "order_id": d.order_id,
            "address": d.address,
            "status": d.status.value if hasattr(d.status, 'value') else d.status,
            "package_size": d.package_size.value if hasattr(d.package_size, 'value') else d.package_size,
            "created_at": d.created_at.isoformat(),
        }
        for d in recent
    ]

    return DriverScore(
        driver_id=driver.id,
        name=driver.name,
        trust_score=driver.trust_score,
        recent_deliveries=history,
    )

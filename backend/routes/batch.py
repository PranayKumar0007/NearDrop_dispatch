from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from auth import get_current_user
from database import get_db
from models import Delivery, DeliveryBatch, DeliveryStatus, User
from schemas import BatchAcceptResponse, BatchRejectRequest, DispatcherDeliveryOut
from websocket_manager import manager

router = APIRouter(tags=["batch"])

@router.post("/batch/{batch_code}/accept", response_model=BatchAcceptResponse)
async def accept_batch(
    batch_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Driver accepts a batch — marks batch active and first delivery en_route."""
    batch_result = await db.execute(
        select(DeliveryBatch)
        .options(selectinload(DeliveryBatch.driver))
        .where(DeliveryBatch.batch_code == batch_code)
    )
    batch = batch_result.scalar_one_or_none()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    batch.status = "accepted"
    db.add(batch)

    # Reload ordered deliveries
    deliveries_result = await db.execute(
        select(Delivery)
        .where(Delivery.batch_id == batch.id)
        .order_by(Delivery.queue_position)
    )
    deliveries = deliveries_result.scalars().all()

    # Mark first delivery as en_route
    if deliveries:
        for i, d in enumerate(deliveries):
            if i == 0:
                d.status = DeliveryStatus.en_route
            else:
                # Keep others as pending/assigned if needed, usually they start as 'en_route' 
                # in the current simple logic, but here we enforce only 1st is en_route.
                pass
            db.add(d)

    await db.commit()

    return BatchAcceptResponse(
        batch_code=batch_code,
        status="accepted",
        deliveries=[DispatcherDeliveryOut.model_validate(d) for d in deliveries],
    )

@router.post("/batch/{batch_code}/reject")
async def reject_batch(
    batch_code: str,
    body: BatchRejectRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Driver rejects a batch — marks batch rejected and broadcasts WS event."""
    batch_result = await db.execute(
        select(DeliveryBatch)
        .options(selectinload(DeliveryBatch.driver))
        .where(DeliveryBatch.batch_code == batch_code)
    )
    batch = batch_result.scalar_one_or_none()
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")

    batch.status = "rejected"
    db.add(batch)
    await db.commit()

    driver_name = batch.driver.name if batch.driver else "Unknown"

    await manager.broadcast("batch_rejected", {
        "batch_code": batch_code,
        "driver_name": driver_name,
        "reason": body.reason,
    })

    return {"batch_code": batch_code, "status": "rejected"}

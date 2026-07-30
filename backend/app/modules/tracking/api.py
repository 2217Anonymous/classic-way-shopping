from fastapi import APIRouter

from app.modules.auth.dependencies import DbSession, OptionalCustomer
from app.modules.tracking.schemas import TrackingResponse
from app.modules.tracking.services import TrackingService

router = APIRouter(prefix="/tracking", tags=["Shipment Tracking"])


@router.get("/awb/{awb}", response_model=TrackingResponse)
def track_by_awb(
    awb: str,
    customer: OptionalCustomer,
    db: DbSession,
) -> TrackingResponse:
    return TrackingService(db).by_awb(awb, customer)


@router.get("/{order_number}", response_model=TrackingResponse)
def track_by_order_number(
    order_number: str,
    customer: OptionalCustomer,
    db: DbSession,
) -> TrackingResponse:
    return TrackingService(db).by_order_number(order_number, customer)

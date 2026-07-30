from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.modules.commerce.schemas import ShipmentEventBrief


class TrackingResponse(BaseModel):
    order_number: str | None = None
    order_id: UUID | None = None
    awb: str | None = None
    status: str
    courier_provider: str | None = None
    events: list[ShipmentEventBrief] = Field(default_factory=list)
    updated_at: datetime | None = None

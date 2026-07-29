from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.modules.commerce.fulfillment_models import Shipment
from app.modules.commerce.models import Order
from app.modules.commerce.schemas import ShipmentEventBrief
from app.modules.customers.models import Customer
from app.modules.tracking.schemas import TrackingResponse
from app.utils.exceptions import AuthorizationError, NotFoundError


class TrackingService:
    def __init__(self, db: Session):
        self.db = db

    def _to_response(self, shipment: Shipment, order: Order | None) -> TrackingResponse:
        return TrackingResponse(
            order_number=order.order_number if order else None,
            order_id=order.id if order else shipment.order_id,
            awb=shipment.awb,
            status=shipment.status,
            courier_provider=shipment.courier_provider,
            events=[
                ShipmentEventBrief(
                    status=e.status,
                    description=e.message,
                    occurred_at=e.event_at,
                    source=e.source,
                )
                for e in shipment.events
            ],
            updated_at=shipment.updated_at,
        )

    def by_order_number(
        self, order_number: str, customer: Customer | None
    ) -> TrackingResponse:
        order = self.db.scalar(
            select(Order).where(Order.order_number == order_number.strip())
        )
        if not order:
            raise NotFoundError("Order not found")
        if customer and order.customer_id != customer.id:
            raise AuthorizationError("Not allowed to track this order")
        shipment = self.db.scalars(
            select(Shipment)
            .where(Shipment.order_id == order.id)
            .options(selectinload(Shipment.events))
            .order_by(Shipment.created_at.desc())
        ).first()
        if not shipment:
            return TrackingResponse(
                order_number=order.order_number,
                order_id=order.id,
                status=order.status,
                events=[],
            )
        return self._to_response(shipment, order)

    def by_awb(self, awb: str, customer: Customer | None) -> TrackingResponse:
        shipment = self.db.scalars(
            select(Shipment)
            .where(Shipment.awb == awb.strip())
            .options(selectinload(Shipment.events))
        ).first()
        if not shipment:
            raise NotFoundError("Shipment not found")
        order = self.db.get(Order, shipment.order_id)
        if customer and order and order.customer_id != customer.id:
            raise AuthorizationError("Not allowed to track this shipment")
        return self._to_response(shipment, order)

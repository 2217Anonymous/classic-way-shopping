from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.modules.support.models import SupportMessage, SupportTicket


class SupportRepository:
    def __init__(self, db: Session):
        self.db = db

    def _options(self):
        return (selectinload(SupportTicket.messages),)

    def list_for_customer(
        self, customer_id: UUID, *, page: int = 1, limit: int = 20
    ) -> tuple[list[SupportTicket], int]:
        base = select(SupportTicket).where(SupportTicket.customer_id == customer_id)
        total = int(
            self.db.scalar(select(func.count()).select_from(base.subquery())) or 0
        )
        rows = list(
            self.db.scalars(
                base.options(*self._options())
                .order_by(SupportTicket.created_at.desc())
                .offset((page - 1) * limit)
                .limit(limit)
            )
            .unique()
            .all()
        )
        return rows, total

    def get_owned(self, ticket_id: UUID, customer_id: UUID) -> SupportTicket | None:
        return self.db.scalars(
            select(SupportTicket)
            .where(
                SupportTicket.id == ticket_id,
                SupportTicket.customer_id == customer_id,
            )
            .options(*self._options())
        ).unique().first()

    def create_ticket(self, **fields) -> SupportTicket:
        row = SupportTicket(**fields)
        self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return self.get_owned(row.id, row.customer_id) or row

    def add_message(self, message: SupportMessage) -> SupportMessage:
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        return message

    def save(self, ticket: SupportTicket) -> SupportTicket:
        self.db.add(ticket)
        self.db.commit()
        self.db.refresh(ticket)
        return self.get_owned(ticket.id, ticket.customer_id) or ticket

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.ids import uuid_fk, uuid_pk


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id: Mapped[uuid.UUID] = uuid_pk()
    customer_id: Mapped[uuid.UUID] = uuid_fk("customers.id", ondelete="CASCADE")
    subject: Mapped[str] = mapped_column(String(200))
    category: Mapped[str] = mapped_column(String(40), default="other")
    status: Mapped[str] = mapped_column(String(32), default="open", index=True)
    order_id: Mapped[uuid.UUID | None] = uuid_fk(
        "orders.id", nullable=True, ondelete="SET NULL"
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )
    closed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    messages: Mapped[list[SupportMessage]] = relationship(
        "SupportMessage",
        back_populates="ticket",
        cascade="all, delete-orphan",
        order_by="SupportMessage.created_at.asc()",
        passive_deletes=True,
    )


class SupportMessage(Base):
    __tablename__ = "support_messages"

    id: Mapped[uuid.UUID] = uuid_pk()
    ticket_id: Mapped[uuid.UUID] = uuid_fk("support_tickets.id", ondelete="CASCADE")
    sender_type: Mapped[str] = mapped_column(String(20), default="customer")
    body: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    ticket: Mapped[SupportTicket] = relationship(
        "SupportTicket", back_populates="messages"
    )

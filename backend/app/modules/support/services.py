from __future__ import annotations

import math
from uuid import UUID

from app.modules.support.constants import TICKET_CATEGORIES
from app.modules.support.models import SupportMessage
from app.modules.support.repositories import SupportRepository
from app.modules.support.schemas import (
    SupportMessageCreate,
    SupportTicketCreate,
    SupportTicketListResponse,
    SupportTicketResponse,
)
from app.utils.exceptions import AppError, NotFoundError


class SupportService:
    def __init__(self, repository: SupportRepository):
        self.repository = repository

    def list(
        self, customer_id: UUID, *, page: int = 1, limit: int = 20
    ) -> SupportTicketListResponse:
        page = max(page, 1)
        limit = min(max(limit, 1), 50)
        rows, total = self.repository.list_for_customer(
            customer_id, page=page, limit=limit
        )
        pages = math.ceil(total / limit) if total else 0
        return SupportTicketListResponse(
            items=[SupportTicketResponse.model_validate(r) for r in rows],
            total=total,
            page=page,
            limit=limit,
            pages=pages,
        )

    def get(self, customer_id: UUID, ticket_id: UUID) -> SupportTicketResponse:
        row = self.repository.get_owned(ticket_id, customer_id)
        if not row:
            raise NotFoundError("Support ticket not found")
        return SupportTicketResponse.model_validate(row)

    def create(
        self, customer_id: UUID, payload: SupportTicketCreate
    ) -> SupportTicketResponse:
        category = payload.category if payload.category in TICKET_CATEGORIES else "other"
        ticket = self.repository.create_ticket(
            customer_id=customer_id,
            subject=payload.subject.strip(),
            category=category,
            status="open",
            order_id=payload.order_id,
        )
        self.repository.add_message(
            SupportMessage(
                ticket_id=ticket.id,
                sender_type="customer",
                body=payload.message.strip(),
            )
        )
        return self.get(customer_id, ticket.id)

    def add_message(
        self, customer_id: UUID, ticket_id: UUID, payload: SupportMessageCreate
    ) -> SupportTicketResponse:
        ticket = self.repository.get_owned(ticket_id, customer_id)
        if not ticket:
            raise NotFoundError("Support ticket not found")
        if ticket.status in {"closed", "resolved"}:
            raise AppError("Cannot message a closed ticket", 400)
        self.repository.add_message(
            SupportMessage(
                ticket_id=ticket.id,
                sender_type="customer",
                body=payload.body.strip(),
            )
        )
        if ticket.status == "waiting_customer":
            ticket.status = "open"
            self.repository.save(ticket)
        return self.get(customer_id, ticket_id)

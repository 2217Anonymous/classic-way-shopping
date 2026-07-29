from __future__ import annotations

import math
from datetime import datetime
from uuid import UUID

from app.modules.notifications.constants import MAX_PAGE_SIZE, NOTIFICATION_TYPES
from app.modules.notifications.repositories import NotificationRepository
from app.modules.notifications.schemas import (
    NotificationCreateInternal,
    NotificationListResponse,
    NotificationResponse,
)
from app.utils.exceptions import AppError, NotFoundError


class NotificationService:
    def __init__(self, repository: NotificationRepository):
        self.repository = repository

    def list(
        self,
        customer_id: UUID,
        *,
        unread_only: bool = False,
        page: int = 1,
        limit: int = 20,
    ) -> NotificationListResponse:
        page = max(page, 1)
        limit = min(max(limit, 1), MAX_PAGE_SIZE)
        rows, total = self.repository.list_for_customer(
            customer_id, unread_only=unread_only, page=page, limit=limit
        )
        unread = self.repository.unread_count(customer_id)
        pages = math.ceil(total / limit) if total else 0
        return NotificationListResponse(
            items=[NotificationResponse.model_validate(r) for r in rows],
            total=total,
            unread_count=unread,
            page=page,
            limit=limit,
            pages=pages,
        )

    def mark_read(self, customer_id: UUID, notification_id: UUID) -> NotificationResponse:
        row = self.repository.get_owned(notification_id, customer_id)
        if not row:
            raise NotFoundError("Notification not found")
        if not row.is_read:
            row.is_read = True
            row.read_at = datetime.utcnow()
            row = self.repository.save(row)
        return NotificationResponse.model_validate(row)

    def mark_all_read(self, customer_id: UUID) -> dict[str, int]:
        updated = self.repository.mark_all_read(customer_id)
        return {"updated": updated}

    def soft_delete(self, customer_id: UUID, notification_id: UUID) -> None:
        row = self.repository.get_owned(notification_id, customer_id)
        if not row:
            raise NotFoundError("Notification not found")
        self.repository.soft_delete(row)

    def create_internal(self, payload: NotificationCreateInternal) -> NotificationResponse:
        if payload.type not in NOTIFICATION_TYPES:
            raise AppError(f"Invalid notification type: {payload.type}", 400)
        row = self.repository.create(**payload.model_dump())
        return NotificationResponse.model_validate(row)

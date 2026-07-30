from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.modules.notifications.models import Notification


class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_for_customer(
        self,
        customer_id: UUID,
        *,
        unread_only: bool = False,
        page: int = 1,
        limit: int = 20,
    ) -> tuple[list[Notification], int]:
        base = select(Notification).where(
            Notification.customer_id == customer_id,
            Notification.deleted_at.is_(None),
        )
        if unread_only:
            base = base.where(Notification.is_read.is_(False))
        count = int(
            self.db.scalar(
                select(func.count()).select_from(base.subquery())
            )
            or 0
        )
        rows = list(
            self.db.scalars(
                base.order_by(Notification.created_at.desc())
                .offset((page - 1) * limit)
                .limit(limit)
            ).all()
        )
        return rows, count

    def unread_count(self, customer_id: UUID) -> int:
        return int(
            self.db.scalar(
                select(func.count(Notification.id)).where(
                    Notification.customer_id == customer_id,
                    Notification.is_read.is_(False),
                    Notification.deleted_at.is_(None),
                )
            )
            or 0
        )

    def get_owned(self, notification_id: UUID, customer_id: UUID) -> Notification | None:
        return self.db.scalar(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.customer_id == customer_id,
                Notification.deleted_at.is_(None),
            )
        )

    def create(self, **fields) -> Notification:
        row = Notification(**fields)
        self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return row

    def save(self, row: Notification) -> Notification:
        self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return row

    def mark_all_read(self, customer_id: UUID) -> int:
        result = self.db.execute(
            update(Notification)
            .where(
                Notification.customer_id == customer_id,
                Notification.is_read.is_(False),
                Notification.deleted_at.is_(None),
            )
            .values(is_read=True, read_at=datetime.utcnow())
        )
        self.db.commit()
        return int(result.rowcount or 0)

    def soft_delete(self, row: Notification) -> None:
        row.deleted_at = datetime.utcnow()
        self.save(row)

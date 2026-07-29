from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlalchemy import delete, func, select
from sqlalchemy.orm import Session

from app.modules.recently_viewed.models import RecentlyViewed


class RecentlyViewedRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_for_customer(
        self, customer_id: UUID, *, limit: int = 12
    ) -> list[RecentlyViewed]:
        statement = (
            select(RecentlyViewed)
            .where(RecentlyViewed.customer_id == customer_id)
            .order_by(RecentlyViewed.viewed_at.desc())
            .limit(limit)
        )
        return list(self.db.scalars(statement).all())

    def count(self, customer_id: UUID) -> int:
        return int(
            self.db.scalar(
                select(func.count(RecentlyViewed.id)).where(
                    RecentlyViewed.customer_id == customer_id
                )
            )
            or 0
        )

    def upsert(self, customer_id: UUID, product_id: UUID) -> RecentlyViewed:
        row = self.db.scalar(
            select(RecentlyViewed).where(
                RecentlyViewed.customer_id == customer_id,
                RecentlyViewed.product_id == product_id,
            )
        )
        if row:
            row.viewed_at = datetime.utcnow()
            self.db.add(row)
            self.db.commit()
            self.db.refresh(row)
            return row
        row = RecentlyViewed(customer_id=customer_id, product_id=product_id)
        self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return row

    def trim(self, customer_id: UUID, keep: int) -> None:
        rows = self.list_for_customer(customer_id, limit=10_000)
        if len(rows) <= keep:
            return
        for stale in rows[keep:]:
            self.db.delete(stale)
        self.db.commit()

    def clear(self, customer_id: UUID) -> int:
        result = self.db.execute(
            delete(RecentlyViewed).where(RecentlyViewed.customer_id == customer_id)
        )
        self.db.commit()
        return int(result.rowcount or 0)

    def delete_product(self, customer_id: UUID, product_id: UUID) -> bool:
        row = self.db.scalar(
            select(RecentlyViewed).where(
                RecentlyViewed.customer_id == customer_id,
                RecentlyViewed.product_id == product_id,
            )
        )
        if not row:
            return False
        self.db.delete(row)
        self.db.commit()
        return True

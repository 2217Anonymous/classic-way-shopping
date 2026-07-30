from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.engagement.models import Review
from app.modules.ratings.schemas import ProductRatingSummary, RatingBreakdown
from app.utils.exceptions import NotFoundError


class RatingsService:
    def __init__(self, db: Session):
        self.db = db

    def summary(self, product_id: UUID) -> ProductRatingSummary:
        from app.modules.catalog.repositories.product_repository import ProductRepository

        product = ProductRepository(self.db).get(product_id)
        if not product or product.deleted_at is not None:
            raise NotFoundError("Product not found")

        avg = self.db.scalar(
            select(func.avg(Review.rating)).where(
                Review.product_id == product_id,
                Review.is_approved.is_(True),
            )
        )
        count = int(
            self.db.scalar(
                select(func.count(Review.id)).where(
                    Review.product_id == product_id,
                    Review.is_approved.is_(True),
                )
            )
            or 0
        )
        breakdown_rows = self.db.execute(
            select(Review.rating, func.count(Review.id))
            .where(Review.product_id == product_id, Review.is_approved.is_(True))
            .group_by(Review.rating)
            .order_by(Review.rating.desc())
        ).all()
        counts = {int(r): int(c) for r, c in breakdown_rows}
        breakdown = [
            RatingBreakdown(stars=stars, count=counts.get(stars, 0))
            for stars in range(5, 0, -1)
        ]
        return ProductRatingSummary(
            product_id=product_id,
            average=round(float(avg or 0), 2),
            count=count,
            breakdown=breakdown,
        )

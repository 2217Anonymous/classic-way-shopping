from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.catalog.constants import PUBLIC_VISIBILITY
from app.modules.catalog.models.product import Product
from app.modules.catalog.product_mapper import ProductMapper
from app.modules.catalog.repositories.brand_repository import BrandRepository
from app.modules.catalog.repositories.category_repository import CategoryRepository
from app.modules.catalog.repositories.product_repository import ProductRepository
from app.modules.recommendations.constants import DEFAULT_LIMIT, MAX_LIMIT
from app.modules.recommendations.schemas import RecommendationResponse
from app.modules.recently_viewed.repositories import RecentlyViewedRepository
from app.utils.exceptions import NotFoundError


class RecommendationService:
    """Heuristic recommendations — no ML dependency; safe for shared-DB storefront."""

    def __init__(self, db: Session):
        self.db = db
        self.products = ProductRepository(db)
        self.mapper = ProductMapper(
            self.products, CategoryRepository(db), BrandRepository(db)
        )
        self.recent = RecentlyViewedRepository(db)

    def _limit(self, limit: int) -> int:
        return min(max(limit, 1), MAX_LIMIT)

    def _public(self):
        return (
            Product.is_active.is_(True),
            Product.is_published.is_(True),
            Product.visibility == PUBLIC_VISIBILITY,
            Product.deleted_at.is_(None),
        )

    def _map(self, rows: list[Product]) -> list:
        return [self.mapper._to_response(p) for p in rows]

    def home(self, *, limit: int = DEFAULT_LIMIT) -> RecommendationResponse:
        limit = self._limit(limit)
        statement = (
            select(Product)
            .options(*self.products._options())
            .where(*self._public(), Product.is_featured.is_(True))
            .order_by(Product.sort_order.asc())
            .limit(limit)
        )
        rows = list(self.db.scalars(statement).unique().all())
        if len(rows) < limit:
            extra = list(
                self.db.scalars(
                    select(Product)
                    .options(*self.products._options())
                    .where(*self._public(), Product.is_trending.is_(True))
                    .order_by(Product.sort_order.asc())
                    .limit(limit - len(rows))
                )
                .unique()
                .all()
            )
            seen = {r.id for r in rows}
            rows.extend(p for p in extra if p.id not in seen)
        return RecommendationResponse(
            title="Recommended for you",
            algorithm="featured_trending",
            items=self._map(rows),
        )

    def for_you(
        self, customer_id: UUID | None, *, limit: int = DEFAULT_LIMIT
    ) -> RecommendationResponse:
        limit = self._limit(limit)
        if not customer_id:
            return self.home(limit=limit)

        recent = self.recent.list_for_customer(customer_id, limit=5)
        category_ids: set[UUID] = set()
        exclude: set[UUID] = set()
        for row in recent:
            exclude.add(row.product_id)
            product = self.products.get(row.product_id)
            if product and product.category_id:
                category_ids.add(product.category_id)

        statement = (
            select(Product)
            .options(*self.products._options())
            .where(*self._public())
            .order_by(Product.is_best_seller.desc(), Product.sort_order.asc())
            .limit(limit)
        )
        if category_ids:
            statement = statement.where(Product.category_id.in_(category_ids))
        if exclude:
            statement = statement.where(Product.id.notin_(exclude))
        rows = list(self.db.scalars(statement).unique().all())
        if not rows:
            return self.home(limit=limit)
        return RecommendationResponse(
            title="Picked for you",
            algorithm="recent_category_affinity",
            items=self._map(rows),
        )

    def similar(self, product_id: UUID, *, limit: int = DEFAULT_LIMIT) -> RecommendationResponse:
        limit = self._limit(limit)
        product = self.products.get(product_id)
        if not product or product.deleted_at is not None:
            raise NotFoundError("Product not found")
        statement = (
            select(Product)
            .options(*self.products._options())
            .where(*self._public(), Product.id != product_id)
            .order_by(Product.sort_order.asc())
            .limit(limit)
        )
        if product.category_id:
            statement = statement.where(Product.category_id == product.category_id)
        elif product.brand_id:
            statement = statement.where(Product.brand_id == product.brand_id)
        rows = list(self.db.scalars(statement).unique().all())
        return RecommendationResponse(
            title="Similar products",
            algorithm="same_category",
            items=self._map(rows),
        )

    def bought_together(
        self, product_id: UUID, *, limit: int = DEFAULT_LIMIT
    ) -> RecommendationResponse:
        """Fallback: same brand / best sellers when co-purchase stats unavailable."""
        limit = self._limit(limit)
        product = self.products.get(product_id)
        if not product or product.deleted_at is not None:
            raise NotFoundError("Product not found")
        statement = (
            select(Product)
            .options(*self.products._options())
            .where(
                *self._public(),
                Product.id != product_id,
                Product.is_best_seller.is_(True),
            )
            .order_by(Product.sort_order.asc())
            .limit(limit)
        )
        if product.brand_id:
            statement = statement.where(Product.brand_id == product.brand_id)
        rows = list(self.db.scalars(statement).unique().all())
        return RecommendationResponse(
            title="Frequently bought together",
            algorithm="best_seller_brand_fallback",
            items=self._map(rows),
        )

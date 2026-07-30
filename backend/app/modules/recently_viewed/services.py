from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.modules.catalog.product_mapper import ProductMapper
from app.modules.catalog.repositories.brand_repository import BrandRepository
from app.modules.catalog.repositories.category_repository import CategoryRepository
from app.modules.catalog.repositories.product_repository import ProductRepository
from app.modules.recently_viewed.constants import DEFAULT_LIMIT, MAX_RECENT_ITEMS
from app.modules.recently_viewed.repositories import RecentlyViewedRepository
from app.modules.recently_viewed.schemas import (
    RecentlyViewedItemResponse,
    RecentlyViewedListResponse,
)
from app.utils.exceptions import NotFoundError


class RecentlyViewedService:
    def __init__(self, db: Session, repository: RecentlyViewedRepository):
        self.db = db
        self.repository = repository
        self.products = ProductRepository(db)
        self.mapper = ProductMapper(
            self.products, CategoryRepository(db), BrandRepository(db)
        )

    def list(self, customer_id: UUID, *, limit: int = DEFAULT_LIMIT) -> RecentlyViewedListResponse:
        limit = min(max(limit, 1), MAX_RECENT_ITEMS)
        rows = self.repository.list_for_customer(customer_id, limit=limit)
        items: list[RecentlyViewedItemResponse] = []
        for row in rows:
            product = self.products.get(row.product_id)
            product_resp = (
                self.mapper._to_response(product) if product and product.deleted_at is None else None
            )
            items.append(
                RecentlyViewedItemResponse(
                    product_id=row.product_id,
                    viewed_at=row.viewed_at,
                    product=product_resp,
                )
            )
        return RecentlyViewedListResponse(items=items, total=len(items))

    def track(self, customer_id: UUID, product_id: UUID) -> RecentlyViewedItemResponse:
        product = self.products.get(product_id)
        if not product or product.deleted_at is not None:
            raise NotFoundError("Product not found")
        row = self.repository.upsert(customer_id, product_id)
        self.repository.trim(customer_id, MAX_RECENT_ITEMS)
        return RecentlyViewedItemResponse(
            product_id=row.product_id,
            viewed_at=row.viewed_at,
            product=self.mapper._to_response(product),
        )

    def clear(self, customer_id: UUID) -> dict[str, int]:
        return {"deleted": self.repository.clear(customer_id)}

    def remove(self, customer_id: UUID, product_id: UUID) -> None:
        if not self.repository.delete_product(customer_id, product_id):
            raise NotFoundError("Recently viewed item not found")

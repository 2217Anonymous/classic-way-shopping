from __future__ import annotations

from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.catalog.constants import PUBLIC_VISIBILITY
from app.modules.catalog.models.product import Product
from app.modules.catalog.repositories.brand_repository import BrandRepository
from app.modules.catalog.repositories.category_repository import CategoryRepository
from app.modules.catalog.repositories.product_repository import ProductRepository
from app.modules.catalog.schemas.brand import BrandResponse
from app.modules.catalog.schemas.category import CategoryResponse
from app.modules.catalog.services import StorefrontCatalogService
from app.modules.commerce.schemas import ProductListResponse
from app.modules.search.schemas import SearchFiltersResponse


class SearchService:
    def __init__(self, db: Session):
        self.db = db
        self.catalog = StorefrontCatalogService(
            db,
            ProductRepository(db),
            CategoryRepository(db),
            BrandRepository(db),
        )
        self.categories = CategoryRepository(db)
        self.brands = BrandRepository(db)

    def search(
        self,
        *,
        q: str | None = None,
        category: str | None = None,
        brand: str | None = None,
        min_price: Decimal | None = None,
        max_price: Decimal | None = None,
        sort: str | None = None,
        page: int = 1,
        limit: int = 20,
    ) -> ProductListResponse:
        return self.catalog.list_products(
            search=q,
            category=category,
            brand=brand,
            min_price=min_price,
            max_price=max_price,
            sort=sort or ("newest" if not q else None),
            page=page,
            limit=limit,
        )

    def suggestions(self, q: str, limit: int = 8) -> list[str]:
        return self.catalog.suggestions(q, limit=limit)

    def filters(self) -> SearchFiltersResponse:
        cats = [
            CategoryResponse.model_validate(c)
            for c in self.categories.list()
            if getattr(c, "is_active", True)
        ]
        brands = [
            BrandResponse.model_validate(b)
            for b in self.brands.list()
            if getattr(b, "is_active", True)
        ]
        price_row = self.db.execute(
            select(func.min(Product.price), func.max(Product.price)).where(
                Product.is_active.is_(True),
                Product.is_published.is_(True),
                Product.visibility == PUBLIC_VISIBILITY,
                Product.deleted_at.is_(None),
            )
        ).one()
        return SearchFiltersResponse(
            categories=cats,
            brands=brands,
            min_price=price_row[0],
            max_price=price_row[1],
        )

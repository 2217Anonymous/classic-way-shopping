from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field

from app.modules.catalog.schemas.brand import BrandResponse
from app.modules.catalog.schemas.category import CategoryResponse
from app.modules.commerce.schemas import ProductListResponse


class SearchFiltersResponse(BaseModel):
    categories: list[CategoryResponse] = Field(default_factory=list)
    brands: list[BrandResponse] = Field(default_factory=list)
    min_price: Decimal | None = None
    max_price: Decimal | None = None
    sort_options: list[str] = Field(
        default_factory=lambda: [
            "relevance",
            "newest",
            "price_asc",
            "price_desc",
            "name",
        ]
    )


class SearchQuery(BaseModel):
    q: str | None = Field(default=None, max_length=200)
    category: str | None = None
    brand: str | None = None
    min_price: Decimal | None = None
    max_price: Decimal | None = None
    sort: str | None = None
    page: int = 1
    limit: int = 20

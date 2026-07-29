from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.modules.catalog.schemas.product import ProductResponse


class RecentlyViewedCreate(BaseModel):
    product_id: UUID


class RecentlyViewedItemResponse(BaseModel):
    product_id: UUID
    viewed_at: datetime
    product: ProductResponse | None = None


class RecentlyViewedListResponse(BaseModel):
    items: list[RecentlyViewedItemResponse]
    total: int = Field(ge=0)

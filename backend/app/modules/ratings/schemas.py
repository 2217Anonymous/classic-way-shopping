from uuid import UUID

from pydantic import BaseModel, Field


class RatingBreakdown(BaseModel):
    stars: int = Field(ge=1, le=5)
    count: int = Field(ge=0)


class ProductRatingSummary(BaseModel):
    product_id: UUID
    average: float
    count: int
    breakdown: list[RatingBreakdown] = Field(default_factory=list)

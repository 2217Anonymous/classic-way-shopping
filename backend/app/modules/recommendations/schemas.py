from pydantic import BaseModel, Field

from app.modules.catalog.schemas.product import ProductResponse


class RecommendationResponse(BaseModel):
    title: str
    algorithm: str
    items: list[ProductResponse] = Field(default_factory=list)

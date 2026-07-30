from uuid import UUID

from fastapi import APIRouter

from app.modules.auth.dependencies import DbSession
from app.modules.ratings.schemas import ProductRatingSummary
from app.modules.ratings.services import RatingsService

router = APIRouter(prefix="/ratings", tags=["Ratings"])


@router.get("/products/{product_id}", response_model=ProductRatingSummary)
@router.get("/summary/{product_id}", response_model=ProductRatingSummary)
def product_rating_summary(product_id: UUID, db: DbSession) -> ProductRatingSummary:
    return RatingsService(db).summary(product_id)

from uuid import UUID

from fastapi import APIRouter, Query

from app.modules.auth.dependencies import DbSession, OptionalCustomer
from app.modules.recommendations.schemas import RecommendationResponse
from app.modules.recommendations.services import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


def get_service(db: DbSession) -> RecommendationService:
    return RecommendationService(db)


@router.get("/home", response_model=RecommendationResponse)
def recommendations_home(
    db: DbSession, limit: int = Query(8, ge=1, le=24)
) -> RecommendationResponse:
    return get_service(db).home(limit=limit)


@router.get("/for-you", response_model=RecommendationResponse)
def recommendations_for_you(
    customer: OptionalCustomer,
    db: DbSession,
    limit: int = Query(8, ge=1, le=24),
) -> RecommendationResponse:
    customer_id = customer.id if customer else None
    return get_service(db).for_you(customer_id, limit=limit)


@router.get("/similar/{product_id}", response_model=RecommendationResponse)
def recommendations_similar(
    product_id: UUID,
    db: DbSession,
    limit: int = Query(8, ge=1, le=24),
) -> RecommendationResponse:
    return get_service(db).similar(product_id, limit=limit)


@router.get("/bought-together/{product_id}", response_model=RecommendationResponse)
def recommendations_bought_together(
    product_id: UUID,
    db: DbSession,
    limit: int = Query(8, ge=1, le=24),
) -> RecommendationResponse:
    return get_service(db).bought_together(product_id, limit=limit)

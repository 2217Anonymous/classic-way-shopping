from decimal import Decimal

from fastapi import APIRouter, Query

from app.modules.auth.dependencies import DbSession
from app.modules.commerce.schemas import ProductListResponse
from app.modules.search.schemas import SearchFiltersResponse
from app.modules.search.services import SearchService

router = APIRouter(prefix="/search", tags=["Search"])


def get_service(db: DbSession) -> SearchService:
    return SearchService(db)


@router.get("", response_model=ProductListResponse)
def search_products(
    db: DbSession,
    q: str | None = Query(default=None, max_length=200),
    category: str | None = None,
    brand: str | None = None,
    min_price: Decimal | None = Query(default=None, ge=0),
    max_price: Decimal | None = Query(default=None, ge=0),
    sort: str | None = Query(default=None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
) -> ProductListResponse:
    return get_service(db).search(
        q=q,
        category=category,
        brand=brand,
        min_price=min_price,
        max_price=max_price,
        sort=sort,
        page=page,
        limit=limit,
    )


@router.get("/suggestions", response_model=list[str])
def search_suggestions(
    db: DbSession,
    q: str = Query(..., min_length=1, max_length=100),
    limit: int = Query(8, ge=1, le=20),
) -> list[str]:
    return get_service(db).suggestions(q, limit=limit)


@router.get("/filters", response_model=SearchFiltersResponse)
def search_filters(db: DbSession) -> SearchFiltersResponse:
    return get_service(db).filters()

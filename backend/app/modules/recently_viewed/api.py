from uuid import UUID

from fastapi import APIRouter, Query, Response, status

from app.modules.auth.dependencies import CurrentCustomer, DbSession
from app.modules.recently_viewed.repositories import RecentlyViewedRepository
from app.modules.recently_viewed.schemas import (
    RecentlyViewedCreate,
    RecentlyViewedItemResponse,
    RecentlyViewedListResponse,
)
from app.modules.recently_viewed.services import RecentlyViewedService

router = APIRouter(prefix="/recently-viewed", tags=["Recently Viewed"])


def get_service(db: DbSession) -> RecentlyViewedService:
    return RecentlyViewedService(db, RecentlyViewedRepository(db))


@router.get("", response_model=RecentlyViewedListResponse)
def list_recently_viewed(
    customer: CurrentCustomer,
    db: DbSession,
    limit: int = Query(12, ge=1, le=40),
) -> RecentlyViewedListResponse:
    return get_service(db).list(customer.id, limit=limit)


@router.post("", response_model=RecentlyViewedItemResponse, status_code=status.HTTP_201_CREATED)
def track_recently_viewed(
    payload: RecentlyViewedCreate,
    customer: CurrentCustomer,
    db: DbSession,
) -> RecentlyViewedItemResponse:
    return get_service(db).track(customer.id, payload.product_id)


@router.delete("", status_code=status.HTTP_200_OK)
def clear_recently_viewed(customer: CurrentCustomer, db: DbSession) -> dict[str, int]:
    return get_service(db).clear(customer.id)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_recently_viewed(
    product_id: UUID, customer: CurrentCustomer, db: DbSession
) -> Response:
    get_service(db).remove(customer.id, product_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

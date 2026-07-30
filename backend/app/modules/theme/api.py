from fastapi import APIRouter

from app.modules.auth.dependencies import CurrentCustomer, DbSession, OptionalCustomer
from app.modules.theme.repositories import ThemeRepository
from app.modules.theme.schemas import ThemeResponse, ThemeUpdate
from app.modules.theme.services import ThemeService

router = APIRouter(prefix="/theme", tags=["Theme"])


def get_theme_service(db: DbSession) -> ThemeService:
    return ThemeService(ThemeRepository(db))


@router.get("", response_model=ThemeResponse)
def get_theme(customer: OptionalCustomer, db: DbSession) -> ThemeResponse:
    customer_id = customer.id if customer else None
    return get_theme_service(db).resolve_for_customer(customer_id)


@router.put("", response_model=ThemeResponse)
def update_theme(
    payload: ThemeUpdate, customer: CurrentCustomer, db: DbSession
) -> ThemeResponse:
    return get_theme_service(db).upsert_customer_theme(customer.id, payload)

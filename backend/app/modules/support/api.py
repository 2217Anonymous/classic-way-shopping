from uuid import UUID

from fastapi import APIRouter, Query, status

from app.modules.auth.dependencies import CurrentCustomer, DbSession
from app.modules.support.repositories import SupportRepository
from app.modules.support.schemas import (
    SupportMessageCreate,
    SupportTicketCreate,
    SupportTicketListResponse,
    SupportTicketResponse,
)
from app.modules.support.services import SupportService

router = APIRouter(prefix="/support", tags=["Customer Support"])


def get_service(db: DbSession) -> SupportService:
    return SupportService(SupportRepository(db))


@router.get("/tickets", response_model=SupportTicketListResponse)
def list_tickets(
    customer: CurrentCustomer,
    db: DbSession,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
) -> SupportTicketListResponse:
    return get_service(db).list(customer.id, page=page, limit=limit)


@router.post(
    "/tickets",
    response_model=SupportTicketResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_ticket(
    payload: SupportTicketCreate,
    customer: CurrentCustomer,
    db: DbSession,
) -> SupportTicketResponse:
    return get_service(db).create(customer.id, payload)


@router.get("/tickets/{ticket_id}", response_model=SupportTicketResponse)
def get_ticket(
    ticket_id: UUID, customer: CurrentCustomer, db: DbSession
) -> SupportTicketResponse:
    return get_service(db).get(customer.id, ticket_id)


@router.post("/tickets/{ticket_id}/messages", response_model=SupportTicketResponse)
def add_ticket_message(
    ticket_id: UUID,
    payload: SupportMessageCreate,
    customer: CurrentCustomer,
    db: DbSession,
) -> SupportTicketResponse:
    return get_service(db).add_message(customer.id, ticket_id, payload)

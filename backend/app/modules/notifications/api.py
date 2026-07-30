from fastapi import APIRouter, Query, Response, status

from app.modules.auth.dependencies import CurrentCustomer, DbSession
from app.modules.notifications.repositories import NotificationRepository
from app.modules.notifications.schemas import NotificationListResponse, NotificationResponse
from app.modules.notifications.services import NotificationService

router = APIRouter(prefix="/notifications", tags=["Notifications"])


def get_service(db: DbSession) -> NotificationService:
    return NotificationService(NotificationRepository(db))


@router.get("", response_model=NotificationListResponse)
def list_notifications(
    customer: CurrentCustomer,
    db: DbSession,
    unread_only: bool = False,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50),
) -> NotificationListResponse:
    return get_service(db).list(
        customer.id, unread_only=unread_only, page=page, limit=limit
    )


@router.post("/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: str,
    customer: CurrentCustomer,
    db: DbSession,
) -> NotificationResponse:
    from uuid import UUID

    return get_service(db).mark_read(customer.id, UUID(notification_id))


@router.post("/read-all")
def mark_all_notifications_read(
    customer: CurrentCustomer, db: DbSession
) -> dict[str, int]:
    return get_service(db).mark_all_read(customer.id)


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(
    notification_id: str,
    customer: CurrentCustomer,
    db: DbSession,
) -> Response:
    from uuid import UUID

    get_service(db).soft_delete(customer.id, UUID(notification_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)

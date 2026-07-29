from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class NotificationResponse(BaseModel):
    id: UUID
    type: str
    title: str
    body: str
    link_url: str | None = None
    reference_type: str | None = None
    reference_id: str | None = None
    is_read: bool
    read_at: datetime | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class NotificationListResponse(BaseModel):
    items: list[NotificationResponse]
    total: int
    unread_count: int
    page: int
    limit: int
    pages: int


class NotificationCreateInternal(BaseModel):
    """Used by services (orders/payments) — not exposed as public write API."""

    customer_id: UUID
    type: str = Field(max_length=32)
    title: str = Field(min_length=1, max_length=200)
    body: str = Field(min_length=1, max_length=5000)
    link_url: str | None = Field(default=None, max_length=500)
    reference_type: str | None = Field(default=None, max_length=64)
    reference_id: str | None = Field(default=None, max_length=64)

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SupportTicketCreate(BaseModel):
    subject: str = Field(min_length=3, max_length=200)
    category: str = Field(default="other", max_length=40)
    message: str = Field(min_length=5, max_length=5000)
    order_id: UUID | None = None


class SupportMessageCreate(BaseModel):
    body: str = Field(min_length=1, max_length=5000)


class SupportMessageResponse(BaseModel):
    id: UUID
    sender_type: str
    body: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SupportTicketResponse(BaseModel):
    id: UUID
    subject: str
    category: str
    status: str
    order_id: UUID | None = None
    created_at: datetime
    updated_at: datetime
    closed_at: datetime | None = None
    messages: list[SupportMessageResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class SupportTicketListResponse(BaseModel):
    items: list[SupportTicketResponse]
    total: int
    page: int
    limit: int
    pages: int

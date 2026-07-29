from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.core.ids import uuid_fk, uuid_pk


class RecentlyViewed(Base):
    __tablename__ = "recently_viewed"
    __table_args__ = (
        UniqueConstraint(
            "customer_id", "product_id", name="uq_recently_viewed_customer_product"
        ),
    )

    id: Mapped[uuid.UUID] = uuid_pk()
    customer_id: Mapped[uuid.UUID] = uuid_fk("customers.id", ondelete="CASCADE")
    product_id: Mapped[uuid.UUID] = uuid_fk("products.id", ondelete="CASCADE")
    viewed_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

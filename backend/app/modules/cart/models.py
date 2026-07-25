from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, Integer, Numeric, String, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.ids import uuid_fk, uuid_pk


class Cart(Base):
    """VL-015 — shopping cart, keyed by session and/or storefront customer."""

    __tablename__ = "carts"

    id: Mapped[uuid.UUID] = uuid_pk()
    session_key: Mapped[str | None] = mapped_column(
        String(120), nullable=True, index=True
    )
    # Legacy admin column (DB FK to users). Storefront ownership is customer_id only —
    # do not declare ORM FK to users; that table is admin-owned and not in this metadata.
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid(as_uuid=True), nullable=True, index=True
    )
    customer_id: Mapped[uuid.UUID | None] = uuid_fk(
        "customers.id", nullable=True, ondelete="SET NULL"
    )
    coupon_code: Mapped[str | None] = mapped_column(String(40), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    items: Mapped[list["CartItem"]] = relationship(
        "CartItem",
        back_populates="cart",
        cascade="all, delete-orphan",
        order_by="CartItem.id.asc()",
        passive_deletes=True,
    )


class CartItem(Base):
    """VL-015 — a line item in a cart, snapshotting price/name at add-time."""

    __tablename__ = "cart_items"

    id: Mapped[uuid.UUID] = uuid_pk()
    cart_id: Mapped[uuid.UUID] = uuid_fk("carts.id", ondelete="CASCADE")
    product_id: Mapped[uuid.UUID] = uuid_fk("products.id", ondelete="CASCADE")
    variant_id: Mapped[uuid.UUID | None] = uuid_fk(
        "product_variants.id", nullable=True, ondelete="SET NULL"
    )
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    product_name: Mapped[str] = mapped_column(String(160))
    sku: Mapped[str | None] = mapped_column(String(64), nullable=True)

    cart: Mapped[Cart] = relationship("Cart", back_populates="items")

from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    DateTime,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.core.ids import uuid_fk, uuid_pk


class Wishlist(Base):
    __tablename__ = "wishlists"

    id: Mapped[uuid.UUID] = uuid_pk()
    customer_id: Mapped[uuid.UUID] = uuid_fk(
        "customers.id", unique=True, ondelete="CASCADE"
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    items: Mapped[list[WishlistItem]] = relationship(
        "WishlistItem",
        back_populates="wishlist",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    __table_args__ = (
        UniqueConstraint("wishlist_id", "product_id", name="uq_wishlist_product"),
    )

    id: Mapped[uuid.UUID] = uuid_pk()
    wishlist_id: Mapped[uuid.UUID] = uuid_fk("wishlists.id", ondelete="CASCADE")
    product_id: Mapped[uuid.UUID] = uuid_fk("products.id", ondelete="CASCADE")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    wishlist: Mapped[Wishlist] = relationship("Wishlist", back_populates="items")


class CompareList(Base):
    __tablename__ = "compare_lists"

    id: Mapped[uuid.UUID] = uuid_pk()
    customer_id: Mapped[uuid.UUID] = uuid_fk(
        "customers.id", unique=True, ondelete="CASCADE"
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    items: Mapped[list[CompareItem]] = relationship(
        "CompareItem",
        back_populates="compare_list",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class CompareItem(Base):
    __tablename__ = "compare_items"
    __table_args__ = (
        UniqueConstraint("compare_list_id", "product_id", name="uq_compare_product"),
    )

    id: Mapped[uuid.UUID] = uuid_pk()
    compare_list_id: Mapped[uuid.UUID] = uuid_fk(
        "compare_lists.id", ondelete="CASCADE"
    )
    product_id: Mapped[uuid.UUID] = uuid_fk("products.id", ondelete="CASCADE")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    compare_list: Mapped[CompareList] = relationship(
        "CompareList", back_populates="items"
    )


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[uuid.UUID] = uuid_pk()
    product_id: Mapped[uuid.UUID] = uuid_fk("products.id", ondelete="CASCADE")
    customer_id: Mapped[uuid.UUID] = uuid_fk("customers.id", ondelete="CASCADE")
    rating: Mapped[int] = mapped_column(Integer)
    title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    body: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_verified_purchase: Mapped[bool] = mapped_column(Boolean, default=False)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    images: Mapped[list[ReviewImage]] = relationship(
        "ReviewImage",
        back_populates="review",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class ReviewImage(Base):
    __tablename__ = "review_images"

    id: Mapped[uuid.UUID] = uuid_pk()
    review_id: Mapped[uuid.UUID] = uuid_fk("reviews.id", ondelete="CASCADE")
    url: Mapped[str] = mapped_column(String(500))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    review: Mapped[Review] = relationship("Review", back_populates="images")


class CouponUsage(Base):
    __tablename__ = "coupon_usages"

    id: Mapped[uuid.UUID] = uuid_pk()
    coupon_id: Mapped[uuid.UUID] = uuid_fk("coupons.id", ondelete="CASCADE")
    customer_id: Mapped[uuid.UUID] = uuid_fk("customers.id", ondelete="CASCADE")
    order_id: Mapped[uuid.UUID | None] = uuid_fk(
        "orders.id", nullable=True, ondelete="SET NULL"
    )
    used_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    discount_amount: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2), nullable=True
    )


class Feedback(Base):
    __tablename__ = "feedbacks"

    id: Mapped[uuid.UUID] = uuid_pk()
    customer_id: Mapped[uuid.UUID | None] = uuid_fk(
        "customers.id", nullable=True, ondelete="SET NULL"
    )
    name: Mapped[str] = mapped_column(String(160))
    email: Mapped[str] = mapped_column(String(255))
    subject: Mapped[str] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(32), default="new")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

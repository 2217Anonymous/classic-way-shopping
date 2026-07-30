#!/usr/bin/env python3
"""ORM seed script for local shopping demo data.

Usage (from backend/):
  python -m scripts.seed_demo

Requires an empty-or-existing classic_way DB. Does not mutate admin-owned
catalog beyond inserting demo products/categories/brands when missing.
"""

from __future__ import annotations

import random
import uuid
from decimal import Decimal

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.modules.catalog.models.brand import Brand
from app.modules.catalog.models.category import Category
from app.modules.catalog.models.product import Product
from app.modules.customers.models import Customer
from app.modules.engagement.models import Review
from app.modules.notifications.models import Notification
from app.modules.theme.models import Theme
from app.modules.theme.constants import DEFAULT_THEME, default_page_visibility

CATEGORIES = [
    "Men", "Women", "Kids", "Footwear", "Accessories",
    "Electronics", "Home", "Beauty", "Sports", "Grocery",
]

BRANDS = [
    f"Brand {c}" for c in "ABCDEFGHIJKLMNOPQRST"
]


def seed() -> None:
    db = SessionLocal()
    try:
        if not db.query(Theme).filter_by(is_default=True, customer_id=None).first():
            db.add(
                Theme(
                    customer_id=None,
                    home_theme=DEFAULT_THEME["home_theme"],
                    shop_category=DEFAULT_THEME["shop_category"],
                    shop_layout=DEFAULT_THEME["shop_layout"],
                    product_layout=DEFAULT_THEME["product_layout"],
                    blog_layout=DEFAULT_THEME["blog_layout"],
                    page_visibility=default_page_visibility(),
                    is_default=True,
                    is_active=True,
                )
            )

        categories: list[Category] = []
        for i, name in enumerate(CATEGORIES):
            slug = name.lower()
            row = db.query(Category).filter_by(slug=slug).first()
            if not row:
                row = Category(
                    name=name,
                    slug=slug,
                    is_active=True,
                    sort_order=i,
                )
                db.add(row)
                db.flush()
            categories.append(row)

        brands: list[Brand] = []
        for name in BRANDS:
            slug = name.lower().replace(" ", "-")
            row = db.query(Brand).filter_by(slug=slug).first()
            if not row:
                row = Brand(name=name, slug=slug, is_active=True)
                db.add(row)
                db.flush()
            brands.append(row)

        product_count = db.query(Product).count()
        if product_count < 100:
            for i in range(100 - product_count):
                n = product_count + i + 1
                db.add(
                    Product(
                        name=f"Demo Product {n}",
                        slug=f"demo-product-{n}",
                        description=f"Sample description for demo product {n}",
                        short_description=f"Demo product {n}",
                        price=Decimal(str(round(random.uniform(99, 4999), 2))),
                        stock=random.randint(0, 200),
                        category_id=random.choice(categories).id,
                        brand_id=random.choice(brands).id,
                        is_published=True,
                        is_active=True,
                        is_featured=n % 10 == 0,
                        is_trending=n % 7 == 0,
                        is_best_seller=n % 11 == 0,
                        visibility="public",
                        sku=f"SKU-DEMO-{n:04d}",
                        sort_order=n,
                    )
                )
            db.flush()

        customers: list[Customer] = list(db.query(Customer).limit(50).all())
        while len(customers) < 50:
            n = len(customers) + 1
            email = f"customer{n}@example.com"
            existing = db.query(Customer).filter_by(email=email).first()
            if existing:
                customers.append(existing)
                continue
            c = Customer(
                email=email,
                full_name=f"Customer {n}",
                phone=f"+91900000{n:04d}",
                hashed_password=hash_password("Password123!"),
                is_active=True,
                email_verified=True,
            )
            db.add(c)
            db.flush()
            customers.append(c)

        products = list(db.query(Product).limit(100).all())
        review_count = db.query(Review).count()
        while review_count < 100 and products and customers:
            p = random.choice(products)
            c = random.choice(customers)
            db.add(
                Review(
                    product_id=p.id,
                    customer_id=c.id,
                    rating=random.randint(3, 5),
                    title="Great product",
                    body="Happy with the purchase.",
                    is_approved=True,
                    is_verified_purchase=True,
                )
            )
            review_count += 1

        for c in customers[:20]:
            db.add(
                Notification(
                    customer_id=c.id,
                    type="system",
                    title="Welcome to Classic Way",
                    body="Thanks for joining. Explore new arrivals today.",
                    link_url="/",
                )
            )

        db.commit()
        print("Seed complete: categories, brands, products, customers, reviews, notifications.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()

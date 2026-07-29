# Enterprise Shopping Backend — Master Blueprint

**Service:** Classic Way Shopping API (`Valaiyagam Shopping API`)  
**Role:** Customer-facing storefront only  
**Sibling:** `classic-way-admin` (catalog writes, inventory, fulfillment ops, Alembic migrations)  
**Shared resource:** PostgreSQL database `classic_way`  
**API base:** `/api/v1`  
**Health:** `GET /health`

---

## 1. Purpose

This backend powers the customer storefront: identity, browsing, search, cart, engagement, checkout, payments, orders, tracking, notifications, recommendations, recently viewed, support, ratings, and theme preferences.

It **must not** expose admin-only write APIs (product CRUD, category/brand mutations, inventory adjustments, coupon administration, courier configuration, refund issuance beyond customer cancel flows).

---

## 2. Architecture Principles

### 2.1 Clean Architecture (per module)

| Layer | Responsibility | Typical files |
|-------|----------------|---------------|
| **Routes (API)** | HTTP binding, auth deps, status codes, response models | `api.py` |
| **Services** | Business rules, orchestration, transactions across repos | `services.py`, `*_service.py` |
| **Repositories** | SQLAlchemy queries only; no HTTP or domain policy | `repositories.py`, `repositories/` |
| **Models** | ORM entities mapped to shared Postgres tables | `models.py`, `models/` |
| **Schemas** | Pydantic request/response DTOs and validation | `schemas.py`, `schemas/` |
| **Mapper / SQL** | DTO shaping, complex SQL fragments (when needed) | `product_mapper.py`, `sql/` |

**Dependency rule:** Routes → Services → Repositories → Models.  
Schemas are used at the edges (routes in/out). Core business logic must not import FastAPI types.

### 2.2 SOLID

- **S** — One service method owns one use case (e.g. `create_order`, not “checkout everything”).
- **O** — Extend via new modules/routers; avoid patching catalog with admin writes.
- **L** — Repositories implement a narrow data contract; services stay substitutable for tests.
- **I** — Prefer focused repos (`WishlistRepository`) over a god `EngagementRepository` when domains diverge.
- **D** — Services depend on repository abstractions / injected instances, not on global sessions.

### 2.3 DDD (lightweight)

Logical **bounded contexts** map to packages or multi-router packages:

| Context | Owns (customer side) |
|---------|----------------------|
| Identity | Auth, customer profile |
| Catalog | Read products/categories/brands |
| Cart | Guest + customer carts |
| Engagement | Wishlist, compare, reviews, feedback |
| Commerce | Coupons apply, checkout, payments, orders |
| Experience | Theme preferences |
| Discovery | Search, recommendations, recently viewed |
| Messaging | Notifications |
| Fulfillment visibility | Public/customer tracking |
| Support | Tickets + messages |

Aggregates of note: **Cart** (+ items), **Order** (+ items + status history), **Wishlist** (+ items), **Customer** (+ refresh tokens).

### 2.4 Request path

```
Client → FastAPI Router → Auth dependency (optional/required)
       → Service use case → Repository / other services
       → SQLAlchemy Session → PostgreSQL
       → Pydantic response model → JSON
```

Errors surface as `AppError` subclasses → `{"detail": "..."}` with HTTP status.

---

## 3. Module Folder Conventions

### 3.1 Large / multi-entity modules

Use a **folder tree** when a module has many entities, multiple routers, or distinct data access paths:

```
modules/<name>/
  api.py                 # or multiple routers exported from api.py
  services.py            # or domain-specific *_service.py
  models/                # one file per aggregate/entity group
  schemas/               # one file per resource
  repositories/          # one file per aggregate
  product_mapper.py      # optional mappers
  sql/                   # optional raw/complex SQL helpers
  constants.py
```

**When to use:** Catalog (products, categories, brands, media, variants), Commerce (orders, payments, coupons, inventory reads, shipments).

**Why:** Keeps imports clear, avoids 2k-line files, and mirrors DDD aggregates without over-splitting micro-packages prematurely.

### 3.2 Small / single-aggregate modules

Use **flat files**:

```
modules/<name>/
  api.py
  services.py
  repositories.py
  models.py
  schemas.py
  constants.py           # optional
```

**When to use:** Auth, Customers, Addresses, Cart, Theme, Search, Ratings, Notifications, Recently Viewed, Recommendations, Tracking, Support — until they grow enough to warrant nested folders.

**Why:** Lower ceremony; same Clean Architecture layers without unnecessary nesting.

### 3.3 Multi-capability packages (current pattern)

Some packages host **several logical modules** behind separate routers in one package:

| Package | Logical modules | Routers |
|---------|-----------------|---------|
| `engagement/` | Wishlist, Compare, Reviews, Feedback | `/wishlist`, `/compare`, `/reviews`, `/feedback` |
| `commerce/` | Coupons, Checkout, Payments, Orders (+ order tracking) | `/coupons`, `/checkout`, `/payments`, `/orders` |

Dedicated packages also exist for Search, Ratings, Notifications, Tracking, Recommendations, Recently Viewed, and Support.

---

## 4. Mapping: 21 Logical Modules → Package Layout

| # | Logical module | Package (actual / target) | Status | Structure |
|---|----------------|---------------------------|--------|-----------|
| 1 | Auth | `modules/auth/` | Existing | Flat |
| 2 | Customer | `modules/customers/` | Existing | Flat |
| 3 | Customer Profile | `modules/customers/` (+ auth schemas) | Existing | Flat (shared with Customer) |
| 4 | Address | `modules/addresses/` | Existing | Flat |
| 5 | Catalog | `modules/catalog/` | Existing | Large (`models/`, `schemas/`, `repositories/`, mapper) |
| 6 | Search | `modules/search/` (+ legacy `/products/search`) | Existing | Flat (+ `sql/` optional) |
| 7 | Cart | `modules/cart/` | Existing | Flat (+ `cart_core.py`) |
| 8 | Wishlist | `modules/engagement/` | Existing | Flat (multi-router package) |
| 9 | Compare | `modules/engagement/` | Existing | Flat |
| 10 | Checkout | `modules/commerce/` | Existing | Multi-file flat/large |
| 11 | Orders | `modules/commerce/` | Existing | Multi-file |
| 12 | Payments | `modules/commerce/` | Existing | Multi-file |
| 13 | Coupons | `modules/commerce/` (read + apply; admin owns CRUD) | Existing | Multi-file |
| 14 | Reviews | `modules/engagement/` | Existing | Flat |
| 15 | Ratings | `modules/ratings/` | Existing | Flat |
| 16 | Notifications | `modules/notifications/` | Existing | Flat (+ `sql/`) |
| 17 | Shipment Tracking | `modules/tracking/` (+ `/orders/tracking/...`) | Existing | Flat |
| 18 | Recently Viewed | `modules/recently_viewed/` | Existing | Flat (+ `sql/`) |
| 19 | Recommendations | `modules/recommendations/` | Existing | Flat |
| 20 | Theme | `modules/theme/` | Existing | Flat |
| 21 | Customer Support | `modules/support/` (+ `/feedback`) | Existing | Flat (+ `sql/`) |

**Router registration** (`app/main.py`): auth, customers, addresses, catalog (+ categories, brands), cart, engagement (wishlist/compare/reviews/feedback), commerce (coupons/checkout/payments/orders), theme, search, notifications, recently_viewed, recommendations, ratings, tracking, support — all under `settings.api_v1_prefix` (`/api/v1`).

---

## 5. Shared Database Read/Write Rules

Postgres is shared with `classic-way-admin`. **Admin owns Alembic.** Shopping may use `create_all` only for local Docker bootstrap (`init_db.py`), never as production migration strategy.

### 5.1 Shopping may WRITE

| Area | Tables |
|------|--------|
| Identity | `customers`, `refresh_tokens` |
| Profile / addresses | `customer_addresses` |
| Cart | `carts`, `cart_items` |
| Engagement | `wishlists`, `wishlist_items`, `compare_lists`, `compare_items`, `reviews`, `review_images`, `feedbacks`, `coupon_usages` |
| Commerce (customer flows) | `orders`, `order_items`, `order_status_history`, `payments` (create/verify path), `theme` (customer row) |
| Engagement extras | `notifications`, `recently_viewed`, `support_tickets`, `support_messages` |

Also allowed on order placement: **inventory reservation decrements** via existing commerce/inventory repositories (customer checkout side-effect), not free-form admin stock edits.

### 5.2 Shopping READ-ONLY

| Area | Tables |
|------|--------|
| Catalog | `products`, `product_media`, `product_attributes`, `product_variants`, `categories`, `brands` |
| Pricing / promos config | `coupons`, `tax_rules`, `store_settings` |
| Inventory truth | `inventory_items`, `inventory_settings`, `stock_movements` (read; write only via checkout reserve path) |
| Fulfillment | `shipments`, `shipment_events`, `courier_accounts` |
| Payments audit | `payment_events`, `refunds` (customer may observe via order APIs; admin owns webhook capture ops) |

### 5.3 Never do in shopping

- Product / category / brand CRUD
- Coupon / tax / store settings administration
- Courier account configuration
- Admin user (`users`) authentication or FK ownership for storefront identity
- Running Alembic migrations against production from this repo

### 5.4 Legacy columns

Some tables retain nullable `user_id` (admin-era). Storefront ownership is always `customer_id`. Do not declare ORM FKs to admin `users` in shopping metadata.

---

## 6. Tech Stack

### 6.1 Current runtime

| Concern | Choice |
|---------|--------|
| Framework | FastAPI |
| ORM | SQLAlchemy 2.0 **sync** |
| Driver | `postgresql+psycopg` (psycopg v3) |
| Auth | JWT (HS256) access + refresh; `pwdlib` Argon2 hashing |
| Validation | Pydantic v2 |
| Media | Local `/uploads` StaticFiles (shared volume with admin) |
| Payments | COD + Razorpay-shaped create/verify (sandbox-oriented) |

Engine: `pool_pre_ping=True`, `pool_size=5`, `max_overflow=10`.

### 6.2 Production target

| Concern | Target |
|---------|--------|
| DB access | Async SQLAlchemy + `asyncpg` (already in requirements for adoption) |
| Cache / sessions | Redis (cart hot path, rate limits, search suggestions, theme) |
| Object storage | S3-compatible for product/media (replace local uploads) |
| Search | Dedicated search service or Postgres FTS / OpenSearch |
| Jobs | Async workers for notifications, recommendation refresh |

### 6.3 Migration path (brief)

1. Keep sync APIs stable; introduce async engine alongside sync (dual-mode sessions).
2. Convert repositories module-by-module to `AsyncSession`, starting with read-heavy catalog/search.
3. Add Redis for rate limiting and cart/session caching without changing route contracts.
4. Move media URLs to S3; keep path-compatible URL fields in DB.
5. Extract search/recommendations workers; shopping API becomes a thin query façade.
6. Remove sync engine once all modules and tests are async.

---

## 7. Security

### 7.1 JWT

- **Access token:** `type=access`, `scope=customer`, `sub=<customer_uuid>`, expiry `access_token_expire_minutes` (default 60).
- **Refresh token:** `type=refresh`; hash stored in `refresh_tokens`; expiry `refresh_token_expire_days` (default 30).
- Algorithm: HS256 with `SECRET_KEY`.
- Dependencies: `CurrentCustomer` (required), `OptionalCustomer` (guest-friendly cart/checkout/theme).

### 7.2 Refresh & logout

- Login/register issue token pair and persist refresh hash.
- Refresh rotates/validates against DB; revoked or expired tokens fail.
- Logout revokes refresh token when provided.

### 7.3 Password hashing

- `pwdlib.PasswordHash.recommended()` (Argon2 family). Never store plaintext.

### 7.4 CORS

- `CORSMiddleware` with `settings.cors_origin_list` (comma-separated env), credentials allowed.

### 7.5 Rate limiting (target)

- In-process `RateLimitMiddleware` is enabled; production should still rate-limit `/auth/login`, `/auth/register`, `/auth/forgot-password`, payment verify, and search via Redis/API gateway.
- Return `429` with clear `detail` when exceeded.

### 7.6 Other

- Ownership checks on addresses, orders, wishlist/compare items (`customer_id` match).
- Guest cart via `X-Cart-Id` header; merge requires authenticated customer.
- Payment webhook on shopping is a stub — authoritative capture remains admin/provider path.
- Soft-delete awareness: respect `customers.deleted_at`, `products.deleted_at` on reads.

---

## 8. Scaling Strategy

| Lever | Approach |
|-------|----------|
| Horizontal API | Stateless FastAPI replicas behind LB; JWT validation local |
| DB | Shared Postgres; shopping uses short transactions; admin heavy writes isolated by table ownership |
| Read scale | Replicas for catalog/search; Redis cache for product lists & theme |
| Cart | Sticky header cart id + eventual Redis cart for guests |
| Uploads | S3 + CDN; stop serving from API process |
| Search | Offload to FTS/OpenSearch; API returns thin product DTOs |
| Peak checkout | Idempotent order create; inventory reserve with row locks; payment retry endpoints |
| Observability | Structured logs, request IDs, metrics on checkout/payment latency |

---

## 9. Common Mistakes

1. **Writing catalog from shopping** — breaks admin ownership and migration discipline.
2. **Using `user_id` as storefront owner** — always key off `customer_id`.
3. **Business logic in routers** — validation OK; pricing/inventory rules belong in services.
4. **Skipping ownership checks** — leaking another customer’s address/order.
5. **Trusting client prices** — cart/order lines must re-read product/variant prices server-side.
6. **Running Alembic from shopping in prod** — schema drift vs admin.
7. **Blocking ORM N+1** on product lists — use repository joins/mappers; plan Redis later.
8. **Treating guest cart ids as secrets** — still validate UUID format; merge only after auth.
9. **Approving reviews in shopping** — customers create reviews; `is_approved` is admin moderation.
10. **Inventing admin write APIs** in docs or code “for convenience”.

---

## 10. Related Documents

| Doc | Path |
|-----|------|
| Module encyclopedia | [`MODULES.md`](./MODULES.md) |
| Customer API catalog | [`../api/CUSTOMER_API_CATALOG.md`](../api/CUSTOMER_API_CATALOG.md) |
| Schema & ER | [`../database/SCHEMA_AND_ER.md`](../database/SCHEMA_AND_ER.md) |
| Business stories | [`BUSINESS_STORIES.md`](./BUSINESS_STORIES.md) |
| Repo folder map | [`../../FOLDER_STRUCTURE.md`](../../FOLDER_STRUCTURE.md) |

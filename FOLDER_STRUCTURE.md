# Classic Way Shopping — Folder Structure

Customer-facing storefront monorepo: FastAPI shopping API + Next.js frontend. Shares PostgreSQL with `classic-way-admin` (admin owns schema/migrations).

```
classic-way-shopping/
├── compose.yaml                 # Docker: postgres (classic-way-db) + shopping API
├── .env.example                 # Compose / shared env template
├── README.md
├── FOLDER_STRUCTURE.md          # This file
│
├── backend/                     # Shopping API (customer-facing only)
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   ├── requirements.txt
│   ├── main.py                  # Uvicorn entry → app.main:app
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, routers, /uploads
│   │   ├── core/
│   │   │   ├── config.py        # Settings (Postgres, JWT, CORS)
│   │   │   ├── database.py      # SQLAlchemy engine / sessions
│   │   │   ├── security.py      # Password hashing, JWT helpers
│   │   │   ├── ids.py           # UUID PK / FK column helpers
│   │   │   └── init_db.py       # Local Docker bootstrap (create_all)
│   │   ├── utils/
│   │   │   └── exceptions.py
│   │   └── modules/             # Domain modules (Clean Architecture per module)
│   │       ├── auth/            # Register, login, refresh, logout
│   │       ├── customers/       # Customer profile
│   │       ├── addresses/       # Shipping / billing addresses
│   │       ├── catalog/         # Products, categories, brands (read-heavy)
│   │       │   ├── api.py
│   │       │   ├── services.py
│   │       │   ├── product_mapper.py
│   │       │   ├── constants.py
│   │       │   ├── models/
│   │       │   ├── schemas/
│   │       │   └── repositories/
│   │       ├── search/          # Faceted search + suggestions + filters
│   │       ├── cart/
│   │       ├── engagement/      # Wishlist, compare, reviews, feedback
│   │       ├── ratings/         # Aggregate rating summaries
│   │       ├── commerce/        # Checkout, orders, coupons, payments
│   │       ├── tracking/        # Shipment tracking by order / AWB
│   │       ├── notifications/   # Customer inbox (sql/)
│   │       ├── recently_viewed/ # Personalization history (sql/)
│   │       ├── recommendations/ # Home / for-you / similar heuristics
│   │       ├── support/         # Support tickets + messages (sql/)
│   │       └── theme/           # Storefront theme settings
│   ├── scripts/
│   │   └── seed_demo.py         # Local demo seed
│   ├── tests/
│   └── uploads/                 # Local media (mounted volume in Docker)
│       ├── categories/
│       └── products/
│
├── frontend/                    # Next.js storefront (port 3001)
│   ├── Dockerfile               # Optional image (Compose runs API only by default)
│   ├── package.json
│   ├── next.config.ts
│   ├── public/
│   └── src/
│       ├── app/                 # App Router pages
│       │   ├── page.tsx         # Grocery home (or redirect to fashion)
│       │   ├── demo-2/          # Fashion home
│       │   ├── shop/
│       │   ├── product/[slug]/
│       │   ├── cart/
│       │   ├── checkout/
│       │   ├── wishlist/
│       │   ├── compare/
│       │   ├── login/
│       │   ├── register/
│       │   └── …                # about-us, contact-us, faq, blog, etc.
│       ├── components/
│       │   ├── home/            # Grocery home sections
│       │   ├── fashion/         # Fashion home sections
│       │   ├── layout/          # Header, Footer, menus, cart sidebar
│       │   ├── shop/
│       │   ├── product/
│       │   ├── pages/           # Page-level content components
│       │   ├── theme/           # Theme drawer / bootstrap
│       │   ├── blog/
│       │   └── ui/              # Shared UI primitives
│       ├── services/            # API client wrappers (auth, cart, products, …)
│       ├── store/               # Redux Toolkit slices
│       ├── hooks/
│       ├── lib/                 # api.ts, mappers, theme helpers
│       ├── types/
│       └── data/                # Static / fallback content
│
├── database/                    # Docs / notes (schema owned by admin Alembic)
│   ├── migrations/
│   ├── schema/
│   └── seeds/
│
├── docs/
│   ├── api/
│   ├── architecture/
│   ├── database/
│   └── deployment/
│
└── postman/                     # API collections
```

## Backend module pattern

Each module under `backend/app/modules/<name>/` typically includes:

| File / folder   | Role                                      |
|-----------------|-------------------------------------------|
| `api.py`        | FastAPI routes                            |
| `services.py`   | Business logic                            |
| `repositories.py` / `repositories/` | Database access only     |
| `models.py` / `models/` | SQLAlchemy ORM entities             |
| `schemas.py` / `schemas/` | Pydantic request/response models  |

**Shared DB rule:** shopping service reads catalog data (products, categories, brands) and writes only customer-owned data (cart, wishlist, orders, reviews, addresses, customer profile). Admin service owns product/category/brand/inventory mutations and Alembic migrations.

## Docker names

| Resource              | Name                 |
|-----------------------|----------------------|
| Network               | `classic-way`        |
| PostgreSQL container  | `classic-way-db`     |
| Shopping API container| `classic-way-shopping` |
| Admin API (sibling)   | `classic-way-admin`  |

## Default ports

| Service            | Port  |
|--------------------|-------|
| Shopping API       | 8011  |
| Admin API          | 8000  |
| Storefront (local) | 3001  |
| PostgreSQL (host)  | 5434  |

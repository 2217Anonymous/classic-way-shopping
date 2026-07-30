from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.modules.addresses import api as addresses
from app.modules.auth import api as auth
from app.modules.cart import api as cart
from app.modules.catalog import api as catalog
from app.modules.commerce import api as commerce
from app.modules.customers import api as customers
from app.modules.engagement import api as engagement
from app.modules.notifications import api as notifications
from app.modules.ratings import api as ratings
from app.modules.recently_viewed import api as recently_viewed
from app.modules.recommendations import api as recommendations
from app.modules.search import api as search
from app.modules.support import api as support
from app.modules.theme import api as theme
from app.modules.tracking import api as tracking
from app.utils.exceptions import AppError

# Register ORM models so ForeignKeys resolve (customers/products — not admin users).
from app.modules.customers.models import Customer as _Customer  # noqa: F401
from app.modules.catalog.models import (  # noqa: F401
    Brand as _Brand,
    Category as _Category,
    Product as _Product,
    ProductVariant as _ProductVariant,
)
from app.modules.cart.models import Cart as _Cart, CartItem as _CartItem  # noqa: F401
from app.modules.addresses.models import CustomerAddress as _Address  # noqa: F401
from app.modules.commerce.models import Order as _Order  # noqa: F401
from app.modules.theme.models import Theme as _Theme  # noqa: F401
from app.modules.notifications.models import Notification as _Notification  # noqa: F401
from app.modules.recently_viewed.models import RecentlyViewed as _RecentlyViewed  # noqa: F401
from app.modules.support.models import (  # noqa: F401
    SupportMessage as _SupportMessage,
    SupportTicket as _SupportTicket,
)

# Shared with admin: mount the same uploads directory (or volume) so product/category
# media URLs resolve. Relative to process cwd — typically point both services at one volume.
UPLOAD_ROOT = Path("uploads")


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.core.rate_limit import RateLimitMiddleware  # noqa: E402

app.add_middleware(
    RateLimitMiddleware,
    requests=settings.rate_limit_requests,
    window=settings.rate_limit_window_seconds,
)


@app.exception_handler(AppError)
async def app_error_handler(_: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


@app.get("/health", tags=["Health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_ROOT)), name="uploads")

prefix = settings.api_v1_prefix
app.include_router(auth.router, prefix=prefix)
app.include_router(customers.router, prefix=prefix)
app.include_router(addresses.router, prefix=prefix)
app.include_router(catalog.router, prefix=prefix)
app.include_router(catalog.categories_router, prefix=prefix)
app.include_router(catalog.brands_router, prefix=prefix)
app.include_router(cart.router, prefix=prefix)
app.include_router(engagement.wishlist_router, prefix=prefix)
app.include_router(engagement.compare_router, prefix=prefix)
app.include_router(engagement.reviews_router, prefix=prefix)
app.include_router(engagement.feedback_router, prefix=prefix)
app.include_router(commerce.coupons_router, prefix=prefix)
app.include_router(commerce.checkout_router, prefix=prefix)
app.include_router(commerce.payments_router, prefix=prefix)
app.include_router(commerce.orders_router, prefix=prefix)
app.include_router(theme.router, prefix=prefix)
app.include_router(search.router, prefix=prefix)
app.include_router(notifications.router, prefix=prefix)
app.include_router(recently_viewed.router, prefix=prefix)
app.include_router(recommendations.router, prefix=prefix)
app.include_router(ratings.router, prefix=prefix)
app.include_router(tracking.router, prefix=prefix)
app.include_router(support.router, prefix=prefix)

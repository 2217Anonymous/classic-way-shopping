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
from app.utils.exceptions import AppError

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

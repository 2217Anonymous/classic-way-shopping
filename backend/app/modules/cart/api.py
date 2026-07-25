from uuid import UUID
from fastapi import APIRouter, Header

from app.modules.catalog.repositories.product_repository import ProductRepository
from app.modules.auth.dependencies import CurrentCustomer, OptionalCustomer, DbSession
from app.modules.commerce.schemas import CartMergeRequest
from app.modules.cart.services import StorefrontCartService
from app.modules.cart.repositories import CartRepository
from app.modules.cart.schemas import CartItemCreate, CartItemUpdate, CartResponse

router = APIRouter(prefix="/cart", tags=["Storefront Cart"])


def get_service(db: DbSession) -> StorefrontCartService:
    return StorefrontCartService(CartRepository(db), ProductRepository(db))


def _cart_id(x_cart_id: str | None) -> UUID | None:
    if not x_cart_id:
        return None
    try:
        return UUID(x_cart_id)
    except ValueError:
        return None


@router.get("", response_model=CartResponse)
def get_cart(
    db: DbSession,
    customer: OptionalCustomer,
    x_cart_id: str | None = Header(default=None, alias="X-Cart-Id"),
) -> CartResponse:
    return get_service(db).get_cart(
        cart_id_header=_cart_id(x_cart_id), customer=customer
    )


@router.delete("", response_model=CartResponse)
def clear_cart(
    db: DbSession,
    customer: OptionalCustomer,
    x_cart_id: str | None = Header(default=None, alias="X-Cart-Id"),
) -> CartResponse:
    return get_service(db).clear_cart(
        cart_id_header=_cart_id(x_cart_id), customer=customer
    )


@router.post("/items", response_model=CartResponse)
def add_item(
    payload: CartItemCreate,
    db: DbSession,
    customer: OptionalCustomer,
    x_cart_id: str | None = Header(default=None, alias="X-Cart-Id"),
) -> CartResponse:
    return get_service(db).add_item(
        payload, cart_id_header=_cart_id(x_cart_id), customer=customer
    )


@router.put("/items/{item_id}", response_model=CartResponse)
def update_item(
    item_id: UUID,
    payload: CartItemUpdate,
    db: DbSession,
    customer: OptionalCustomer,
    x_cart_id: str | None = Header(default=None, alias="X-Cart-Id"),
) -> CartResponse:
    return get_service(db).update_item(
        item_id, payload, cart_id_header=_cart_id(x_cart_id), customer=customer
    )


@router.delete("/items/{item_id}", response_model=CartResponse)
def delete_item(
    item_id: UUID,
    db: DbSession,
    customer: OptionalCustomer,
    x_cart_id: str | None = Header(default=None, alias="X-Cart-Id"),
) -> CartResponse:
    return get_service(db).delete_item(
        item_id, cart_id_header=_cart_id(x_cart_id), customer=customer
    )


@router.post("/merge", response_model=CartResponse)
def merge_cart(
    payload: CartMergeRequest,
    db: DbSession,
    customer: CurrentCustomer,
    x_cart_id: str | None = Header(default=None, alias="X-Cart-Id"),
) -> CartResponse:
    return get_service(db).merge(
        guest_cart_id=payload.guest_cart_id,
        cart_id_header=_cart_id(x_cart_id),
        customer=customer,
    )

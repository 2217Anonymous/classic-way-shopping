"""Create the shopping schema for a fresh local database.

Production schema migrations remain owned by classic-way-admin. This module is
used by the self-contained Docker Compose stack to bootstrap an empty database.
"""

from app.core.database import Base, engine
from app.modules.addresses.models import CustomerAddress  # noqa: F401
from app.modules.cart.models import Cart, CartItem  # noqa: F401
from app.modules.catalog.models import (  # noqa: F401
    Brand,
    Category,
    Product,
    ProductVariant,
)
from app.modules.commerce.coupon_models import (  # noqa: F401
    Coupon,
    StoreSettings,
    TaxRule,
)
from app.modules.commerce.fulfillment_models import (  # noqa: F401
    CourierAccount,
    Shipment,
    ShipmentEvent,
)
from app.modules.commerce.inventory_models import (  # noqa: F401
    InventoryItem,
    InventorySettings,
    StockMovement,
)
from app.modules.commerce.models import Order  # noqa: F401
from app.modules.commerce.payment_models import Payment, PaymentEvent, Refund  # noqa: F401
from app.modules.customers.models import Customer  # noqa: F401
from app.modules.engagement.models import (  # noqa: F401
    CompareList,
    CouponUsage,
    Feedback,
    Review,
    Wishlist,
)
from app.modules.theme.models import Theme  # noqa: F401
from app.modules.notifications.models import Notification  # noqa: F401
from app.modules.recently_viewed.models import RecentlyViewed  # noqa: F401
from app.modules.support.models import SupportMessage, SupportTicket  # noqa: F401


def main() -> None:
    Base.metadata.create_all(bind=engine)


if __name__ == "__main__":
    main()

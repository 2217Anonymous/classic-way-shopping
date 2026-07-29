# Shopping Backend — Module Encyclopedia

All **21 logical modules** for the customer-facing Classic Way Shopping API.  
Package paths are under `backend/app/modules/`. API prefix: `/api/v1`.

**Legend:** Existing = implemented in shopping service · Partial = also available under a legacy path in another package.

---

## 1. Auth

### Business purpose
Register, login, logout, refresh tokens, password reset, and `/auth/me` for storefront shoppers (`customers` table — not admin `users`).

### Folder structure
**Flat** (`auth/`): few entities (tokens), thin routes, delegates customer persistence to `CustomerRepository`.

```
auth/
  api.py
  services.py
  schemas.py
  dependencies.py
```

### Models (tables)
| Model | Table | Notes |
|-------|-------|-------|
| (uses) `Customer` | `customers` | In `customers/models.py` |
| (uses) `RefreshToken` | `refresh_tokens` | In `customers/models.py` |

### Key schemas
`RegisterRequest`, `LoginRequest`, `RefreshRequest`, `LogoutRequest`, `TokenPairResponse`, `CustomerResponse`, `ForgotPasswordRequest`, `ResetPasswordRequest`, `MessageResponse`

### Repository / Service
- **Service:** `AuthService`
- **Repo:** `CustomerRepository` (customers module)

### Routes summary
| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/register` | No |
| POST | `/auth/login` | No |
| POST | `/auth/logout` | No (refresh body) |
| POST | `/auth/refresh` | No (refresh body) |
| GET | `/auth/me` | Yes |
| POST | `/auth/forgot-password` | No |
| POST | `/auth/reset-password` | No |

### Validation rules
- Email: valid `EmailStr`
- Password: 8–128 on register/reset/change
- Full name: 2–160
- Access JWT must have `scope=customer`

### Business flow
Register/Login → hash password → persist customer → issue JWT pair → store refresh **hash** → return tokens + customer DTO.

### Best practices
- Never return `hashed_password`
- Rotate/revoke refresh on logout
- Rate-limit login/forgot-password in production

---

## 2. Customer

### Business purpose
Canonical storefront identity aggregate: account record, active flag, email verification flags.

### Folder structure
**Flat** (`customers/`): single aggregate + repository shared by Auth and Profile.

```
customers/
  api.py          # profile routes under /customers
  models.py
  repositories.py
  services.py
  schemas.py
```

### Models
| Model | Table |
|-------|-------|
| `Customer` | `customers` |
| `RefreshToken` | `refresh_tokens` |

### Key schemas
Auth/profile schemas live primarily in `auth/schemas.py`: `CustomerResponse`, `ProfileUpdate`, `PasswordChange`.

### Repository / Service
- `CustomerRepository`
- Profile mutations via `AuthService` (current layout)

### Routes summary
Owned under Customer Profile (`/customers/me*`). No separate public “list customers” API.

### Validation rules
Unique email; soft-delete via `deleted_at`; inactive customers cannot authenticate.

### Business flow
Auth creates row → subsequent requests load by JWT `sub` → repository enforces `is_active`.

### Best practices
- Soft-delete; do not hard-delete accounts with order history without archival policy
- Keep admin `users` completely separate

---

## 3. Customer Profile

### Business purpose
Authenticated shopper updates name/phone and changes password.

### Folder structure
**Flat**, co-located in `customers/` + `auth` schemas/services (small surface; no separate package yet).

### Models
Same as Customer: `customers`.

### Key schemas
`CustomerResponse`, `ProfileUpdate`, `PasswordChange`, `MessageResponse`

### Repository / Service
`AuthService.update_profile`, `AuthService.change_password` + `CustomerRepository`

### Routes summary
| Method | Path | Auth |
|--------|------|------|
| GET | `/customers/me` | Yes |
| PUT | `/customers/me` | Yes |
| PUT | `/customers/me/password` | Yes |

### Validation rules
- Profile: optional `full_name` (2–160), `phone` (≤40)
- Password change: current required; new 8–128

### Business flow
Bearer access → load customer → validate → update columns / re-hash password → commit → DTO.

### Best practices
- Require current password for change
- Do not allow email change without verification flow (not exposed today)

---

## 4. Address

### Business purpose
Shipping/billing addresses for checkout; default address selection.

### Folder structure
**Flat** (`addresses/`): single entity CRUD.

### Models
| Model | Table |
|-------|-------|
| `CustomerAddress` | `customer_addresses` |

### Key schemas
`AddressCreate`, `AddressUpdate`, `AddressResponse`

### Repository / Service
`AddressRepository` (API layer currently orchestrates; keep heavy rules in service if growing)

### Routes summary
| Method | Path | Auth |
|--------|------|------|
| GET | `/addresses` | Yes |
| POST | `/addresses` | Yes |
| GET | `/addresses/{address_id}` | Yes |
| PUT | `/addresses/{address_id}` | Yes |
| DELETE | `/addresses/{address_id}` | Yes |
| PUT | `/addresses/{address_id}/default` | Yes |

### Validation rules
Name/phone/line1/city/state/postal required lengths; country default `India`; ownership by `customer_id`.

### Business flow
Create → if `is_default`, unset other defaults → insert → return. Updates/deletes must match owner.

### Best practices
- Always scope by `customer_id`
- Prefer `address_id` at checkout over trusting inline address when saved address exists

---

## 5. Catalog

### Business purpose
Read-only storefront catalog: products, variants, media, categories, brands, curated lists (featured/trending/best-sellers/new-arrivals), product reviews listing, related products.

### Folder structure
**Large** — many entities and mappers:

```
catalog/
  api.py
  services.py
  product_mapper.py
  constants.py
  models/          # product, category, brand
  schemas/
  repositories/
```

### Models (tables)
| Model | Table | Access |
|-------|-------|--------|
| `Product` | `products` | Read |
| `ProductMedia` | `product_media` | Read |
| `ProductAttribute` | `product_attributes` | Read |
| `ProductVariant` | `product_variants` | Read |
| `Category` | `categories` | Read |
| `Brand` | `brands` | Read |

### Key schemas
`ProductResponse`, `ProductVariantResponse`, `ProductListResponse`, `CategoryResponse`, `BrandResponse`, `ReviewResponse` (via engagement)

### Repository / Service
- `StorefrontCatalogService`
- `ProductRepository`, `CategoryRepository`, `BrandRepository`
- `ReviewRepository` (for product reviews)

### Routes summary
| Method | Path | Auth |
|--------|------|------|
| GET | `/products` | No |
| GET | `/products/featured` | No |
| GET | `/products/trending` | No |
| GET | `/products/best-sellers` | No |
| GET | `/products/new-arrivals` | No |
| GET | `/products/search` | No |
| GET | `/products/suggestions` | No |
| GET | `/products/slug/{slug}` | No |
| GET | `/products/{product_id}` | No |
| GET | `/products/{product_id}/related` | No |
| GET | `/products/{product_id}/reviews` | No |
| GET | `/products/{product_id}/variants` | No |
| GET | `/categories` | No |
| GET | `/categories/{slug}` | No |
| GET | `/categories/{slug}/products` | No |
| GET | `/brands` | No |

### Validation rules
Query filters: page ≥1, limit 1–100; price/rating/discount optional; only published/active/public products for storefront.

### Business flow
Client filters → repository query (published, not deleted) → mapper enriches media/category → paginated DTO.

### Best practices
- Never expose admin create/update product routes here
- Prefer dedicated Search module for advanced discovery (see §6)
- Cache hot lists in Redis when scaling

---

## 6. Search

### Business purpose
Dedicated product discovery: full search, typeahead suggestions, facet/filter metadata for the shop UI.

### Folder structure
**Flat** `search/` (wraps catalog read services; grows to large if an external index is added).

```
search/
  api.py
  services.py
  schemas.py
```

Legacy equivalents remain under Catalog (`GET /products/search`, `/products/suggestions`).

### Models
Reads `products`, `categories`, `brands`, attributes/variants. Optional later: search analytics tables.

### Key schemas
`SearchFiltersResponse`, reuses `ProductListResponse`

### Repository / Service
`SearchService` (delegates to `StorefrontCatalogService` + category/brand repos)

### Routes summary
| Method | Path | Auth |
|--------|------|------|
| GET | `/search` | No |
| GET | `/search/suggestions` | No |
| GET | `/search/filters` | No |

### Validation rules
`q` length bounds; page/limit caps; sanitize sort/filter enums.

### Business flow
Query → parse filters → search DB → map to `ProductResponse` list + facets.

### Best practices
- Keep `/search` as public read API
- Do not write catalog from search
- Log queries anonymously for ranking improvements

---

## 7. Cart

### Business purpose
Guest and authenticated carts; add/update/remove lines; merge guest into customer cart.

### Folder structure
**Flat** (+ `cart_core.py` for shared helpers):

```
cart/
  api.py
  services.py
  repositories.py
  models.py
  schemas.py
  cart_core.py
```

### Models
| Model | Table |
|-------|-------|
| `Cart` | `carts` |
| `CartItem` | `cart_items` |

### Key schemas
`CartItemCreate`, `CartItemUpdate`, `CartResponse`, `CartItemResponse`, `CartMergeRequest`

### Repository / Service
`StorefrontCartService`, `CartRepository`, `ProductRepository` (price/stock snapshot)

### Routes summary
| Method | Path | Auth |
|--------|------|------|
| GET | `/cart` | Optional |
| DELETE | `/cart` | Optional |
| POST | `/cart/items` | Optional |
| PUT | `/cart/items/{item_id}` | Optional |
| DELETE | `/cart/items/{item_id}` | Optional |
| POST | `/cart/merge` | Required |

Header: `X-Cart-Id` (guest/session cart UUID).

### Validation rules
Quantity 1–999; valid product/variant; ownership of cart for mutations.

### Business flow
Resolve cart (header and/or customer) → load product price → upsert line with snapshot name/sku/unit_price → recompute subtotal.

### Best practices
- Re-price at checkout; snapshots are UX convenience
- Merge only after login
- Do not trust client-supplied unit prices

---

## 8. Wishlist

### Business purpose
Saved products per customer for later purchase.

### Folder structure
Part of **flat multi-router** `engagement/`.

### Models
| Model | Table |
|-------|-------|
| `Wishlist` | `wishlists` |
| `WishlistItem` | `wishlist_items` |

Unique: `(wishlist_id, product_id)`.

### Key schemas
`WishlistResponse`, `WishlistItemCreate`, `WishlistItemResponse`

### Repository / Service
`EngagementService`, `WishlistRepository`, `ProductRepository`

### Routes summary
| Method | Path | Auth |
|--------|------|------|
| GET | `/wishlist` | Yes |
| POST | `/wishlist/items` | Yes |
| DELETE | `/wishlist/items/{item_id}` | Yes |

### Validation rules
Authenticated; product must exist; duplicate product ignored or conflicted per service rules.

### Business flow
Ensure wishlist for customer → insert item → return enriched list (name/slug/price/image).

### Best practices
- One wishlist per customer
- Enrich from catalog read models, don’t denormalize full product

---

## 9. Compare

### Business purpose
Short list of products for side-by-side comparison.

### Folder structure
`engagement/` flat multi-router.

### Models
| Model | Table |
|-------|-------|
| `CompareList` | `compare_lists` |
| `CompareItem` | `compare_items` |

### Key schemas
`CompareResponse`, `CompareItemCreate`, `CompareItemResponse`

### Repository / Service
`EngagementService`, `CompareRepository`

### Routes summary
| Method | Path | Auth |
|--------|------|------|
| GET | `/compare` | Yes |
| POST | `/compare/items` | Yes |
| DELETE | `/compare/items/{item_id}` | Yes |

### Validation rules
Cap compare list size in service (recommended ≤4–6); unique product per list.

### Business flow
Same pattern as wishlist with stricter size limit.

### Best practices
- Enforce max items server-side
- Return attributes needed for comparison UI

---

## 10. Checkout

### Business purpose
Preview totals, validate stock/address/coupon, create order from cart.

### Folder structure
`commerce/` multi-file (schemas, order service/repo, inventory repos).

### Models (writes / reads)
Writes: `orders`, `order_items`, `order_status_history`, may touch inventory reserved qty.  
Reads: `carts`, `coupons`, `tax_rules`, `customer_addresses`, `products`/`variants`.

### Key schemas
`CheckoutPreviewRequest`, `CheckoutPreviewResponse`, `CustomerOrderResponse`, `CheckoutAddressInput`

### Repository / Service
`CommerceService`, `CartRepository`, `OrderRepository`, `AddressRepository`, `InventoryItemRepository`, `CouponRepository`, `CouponUsageRepository`

### Routes summary
| Method | Path | Auth |
|--------|------|------|
| POST | `/checkout/preview` | Optional |
| POST | `/checkout/validate` | Optional |
| POST | `/checkout/create-order` | Required |

### Validation rules
Payment method `cod` | `razorpay`; address_id owned or inline address; cart non-empty; stock available.

### Business flow
Load cart → compute subtotal/shipping/tax/discount → validate → create order + items + history → clear/adjust cart → return order.

### Best practices
- Idempotency key recommended for create-order at scale
- Never create order without auth
- Snapshot line names/prices on order items

---

## 11. Orders

### Business purpose
Customer order history, detail, cancel (when allowed), tracking by order number (existing).

### Folder structure
`commerce/` (`models.py`, `order_repository.py`, `order_service.py`, `api.py` routers).

### Models
| Model | Table |
|-------|-------|
| `Order` | `orders` |
| `OrderItem` | `order_items` |
| `OrderStatusHistory` | `order_status_history` |

### Key schemas
`CustomerOrderResponse`, `CustomerOrderItemResponse`, `OrderCancelBody`, `CustomerOrderTrackingResponse`

### Repository / Service
`CommerceService`, `OrderRepository`, `ShipmentRepository` (tracking)

### Routes summary
| Method | Path | Auth |
|--------|------|------|
| GET | `/orders` | Yes |
| GET | `/orders/{order_id}` | Yes |
| POST | `/orders/{order_id}/cancel` | Yes |
| GET | `/orders/tracking/{order_number}` | Yes |

### Validation rules
Ownership; cancel only from cancellable statuses; optional reason ≤255.

### Business flow
List/filter by status → get by id with ownership → cancel transitions status + history note.

### Best practices
- Immutable financial snapshots on items
- Status changes append history; don’t overwrite silently

---

## 12. Payments

### Business purpose
Create payment intent for an order; verify provider return; retry; webhook stub.

### Folder structure
`commerce/` (`payment_models.py`, `payment_service.py`, `payment_repositories.py`, `payment_schemas.py`).

### Models
| Model | Table | Notes |
|-------|-------|-------|
| `Payment` | `payments` | Shopping creates/updates status on verify |
| `PaymentEvent` | `payment_events` | Prefer admin/provider ingestion |
| `Refund` | `refunds` | Read / admin-owned write |

### Key schemas
`PaymentCreateBody`, `PaymentVerifyBody`

### Repository / Service
`CommerceService` → payment helpers; `Payment` repositories

### Routes summary
| Method | Path | Auth |
|--------|------|------|
| POST | `/payments/create` | Yes |
| POST | `/payments/verify` | Yes |
| POST | `/payments/retry` | Yes |
| POST | `/payments/webhook` | No (stub) |

### Validation rules
Order owned by customer; provider `razorpay` | `cod`; amounts from order total server-side.

### Business flow
Create payment row → return provider payload → verify signature/ids → mark paid / update order status.

### Best practices
- Never trust client amount
- Webhook verification & capture ownership documented as admin/sandbox path
- Idempotent verify

---

## 13. Coupons

### Business purpose
Validate and apply promo codes to cart; remove applied code. **Admin owns coupon CRUD.**

### Folder structure
`commerce/` (`coupon_models.py`, `coupon_repositories.py`).

### Models
| Model | Table | Access |
|-------|-------|--------|
| `Coupon` | `coupons` | Read (+ `used_count` bump on successful order usage path) |
| `CouponUsage` | `coupon_usages` | Write on use |

### Key schemas
`CouponValidateRequest`, `CouponApplyRequest`, `CouponResultResponse`

### Repository / Service
`CommerceService`, `CouponRepository`, `CouponUsageRepository`

### Routes summary
| Method | Path | Auth |
|--------|------|------|
| POST | `/coupons/validate` | No |
| POST | `/coupons/apply` | Optional |
| DELETE | `/coupons/remove` | Optional |

### Validation rules
Active window, min order, max uses, discount type/value; code 1–40 chars.

### Business flow
Validate against subtotal → apply stores `carts.coupon_code` → checkout recomputes discount → usage row on order success.

### Best practices
- Re-validate at create-order
- No admin coupon write APIs in shopping

---

## 14. Reviews

### Business purpose
Customers submit product reviews after purchase context; storefront lists approved reviews via catalog.

### Folder structure
`engagement/`

### Models
| Model | Table |
|-------|-------|
| `Review` | `reviews` |
| `ReviewImage` | `review_images` |

### Key schemas
`ReviewCreate`, `ReviewResponse`, `ReviewImageResponse`

### Repository / Service
`EngagementService`, `ReviewRepository`, `OrderRepository` (verified purchase)

### Routes summary
| Method | Path | Auth |
|--------|------|------|
| POST | `/reviews` | Yes |
| GET | `/products/{product_id}/reviews` | No (catalog) |

### Validation rules
Rating 1–5; title ≤200; body ≤5000; typically one review per customer/product (enforce in service).

### Business flow
Auth → verify purchase when possible → insert review (`is_approved=false`) → admin approves later → public list shows approved.

### Best practices
- Shopping does not approve reviews
- Mark `is_verified_purchase` from order history

---

## 15. Ratings

### Business purpose
Aggregate rating stats for PDP and listings (average, count, histogram).

### Folder structure
**Flat** `ratings/` reading `reviews` (optionally materialized summary table later).

### Models
Source: `reviews`. Optional later: `product_rating_summaries`.

### Key schemas
`ProductRatingSummary`, `RatingBreakdown`

### Repository / Service
`RatingsService`

### Routes summary
| Method | Path | Auth |
|--------|------|------|
| GET | `/ratings/products/{product_id}` | No |
| GET | `/ratings/summary/{product_id}` | No |

### Validation rules
Only approved reviews count toward public aggregates.

### Business flow
Query approved reviews → compute avg/count/distribution → cache optionally.

### Best practices
- Don’t recompute on every list page without cache
- Keep write path on Reviews module only

---

## 16. Notifications

### Business purpose
In-app customer notifications (order updates, promos, support replies).

### Folder structure
**Flat** `notifications/` (+ `sql/notifications.sql`).

### Models
| Model | Table |
|-------|-------|
| `Notification` | `notifications` |

### Key schemas
`NotificationResponse`, `NotificationListResponse`, `NotificationCreateInternal`

### Repository / Service
`NotificationService`, `NotificationRepository`

### Routes summary
| Method | Path | Auth |
|--------|------|------|
| GET | `/notifications` | Yes |
| POST | `/notifications/{id}/read` | Yes |
| POST | `/notifications/read-all` | Yes |
| DELETE | `/notifications/{id}` | Yes |

### Validation rules
Ownership; mark-read idempotent; soft delete.

### Business flow
System/worker inserts notification → customer lists → mark read flags.

### Best practices
- Writers are workers/admin events; customers only read/mark/delete
- Paginate; prefer cursor for large inboxes

---

## 17. Shipment Tracking

### Business purpose
Customer-visible shipment progress by order number or AWB.

### Folder structure
**Flat** `tracking/` plus legacy `GET /orders/tracking/{order_number}` in commerce.

### Models (read)
| Model | Table |
|-------|-------|
| `Shipment` | `shipments` |
| `ShipmentEvent` | `shipment_events` |
| `Order` | `orders` |

### Key schemas
`TrackingResponse`, `CustomerOrderTrackingResponse` (commerce)

### Repository / Service
`TrackingService`; `CommerceService.track_order`, `ShipmentRepository`

### Routes summary
| Method | Path | Auth | Status |
|--------|------|------|--------|
| GET | `/orders/tracking/{order_number}` | Yes | Existing |
| GET | `/tracking/{order_number}` | Optional* | Existing |
| GET | `/tracking/awb/{awb}` | Optional* | Existing |

\*Authenticated customers are ownership-checked; anonymous AWB/order lookup returns tracking without leaking other customers’ addresses.

### Validation rules
Customer owns order for full detail; AWB lookups return status events without leaking other customers’ addresses.

### Business flow
Resolve order/shipment → return status history + shipment events + AWB.

### Best practices
- Shopping never configures `courier_accounts`
- Admin/courier webhooks write `shipment_events`

---

## 18. Recently Viewed

### Business purpose
Persist last N products viewed for PDP “continue browsing” and recommendations.

### Folder structure
**Flat** `recently_viewed/` (+ `sql/recently_viewed.sql`).

### Models
| Model | Table |
|-------|-------|
| `RecentlyViewed` | `recently_viewed` |

### Key schemas
`RecentlyViewedCreate`, `RecentlyViewedItemResponse`, `RecentlyViewedListResponse`

### Repository / Service
`RecentlyViewedService`, `RecentlyViewedRepository`

### Routes summary
| Method | Path | Auth |
|--------|------|------|
| GET | `/recently-viewed` | Yes |
| POST | `/recently-viewed` | Yes |
| DELETE | `/recently-viewed` | Yes |
| DELETE | `/recently-viewed/{product_id}` | Yes |

### Validation rules
Cap list (~40); valid `product_id`; dedupe by product.

### Business flow
View PDP → POST product id → upsert timestamp → GET returns enriched products.

### Best practices
- Customer-scoped today; guest session key can be added later
- Read products via catalog repos only

---

## 19. Recommendations

### Business purpose
Home and PDP recommendation rails: for-you, similar, bought-together.

### Folder structure
**Flat** `recommendations/` (heuristic; may later call offline jobs / Redis).

### Models
Reads orders, cart, recently viewed, catalog. Optional `recommendation_scores` table later.

### Key schemas
`RecommendationResponse`

### Repository / Service
`RecommendationService`

### Routes summary
| Method | Path | Auth |
|--------|------|------|
| GET | `/recommendations/home` | Optional |
| GET | `/recommendations/for-you` | Optional |
| GET | `/recommendations/similar/{product_id}` | No |
| GET | `/recommendations/bought-together/{product_id}` | No |

Existing related products: `GET /products/{product_id}/related`.

### Validation rules
Limit caps; fall back to trending/featured when cold start.

### Business flow
Context (customer/product) → score candidates → filter published → return products.

### Best practices
- Fail soft to catalog curated lists
- No admin write APIs

---

## 20. Theme

### Business purpose
Resolve global default theme or per-customer theme overrides for storefront layouts.

### Folder structure
**Flat** `theme/`.

### Models
| Model | Table |
|-------|-------|
| `Theme` | `theme` |

### Key schemas
`ThemeResponse`, `ThemeUpdate`

### Repository / Service
`ThemeService`, `ThemeRepository`

### Routes summary
| Method | Path | Auth |
|--------|------|------|
| GET | `/theme` | Optional |
| PUT | `/theme` | Required |

### Validation rules
Layout/theme string lengths; `page_visibility` map of booleans; upsert by `customer_id`.

### Business flow
GET resolves customer override else default (`is_default`); PUT upserts customer row.

### Best practices
- Global default maintained carefully (often seeded/admin); customer only updates own row
- Return `source` (`default` vs `customer`) for UI

---

## 21. Customer Support

### Business purpose
Contact feedback (existing) and full support tickets with message threads.

### Folder structure
**Flat** `support/` (+ `sql/support.sql`); feedback remains in `engagement/` as `POST /feedback`.

### Models
| Model | Table | Status |
|-------|-------|--------|
| `Feedback` | `feedbacks` | Existing |
| `SupportTicket` | `support_tickets` | Existing |
| `SupportMessage` | `support_messages` | Existing |

### Key schemas
`FeedbackCreate`, `FeedbackResponse`; `SupportTicketCreate`, `SupportTicketResponse`, `SupportMessageCreate`

### Repository / Service
`EngagementService.submit_feedback`; `SupportService`, `SupportRepository`

### Routes summary
| Method | Path | Auth | Status |
|--------|------|------|--------|
| POST | `/feedback` | Optional | Existing |
| POST | `/support/tickets` | Yes | Existing |
| GET | `/support/tickets` | Yes | Existing |
| GET | `/support/tickets/{id}` | Yes | Existing |
| POST | `/support/tickets/{id}/messages` | Yes | Existing |

### Validation rules
Feedback: name/email/subject/message lengths. Tickets: ownership; message body required.

### Business flow
Feedback: insert `feedbacks` status `new`. Tickets: create ticket → append messages → notify (Notifications module).

### Best practices
- Customers cannot close tickets as “resolved” without rules; staff resolution is admin-side
- Don’t invent staff assignment APIs on shopping

---

## Cross-cutting notes

| Concern | Guidance |
|---------|----------|
| Auth deps | `CurrentCustomer`, `OptionalCustomer`, `DbSession` in `auth/dependencies.py` |
| Errors | `AppError`, `NotFoundError` (404), `ConflictError` (409), `AuthenticationError` (401), `AuthorizationError` (403) |
| IDs | UUID PKs via `app.core.ids` |
| Migrations | Admin Alembic only |
| Docs for HTTP contracts | [`../api/CUSTOMER_API_CATALOG.md`](../api/CUSTOMER_API_CATALOG.md) |

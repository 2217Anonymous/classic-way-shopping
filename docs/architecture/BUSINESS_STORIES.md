# Business Stories — Customer Journey

End-to-end storefront flows for Classic Way Shopping. Each story maps **customer action → API → services → DB**, using existing `/api/v1` prefixes. Newer discovery/support surfaces are marked **(NEW)** where helpful.

---

## Story map

```text
Browse → Search → Product → Recently Viewed → Recommendations
     ↘ Wishlist / Compare
Cart → Coupon → Checkout → Payment → Order
     → Tracking → Notification → Review → Ratings
```

---

## 1. Browse catalog

**As a** visitor  
**I want to** browse published products and categories  
**So that** I can discover merchandise without signing in.

| Step | Action | API | Persistence |
|------|--------|-----|-------------|
| 1 | Open home | `GET /theme` (optional auth) | **R** `theme` (default or customer) |
| 2 | Load curated rails | `GET /products/featured`, `/trending`, `/best-sellers`, `/new-arrivals` | **R** `products` (+ media) |
| 3 | Browse category | `GET /categories` → `GET /categories/{slug}/products` | **R** `categories`, `products` |
| 4 | Open brand list | `GET /brands` | **R** `brands` |
| 5 | Filter shop | `GET /products?category=&brand=&min_price=&…` | **R** filtered products |

**Rules:** Only `is_published`, `is_active`, non-deleted, public visibility. No catalog writes.

---

## 2. Search & discover

**As a** visitor  
**I want to** search and refine results  
**So that** I find products quickly.

| Step | Action | API | Persistence |
|------|--------|-----|-------------|
| 1 | Typeahead | `GET /products/suggestions?q=` *(existing)* or `GET /search/suggestions` **(NEW)** | **R** products/categories |
| 2 | Full search | `GET /products/search?q=` or `GET /search` **(NEW)** | **R** products |
| 3 | Load facets | `GET /search/filters` **(NEW)** | **R** aggregates |
| 4 | Open PDP | `GET /products/slug/{slug}` | **R** product graph |
| 5 | Record view | `POST /recently-viewed` **(NEW)** | **W** `recently_viewed` |
| 6 | Similar / FBT | `GET /products/{id}/related` or `/recommendations/similar/{id}` / `bought-together` **(NEW)** | **R** catalog + order history aggregates |

---

## 3. Guest cart

**As a** guest  
**I want to** add items before login  
**So that** I can shop frictionlessly.

| Step | Action | API | Persistence |
|------|--------|-----|-------------|
| 1 | First add | `POST /cart/items` + receive/store cart id | **W** `carts`, `cart_items` (snapshot price/name/sku) |
| 2 | Subsequent calls | Header `X-Cart-Id` on `GET/PUT/DELETE /cart…` | **W** lines; **R** products for price/stock |
| 3 | Clear cart | `DELETE /cart` | **W** delete items |

**Rules:** Quantity 1–999; server sets `unit_price` from product/variant — never trust client price.

---

## 4. Register / login & merge cart

**As a** guest with items  
**I want to** create an account and keep my cart  
**So that** I can checkout securely.

| Step | Action | API | Persistence |
|------|--------|-----|-------------|
| 1 | Register or login | `POST /auth/register` or `/auth/login` | **W** `customers`, `refresh_tokens` |
| 2 | Merge guest cart | `POST /cart/merge` `{ guest_cart_id }` + Bearer | **W** move/merge `cart_items` onto customer cart |
| 3 | Session refresh | `POST /auth/refresh` | **R/W** refresh token validation/rotation |
| 4 | Logout | `POST /auth/logout` | **W** revoke refresh |

**Profile (optional):** `GET/PUT /customers/me`, `PUT /customers/me/password`.

---

## 5. Wishlist & compare

**As a** signed-in shopper  
**I want to** save and compare products  
**So that** I can decide later.

| Step | Action | API | Persistence |
|------|--------|-----|-------------|
| 1 | Save | `POST /wishlist/items` | **W** ensure `wishlists` + `wishlist_items` |
| 2 | View | `GET /wishlist` | **R** join products for enrichment |
| 3 | Remove | `DELETE /wishlist/items/{item_id}` | **W** delete item |
| 4 | Compare add/list/remove | `/compare` routes | **W/R** `compare_lists` / `compare_items` (size-capped) |

---

## 6. Addresses

**As a** signed-in shopper  
**I want to** manage shipping addresses  
**So that** checkout is faster.

| Step | Action | API | Persistence |
|------|--------|-----|-------------|
| 1 | Add | `POST /addresses` | **W** `customer_addresses`; unset other defaults if needed |
| 2 | List / update / default / delete | REST under `/addresses` | **W** owned rows only |

---

## 7. Apply coupon

**As a** shopper with a cart  
**I want to** apply a promo code  
**So that** I get a discount.

| Step | Action | API | Persistence |
|------|--------|-----|-------------|
| 1 | Dry-run | `POST /coupons/validate` `{ code, subtotal }` | **R** `coupons` |
| 2 | Attach to cart | `POST /coupons/apply` + `X-Cart-Id` | **W** `carts.coupon_code` |
| 3 | Remove | `DELETE /coupons/remove` | **W** clear coupon_code |

**Rules:** Active window, min order, max uses checked again at order create. Admin owns coupon definitions.

---

## 8. Checkout preview → place order

**As a** signed-in shopper  
**I want to** see totals and place an order  
**So that** I purchase my cart.

| Step | Action | API | Persistence |
|------|--------|-----|-------------|
| 1 | Preview | `POST /checkout/preview` | **R** cart, products, coupon, tax, address |
| 2 | Validate stock/address | `POST /checkout/validate` | same + stricter checks |
| 3 | Create order | `POST /checkout/create-order` (auth required) | **W** `orders`, `order_items`, `order_status_history`; **W*** inventory reserve; **W** `coupon_usages` / coupon `used_count`; clear/adjust cart |

**Payment method:** `cod` or `razorpay` on request body.

**Address:** `address_id` (owned) or inline `address` snapshot copied onto order shipping_* fields.

---

## 9. Payment

**As a** shopper with a pending order  
**I want to** pay online (or confirm COD)  
**So that** fulfillment can start.

| Step | Action | API | Persistence |
|------|--------|-----|-------------|
| 1 | Create payment | `POST /payments/create` `{ order_id, provider }` | **W** `payments` status `created` |
| 2 | Client completes provider UI | (external) | — |
| 3 | Verify | `POST /payments/verify` | **W** payment status; update order status + history |
| 4 | Retry if failed | `POST /payments/retry` | **W** new/updated payment attempt |
| 5 | Webhook | `POST /payments/webhook` | Stub — admin/provider path is authoritative for sandbox capture |

**COD:** may skip provider; order remains payable on delivery per business status rules.

---

## 10. Order history & cancel

**As a** shopper  
**I want to** view and cancel eligible orders  
**So that** I control my purchases.

| Step | Action | API | Persistence |
|------|--------|-----|-------------|
| 1 | List | `GET /orders?status=` | **R** owned orders |
| 2 | Detail | `GET /orders/{order_id}` | **R** + items |
| 3 | Cancel | `POST /orders/{order_id}/cancel` | **W** status + `order_status_history`; release inventory if applicable |

---

## 11. Shipment tracking

**As a** shopper  
**I want to** track shipment progress  
**So that** I know when it arrives.

| Step | Action | API | Persistence |
|------|--------|-----|-------------|
| 1 | By order number | `GET /orders/tracking/{order_number}` *(existing)* or `GET /tracking/{order_number}` **(NEW)** | **R** orders, history, shipments, shipment_events |
| 2 | By AWB | `GET /tracking/awb/{awb}` **(NEW)** | **R** shipments by awb |

**Admin/courier** writes shipment rows and events — shopping never configures couriers.

---

## 12. Notifications

**As a** shopper  
**I want to** see order and support alerts  
**So that** I stay informed.

| Step | Action | API | Persistence |
|------|--------|-----|-------------|
| 0 | System emits (worker) | — | **W** `notifications` (backend job / admin event) |
| 1 | Inbox | `GET /notifications` **(NEW)** | **R** owned rows |
| 2 | Mark one / all | `POST /notifications/{id}/read`, `/read-all` **(NEW)** | **W** `is_read` |
| 3 | Bulk patch | `PATCH /notifications` **(NEW)** | **W** |

Example trigger: after shipment status → create `order_shipped` notification.

---

## 13. Review & ratings

**As a** shopper who received an order  
**I want to** rate the product  
**So that** others benefit from my experience.

| Step | Action | API | Persistence |
|------|--------|-----|-------------|
| 1 | Submit review | `POST /reviews` | **W** `reviews` (`is_approved=false`, maybe `is_verified_purchase` from orders) |
| 2 | Admin approves | (admin service) | **W** `is_approved` — not shopping |
| 3 | Public list | `GET /products/{id}/reviews` | **R** approved reviews |
| 4 | Aggregates | `GET /ratings/summary/{product_id}` **(NEW)** | **R** approved reviews / summary table |

---

## 14. Customer support

**As a** shopper with an issue  
**I want to** contact support  
**So that** problems get resolved.

| Step | Action | API | Persistence |
|------|--------|-----|-------------|
| A | Quick feedback | `POST /feedback` (optional auth) | **W** `feedbacks` |
| B | Open ticket | `POST /support/tickets` **(NEW)** | **W** `support_tickets` + first message |
| C | Follow thread | `GET /support/tickets/{id}`, `POST …/messages` **(NEW)** | **R/W** owned ticket messages |
| D | Notify | worker | **W** `notifications` |

Staff replies/resolution happen in admin — not exposed as shopping write APIs beyond customer messages.

---

## 15. Personalized return visit

**As a** returning customer  
**I want to** see relevant products  
**So that** I continue shopping.

| Step | Action | API | Persistence |
|------|--------|-----|-------------|
| 1 | Home rails | `GET /recommendations/home` **(NEW)** | **R** catalog + scores |
| 2 | For you | `GET /recommendations/for-you` **(NEW)** | **R** orders, wishlist, recently_viewed |
| 3 | Continue browsing | `GET /recently-viewed` **(NEW)** | **R** |
| 4 | Theme preference | `PUT /theme` then `GET /theme` | **W/R** customer theme row |

---

## Happy-path sequence (commerce core)

```mermaid
sequenceDiagram
  participant C as Customer
  participant API as Shopping API
  participant DB as Postgres

  C->>API: GET /products (browse)
  API->>DB: SELECT products (published)
  C->>API: POST /cart/items (X-Cart-Id)
  API->>DB: INSERT carts/cart_items
  C->>API: POST /auth/login
  API->>DB: SELECT customers; INSERT refresh_tokens
  C->>API: POST /cart/merge
  API->>DB: MERGE cart_items
  C->>API: POST /coupons/apply
  API->>DB: UPDATE carts.coupon_code
  C->>API: POST /checkout/create-order
  API->>DB: INSERT orders, order_items, history; reserve inventory
  C->>API: POST /payments/create + verify
  API->>DB: INSERT/UPDATE payments; UPDATE order status
  Note over DB: Admin creates shipment + events
  C->>API: GET /orders/tracking/{order_number}
  API->>DB: SELECT orders, shipments, events
  C->>API: POST /reviews
  API->>DB: INSERT reviews (pending approval)
```

---

## Failure & edge cases (must handle in services)

| Scenario | Expected behavior |
|----------|-------------------|
| Out of stock at create-order | 400; no partial order |
| Coupon expires between apply and checkout | Re-validate; fail create-order or drop discount per policy |
| Cancel after ship | 400 not cancellable |
| Access another customer’s order/address | 404 (do not leak existence details beyond policy) |
| Guest hits wishlist | 401 |
| Unapproved review | Hidden from public product reviews / ratings |
| Payment verify replay | Idempotent success |

---

## Ownership summary for the journey

| Customer-owned writes | Shared reads |
|----------------------|--------------|
| Auth, profile, addresses | Catalog, brands, categories |
| Cart, wishlist, compare | Coupons definitions, tax, store settings |
| Checkout orders, payments (customer path) | Shipments & events |
| Reviews, feedback, theme override | Inventory balances (except reserve) |
| Notifications read/mark, recently viewed, support tickets | |

Admin remains the system of record for catalog content, coupon configuration, fulfillment operations, and schema migrations.

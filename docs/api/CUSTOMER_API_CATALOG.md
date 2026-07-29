# Customer API Catalog

**Base URL:** `/api/v1`  
**Service:** Classic Way Shopping (customer-facing only)  
**Auth:** `Authorization: Bearer <access_token>` unless noted  
**Guest cart header:** `X-Cart-Id: <cart-uuid>`  
**Error shape:** `{ "detail": "<message>" }`  
**Health (no prefix):** `GET /health` → `{ "status": "ok" }`

Status codes used across the API:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No content |
| 400 | Validation / business rule (`AppError`) |
| 401 | Missing/invalid customer token |
| 403 | Forbidden |
| 404 | Not found / not owned |
| 409 | Conflict |
| 422 | Pydantic validation |
| 429 | Rate limited (production target) |

---

# A. Auth — `/auth`

## POST `/auth/register`

| | |
|--|--|
| **Auth** | No |
| **Description** | Create customer account and return JWT pair |

**Request**
```json
{
  "email": "shopper@example.com",
  "password": "SecurePass1",
  "full_name": "Ada Lovelace",
  "phone": "+919876543210"
}
```

**Response** `200`
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "customer": {
    "id": "11111111-1111-1111-1111-111111111111",
    "email": "shopper@example.com",
    "full_name": "Ada Lovelace",
    "phone": "+919876543210",
    "is_active": true,
    "email_verified": false,
    "created_at": "2026-07-29T10:00:00",
    "updated_at": "2026-07-29T10:00:00"
  }
}
```

**Validation:** email valid; password 8–128; full_name 2–160; phone ≤40 optional.  
**Errors:** 409 email taken; 422 invalid body.  
**Status codes:** 200, 409, 422

---

## POST `/auth/login`

| | |
|--|--|
| **Auth** | No |
| **Description** | Authenticate and issue token pair |

**Request**
```json
{
  "email": "shopper@example.com",
  "password": "SecurePass1"
}
```

**Response** `200` — same shape as register (`TokenPairResponse`).

**Validation:** email + password required.  
**Errors:** 401 invalid credentials / inactive.  
**Status codes:** 200, 401, 422

---

## POST `/auth/logout`

| | |
|--|--|
| **Auth** | No |
| **Description** | Revoke refresh token if provided |

**Request**
```json
{ "refresh_token": "eyJ..." }
```

**Response** `200`
```json
{ "message": "Logged out" }
```

**Validation:** refresh_token optional.  
**Status codes:** 200

---

## POST `/auth/refresh`

| | |
|--|--|
| **Auth** | No |
| **Description** | Exchange valid refresh token for new pair |

**Request**
```json
{ "refresh_token": "eyJ..." }
```

**Response** `200` — `TokenPairResponse`.

**Errors:** 401 invalid/expired/revoked.  
**Status codes:** 200, 401, 422

---

## GET `/auth/me`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Current customer from access token |

**Request:** none  
**Response** `200` — `CustomerResponse` (see register).

**Errors:** 401.  
**Status codes:** 200, 401

---

## POST `/auth/forgot-password`

| | |
|--|--|
| **Auth** | No |
| **Description** | Request password reset (always generic success message) |

**Request**
```json
{ "email": "shopper@example.com" }
```

**Response** `200`
```json
{ "message": "If the email exists, a reset link was sent" }
```

**Status codes:** 200, 422

---

## POST `/auth/reset-password`

| | |
|--|--|
| **Auth** | No |
| **Description** | Reset password with token |

**Request**
```json
{
  "token": "reset-token",
  "new_password": "NewSecurePass1"
}
```

**Response** `200`
```json
{ "message": "Password updated" }
```

**Validation:** new_password 8–128.  
**Errors:** 400/401 invalid token.  
**Status codes:** 200, 400, 401, 422

---

# B. Customers / Profile — `/customers`

## GET `/customers/me`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Get profile |

**Response** `200` — `CustomerResponse`.  
**Status codes:** 200, 401

---

## PUT `/customers/me`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Update name and/or phone |

**Request**
```json
{
  "full_name": "Ada L.",
  "phone": "+919876543210"
}
```

**Response** `200` — `CustomerResponse`.  
**Validation:** full_name 2–160 if set; phone ≤40.  
**Status codes:** 200, 401, 422

---

## PUT `/customers/me/password`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Change password |

**Request**
```json
{
  "current_password": "SecurePass1",
  "new_password": "NewerSecurePass1"
}
```

**Response** `200`
```json
{ "message": "Password changed" }
```

**Errors:** 400 wrong current password.  
**Status codes:** 200, 400, 401, 422

---

# C. Addresses — `/addresses`

## GET `/addresses`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | List customer addresses |

**Response** `200`
```json
[
  {
    "id": "22222222-2222-2222-2222-222222222222",
    "user_id": null,
    "customer_id": "11111111-1111-1111-1111-111111111111",
    "full_name": "Ada Lovelace",
    "phone": "+919876543210",
    "line1": "12 Market Street",
    "line2": null,
    "city": "Chennai",
    "state": "TN",
    "postal_code": "600001",
    "country": "India",
    "is_default": true,
    "created_at": "2026-07-29T10:00:00",
    "updated_at": "2026-07-29T10:00:00"
  }
]
```

**Status codes:** 200, 401

---

## POST `/addresses`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Create address (sets default exclusivity) |

**Request**
```json
{
  "full_name": "Ada Lovelace",
  "phone": "+919876543210",
  "line1": "12 Market Street",
  "line2": "Apt 4",
  "city": "Chennai",
  "state": "TN",
  "postal_code": "600001",
  "country": "India",
  "is_default": true
}
```

**Response** `201` — `AddressResponse`.  
**Validation:** field min/max lengths as in schemas.  
**Status codes:** 201, 401, 422

---

## GET `/addresses/{address_id}`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Get owned address |

**Response** `200` — `AddressResponse`.  
**Errors:** 404 not found/not owned.  
**Status codes:** 200, 401, 404

---

## PUT `/addresses/{address_id}`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Partial update |

**Request**
```json
{
  "city": "Coimbatore",
  "is_default": true
}
```

**Response** `200` — `AddressResponse`.  
**Status codes:** 200, 401, 404, 422

---

## DELETE `/addresses/{address_id}`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Delete owned address |

**Response:** empty `204`.  
**Status codes:** 204, 401, 404

---

## PUT `/addresses/{address_id}/default`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Mark address as default |

**Response** `200` — `AddressResponse`.  
**Status codes:** 200, 401, 404

---

# D. Catalog — `/products`, `/categories`, `/brands`

## GET `/products`

| | |
|--|--|
| **Auth** | No |
| **Description** | Filtered, paginated product list |

**Query:** `search`, `category`, `brand`, `size`, `color`, `min_price`, `max_price`, `rating`, `discount`, `availability`, `sort`, `page` (≥1), `limit` (1–100, default 20)

**Request:** none (query string)

**Response** `200`
```json
{
  "items": [
    {
      "id": "33333333-3333-3333-3333-333333333333",
      "name": "Classic Cotton Tee",
      "slug": "classic-cotton-tee",
      "description": "Soft everyday tee",
      "short_description": "Everyday tee",
      "price": "799.00",
      "compare_at_price": "999.00",
      "discount_percent": "20.00",
      "sku": "TEE-001",
      "stock": 42,
      "category_id": "44444444-4444-4444-4444-444444444444",
      "category_name": "Tops",
      "brand_id": null,
      "is_published": true,
      "is_active": true,
      "is_featured": true,
      "is_trending": false,
      "is_best_seller": false,
      "primary_image_url": "/uploads/products/tee.jpg",
      "media": [],
      "attributes": [],
      "variants": [],
      "created_at": "2026-07-01T00:00:00",
      "updated_at": "2026-07-01T00:00:00",
      "deleted_at": null
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20,
  "pages": 1
}
```

**Status codes:** 200, 422

---

## GET `/products/featured` · `/products/trending` · `/products/best-sellers` · `/products/new-arrivals`

| | |
|--|--|
| **Auth** | No |
| **Description** | Curated lists |

**Query:** `limit` (1–100, default 20)  
**Response:** `ProductListResponse`  
**Status codes:** 200, 422

---

## GET `/products/search`

| | |
|--|--|
| **Auth** | No |
| **Description** | Legacy/simple search (`q`) — prefer `/search` when available |

**Query:** `q`, `page`, `limit`  
**Response:** `ProductListResponse`  
**Status codes:** 200, 422

---

## GET `/products/suggestions`

| | |
|--|--|
| **Auth** | No |
| **Description** | Typeahead strings |

**Query:** `q`, `limit` (1–20, default 8)  
**Response** `200`
```json
["Classic Cotton Tee", "Classic Denim"]
```

**Status codes:** 200, 422

---

## GET `/products/slug/{slug}`

| | |
|--|--|
| **Auth** | No |
| **Description** | Product by slug |

**Response** `200` — `ProductResponse`.  
**Errors:** 404.  
**Status codes:** 200, 404

---

## GET `/products/{product_id}`

| | |
|--|--|
| **Auth** | No |
| **Description** | Product by id |

**Response** `200` — `ProductResponse`.  
**Status codes:** 200, 404

---

## GET `/products/{product_id}/related`

| | |
|--|--|
| **Auth** | No |
| **Description** | Related products |

**Response** `200` — `ProductResponse[]`.  
**Status codes:** 200, 404

---

## GET `/products/{product_id}/reviews`

| | |
|--|--|
| **Auth** | No |
| **Description** | Approved (and/or visible) reviews for product |

**Response** `200`
```json
[
  {
    "id": "55555555-5555-5555-5555-555555555555",
    "product_id": "33333333-3333-3333-3333-333333333333",
    "customer_id": "11111111-1111-1111-1111-111111111111",
    "customer_name": "Ada Lovelace",
    "rating": 5,
    "title": "Great fit",
    "body": "Washed well.",
    "is_verified_purchase": true,
    "is_approved": true,
    "images": [],
    "created_at": "2026-07-20T12:00:00",
    "updated_at": "2026-07-20T12:00:00"
  }
]
```

**Status codes:** 200, 404

---

## GET `/products/{product_id}/variants`

| | |
|--|--|
| **Auth** | No |
| **Description** | Active variants |

**Response** `200` — `ProductVariantResponse[]`.  
**Status codes:** 200, 404

---

## GET `/categories`

| | |
|--|--|
| **Auth** | No |
| **Description** | List active categories |

**Response** `200` — `CategoryResponse[]`.  
**Status codes:** 200

---

## GET `/categories/{slug}`

| | |
|--|--|
| **Auth** | No |
| **Description** | Category by slug |

**Response** `200` — `CategoryResponse`.  
**Status codes:** 200, 404

---

## GET `/categories/{slug}/products`

| | |
|--|--|
| **Auth** | No |
| **Description** | Products in category |

**Query:** `page`, `limit`  
**Response:** `ProductListResponse`  
**Status codes:** 200, 404, 422

---

## GET `/brands`

| | |
|--|--|
| **Auth** | No |
| **Description** | List brands |

**Response** `200` — `BrandResponse[]`.  
**Status codes:** 200

---

# E. Cart — `/cart`

All cart routes accept optional Bearer + `X-Cart-Id`.

## GET `/cart`

| | |
|--|--|
| **Auth** | Optional |
| **Description** | Get or create resolved cart |

**Response** `200`
```json
{
  "id": "66666666-6666-6666-6666-666666666666",
  "session_key": null,
  "user_id": null,
  "customer_id": null,
  "coupon_code": null,
  "items": [
    {
      "id": "77777777-7777-7777-7777-777777777777",
      "cart_id": "66666666-6666-6666-6666-666666666666",
      "product_id": "33333333-3333-3333-3333-333333333333",
      "variant_id": null,
      "quantity": 2,
      "unit_price": "799.00",
      "product_name": "Classic Cotton Tee",
      "sku": "TEE-001",
      "line_total": "1598.00"
    }
  ],
  "subtotal": "1598.00",
  "item_count": 2,
  "created_at": "2026-07-29T10:00:00",
  "updated_at": "2026-07-29T10:05:00"
}
```

**Status codes:** 200

---

## DELETE `/cart`

| | |
|--|--|
| **Auth** | Optional |
| **Description** | Clear all items |

**Response** `200` — empty-items `CartResponse`.  
**Status codes:** 200, 404

---

## POST `/cart/items`

| | |
|--|--|
| **Auth** | Optional |
| **Description** | Add line item |

**Request**
```json
{
  "product_id": "33333333-3333-3333-3333-333333333333",
  "variant_id": null,
  "quantity": 1
}
```

**Response** `200` — `CartResponse`.  
**Validation:** quantity 1–999.  
**Errors:** 404 product; 400 stock.  
**Status codes:** 200, 400, 404, 422

---

## PUT `/cart/items/{item_id}`

| | |
|--|--|
| **Auth** | Optional |
| **Description** | Update quantity |

**Request**
```json
{ "quantity": 3 }
```

**Response** `200` — `CartResponse`.  
**Status codes:** 200, 400, 404, 422

---

## DELETE `/cart/items/{item_id}`

| | |
|--|--|
| **Auth** | Optional |
| **Description** | Remove line |

**Response** `200` — `CartResponse`.  
**Status codes:** 200, 404

---

## POST `/cart/merge`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Merge guest cart into customer cart |

**Request**
```json
{ "guest_cart_id": "66666666-6666-6666-6666-666666666666" }
```

**Response** `200` — `CartResponse`.  
**Status codes:** 200, 401, 404

---

# F. Wishlist — `/wishlist`

## GET `/wishlist`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Get wishlist |

**Response** `200`
```json
{
  "id": "88888888-8888-8888-8888-888888888888",
  "customer_id": "11111111-1111-1111-1111-111111111111",
  "items": [
    {
      "id": "99999999-9999-9999-9999-999999999999",
      "product_id": "33333333-3333-3333-3333-333333333333",
      "product_name": "Classic Cotton Tee",
      "product_slug": "classic-cotton-tee",
      "product_price": "799.00",
      "product_image": "/uploads/products/tee.jpg"
    }
  ],
  "item_count": 1
}
```

**Status codes:** 200, 401

---

## POST `/wishlist/items`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Add product |

**Request**
```json
{ "product_id": "33333333-3333-3333-3333-333333333333" }
```

**Response** `200` — `WishlistResponse`.  
**Status codes:** 200, 401, 404, 409, 422

---

## DELETE `/wishlist/items/{item_id}`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Remove item |

**Response** `200` — `WishlistResponse`.  
**Status codes:** 200, 401, 404

---

# G. Compare — `/compare`

## GET `/compare` · POST `/compare/items` · DELETE `/compare/items/{item_id}`

Same auth/patterns as wishlist with `CompareResponse` / `CompareItemCreate`.

**Request (POST)**
```json
{ "product_id": "33333333-3333-3333-3333-333333333333" }
```

**Response** `200`
```json
{
  "id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  "customer_id": "11111111-1111-1111-1111-111111111111",
  "items": [],
  "item_count": 0
}
```

**Status codes:** 200, 401, 400 (over limit), 404, 409, 422

---

# H. Reviews & Feedback

## POST `/reviews`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Submit product review (pending approval) |

**Request**
```json
{
  "product_id": "33333333-3333-3333-3333-333333333333",
  "rating": 5,
  "title": "Great fit",
  "body": "Washed well."
}
```

**Response** `201` — `ReviewResponse`.  
**Validation:** rating 1–5.  
**Status codes:** 201, 401, 400, 404, 409, 422

---

## POST `/feedback`

| | |
|--|--|
| **Auth** | Optional |
| **Description** | Contact / general feedback |

**Request**
```json
{
  "name": "Ada Lovelace",
  "email": "shopper@example.com",
  "subject": "Delivery question",
  "message": "When will my order ship?"
}
```

**Response** `201`
```json
{
  "id": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  "customer_id": "11111111-1111-1111-1111-111111111111",
  "name": "Ada Lovelace",
  "email": "shopper@example.com",
  "subject": "Delivery question",
  "message": "When will my order ship?",
  "status": "new",
  "created_at": "2026-07-29T11:00:00"
}
```

**Status codes:** 201, 422

---

# I. Coupons — `/coupons`

## POST `/coupons/validate`

| | |
|--|--|
| **Auth** | No |
| **Description** | Dry-run coupon against subtotal |

**Request**
```json
{ "code": "SAVE10", "subtotal": "1598.00" }
```

**Response** `200`
```json
{
  "code": "SAVE10",
  "discount_type": "percent",
  "discount_value": "10.00",
  "discount_amount": "159.80",
  "message": "Coupon applied"
}
```

**Errors:** 400 invalid/expired/min order.  
**Status codes:** 200, 400, 422

---

## POST `/coupons/apply`

| | |
|--|--|
| **Auth** | Optional |
| **Description** | Attach coupon to cart |

**Request**
```json
{
  "code": "SAVE10",
  "cart_id": "66666666-6666-6666-6666-666666666666"
}
```

**Headers:** `X-Cart-Id` optional fallback.  
**Response** `200` — `CouponResultResponse`.  
**Status codes:** 200, 400, 404, 422

---

## DELETE `/coupons/remove`

| | |
|--|--|
| **Auth** | Optional |
| **Description** | Clear cart coupon |

**Response** `200`
```json
{ "message": "Coupon removed" }
```

**Status codes:** 200, 404

---

# J. Checkout — `/checkout`

## POST `/checkout/preview`

| | |
|--|--|
| **Auth** | Optional |
| **Description** | Compute totals without placing order |

**Request**
```json
{
  "cart_id": "66666666-6666-6666-6666-666666666666",
  "address_id": "22222222-2222-2222-2222-222222222222",
  "coupon_code": "SAVE10",
  "payment_method": "cod",
  "notes": null
}
```

**Response** `200`
```json
{
  "subtotal": "1598.00",
  "shipping_amount": "50.00",
  "tax_amount": "0.00",
  "discount_amount": "159.80",
  "total": "1488.20",
  "coupon_code": "SAVE10",
  "item_count": 2,
  "currency": "INR"
}
```

**Status codes:** 200, 400, 404, 422

---

## POST `/checkout/validate`

| | |
|--|--|
| **Auth** | Optional |
| **Description** | Same as preview with stricter stock/address checks |

**Request/Response:** same as preview.  
**Status codes:** 200, 400, 404, 422

---

## POST `/checkout/create-order`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Place order from cart |

**Request:** `CheckoutPreviewRequest` (may include inline `address` instead of `address_id`)

**Inline address example**
```json
{
  "address": {
    "full_name": "Ada Lovelace",
    "phone": "+919876543210",
    "line1": "12 Market Street",
    "line2": null,
    "city": "Chennai",
    "state": "TN",
    "postal_code": "600001",
    "country": "India"
  },
  "payment_method": "razorpay",
  "coupon_code": "SAVE10"
}
```

**Response** `200`
```json
{
  "id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
  "order_number": "CW-20260729-0001",
  "status": "pending",
  "payment_method": "razorpay",
  "subtotal": "1598.00",
  "shipping_amount": "50.00",
  "tax_amount": "0.00",
  "discount_amount": "159.80",
  "total": "1488.20",
  "currency": "INR",
  "items": [
    {
      "id": "dddddddd-dddd-dddd-dddd-dddddddddddd",
      "name": "Classic Cotton Tee",
      "quantity": 2,
      "unit_price": "799.00",
      "line_total": "1598.00"
    }
  ],
  "created_at": "2026-07-29T12:00:00"
}
```

**Status codes:** 200, 400, 401, 404, 422

---

# K. Payments — `/payments`

## POST `/payments/create`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Create payment for owned order |

**Request**
```json
{
  "order_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
  "provider": "razorpay"
}
```

**Response** `200` (provider-shaped; illustrative)
```json
{
  "payment_id": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
  "provider": "razorpay",
  "provider_order_id": "order_xyz",
  "amount": "1488.20",
  "currency": "INR",
  "status": "created"
}
```

**Status codes:** 200, 400, 401, 404, 422

---

## POST `/payments/verify`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Verify provider payment and update order |

**Request**
```json
{
  "order_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
  "provider_order_id": "order_xyz",
  "provider_payment_id": "pay_abc"
}
```

**Response** `200`
```json
{ "status": "paid", "order_id": "cccccccc-cccc-cccc-cccc-cccccccccccc" }
```

**Status codes:** 200, 400, 401, 404, 422

---

## POST `/payments/retry`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Retry payment create for unpaid order |

**Request/Response:** same as `/payments/create`.  
**Status codes:** 200, 400, 401, 404, 422

---

## POST `/payments/webhook`

| | |
|--|--|
| **Auth** | No |
| **Description** | Stub — use admin payment webhook for sandbox capture |

**Response** `200`
```json
{
  "status": "ok",
  "message": "Use admin payment webhook for sandbox capture"
}
```

**Status codes:** 200

---

# L. Orders — `/orders`

## GET `/orders`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | List customer orders |

**Query:** `status` optional  
**Response** `200` — `CustomerOrderResponse[]`.  
**Status codes:** 200, 401

---

## GET `/orders/{order_id}`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Order detail (owned) |

**Response** `200` — `CustomerOrderResponse`.  
**Status codes:** 200, 401, 404

---

## POST `/orders/{order_id}/cancel`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Cancel if status allows |

**Request**
```json
{ "reason": "Changed my mind" }
```

**Response** `200` — `CustomerOrderResponse`.  
**Errors:** 400 not cancellable.  
**Status codes:** 200, 400, 401, 404, 422

---

## GET `/orders/tracking/{order_number}`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Tracking payload for owned order |

**Response** `200`
```json
{
  "order_number": "CW-20260729-0001",
  "status": "shipped",
  "status_history": [
    {
      "from_status": "paid",
      "to_status": "shipped",
      "note": "Handed to courier",
      "created_at": "2026-07-30T09:00:00",
      "status": "shipped"
    }
  ],
  "shipping_city": "Chennai",
  "created_at": "2026-07-29T12:00:00",
  "awb": "AWB123456",
  "shipment_status": "in_transit",
  "shipment_events": [
    {
      "status": "in_transit",
      "description": "Departed hub",
      "location": null,
      "occurred_at": "2026-07-30T14:00:00",
      "source": "manual"
    }
  ]
}
```

**Status codes:** 200, 401, 404

---

# M. Theme — `/theme`

## GET `/theme`

| | |
|--|--|
| **Auth** | Optional |
| **Description** | Resolve default or customer theme |

**Response** `200`
```json
{
  "id": "ffffffff-ffff-ffff-ffff-ffffffffffff",
  "customer_id": null,
  "home_theme": "fashion",
  "shop_category": "classic",
  "shop_layout": "full-width",
  "product_layout": "full-width",
  "blog_layout": "full-width",
  "page_visibility": {},
  "theme_config": null,
  "is_default": true,
  "is_active": true,
  "created_at": "2026-07-01T00:00:00",
  "updated_at": "2026-07-01T00:00:00",
  "source": "default"
}
```

**Status codes:** 200

---

## PUT `/theme`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Upsert customer theme override |

**Request**
```json
{
  "home_theme": "fashion",
  "shop_category": "classic",
  "shop_layout": "full-width",
  "product_layout": "boxed",
  "blog_layout": "full-width",
  "page_visibility": { "blog": true },
  "theme_config": { "accent": "#1a1a1a" }
}
```

**Response** `200` — `ThemeResponse` with `source: "customer"`.  
**Status codes:** 200, 401, 422

---

# N. Search (NEW) — `/search`

> Dedicated discovery endpoints. Legacy equivalents remain under `/products/search` and `/products/suggestions`.

## GET `/search`

| | |
|--|--|
| **Auth** | No |
| **Description** | Full product search with filters |

**Query:** `q`, `category`, `brand`, `min_price`, `max_price`, `sort`, `page`, `limit`

**Request:** none

**Response** `200` — `ProductListResponse` (same as catalog list).

**Validation:** `limit` ≤100; sanitize sort enums.  
**Errors:** 422.  
**Status codes:** 200, 422

---

## GET `/search/suggestions`

| | |
|--|--|
| **Auth** | No |
| **Description** | Autocomplete suggestions |

**Query:** `q`, `limit` (default 8, max 20)

**Response** `200`
```json
{
  "suggestions": [
    { "text": "Classic Cotton Tee", "type": "product", "slug": "classic-cotton-tee" },
    { "text": "Tops", "type": "category", "slug": "tops" }
  ]
}
```

**Status codes:** 200, 422

---

## GET `/search/filters`

| | |
|--|--|
| **Auth** | No |
| **Description** | Facet metadata for current query context |

**Query:** `q`, `category` optional

**Response** `200`
```json
{
  "brands": [{ "slug": "classic-way", "name": "Classic Way", "count": 12 }],
  "categories": [{ "slug": "tops", "name": "Tops", "count": 8 }],
  "price": { "min": "199.00", "max": "4999.00" },
  "sizes": ["S", "M", "L"],
  "colors": ["Black", "White"],
  "availability": ["in_stock", "out_of_stock"]
}
```

**Status codes:** 200, 422

---

# O. Notifications (NEW) — `/notifications`

## GET `/notifications`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | List customer notifications |

**Query:** `unread_only` bool, `page`, `limit`

**Response** `200`
```json
{
  "items": [
    {
      "id": "10101010-1010-1010-1010-101010101010",
      "type": "order_shipped",
      "title": "Your order shipped",
      "body": "Order CW-20260729-0001 is on the way.",
      "data": { "order_number": "CW-20260729-0001" },
      "is_read": false,
      "created_at": "2026-07-30T09:05:00"
    }
  ],
  "unread_count": 1,
  "page": 1,
  "limit": 20,
  "total": 1
}
```

**Status codes:** 200, 401, 422

---

## PATCH `/notifications`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Bulk preferences or mark subset (implementation-defined) |

**Request**
```json
{
  "notification_ids": ["10101010-1010-1010-1010-101010101010"],
  "is_read": true
}
```

**Response** `200`
```json
{ "updated": 1 }
```

**Status codes:** 200, 401, 422

---

## POST `/notifications/{id}/read`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Mark one notification read |

**Request:** none  
**Response** `200`
```json
{
  "id": "10101010-1010-1010-1010-101010101010",
  "is_read": true
}
```

**Errors:** 404.  
**Status codes:** 200, 401, 404

---

## POST `/notifications/read-all`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Mark all notifications read |

**Request:** none  
**Response** `200`
```json
{ "updated": 5 }
```

**Status codes:** 200, 401

---

# P. Recently Viewed (NEW) — `/recently-viewed`

## GET `/recently-viewed`

| | |
|--|--|
| **Auth** | Optional / Yes preferred |
| **Description** | Last viewed products |

**Query:** `limit` (default 12, max 20)

**Response** `200`
```json
{
  "items": [
    {
      "product_id": "33333333-3333-3333-3333-333333333333",
      "viewed_at": "2026-07-29T15:00:00",
      "product": { "id": "33333333-3333-3333-3333-333333333333", "name": "Classic Cotton Tee", "slug": "classic-cotton-tee", "price": "799.00", "primary_image_url": "/uploads/products/tee.jpg" }
    }
  ]
}
```

**Status codes:** 200, 401, 422

---

## POST `/recently-viewed`

| | |
|--|--|
| **Auth** | Optional / Yes preferred |
| **Description** | Record a product view |

**Request**
```json
{ "product_id": "33333333-3333-3333-3333-333333333333" }
```

**Response** `200`
```json
{ "message": "Recorded", "product_id": "33333333-3333-3333-3333-333333333333" }
```

**Errors:** 404 product.  
**Status codes:** 200, 401, 404, 422

---

## DELETE `/recently-viewed`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Clear history |

**Response** `200`
```json
{ "message": "Cleared" }
```

**Status codes:** 200, 401

---

# Q. Recommendations (NEW) — `/recommendations`

## GET `/recommendations/home`

| | |
|--|--|
| **Auth** | Optional |
| **Description** | Home page recommendation rails |

**Query:** `limit`  
**Response** `200`
```json
{
  "rails": [
    {
      "key": "trending",
      "title": "Trending now",
      "products": []
    },
    {
      "key": "new_arrivals",
      "title": "New arrivals",
      "products": []
    }
  ]
}
```

**Status codes:** 200, 422

---

## GET `/recommendations/for-you`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Personalized picks |

**Response** `200`
```json
{
  "products": [],
  "strategy": "collaborative_fallback_trending"
}
```

**Status codes:** 200, 401, 422

---

## GET `/recommendations/similar/{product_id}`

| | |
|--|--|
| **Auth** | No |
| **Description** | Similar products for PDP |

**Response** `200`
```json
{ "product_id": "33333333-3333-3333-3333-333333333333", "products": [] }
```

**Status codes:** 200, 404, 422

---

## GET `/recommendations/bought-together/{product_id}`

| | |
|--|--|
| **Auth** | No |
| **Description** | Frequently bought together |

**Response** `200`
```json
{ "product_id": "33333333-3333-3333-3333-333333333333", "products": [] }
```

**Status codes:** 200, 404, 422

---

# R. Ratings (NEW) — `/ratings`

## GET `/ratings/products/{product_id}`

| | |
|--|--|
| **Auth** | No |
| **Description** | Rating breakdown from approved reviews |

**Response** `200`
```json
{
  "product_id": "33333333-3333-3333-3333-333333333333",
  "average": 4.6,
  "count": 28,
  "distribution": { "1": 0, "2": 1, "3": 2, "4": 8, "5": 17 }
}
```

**Status codes:** 200, 404

---

## GET `/ratings/summary/{product_id}`

| | |
|--|--|
| **Auth** | No |
| **Description** | Compact summary for cards/PDP header |

**Response** `200`
```json
{
  "product_id": "33333333-3333-3333-3333-333333333333",
  "average": 4.6,
  "count": 28
}
```

**Status codes:** 200, 404

---

# S. Shipment Tracking (NEW) — `/tracking`

> Complements existing `GET /orders/tracking/{order_number}`.

## GET `/tracking/{order_number}`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Track by order number (owned) |

**Response** `200` — same shape as `CustomerOrderTrackingResponse`.  
**Status codes:** 200, 401, 404

---

## GET `/tracking/awb/{awb}`

| | |
|--|--|
| **Auth** | Yes (or limited public with reduced PII) |
| **Description** | Track by courier AWB |

**Response** `200`
```json
{
  "awb": "AWB123456",
  "order_number": "CW-20260729-0001",
  "shipment_status": "in_transit",
  "shipment_events": [
    {
      "status": "in_transit",
      "description": "Departed hub",
      "occurred_at": "2026-07-30T14:00:00",
      "source": "courier"
    }
  ]
}
```

**Validation:** AWB format length ≤80.  
**Errors:** 404 unknown AWB; 403 if AWB belongs to another customer under auth mode.  
**Status codes:** 200, 401, 403, 404

---

# T. Customer Support (NEW) — `/support`

> Complements existing `POST /feedback`.

## POST `/support/tickets`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Open support ticket |

**Request**
```json
{
  "subject": "Missing item",
  "message": "One item was missing from my package.",
  "order_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
  "category": "fulfillment"
}
```

**Response** `201`
```json
{
  "id": "12121212-1212-1212-1212-121212121212",
  "ticket_number": "SUP-1001",
  "subject": "Missing item",
  "status": "open",
  "category": "fulfillment",
  "order_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
  "created_at": "2026-07-31T10:00:00"
}
```

**Validation:** subject/message required lengths; order must be owned if provided.  
**Status codes:** 201, 401, 404, 422

---

## GET `/support/tickets`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | List own tickets |

**Response** `200`
```json
{
  "items": [
    {
      "id": "12121212-1212-1212-1212-121212121212",
      "ticket_number": "SUP-1001",
      "subject": "Missing item",
      "status": "open",
      "updated_at": "2026-07-31T10:00:00"
    }
  ]
}
```

**Status codes:** 200, 401

---

## GET `/support/tickets/{id}`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Ticket detail + messages |

**Response** `200`
```json
{
  "id": "12121212-1212-1212-1212-121212121212",
  "ticket_number": "SUP-1001",
  "subject": "Missing item",
  "status": "open",
  "messages": [
    {
      "id": "13131313-1313-1313-1313-131313131313",
      "sender": "customer",
      "body": "One item was missing from my package.",
      "created_at": "2026-07-31T10:00:00"
    }
  ]
}
```

**Errors:** 404 not owned.  
**Status codes:** 200, 401, 404

---

## POST `/support/tickets/{id}/messages`

| | |
|--|--|
| **Auth** | Yes |
| **Description** | Reply on own ticket |

**Request**
```json
{ "body": "Also attaching the packing slip details." }
```

**Response** `201`
```json
{
  "id": "14141414-1414-1414-1414-141414141414",
  "ticket_id": "12121212-1212-1212-1212-121212121212",
  "sender": "customer",
  "body": "Also attaching the packing slip details.",
  "created_at": "2026-07-31T11:00:00"
}
```

**Status codes:** 201, 401, 404, 422

---

# Out of scope (do not implement on shopping)

Admin-only writes are **not** part of this catalog: product/category/brand CRUD, coupon CRUD, inventory adjustments, courier account setup, refund issuance APIs, review moderation approve/reject staff tools.

---

# Quick index

| Area | Prefix | Status |
|------|--------|--------|
| Auth | `/auth` | Existing |
| Profile | `/customers` | Existing |
| Addresses | `/addresses` | Existing |
| Catalog | `/products`, `/categories`, `/brands` | Existing |
| Cart | `/cart` | Existing |
| Wishlist / Compare | `/wishlist`, `/compare` | Existing |
| Reviews / Feedback | `/reviews`, `/feedback` | Existing |
| Coupons / Checkout / Payments / Orders | `/coupons`, `/checkout`, `/payments`, `/orders` | Existing |
| Theme | `/theme` | Existing |
| Search | `/search` | New |
| Notifications | `/notifications` | New |
| Recently viewed | `/recently-viewed` | New |
| Recommendations | `/recommendations` | New |
| Ratings | `/ratings` | New |
| Tracking | `/tracking` | New (+ existing orders tracking) |
| Support | `/support` | New (+ existing feedback) |

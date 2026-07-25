export type ApiCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: number | null;
  is_active: boolean;
  sort_order: number;
  product_count?: number;
};

export type ApiBrand = {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
};

export type ApiProductMedia = {
  id: number;
  product_id: number;
  url: string;
  alt_text: string | null;
  sort_order: number;
  is_primary: boolean;
};

export type ApiProductAttribute = {
  id: number;
  product_id: number;
  name: string;
  values: unknown[];
  sort_order: number;
};

export type ApiProductVariant = {
  id: number;
  product_id: number;
  sku: string;
  price: number | string | null;
  stock: number;
  options: Record<string, string>;
  is_active: boolean;
  sort_order: number;
};

export type ApiProduct = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  short_description?: string | null;
  price: number | string;
  compare_at_price: number | string | null;
  discount_percent?: number | string | null;
  sku: string | null;
  stock?: number;
  tags?: string | null;
  category_id: number | null;
  category_name?: string | null;
  is_published: boolean;
  is_active: boolean;
  is_featured?: boolean;
  is_trending?: boolean;
  is_best_seller?: boolean;
  primary_image_url?: string | null;
  media?: ApiProductMedia[];
  attributes?: ApiProductAttribute[];
  variants?: ApiProductVariant[];
};

export type ApiProductList = {
  items: ApiProduct[];
  total: number;
  page: number;
  limit: number;
  pages: number;
};

export type ApiCartItem = {
  id: number;
  cart_id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  unit_price: number | string;
  product_name: string;
  sku: string | null;
  line_total: number | string;
};

export type ApiCart = {
  id: number;
  session_key: string | null;
  user_id: number | null;
  customer_id?: number | null;
  items: ApiCartItem[];
  subtotal: number | string;
  item_count: number;
};

export type ApiCustomer = {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  is_active: boolean;
  email_verified: boolean;
};

export type ApiTokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  customer: ApiCustomer;
};

export type ApiWishlistItem = {
  id: number;
  product_id: number;
  product_name?: string | null;
  product_slug?: string | null;
  product_price?: number | string | null;
  product_image?: string | null;
};

export type ApiWishlist = {
  id: number;
  customer_id: number;
  items: ApiWishlistItem[];
  item_count: number;
};

export type ApiCompareItem = {
  id: number;
  product_id: number;
  product_name?: string | null;
  product_slug?: string | null;
  product_price?: number | string | null;
  product_image?: string | null;
};

export type ApiCompare = {
  id: number;
  customer_id: number;
  items: ApiCompareItem[];
  item_count: number;
};

export type ApiCheckoutPreview = {
  subtotal: number | string;
  shipping_amount: number | string;
  tax_amount: number | string;
  discount_amount: number | string;
  total: number | string;
  coupon_code?: string | null;
  item_count: number;
  currency: string;
};

export type ApiCheckoutAddress = {
  full_name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
};

export type ApiCheckoutCreate = {
  cart_id?: number | null;
  address_id?: number | null;
  address?: ApiCheckoutAddress | null;
  coupon_code?: string | null;
  payment_method?: "razorpay" | "cod";
  notes?: string | null;
};

export type ApiOrder = {
  id: number;
  order_number: string;
  status: string;
  payment_method: string;
  subtotal: number | string;
  shipping_amount: number | string;
  tax_amount: number | string;
  discount_amount: number | string;
  total: number | string;
  currency: string;
  items: Array<{
    id: number;
    name: string;
    quantity: number;
    unit_price: number | string;
    line_total: number | string;
  }>;
  created_at: string;
};

export type ApiShipmentEvent = {
  status?: string | null;
  description?: string | null;
  location?: string | null;
  occurred_at?: string | null;
  source?: string | null;
};

export type ApiOrderTracking = {
  order_number: string;
  status: string;
  status_history: Array<{
    from_status?: string | null;
    to_status?: string | null;
    note?: string | null;
    created_at?: string | null;
    status?: string | null;
  }>;
  shipping_city?: string | null;
  created_at: string;
  awb?: string | null;
  shipment_status?: string | null;
  shipment_events?: ApiShipmentEvent[] | null;
};

export type ApiCouponResult = {
  code: string;
  discount_type: string;
  discount_value: number | string;
  discount_amount: number | string;
  message: string;
};

export type ProductListParams = {
  search?: string;
  category?: string;
  brand?: string;
  size?: string;
  color?: string;
  min_price?: number;
  max_price?: number;
  rating?: number;
  discount?: number;
  availability?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

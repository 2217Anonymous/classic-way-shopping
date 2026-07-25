import { mediaUrl } from "@/lib/api";
import type { CartItem, Category, Product, ProductFlag } from "@/types";
import type { ApiCart, ApiCartItem, ApiCategory, ApiProduct } from "@/services/types";

const CATEGORY_COLORS = [
  "bg-[#f4ecf7]",
  "bg-[#eaf3e1]",
  "bg-[#e1f0f7]",
  "bg-[#fceee4]",
  "bg-[#fff3e0]",
  "bg-[#fce4ec]",
];

const CATEGORY_PLACEHOLDER =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&h=300&q=80";

export function mapApiCategory(category: ApiCategory, index = 0): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    image: category.image_url ? mediaUrl(category.image_url) : CATEGORY_PLACEHOLDER,
    itemCount: category.product_count ?? 0,
    colorClass: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  };
}

function parseTags(tags: string | null | undefined): string[] | undefined {
  if (!tags) return undefined;
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function deriveFlag(product: ApiProduct): ProductFlag {
  if (product.discount_percent && Number(product.discount_percent) > 0) return "Sale";
  if (product.is_trending) return "Hot";
  if (product.is_featured || product.is_best_seller) return "New";
  return null;
}

function sizesFromAttributes(product: ApiProduct): string[] | undefined {
  const sizeAttr = product.attributes?.find(
    (a) => a.name.toLowerCase() === "size" || a.name.toLowerCase() === "sizes"
  );
  if (sizeAttr?.values?.length) {
    return sizeAttr.values.map(String);
  }
  const fromVariants = new Set<string>();
  product.variants?.forEach((v) => {
    const size = v.options?.Size ?? v.options?.size;
    if (size) fromVariants.add(String(size));
  });
  return fromVariants.size ? Array.from(fromVariants) : undefined;
}

export function mapApiProduct(product: ApiProduct): Product {
  const primary =
    product.primary_image_url ||
    product.media?.find((m) => m.is_primary)?.url ||
    product.media?.[0]?.url;
  const hover = product.media?.find((m) => !m.is_primary && m.url !== primary)?.url;
  const categoryName = product.category_name ?? "Fashion";
  const categorySlug = categoryName.toLowerCase().replace(/\s+/g, "-");

  return {
    id: product.id,
    slug: product.slug,
    title: product.name,
    category: categoryName,
    categorySlug,
    price: Number(product.price),
    oldPrice: product.compare_at_price != null ? Number(product.compare_at_price) : undefined,
    rating: 4,
    image: mediaUrl(primary),
    hoverImage: hover ? mediaUrl(hover) : undefined,
    flag: deriveFlag(product),
    stock: product.stock ?? 0,
    unit: "1 pc",
    description: product.description || product.short_description || product.name,
    tags: parseTags(product.tags),
    sizes: sizesFromAttributes(product),
    sku: product.sku ?? undefined,
  };
}

export function mapApiCartItem(item: ApiCartItem, fallback?: Partial<Product>): CartItem {
  return {
    id: item.product_id,
    slug: fallback?.slug ?? `product-${item.product_id}`,
    title: item.product_name || fallback?.title || `Product #${item.product_id}`,
    category: fallback?.category ?? "Fashion",
    categorySlug: fallback?.categorySlug ?? "fashion",
    price: Number(item.unit_price),
    oldPrice: fallback?.oldPrice,
    rating: fallback?.rating ?? 4,
    image: fallback?.image ?? "/tshirts/IMG_5661.PNG",
    hoverImage: fallback?.hoverImage,
    flag: fallback?.flag ?? null,
    stock: fallback?.stock ?? 99,
    unit: fallback?.unit ?? "1 pc",
    description: fallback?.description ?? item.product_name,
    tags: fallback?.tags,
    sizes: fallback?.sizes,
    sku: item.sku ?? fallback?.sku,
    quantity: item.quantity,
    cartItemId: item.id,
    variantId: item.variant_id ?? undefined,
  };
}

export function mapApiCartToItems(cart: ApiCart, known?: CartItem[]): CartItem[] {
  return cart.items.map((item) => {
    const match = known?.find(
      (k) =>
        String(k.id) === String(item.product_id) &&
        (item.variant_id == null || String(k.variantId) === String(item.variant_id))
    );
    return mapApiCartItem(item, match);
  });
}

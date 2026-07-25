export type ProductFlag = "New" | "Hot" | "Sale" | null;

export type ProductId = string;

export interface Product {
  id: ProductId;
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  price: number;
  oldPrice?: number;
  rating: number;
  image: string;
  hoverImage?: string;
  flag?: ProductFlag;
  stock: number;
  unit: string;
  description: string;
  tags?: string[];
  sizes?: string[];
  sku?: string;
}

export interface Category {
  id: ProductId;
  name: string;
  slug: string;
  image: string;
  itemCount: number;
  colorClass?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  category: string;
  comments: number;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  cartItemId?: string;
  variantId?: string;
}

export interface Vendor {
  id: string;
  name: string;
  image: string;
  products: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  image: string;
  rating: number;
  text: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export type ShopConfig = {
  sidebar?: "left" | "right" | "none";
  columns?: 2 | 3 | 4 | 5 | 6;
  banner?: boolean;
  view?: "grid" | "list";
  title?: string;
};

export type ProductLayoutConfig = {
  sidebar?: "left" | "right" | "none";
  accordion?: boolean;
};

export function sameId(a: ProductId | undefined, b: ProductId | undefined) {
  return String(a) === String(b);
}

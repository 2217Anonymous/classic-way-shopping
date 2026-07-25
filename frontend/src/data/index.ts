import type { BlogPost, FaqItem, Testimonial } from "@/types";

/** Static CMS content only — catalog/products come from the shopping API + Postgres. */

export const blogs: BlogPost[] = [
  {
    id: "1",
    slug: "healthy-eating-habits",
    title: "Healthy Eating Habits for Busy Lives",
    excerpt: "Simple ways to stay nourished without sacrificing time.",
    content:
      "Classic Way is built around quality and convenience. Our catalog, pricing, and inventory are managed in Admin and served from PostgreSQL — what you see in the shop is live store data.",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&h=500&q=80",
    date: "2026-06-01",
    author: "Classic Way",
    category: "Lifestyle",
    comments: 0,
  },
  {
    id: "2",
    slug: "fashion-essentials",
    title: "Wardrobe Essentials for Every Season",
    excerpt: "Build a versatile closet with classic pieces that last.",
    content:
      "Browse featured and trending products from the live catalog. New arrivals appear as soon as they are published in Classic Way Admin.",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&h=500&q=80",
    date: "2026-06-10",
    author: "Classic Way",
    category: "Fashion",
    comments: 0,
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Priya S.",
    role: "Customer",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80",
    rating: 5,
    text: "Quality products and reliable delivery. Happy with every order.",
  },
  {
    id: "2",
    name: "Arun K.",
    role: "Customer",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
    rating: 5,
    text: "Smooth checkout and helpful support. Will shop again.",
  },
];

export const faqs: FaqItem[] = [
  {
    id: "1",
    question: "How do I track my order?",
    answer:
      "Use Track Order with your order number. Status updates when our team ships and delivers.",
  },
  {
    id: "2",
    question: "What payment methods do you accept?",
    answer: "Cash on Delivery and online payment (when configured).",
  },
  {
    id: "3",
    question: "How do I return an item?",
    answer:
      "Contact support with your order number. Eligible items can be returned per our policy.",
  },
];

export function getBlogBySlug(slug: string) {
  return blogs.find((b) => b.slug === slug);
}

"use client";

import Link from "next/link";
import { blogs } from "@/data";
import { cn } from "@/lib/utils";

export default function BlogSidebar({ className }: { className?: string }) {
  const categories = [...new Set(blogs.map((b) => b.category))];
  const tags = ["Food", "Organic", "Recipes", "Health", "Lifestyle", "Cooking"];

  return (
    <aside className={cn("space-y-6", className)}>
      <div className="border border-bb-border rounded-xl bg-white p-5">
        <h4 className="text-base font-semibold text-bb-text mb-4 pb-3 border-b border-bb-border">
          Search
        </h4>
        <div className="flex border border-bb-border rounded-md overflow-hidden">
          <input
            type="text"
            placeholder="Search blog..."
            className="flex-1 px-3 py-2 text-sm outline-none"
          />
          <button type="button" className="px-3 bg-bb-primary text-white">
            <i className="ri-search-line" />
          </button>
        </div>
      </div>

      <div className="border border-bb-border rounded-xl bg-white p-5">
        <h4 className="text-base font-semibold text-bb-text mb-4 pb-3 border-b border-bb-border">
          Categories
        </h4>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat}>
              <Link href="#" className="text-sm text-bb-muted hover:text-bb-primary transition-colors">
                {cat}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="border border-bb-border rounded-xl bg-white p-5">
        <h4 className="text-base font-semibold text-bb-text mb-4 pb-3 border-b border-bb-border">
          Recent Posts
        </h4>
        <ul className="space-y-4">
          {blogs.slice(0, 3).map((post) => (
            <li key={post.id}>
              <Link href={`/blog/${post.slug}`} className="group block">
                <span className="text-sm font-medium group-hover:text-bb-primary line-clamp-2">
                  {post.title}
                </span>
                <span className="text-xs text-bb-muted mt-1 block">{post.date}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="border border-bb-border rounded-xl bg-white p-5">
        <h4 className="text-base font-semibold text-bb-text mb-4 pb-3 border-b border-bb-border">
          Tags
        </h4>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-3 py-1.5 rounded-full border border-bb-border text-bb-muted hover:border-bb-primary hover:text-bb-primary cursor-pointer transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}

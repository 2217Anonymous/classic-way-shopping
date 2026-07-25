"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import { listCategories } from "@/services/categories";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

export default function CategorySection({ showTitle = true }: { showTitle?: boolean }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await listCategories();
        if (!cancelled) setCategories(items);
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="categories" className="py-10 md:py-12">
      <Container>
        {showTitle && (
          <SectionTitle
            title="Explore"
            highlight="Categories"
            subtitle="Shop by your favorite fashion categories"
          />
        )}
        {loading && categories.length === 0 ? (
          <p className="text-center text-bb-muted py-8">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-center text-bb-muted py-8">No categories yet.</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin md:grid md:grid-cols-3 lg:grid-cols-6 md:overflow-visible md:pb-0">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop?category=${category.slug}`}
                className={cn(
                  "group shrink-0 snap-start w-[140px] md:w-auto flex flex-col items-center text-center rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md border border-transparent hover:border-bb-primary/20",
                  category.colorClass ?? "bg-bb-soft"
                )}
              >
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-white shadow-sm mb-4">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="96px"
                  />
                </div>
                <h5 className="text-sm font-medium text-bb-text capitalize group-hover:text-bb-primary transition-colors">
                  {category.name}
                </h5>
                <p className="text-xs text-bb-muted mt-1">{category.itemCount} items</p>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

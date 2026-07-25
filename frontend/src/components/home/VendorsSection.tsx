"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import { listBrands } from "@/services/brands";
import type { ApiBrand } from "@/services/types";

export default function VendorsSection() {
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await listBrands();
        if (!cancelled) setBrands(items.filter((b) => b.is_active));
      } catch {
        if (!cancelled) setBrands([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!loading && brands.length === 0) {
    return null;
  }

  return (
    <section className="py-10 md:py-12">
      <Container>
        <SectionTitle
          title="Top"
          highlight="Brands"
          subtitle="Shop brands managed from Classic Way Admin"
        />
        {loading ? (
          <p className="text-center text-bb-muted py-8">Loading brands...</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/shop?brand=${brand.slug}`}
                className="group overflow-hidden rounded-2xl border border-bb-border bg-white hover:shadow-lg transition-all duration-300 p-6 text-center"
              >
                <h5 className="text-base font-medium text-bb-text group-hover:text-bb-primary transition-colors">
                  {brand.name}
                </h5>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

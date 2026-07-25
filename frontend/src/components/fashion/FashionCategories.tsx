"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import Container from "@/components/ui/Container";
import { listCategories } from "@/services/categories";
import type { Category } from "@/types";

import "swiper/css";

export default function FashionCategories() {
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
    <section className="section-category-2 padding-tb-30">
      <Container>
        <div className="bb-category-block-2">
          {loading && categories.length === 0 ? (
            <p className="text-center text-bb-muted py-8">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-center text-bb-muted py-8">No categories yet.</p>
          ) : (
            <Swiper
              modules={[Autoplay]}
              slidesPerView={2}
              spaceBetween={16}
              loop={categories.length > 4}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              breakpoints={{
                576: { slidesPerView: 3 },
                768: { slidesPerView: 4 },
                992: { slidesPerView: 5 },
                1200: { slidesPerView: 7 },
              }}
            >
              {categories.map((cat) => (
                <SwiperSlide key={cat.id}>
                  <Link
                    href={`/shop?category=${cat.slug}`}
                    className="bb-category-box fashion-cat-card"
                  >
                    <div className="category-detail">
                      <div className="category-image">
                        <Image
                          src={cat.image}
                          alt={cat.name}
                          width={120}
                          height={120}
                          className="object-contain mx-auto"
                        />
                      </div>
                      <div className="category-sub-contact">
                        <h5>{cat.name}</h5>
                        <p>{cat.itemCount} items</p>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </Container>
    </section>
  );
}

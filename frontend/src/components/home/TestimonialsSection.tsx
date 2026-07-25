"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { testimonials } from "@/data";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import Rating from "@/components/ui/Rating";

import "swiper/css";
import "swiper/css/pagination";

export default function TestimonialsSection() {
  return (
    <section className="py-10 md:py-12 bg-bb-soft/60">
      <Container>
        <SectionTitle
          title="What Our"
          highlight="Customers Say"
          subtitle="Real reviews from happy BlueBerry shoppers"
        />
        <Swiper
          modules={[Pagination, Autoplay]}
          slidesPerView={1}
          spaceBetween={24}
          loop
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="!pb-12"
        >
          {testimonials.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="h-full flex flex-col rounded-2xl border border-bb-border bg-white p-6 md:p-7 shadow-sm">
                <Rating rating={item.rating} className="mb-4" />
                <p className="text-sm text-bb-muted leading-relaxed flex-1">&ldquo;{item.text}&rdquo;</p>
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-bb-border">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-bb-text">{item.name}</h5>
                    <p className="text-xs text-bb-muted">{item.role}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </Container>
    </section>
  );
}

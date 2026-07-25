"use client";

import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import Container from "@/components/ui/Container";
import { fashionHeroSlides } from "@/data/fashion";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function FashionHero() {
  return (
    <section className="section-hero-2 margin-b-50">
      <Container>
        <div className="hero-slider-2">
          <Swiper
            modules={[Pagination, Autoplay, EffectFade]}
            effect="fade"
            fadeEffect={{ crossFade: true }}
            slidesPerView={1}
            loop
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            className="fashion-hero-swiper"
          >
            {fashionHeroSlides.map((slide) => (
              <SwiperSlide key={slide.id}>
                <div className="fashion-hero-grid">
                  <div className="fashion-hero-media">
                    <div className="hero-img">
                      <Image
                        src={slide.image}
                        alt={slide.subtitle}
                        width={900}
                        height={560}
                        className="w-full h-auto object-cover"
                        priority={slide.id === 1}
                      />
                      <p>{slide.badge}</p>
                    </div>
                  </div>
                  <div className="fashion-hero-aside">
                    <div className="hero-contact fashion-hero-contact">
                      <div className="hero-detail">
                        <h2>
                          {slide.title} <span>{slide.highlight}</span>
                          <br />
                          {slide.subtitle}
                        </h2>
                        <p className="hero-desc">{slide.desc}</p>
                        <Link href="/shop/left-sidebar-col-3" className="bb-btn-1">
                          Shop Now
                        </Link>
                      </div>
                      <div className="cat-card">
                        <ul>
                          {slide.cards.map((card) => (
                            <li key={card.name}>
                              <Link href="/shop/left-sidebar-col-3">
                                <Image
                                  src={card.image}
                                  alt={card.name}
                                  width={220}
                                  height={220}
                                  className="w-full aspect-square object-cover"
                                />
                                <div className="detail">
                                  <span className="name">{card.name}</span>
                                  <p>${card.price}</p>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Container>
    </section>
  );
}

"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, EffectFade } from "swiper/modules";
import Container from "@/components/ui/Container";
import HeroParallaxImage from "./HeroParallaxImage";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const slides = [
  {
    id: 1,
    badge: "Limited Drop",
    title: "Explore",
    highlight: "Bold",
    subtitle: "Tiger Graphic Tees",
    image: "/hero/hero-1.png",
    alt: "Motivational tiger t-shirt design",
  },
  {
    id: 2,
    badge: "Flat 30% Off",
    title: "Feel",
    highlight: "Sunshine",
    subtitle: "Beach Vibes Tees",
    image: "/hero/hero-2.png",
    alt: "Sunshine beach t-shirt design",
  },
  {
    id: 3,
    badge: "New Arrival",
    title: "Wear",
    highlight: "Legend",
    subtitle: "Number 7 Collection",
    image: "/tshirts/IMG_5698.PNG",
    alt: "Ronaldo 7 transparent t-shirt",
  },
];

const socials = [
  { label: "Fb", href: "#" },
  { label: "Li", href: "#" },
  { label: "Dr", href: "#" },
  { label: "In", href: "#" },
];

export default function HeroSlider() {
  return (
    <section className="section-hero relative w-full bg-[#f8f8fb] mb-0 overflow-hidden">
      <div className="bb-social-follow hidden xl:flex">
        <ul className="inner-links">
          {socials.map((s) => (
            <li key={s.label}>
              <a href={s.href}>{s.label}</a>
            </li>
          ))}
        </ul>
      </div>

      <div className="bb-scroll-Page hidden xl:flex">
        <span className="scroll-bar">
          <a href="#categories">Scroll Page</a>
        </span>
      </div>

      <div className="hero-slider w-full">
        <Swiper
          modules={[Pagination, Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          slidesPerView={1}
          loop
          autoplay={{ delay: 5500, disableOnInteraction: false }}
          pagination={{
            clickable: true,
            el: ".hero-pagination",
            bulletClass: "hero-bullet",
            bulletActiveClass: "hero-bullet-active",
          }}
          className="w-full"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="w-full min-h-[520px] md:min-h-[600px] lg:min-h-[680px] bg-[#f8f8fb]">
                <Container className="h-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12 min-h-[520px] md:min-h-[600px] lg:min-h-[680px] py-10 md:py-14">
                    <div className="order-2 lg:order-1 text-center lg:text-left relative z-10">
                      <p className="hero-badge">{slide.badge}</p>
                      <h1 className="hero-title">
                        {slide.title} <span>{slide.highlight}</span>
                        <br />
                        {slide.subtitle}
                      </h1>
                      <Link href="/shop/left-sidebar-col-3" className="bb-btn-1 hero-cta">
                        Shop Now
                      </Link>
                    </div>

                    <div className="order-1 lg:order-2 flex justify-center lg:justify-end relative">
                      <HeroParallaxImage
                        src={slide.image}
                        alt={slide.alt}
                        priority={slide.id === 1}
                      />
                    </div>
                  </div>
                </Container>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="hero-pagination-wrap">
          <Container>
            <div className="hero-pagination" />
          </Container>
        </div>
      </div>
    </section>
  );
}

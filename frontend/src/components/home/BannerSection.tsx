import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";

const banners = [
  {
    id: 1,
    title: "Bold",
    highlight: "Tiger",
    subtitle: "Shop motivational graphic drops",
    image: "/hero/hero-1.png",
    href: "/shop/left-sidebar-col-3",
  },
  {
    id: 2,
    title: "Sunshine",
    highlight: "Beach",
    subtitle: "Flat 30% Off on summer vibes tees",
    image: "/hero/hero-2.png",
    href: "/shop/left-sidebar-col-3",
  },
];

export default function BannerSection() {
  return (
    <section className="py-10 md:py-12">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="group relative overflow-hidden rounded-[20px] min-h-[240px] md:min-h-[280px] bg-[#f8f8fb] border border-[#eee]"
            >
              <div className="absolute inset-0 flex items-center justify-end pr-2 md:pr-4">
                <div className="relative w-[55%] h-[90%]">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-contain object-center transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 30vw"
                  />
                </div>
              </div>
              <div className="relative z-10 flex flex-col justify-center h-full p-6 md:p-8 max-w-[55%]">
                <p className="text-sm text-[#777] mb-2">{banner.subtitle}</p>
                <h3 className="text-2xl md:text-[28px] font-semibold leading-snug mb-5 text-[#3d4750]">
                  {banner.title}{" "}
                  <span className="text-bb-primary">{banner.highlight}</span>
                </h3>
                <Link href={banner.href} className="bb-btn-1 w-fit">
                  Shop Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

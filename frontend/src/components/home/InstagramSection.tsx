import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";

const instagramImages = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1498557850523-fd3d7ee50f91?auto=format&fit=crop&w=400&h=400&q=80",
    alt: "Fresh blueberries",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=400&h=400&q=80",
    alt: "Organic tomatoes",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&h=400&q=80",
    alt: "Crispy snacks",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=400&h=400&q=80",
    alt: "Healthy breakfast bowl",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&h=400&q=80",
    alt: "Kitchen spices",
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&h=400&q=80",
    alt: "Fresh fruits",
  },
];

export default function InstagramSection() {
  return (
    <section className="py-10 md:py-12 bg-bb-soft/40">
      <Container>
        <SectionTitle
          title="#ClassicWay"
          highlight="Instagram"
          subtitle="Follow us for daily fresh food inspiration"
          right={
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-bb-primary hover:underline"
            >
              <i className="ri-instagram-line mr-1" />
              @classicway
            </a>
          }
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {instagramImages.map((item) => (
            <Link
              key={item.id}
              href="/shop/left-sidebar-col-3"
              className="group relative aspect-square overflow-hidden rounded-xl bg-bb-soft"
            >
              <Image
                src={item.image}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 16vw"
              />
              <div className="absolute inset-0 bg-bb-primary/0 group-hover:bg-bb-primary/40 transition-colors duration-300 flex items-center justify-center">
                <i className="ri-instagram-line text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

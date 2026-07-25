import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";

const bannerThree = [
  {
    id: 1,
    title: "School bags & Office Bags",
    desc: "Standard leather School & office bag",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&h=400&q=80",
  },
  {
    id: 2,
    title: "Cosmetics & makeup kits",
    desc: "Natural beauty and cosmetics.",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&h=400&q=80",
  },
];

export default function FashionBanners() {
  return (
    <>
      <section className="section-banner-three padding-tb-50">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bannerThree.map((b) => (
              <div key={b.id} className="banner-box-three">
                <div className="inner-banner-box-three">
                  <div className="side-image">
                    <Image
                      src={b.image}
                      alt={b.title}
                      width={280}
                      height={280}
                      className="object-contain"
                    />
                  </div>
                  <div className="inner-contact">
                    <h5>{b.title}</h5>
                    <p>{b.desc}</p>
                    <Link href="/shop/left-sidebar-col-3" className="bb-btn-1">
                      Shop Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="section-banner-four margin-tb-50">
        <Container>
          <div
            className="banner-justify-box-contact"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(61,71,80,0.15), rgba(61,71,80,0.05)), url(/tshirts/IMG_5701.PNG)",
            }}
          >
            <div className="banner-four-box">
              <span>35% Off</span>
              <h4>Women&apos;s Trendy Fashion Clothes</h4>
              <Link href="/shop/left-sidebar-col-3" className="bb-btn-1">
                Shop Now
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

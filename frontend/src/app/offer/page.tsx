import Link from "next/link";
import Image from "next/image";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";

export default function OfferPage() {
  return (
    <>
      <Breadcrumb title="Offers" items={[{ label: "Offers" }]} />
      <Container className="pb-16">
        <div className="relative h-56 md:h-72 rounded-xl overflow-hidden mb-10">
          <Image
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&h=400&q=80"
            alt="Special offers"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-bb-primary/80 flex items-center justify-center text-center text-white px-4">
            <div>
              <p className="text-sm uppercase tracking-widest mb-2">Limited Time</p>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Flat 50% Off</h2>
              <p className="text-sm opacity-90 mb-4">On selected grocery items this week</p>
              <Link href="/shop/left-sidebar-col-3" className="bb-btn bg-white text-bb-primary hover:bg-bb-soft">
                Shop Now
              </Link>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Fresh Fruits", discount: "30% OFF", code: "FRUIT30" },
            { title: "Organic Veggies", discount: "25% OFF", code: "VEGGIE25" },
            { title: "Snacks & Drinks", discount: "20% OFF", code: "SNACK20" },
          ].map((offer) => (
            <div key={offer.code} className="border border-bb-border rounded-xl p-6 bg-white text-center">
              <h3 className="font-semibold text-lg mb-2">{offer.title}</h3>
              <p className="text-2xl font-bold text-bb-primary mb-3">{offer.discount}</p>
              <p className="text-xs text-bb-muted mb-4">
                Use code: <strong className="text-bb-text">{offer.code}</strong>
              </p>
              <Link href="/shop/left-sidebar-col-3" className="bb-btn bb-btn-2 text-sm">
                View Products
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}

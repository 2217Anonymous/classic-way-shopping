import Image from "next/image";
import Link from "next/link";
import { vendors } from "@/data";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";

export default function VendorsSection() {
  return (
    <section className="py-10 md:py-12">
      <Container>
        <SectionTitle
          title="Top"
          highlight="Vendors"
          subtitle="Shop from trusted grocery partners near you"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {vendors.map((vendor) => (
            <Link
              key={vendor.id}
              href="/shop/left-sidebar-col-3"
              className="group overflow-hidden rounded-2xl border border-bb-border bg-white hover:shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-bb-soft">
                <Image
                  src={vendor.image}
                  alt={vendor.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
              <div className="p-4 text-center">
                <h5 className="text-base font-medium text-bb-text group-hover:text-bb-primary transition-colors">
                  {vendor.name}
                </h5>
                <p className="text-sm text-bb-muted mt-1">{vendor.products} Products</p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

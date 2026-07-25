import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";

export default function TermsPage() {
  return (
    <>
      <Breadcrumb title="Terms & Conditions" items={[{ label: "Terms & Conditions" }]} />
      <Container className="pb-16">
        <div className="max-w-3xl mx-auto space-y-6 text-sm text-bb-muted leading-relaxed">
          <section>
            <h3 className="text-lg font-semibold text-bb-text mb-2">1. Introduction</h3>
            <p>
              By accessing and using the BlueBerry website, you accept and agree to be bound by these Terms and
              Conditions. Please read them carefully before placing an order.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-bb-text mb-2">2. Orders & Payment</h3>
            <p>
              All orders are subject to availability and confirmation of the order price. We accept major credit cards,
              UPI, net banking, and cash on delivery in eligible areas.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-bb-text mb-2">3. Shipping & Delivery</h3>
            <p>
              Delivery times vary by location. Same-day delivery is available in select cities for orders placed before
              2 PM. Perishable items are handled with care to maintain freshness.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-bb-text mb-2">4. Returns & Refunds</h3>
            <p>
              Perishable products may be returned within 24 hours of delivery if quality issues are reported with
              supporting photos. Non-perishable items can be returned within 7 days in original packaging.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-bb-text mb-2">5. Privacy</h3>
            <p>
              Your personal information is used solely to process orders and improve our services. We do not sell your
              data to third parties.
            </p>
          </section>
        </div>
      </Container>
    </>
  );
}

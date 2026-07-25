import Container from "@/components/ui/Container";

const services = [
  {
    id: 1,
    icon: "ri-truck-line",
    title: "Free Shipping",
    description: "Free delivery on orders over $50 in selected areas.",
  },
  {
    id: 2,
    icon: "ri-customer-service-2-line",
    title: "24/7 Support",
    description: "Our support team is always ready to help you shop.",
  },
  {
    id: 3,
    icon: "ri-refresh-line",
    title: "30 Days Return",
    description: "Easy returns within 30 days on eligible products.",
  },
  {
    id: 4,
    icon: "ri-shield-check-line",
    title: "Payment Secure",
    description: "Your payment information is encrypted and safe.",
  },
];

export default function ServicesSection() {
  return (
    <section className="py-10 md:py-12 border-y border-bb-border bg-bb-soft/40">
      <Container>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-start gap-4 rounded-xl bg-white border border-bb-border p-5 hover:shadow-md transition-shadow duration-300"
            >
              <div className="shrink-0 w-14 h-14 rounded-full bg-bb-primary/10 text-bb-primary flex items-center justify-center text-2xl">
                <i className={service.icon} />
              </div>
              <div>
                <h4 className="text-base font-semibold text-bb-text mb-1">{service.title}</h4>
                <p className="text-sm text-bb-muted leading-relaxed">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

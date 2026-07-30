import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";

export default function AboutUsPage() {
  return (
    <>
      <Breadcrumb title="About Us" items={[{ label: "About Us" }]} />
      <Container className="pb-16">
        <div className="max-w-3xl mx-auto space-y-6 text-bb-muted leading-relaxed">
          <p>
            Welcome to <strong className="text-bb-text">Classic Way</strong>, your trusted online fashion destination.
            We bring fresh, organic, and quality products directly from farms and trusted vendors to your doorstep.
          </p>
          <p>
            Our mission is to make healthy eating accessible and convenient for every household. From seasonal fruits
            and vegetables to pantry staples, spices, and snacks — we curate the best for you.
          </p>
          <h3 className="text-xl font-semibold text-bb-text pt-4">Why Choose Us?</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Fresh products sourced from verified vendors</li>
            <li>Fast and reliable delivery</li>
            <li>Competitive prices with regular offers</li>
            <li>Easy returns on quality issues</li>
          </ul>
        </div>
      </Container>
    </>
  );
}

import Link from "next/link";
import Container from "@/components/ui/Container";

const brandDirectory = [
  {
    label: "Vegetables",
    links: ["Tomato", "Potato", "Onion", "Carrot", "Spinach", "Broccoli", "Cabbage", "Peas"],
  },
  {
    label: "Fruits",
    links: ["Apple", "Mango", "Banana", "Orange", "Grapes", "Cherry", "Blueberry", "Guava"],
  },
  {
    label: "Dairy",
    links: ["Milk", "Cheese", "Butter", "Yogurt", "Cream", "Paneer"],
  },
  {
    label: "Snacks",
    links: ["Chips", "Cookies", "Nuts", "Crackers", "Popcorn", "Granola", "Trail Mix"],
  },
];

const footerColumns = {
  category: [
    { label: "Dairy & Milk", href: "/shop/left-sidebar-col-3" },
    { label: "Snack & Spice", href: "/shop/banner-left-sidebar-col-3" },
    { label: "Fast Food", href: "/shop/full-width-col-5" },
    { label: "Juice & Drinks", href: "/shop/list-left-sidebar" },
    { label: "Bakery", href: "/shop/list-full-col-2" },
    { label: "Seafood", href: "/shop/banner-right-sidebar-col-4" },
  ],
  company: [
    { label: "About us", href: "/about-us" },
    { label: "Delivery", href: "/track-order" },
    { label: "Legal Notice", href: "/faq" },
    { label: "Terms & conditions", href: "/terms" },
    { label: "Secure payment", href: "/checkout" },
    { label: "Contact us", href: "/contact-us" },
  ],
  account: [
    { label: "Sign In", href: "/login" },
    { label: "View Cart", href: "/cart" },
    { label: "Return Policy", href: "/faq" },
    { label: "Become a Vendor", href: "/shop/left-sidebar-col-3" },
    { label: "Affiliate Program", href: "/product/left-sidebar" },
    { label: "Payments", href: "/checkout" },
  ],
};

const socialLinks = [
  { icon: "ri-facebook-fill", href: "#" },
  { icon: "ri-twitter-fill", href: "#" },
  { icon: "ri-linkedin-fill", href: "#" },
  { icon: "ri-instagram-line", href: "#" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-bb-border bg-bb-soft">
      <div className="py-12 border-b border-bb-border">
        <Container>
          <h4 className="text-lg font-semibold text-bb-text mb-6">Brands Directory</h4>
          <div className="grid lg:grid-cols-2 gap-6">
            {brandDirectory.map((group) => (
              <div key={group.label} className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm">
                <span className="font-semibold text-bb-text mr-1">{group.label} :</span>
                {group.links.map((link, i) => (
                  <span key={link} className="inline-flex items-center">
                    <Link
                      href="/shop/left-sidebar-col-3"
                      className="text-bb-muted hover:text-bb-primary transition-colors"
                    >
                      {link}
                    </Link>
                    {i < group.links.length - 1 && (
                      <span className="text-bb-muted mx-1">|</span>
                    )}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </Container>
      </div>

      <div className="py-12">
        <Container>
          <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-3">
              <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-bb-primary">
                <i className="ri-shopping-basket-2-fill text-2xl" />
                BlueBerry
              </Link>
              <p className="text-sm text-bb-muted mt-4 leading-relaxed">
                BlueBerry is the biggest market of grocery products. Get your daily needs from our store.
              </p>
              <div className="flex gap-3 mt-5">
                <span className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-bb-border rounded-md text-xs text-bb-muted">
                  <i className="ri-google-play-fill text-lg" /> Google Play
                </span>
                <span className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-bb-border rounded-md text-xs text-bb-muted">
                  <i className="ri-apple-fill text-lg" /> App Store
                </span>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-semibold text-bb-text mb-4">Category</h4>
              <ul className="space-y-2">
                {footerColumns.category.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-bb-muted hover:text-bb-primary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-semibold text-bb-text mb-4">Company</h4>
              <ul className="space-y-2">
                {footerColumns.company.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-bb-muted hover:text-bb-primary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <h4 className="font-semibold text-bb-text mb-4">Account</h4>
              <ul className="space-y-2">
                {footerColumns.account.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-bb-muted hover:text-bb-primary transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3">
              <h4 className="font-semibold text-bb-text mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-bb-muted">
                <li className="flex gap-3">
                  <i className="ri-map-pin-line text-bb-primary mt-0.5 shrink-0" />
                  <span>971 Lajamni, Motavarachha, Surat, Gujarat, Bharat 394101.</span>
                </li>
                <li className="flex gap-3">
                  <i className="ri-whatsapp-line text-bb-primary shrink-0" />
                  <a href="tel:+009876543210" className="hover:text-bb-primary transition-colors">
                    +00 9876543210
                  </a>
                </li>
                <li className="flex gap-3">
                  <i className="ri-mail-line text-bb-primary shrink-0" />
                  <a href="mailto:example@email.com" className="hover:text-bb-primary transition-colors">
                    example@email.com
                  </a>
                </li>
              </ul>
              <div className="flex gap-2 mt-5">
                {socialLinks.map((social) => (
                  <a
                    key={social.icon}
                    href={social.href}
                    className="w-9 h-9 rounded-full border border-bb-border bg-white flex items-center justify-center text-bb-muted hover:bg-bb-primary hover:text-white hover:border-bb-primary transition-colors"
                    aria-label="Social link"
                  >
                    <i className={social.icon} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </div>

      <div className="border-t border-bb-border py-5 bg-white">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-bb-muted">
            <p>
              Copyright © {year}{" "}
              <Link href="/" className="text-bb-primary font-medium hover:underline">
                BlueBerry
              </Link>{" "}
              all rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <i className="ri-visa-line text-xl" />
              <i className="ri-mastercard-line text-xl" />
              <i className="ri-paypal-line text-xl" />
              <i className="ri-bank-card-line text-xl" />
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}

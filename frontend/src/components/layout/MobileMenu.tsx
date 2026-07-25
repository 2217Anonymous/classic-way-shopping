"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeMobileMenu } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";

type NavLink = { label: string; href: string };
type NavGroup = { label: string; links: NavLink[] };

const shopGroups: NavGroup[] = [
  {
    label: "Classic",
    links: [
      { label: "Left sidebar 3 column", href: "/shop/left-sidebar-col-3" },
      { label: "Left sidebar 4 column", href: "/shop/left-sidebar-col-4" },
      { label: "Right sidebar 3 column", href: "/shop/right-sidebar-col-3" },
      { label: "Right sidebar 4 column", href: "/shop/right-sidebar-col-4" },
      { label: "Full width 4 column", href: "/shop/full-width" },
    ],
  },
  {
    label: "Banner",
    links: [
      { label: "Left sidebar 3 column", href: "/shop/banner-left-sidebar-col-3" },
      { label: "Left sidebar 4 column", href: "/shop/banner-left-sidebar-col-4" },
      { label: "Right sidebar 3 column", href: "/shop/banner-right-sidebar-col-3" },
      { label: "Right sidebar 4 column", href: "/shop/banner-right-sidebar-col-4" },
      { label: "Full width 4 column", href: "/shop/banner-full-width" },
    ],
  },
  {
    label: "Columns",
    links: [
      { label: "3 Columns full width", href: "/shop/full-width-col-3" },
      { label: "4 Columns full width", href: "/shop/full-width-col-4" },
      { label: "5 Columns full width", href: "/shop/full-width-col-5" },
      { label: "6 Columns full width", href: "/shop/full-width-col-6" },
      { label: "Banner 3 Columns", href: "/shop/banner-full-width-col-3" },
    ],
  },
  {
    label: "List",
    links: [
      { label: "Shop left sidebar", href: "/shop/list-left-sidebar" },
      { label: "Shop right sidebar", href: "/shop/list-right-sidebar" },
      { label: "Banner left sidebar", href: "/shop/list-banner-left-sidebar" },
      { label: "Banner right sidebar", href: "/shop/list-banner-right-sidebar" },
      { label: "Full width 2 columns", href: "/shop/list-full-col-2" },
    ],
  },
];

const productGroups: NavGroup[] = [
  {
    label: "Product page",
    links: [
      { label: "Product left sidebar", href: "/product/left-sidebar" },
      { label: "Product right sidebar", href: "/product/right-sidebar" },
    ],
  },
  {
    label: "Product Accordion",
    links: [
      { label: "Left sidebar", href: "/product/accordion-left-sidebar" },
      { label: "Right sidebar", href: "/product/accordion-right-sidebar" },
    ],
  },
];

const productLinks: NavLink[] = [
  { label: "Product full width", href: "/product/full-width" },
  { label: "Accordion full width", href: "/product/accordion-full-width" },
];

const pageLinks: NavLink[] = [
  { label: "About Us", href: "/about-us" },
  { label: "Contact Us", href: "/contact-us" },
  { label: "Cart", href: "/cart" },
  { label: "Checkout", href: "/checkout" },
  { label: "Compare", href: "/compare" },
  { label: "Faq", href: "/faq" },
  { label: "Login", href: "/login" },
  { label: "Register", href: "/register" },
  { label: "Wishlist", href: "/wishlist" },
  { label: "Terms", href: "/terms" },
  { label: "Track Order", href: "/track-order" },
  { label: "Offer", href: "/offer" },
];

const blogLinks: NavLink[] = [
  { label: "Left Sidebar", href: "/blog/left-sidebar" },
  { label: "Right Sidebar", href: "/blog/right-sidebar" },
  { label: "Full Width", href: "/blog/full-width" },
  { label: "Detail Left Sidebar", href: "/blog/detail-left-sidebar" },
  { label: "Detail Right Sidebar", href: "/blog/detail-right-sidebar" },
  { label: "Detail Full Width", href: "/blog/detail-full-width" },
];

const homeLinks: NavLink[] = [
  { label: "Grocery", href: "/" },
  { label: "Fashion", href: "/demo-2" },
];

function AccordionItem({
  label,
  children,
  open,
  onToggle,
}: {
  label: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="border-b border-bb-border">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full py-3 text-left font-medium text-bb-text hover:text-bb-primary transition-colors"
      >
        {label}
        <i className={cn("ri-arrow-down-s-line transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="pb-3 pl-3">{children}</div>}
    </li>
  );
}

function NestedAccordion({
  group,
  onNavigate,
}: {
  group: NavGroup;
  onNavigate: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <AccordionItem label={group.label} open={open} onToggle={() => setOpen(!open)}>
      <ul className="space-y-2">
        {group.links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              onClick={onNavigate}
              className="text-sm text-bb-muted hover:text-bb-primary block py-1"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </AccordionItem>
  );
}

export default function MobileMenu() {
  const dispatch = useAppDispatch();
  const open = useAppSelector((state) => state.ui.mobileMenuOpen);
  const [homeOpen, setHomeOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [blogOpen, setBlogOpen] = useState(false);

  const close = () => dispatch(closeMobileMenu());

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[85] bg-black/50" onClick={close} aria-hidden />
      <aside
        className="fixed top-0 left-0 z-[86] h-full w-full max-w-xs bg-white shadow-2xl flex flex-col"
        role="dialog"
        aria-modal
        aria-label="Mobile menu"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-bb-border">
          <span className="font-semibold text-bb-text">My Menu</span>
          <button
            type="button"
            onClick={close}
            className="w-9 h-9 flex items-center justify-center text-2xl hover:text-bb-primary transition-colors"
            aria-label="Close menu"
          >
            <i className="ri-close-line" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4">
          <ul>
            <AccordionItem label="Home" open={homeOpen} onToggle={() => setHomeOpen(!homeOpen)}>
              <ul className="space-y-2">
                {homeLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} onClick={close} className="text-sm text-bb-muted hover:text-bb-primary block py-1">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </AccordionItem>

            <AccordionItem label="Categories" open={shopOpen} onToggle={() => setShopOpen(!shopOpen)}>
              <ul>
                {shopGroups.map((group) => (
                  <NestedAccordion key={group.label} group={group} onNavigate={close} />
                ))}
              </ul>
            </AccordionItem>

            <AccordionItem label="Products" open={productOpen} onToggle={() => setProductOpen(!productOpen)}>
              <ul>
                {productGroups.map((group) => (
                  <NestedAccordion key={group.label} group={group} onNavigate={close} />
                ))}
                {productLinks.map((link) => (
                  <li key={link.href} className="py-1">
                    <Link href={link.href} onClick={close} className="text-sm text-bb-muted hover:text-bb-primary block py-1">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </AccordionItem>

            <AccordionItem label="Pages" open={pagesOpen} onToggle={() => setPagesOpen(!pagesOpen)}>
              <ul className="space-y-2">
                {pageLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} onClick={close} className="text-sm text-bb-muted hover:text-bb-primary block py-1">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </AccordionItem>

            <AccordionItem label="Blog" open={blogOpen} onToggle={() => setBlogOpen(!blogOpen)}>
              <ul className="space-y-2">
                {blogLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} onClick={close} className="text-sm text-bb-muted hover:text-bb-primary block py-1">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </AccordionItem>

            <li className="border-b border-bb-border">
              <Link
                href="/offer"
                onClick={close}
                className="flex items-center gap-2 py-3 font-medium text-bb-text hover:text-bb-primary transition-colors"
              >
                <i className="ri-shield-check-line text-bb-accent" />
                Offers
              </Link>
            </li>
          </ul>
        </nav>

        <div className="px-4 py-4 border-t border-bb-border">
          <div className="flex gap-3 justify-center">
            {["ri-facebook-fill", "ri-twitter-fill", "ri-instagram-line", "ri-linkedin-fill"].map((icon) => (
              <a
                key={icon}
                href="#"
                className="w-9 h-9 rounded-full border border-bb-border flex items-center justify-center text-bb-muted hover:bg-bb-primary hover:text-white hover:border-bb-primary transition-colors"
              >
                <i className={icon} />
              </a>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}

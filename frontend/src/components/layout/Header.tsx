"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import { listCategories } from "@/services/categories";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCartCount } from "@/store/slices/cartSlice";
import { selectWishlistCount } from "@/store/slices/wishlistSlice";
import {
  openCart,
  toggleCategory,
  toggleMobileMenu,
  setSearchQuery,
} from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";
import type { Category } from "@/types";

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

function DropdownMenu({
  label,
  children,
  className,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li className="relative group">
      <span className="flex items-center gap-1 px-4 py-4 text-sm font-medium text-bb-text cursor-pointer hover:text-bb-primary transition-colors">
        {label}
        <i className="ri-arrow-down-s-line text-base" />
      </span>
      <ul
        className={cn(
          "absolute top-full left-0 min-w-[220px] bg-white border border-bb-border rounded-md shadow-lg py-2",
          "opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50",
          className
        )}
      >
        {children}
      </ul>
    </li>
  );
}

function MegaMenu({ groups }: { groups: NavGroup[] }) {
  return (
    <li className="relative group">
      <span className="flex items-center gap-1 px-4 py-4 text-sm font-medium text-bb-text cursor-pointer hover:text-bb-primary transition-colors">
        Categories
        <i className="ri-arrow-down-s-line text-base" />
      </span>
      <div className="absolute top-full left-0 bg-white border border-bb-border rounded-md shadow-xl p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="grid grid-cols-4 gap-8 min-w-[720px]">
          {groups.map((group) => (
            <div key={group.label}>
              <h6 className="text-sm font-semibold text-bb-text mb-3 pb-2 border-b border-bb-border">
                {group.label}
              </h6>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-bb-muted hover:text-bb-primary transition-colors block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </li>
  );
}

export default function Header() {
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const wishlistCount = useAppSelector(selectWishlistCount);
  const [search, setSearch] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [langOpen, setLangOpen] = useState(false);
  const [currOpen, setCurrOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await listCategories();
        if (!cancelled) setCategories(items);
      } catch {
        if (!cancelled) setCategories([]);
      } finally {
        if (!cancelled) setCategoriesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    dispatch(setSearchQuery(search));
  };

  return (
    <header className="bb-header sticky top-0 z-40 bg-white shadow-sm">
      {/* Top bar — dark like reference */}
      <div className="top-header hidden md:block bg-[var(--bb-topbar)]">
        <Container>
          <div className="flex items-center justify-between py-[6px] text-sm">
            <Link
              href="/shop/left-sidebar-col-3"
              className="text-white font-normal hover:text-bb-primary transition-colors"
            >
              Flat 50% Off On Grocery Shop.
            </Link>
            <div className="flex items-center">
              <Link
                href="/faq"
                className="px-3 text-white hover:text-bb-primary transition-colors"
              >
                Help?
              </Link>
              <Link
                href="/track-order"
                className="px-3 text-white hover:text-bb-primary transition-colors"
              >
                Track Order
              </Link>
              <div className="relative px-3">
                <button
                  type="button"
                  onClick={() => {
                    setLangOpen(!langOpen);
                    setCurrOpen(false);
                  }}
                  className="flex items-center gap-1 text-white hover:text-bb-primary transition-colors"
                >
                  Language <i className="ri-arrow-down-s-line" />
                </button>
                {langOpen && (
                  <ul className="absolute top-full right-0 mt-1 min-w-[120px] bg-white border border-bb-border rounded-md shadow-lg py-1 z-50">
                    {["English", "Hindi", "Gujarati"].map((lang) => (
                      <li key={lang}>
                        <button
                          type="button"
                          onClick={() => setLangOpen(false)}
                          className="block w-full text-left px-4 py-2 text-sm text-bb-muted hover:bg-bb-soft hover:text-bb-primary"
                        >
                          {lang}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="relative px-3">
                <button
                  type="button"
                  onClick={() => {
                    setCurrOpen(!currOpen);
                    setLangOpen(false);
                  }}
                  className="flex items-center gap-1 text-white hover:text-bb-primary transition-colors"
                >
                  Currency <i className="ri-arrow-down-s-line" />
                </button>
                {currOpen && (
                  <ul className="absolute top-full right-0 mt-1 min-w-[100px] bg-white border border-bb-border rounded-md shadow-lg py-1 z-50">
                    {["USD $", "EUR €"].map((curr) => (
                      <li key={curr}>
                        <button
                          type="button"
                          onClick={() => setCurrOpen(false)}
                          className="block w-full text-left px-4 py-2 text-sm text-bb-muted hover:bg-bb-soft hover:text-bb-primary"
                        >
                          {curr}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main header — logo / search / actions */}
      <div className="bottom-header border-b border-bb-border">
        <Container>
          <div className="flex items-center gap-4 py-4 lg:py-5">
            <div className="flex items-center gap-3 shrink-0">
              <Link href="/" className="inline-flex items-center gap-2">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-bb-primary/15 text-bb-primary">
                  <i className="ri-shopping-basket-2-fill text-2xl" />
                </span>
                <span className="hidden sm:inline text-[22px] font-bold leading-none tracking-tight">
                  <span className="text-bb-primary">Blue</span>
                  <span className="text-bb-text">Berry</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => dispatch(toggleCategory())}
                className="hidden xl:flex items-center justify-center w-11 h-11 rounded-[10px] border border-bb-primary/40 text-bb-primary hover:bg-bb-primary hover:text-white transition-colors"
                aria-label="Toggle categories"
              >
                <i className="ri-layout-grid-line text-lg" />
              </button>
            </div>

            {/* Tall search — matches reference height (~50px) */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-[640px] mx-auto items-center h-[50px] border border-[#eee] rounded-[10px] overflow-hidden bg-white"
            >
              <div className="h-full flex items-center border-r border-[#eee] bg-transparent shrink-0">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="h-full px-4 text-sm text-bb-muted outline-none cursor-pointer bg-transparent min-w-[130px]"
                  aria-label="Search category"
                >
                  <option value="">All Categories</option>
                  {categoriesLoading && categories.length === 0 ? (
                    <option value="" disabled>
                      Loading...
                    </option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="flex-1 h-full px-4 text-sm outline-none bg-transparent min-w-0 text-bb-text placeholder:text-bb-muted"
              />
              <button
                type="submit"
                className="h-full px-5 text-bb-primary hover:text-bb-primary-dark transition-colors shrink-0"
                aria-label="Search"
              >
                <i className="ri-search-line text-xl" />
              </button>
            </form>

            <div className="flex items-center gap-1 sm:gap-3 ml-auto shrink-0">
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(!accountOpen);
                    setLangOpen(false);
                    setCurrOpen(false);
                  }}
                  className="flex items-center gap-2 px-1 py-1 rounded-md hover:text-bb-primary transition-colors"
                >
                  <span className="w-8 h-8 flex items-center justify-center text-bb-primary">
                    <i className="ri-user-3-line text-[26px]" />
                  </span>
                  <span className="hidden lg:flex flex-col text-left text-xs leading-tight">
                    <span className="font-medium text-bb-text text-[13px]">Account</span>
                    <span className="text-bb-muted">Login</span>
                  </span>
                </button>
                {accountOpen && (
                  <ul className="absolute top-full right-0 mt-1 min-w-[160px] bg-white border border-bb-border rounded-md shadow-lg py-1 z-50">
                    <li>
                      <Link href="/register" className="block px-4 py-2 text-sm hover:bg-bb-soft hover:text-bb-primary" onClick={() => setAccountOpen(false)}>
                        Register
                      </Link>
                    </li>
                    <li>
                      <Link href="/checkout" className="block px-4 py-2 text-sm hover:bg-bb-soft hover:text-bb-primary" onClick={() => setAccountOpen(false)}>
                        Checkout
                      </Link>
                    </li>
                    <li>
                      <Link href="/login" className="block px-4 py-2 text-sm hover:bg-bb-soft hover:text-bb-primary" onClick={() => setAccountOpen(false)}>
                        Login
                      </Link>
                    </li>
                  </ul>
                )}
              </div>

              <Link
                href="/wishlist"
                className="flex items-center gap-2 px-1 py-1 rounded-md hover:text-bb-primary transition-colors"
                title="Wishlist"
              >
                <span className="relative w-8 h-8 flex items-center justify-center text-bb-primary">
                  <i className="ri-star-line text-[26px]" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-bb-primary text-white text-[10px] font-medium flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </span>
                <span className="hidden lg:flex flex-col text-left text-xs leading-tight">
                  <span className="font-medium text-bb-text text-[13px]">
                    <b>{wishlistCount}</b> Items
                  </span>
                  <span className="text-bb-muted">Wishlist</span>
                </span>
              </Link>

              <button
                type="button"
                onClick={() => dispatch(openCart())}
                className="flex items-center gap-2 px-1 py-1 rounded-md hover:text-bb-primary transition-colors"
                title="Cart"
              >
                <span className="relative w-8 h-8 flex items-center justify-center text-bb-primary">
                  <i className="ri-shopping-cart-2-line text-[26px]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-bb-primary text-white text-[10px] font-medium flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </span>
                <span className="hidden lg:flex flex-col text-left text-xs leading-tight">
                  <span className="font-medium text-bb-text text-[13px]">
                    <b>{cartCount}</b> Items
                  </span>
                  <span className="text-bb-muted">Cart</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => dispatch(toggleMobileMenu())}
                className="lg:hidden w-10 h-10 flex items-center justify-center rounded-md border border-bb-border hover:border-bb-primary hover:text-bb-primary transition-colors"
                aria-label="Toggle mobile menu"
              >
                <i className="ri-menu-3-fill text-xl" />
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* Desktop nav */}
      <nav className="hidden lg:block border-b border-bb-border bg-white">
        <Container>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => dispatch(toggleCategory())}
              className="flex items-center justify-center w-10 h-10 mr-3 rounded-[8px] border border-bb-primary/50 text-bb-primary hover:bg-bb-primary hover:text-white transition-colors shrink-0"
              aria-label="Categories"
            >
              <i className="ri-layout-grid-line" />
            </button>
            <ul className="flex items-center flex-1">
              <DropdownMenu label="Home">
                {homeLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block px-4 py-2 text-sm text-bb-muted hover:bg-bb-soft hover:text-bb-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </DropdownMenu>

              <MegaMenu groups={shopGroups} />

              <DropdownMenu label="Products">
                {productGroups.map((group) => (
                  <li key={group.label} className="relative group/sub">
                    <span className="flex items-center justify-between px-4 py-2 text-sm text-bb-muted hover:bg-bb-soft hover:text-bb-primary cursor-pointer">
                      {group.label}
                      <i className="ri-arrow-right-s-line" />
                    </span>
                    <ul className="absolute left-full top-0 min-w-[200px] bg-white border border-bb-border rounded-md shadow-lg py-1 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all">
                      {group.links.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="block px-4 py-2 text-sm text-bb-muted hover:bg-bb-soft hover:text-bb-primary"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
                {productLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block px-4 py-2 text-sm text-bb-muted hover:bg-bb-soft hover:text-bb-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </DropdownMenu>

              <DropdownMenu label="Pages">
                {pageLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block px-4 py-2 text-sm text-bb-muted hover:bg-bb-soft hover:text-bb-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </DropdownMenu>

              <DropdownMenu label="Blog">
                {blogLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block px-4 py-2 text-sm text-bb-muted hover:bg-bb-soft hover:text-bb-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </DropdownMenu>

              <li>
                <Link
                  href="/offer"
                  className="flex items-center gap-1.5 px-4 py-4 text-sm font-medium text-bb-text hover:text-bb-primary transition-colors"
                >
                  <i className="ri-shield-check-line text-bb-primary" />
                  Offers
                </Link>
              </li>
            </ul>

            <div className="flex items-center gap-2 pl-4 ml-2 border border-bb-border rounded-[10px] px-3 py-1.5 text-sm text-bb-muted">
              <i className="ri-map-pin-line text-bb-primary" />
              <select className="bg-transparent outline-none cursor-pointer text-bb-text" aria-label="Location">
                <option>Surat</option>
                <option>Delhi</option>
                <option>Rajkot</option>
                <option>Udaipur</option>
              </select>
            </div>
          </div>
        </Container>
      </nav>
    </header>
  );
}

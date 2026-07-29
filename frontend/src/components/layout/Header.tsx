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
  setSearchQuery,
} from "@/store/slices/uiSlice";
import { useTheme } from "@/hooks/useTheme";
import { resolveHomePath, resolveShopPath } from "@/lib/themeResolver";
import type { Category } from "@/types";

export default function Header() {
  const dispatch = useAppDispatch();
  const cartCount = useAppSelector(selectCartCount);
  const wishlistCount = useAppSelector(selectWishlistCount);
  const { theme } = useTheme();
  const homePath = resolveHomePath(theme);
  const shopPath = resolveShopPath(theme);
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
              href={shopPath}
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
              <Link href={homePath} className="inline-flex items-center gap-2">
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
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
}

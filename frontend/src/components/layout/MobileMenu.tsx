"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeMobileMenu } from "@/store/slices/uiSlice";
import {
  logout,
  selectAuthCustomer,
  selectIsAuthenticated,
} from "@/store/slices/authSlice";
import { useTheme } from "@/hooks/useTheme";
import {
  resolveHomePath,
  resolveShopPath,
  visiblePageLinks,
} from "@/lib/themeResolver";
import { cn } from "@/lib/utils";

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

export default function MobileMenu() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const open = useAppSelector((state) => state.ui.mobileMenuOpen);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const customer = useAppSelector(selectAuthCustomer);
  const { theme } = useTheme();
  const homePath = resolveHomePath(theme);
  const shopPath = resolveShopPath(theme);
  const pageLinks = visiblePageLinks(theme);
  const [pagesOpen, setPagesOpen] = useState(false);

  const close = () => dispatch(closeMobileMenu());

  const handleLogout = async () => {
    close();
    await dispatch(logout());
    router.push("/");
  };

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
          {isAuthenticated && (
            <div className="py-4 border-b border-bb-border">
              <p className="font-medium text-bb-text truncate">
                {customer?.full_name || customer?.email}
              </p>
              <p className="text-sm text-bb-muted truncate">{customer?.email}</p>
            </div>
          )}
          <ul>
            <li className="border-b border-bb-border">
              <Link
                href={homePath}
                onClick={close}
                className="flex items-center py-3 font-medium text-bb-text hover:text-bb-primary transition-colors"
              >
                Home
              </Link>
            </li>
            <li className="border-b border-bb-border">
              <Link
                href={shopPath}
                onClick={close}
                className="flex items-center py-3 font-medium text-bb-text hover:text-bb-primary transition-colors"
              >
                Shop
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                <li className="border-b border-bb-border">
                  <Link
                    href="/orders"
                    onClick={close}
                    className="flex items-center py-3 font-medium text-bb-text hover:text-bb-primary transition-colors"
                  >
                    My Orders
                  </Link>
                </li>
                <li className="border-b border-bb-border">
                  <Link
                    href="/profile"
                    onClick={close}
                    className="flex items-center py-3 font-medium text-bb-text hover:text-bb-primary transition-colors"
                  >
                    My Profile
                  </Link>
                </li>
                <li className="border-b border-bb-border">
                  <button
                    type="button"
                    onClick={() => void handleLogout()}
                    className="flex items-center w-full py-3 font-medium text-bb-text hover:text-bb-primary transition-colors"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="border-b border-bb-border">
                  <Link
                    href="/login"
                    onClick={close}
                    className="flex items-center py-3 font-medium text-bb-text hover:text-bb-primary transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li className="border-b border-bb-border">
                  <Link
                    href="/register"
                    onClick={close}
                    className="flex items-center py-3 font-medium text-bb-text hover:text-bb-primary transition-colors"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}

            {pageLinks.length > 0 && (
              <AccordionItem
                label="Pages"
                open={pagesOpen}
                onToggle={() => setPagesOpen(!pagesOpen)}
              >
                <ul className="space-y-2">
                  {pageLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={close}
                        className="text-sm text-bb-muted hover:text-bb-primary block py-1"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionItem>
            )}

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
            {["ri-facebook-fill", "ri-twitter-fill", "ri-instagram-line", "ri-linkedin-fill"].map(
              (icon) => (
                <a
                  key={icon}
                  href="#"
                  className="w-9 h-9 rounded-full border border-bb-border flex items-center justify-center text-bb-muted hover:bg-bb-primary hover:text-white hover:border-bb-primary transition-colors"
                >
                  <i className={icon} />
                </a>
              )
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

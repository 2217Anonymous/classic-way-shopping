"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setNewsletterOpen } from "@/store/slices/uiSlice";
import ThemeBootstrap from "@/components/theme/ThemeBootstrap";
import ThemeSettingsFab from "@/components/theme/ThemeSettingsFab";
import ThemeSettingsDrawer from "@/components/theme/ThemeSettingsDrawer";
import Header from "./Header";
import Footer from "./Footer";
import CartSidebar from "./CartSidebar";
import CategoryPopup from "./CategoryPopup";
import QuickViewModal from "./QuickViewModal";
import NewsletterModal from "./NewsletterModal";
import BackToTop from "./BackToTop";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    try {
      const seen = localStorage.getItem("bb-newsletter-seen");
      if (!seen) {
        const timer = setTimeout(() => {
          dispatch(setNewsletterOpen(true));
          localStorage.setItem("bb-newsletter-seen", "1");
        }, 4000);
        return () => clearTimeout(timer);
      }
    } catch {
      /* ignore storage errors */
    }
  }, [dispatch]);

  return (
    <>
      <ThemeBootstrap />
      <div className="no-print">
        <Header />
      </div>
      <main className="flex-1">{children}</main>
      <div className="no-print">
        <Footer />
        <CartSidebar />
        <CategoryPopup />
        <QuickViewModal />
        <NewsletterModal />
        <BackToTop />
        <ThemeSettingsFab />
        <ThemeSettingsDrawer />
      </div>
    </>
  );
}

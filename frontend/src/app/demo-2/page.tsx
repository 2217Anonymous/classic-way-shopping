"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import FashionCategories from "@/components/fashion/FashionCategories";
import FashionHero from "@/components/fashion/FashionHero";
import FashionDeal from "@/components/fashion/FashionDeal";
import FashionBanners from "@/components/fashion/FashionBanners";
import FashionProducts from "@/components/fashion/FashionProducts";
import ServicesSection from "@/components/home/ServicesSection";
import { useTheme } from "@/hooks/useTheme";

function FashionHome() {
  return (
    <>
      <FashionCategories />
      <FashionHero />
      <FashionDeal />
      <FashionBanners />
      <FashionProducts />
      <ServicesSection />
    </>
  );
}

/** Fashion home; redirects to grocery `/` when theme.home_theme is grocery. */
export default function Demo2Page() {
  const router = useRouter();
  const { theme, hydrated } = useTheme();

  useEffect(() => {
    if (!hydrated) return;
    if (theme.home_theme === "grocery") {
      router.replace("/");
    }
  }, [hydrated, theme.home_theme, router]);

  if (!hydrated || theme.home_theme === "grocery") {
    return <div className="py-20 text-center text-bb-muted">Loading...</div>;
  }

  return <FashionHome />;
}

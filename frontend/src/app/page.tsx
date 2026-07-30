"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HeroSlider from "@/components/home/HeroSlider";
import CategorySection from "@/components/home/CategorySection";
import DealSection from "@/components/home/DealSection";
import BannerSection from "@/components/home/BannerSection";
import ProductTabs from "@/components/home/ProductTabs";
import ServicesSection from "@/components/home/ServicesSection";
import VendorsSection from "@/components/home/VendorsSection";
import { useTheme } from "@/hooks/useTheme";

function GroceryHome() {
  return (
    <>
      <HeroSlider />
      <CategorySection />
      <DealSection />
      <BannerSection />
      <ProductTabs />
      <ServicesSection />
      <VendorsSection />
    </>
  );
}

/** Routes grocery vs fashion home based on theme.home_theme. */
export default function HomePage() {
  const router = useRouter();
  const { theme, hydrated } = useTheme();

  useEffect(() => {
    if (!hydrated) return;
    if (theme.home_theme === "fashion") {
      router.replace("/demo-2");
    }
  }, [hydrated, theme.home_theme, router]);

  if (!hydrated || theme.home_theme === "fashion") {
    return <div className="py-20 text-center text-bb-muted">Loading...</div>;
  }

  return <GroceryHome />;
}

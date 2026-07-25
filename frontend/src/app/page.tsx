import HeroSlider from "@/components/home/HeroSlider";
import CategorySection from "@/components/home/CategorySection";
import DealSection from "@/components/home/DealSection";
import BannerSection from "@/components/home/BannerSection";
import ProductTabs from "@/components/home/ProductTabs";
import ServicesSection from "@/components/home/ServicesSection";
import VendorsSection from "@/components/home/VendorsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import BlogSection from "@/components/home/BlogSection";
import InstagramSection from "@/components/home/InstagramSection";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <CategorySection />
      <DealSection />
      <BannerSection />
      <ProductTabs />
      <ServicesSection />
      <VendorsSection />
      <TestimonialsSection />
      <BlogSection />
      <InstagramSection />
    </>
  );
}

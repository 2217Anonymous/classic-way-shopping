import FashionCategories from "@/components/fashion/FashionCategories";
import FashionHero from "@/components/fashion/FashionHero";
import FashionDeal from "@/components/fashion/FashionDeal";
import FashionBanners from "@/components/fashion/FashionBanners";
import FashionProducts from "@/components/fashion/FashionProducts";
import ServicesSection from "@/components/home/ServicesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import BlogSection from "@/components/home/BlogSection";
import InstagramSection from "@/components/home/InstagramSection";

export default function Demo2Page() {
  return (
    <>
      <FashionCategories />
      <FashionHero />
      <FashionDeal />
      <FashionBanners />
      <FashionProducts />
      <ServicesSection />
      <TestimonialsSection />
      <BlogSection />
      <InstagramSection />
    </>
  );
}

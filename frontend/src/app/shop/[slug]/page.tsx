import { Suspense } from "react";
import { notFound } from "next/navigation";
import ShopPageView from "@/components/shop/ShopPageView";
import { SHOP_CONFIGS } from "@/lib/shopConfig";

export function generateStaticParams() {
  return Object.keys(SHOP_CONFIGS).map((slug) => ({ slug }));
}

export default async function ShopSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = SHOP_CONFIGS[slug];

  if (!config) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="py-20 text-center text-bb-muted">Loading shop...</div>}>
      <ShopPageView config={config} />
    </Suspense>
  );
}

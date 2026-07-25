import { redirect } from "next/navigation";
import { DEFAULT_SHOP_SLUG } from "@/lib/shopConfig";

export default function ShopIndexPage() {
  redirect(`/shop/${DEFAULT_SHOP_SLUG}`);
}

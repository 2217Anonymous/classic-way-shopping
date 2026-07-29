"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import { resolveShopPath } from "@/lib/themeResolver";

/** Client redirect to the theme-selected shop layout. */
export default function ShopIndexPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const target = resolveShopPath(theme);

  useEffect(() => {
    router.replace(target);
  }, [router, target]);

  return (
    <div className="py-20 text-center text-bb-muted">
      Redirecting to shop...
    </div>
  );
}

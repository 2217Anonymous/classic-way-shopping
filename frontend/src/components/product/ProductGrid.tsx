import { Product } from "@/types";
import ProductCard from "./ProductCard";
import { cn } from "@/lib/utils";

const colClasses: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  5: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
};

export default function ProductGrid({
  products,
  columns = 4,
  listView = false,
  className,
}: {
  products: Product[];
  columns?: 2 | 3 | 4 | 5 | 6;
  listView?: boolean;
  className?: string;
}) {
  if (listView) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} listView />
        ))}
      </div>
    );
  }

  return (
    <div className={cn("grid gap-4 md:gap-5", colClasses[columns], className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

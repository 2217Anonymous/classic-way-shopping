"use client";

import { cn } from "@/lib/utils";

export default function Rating({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-bb-warning text-sm", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <i
          key={i}
          className={i < Math.round(rating) ? "ri-star-fill" : "ri-star-line"}
        />
      ))}
    </span>
  );
}

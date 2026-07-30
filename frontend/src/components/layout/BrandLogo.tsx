import { cn } from "@/lib/utils";

export default function BrandLogo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center rounded-xl bg-bb-primary text-white shadow-sm",
          compact ? "h-9 w-9" : "h-11 w-11"
        )}
        aria-hidden="true"
      >
        <i className={cn("ri-shopping-bag-3-fill", compact ? "text-xl" : "text-2xl")} />
        <span className="absolute -bottom-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-bb-accent px-0.5 text-[8px] font-bold leading-none text-white">
          C
        </span>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "whitespace-nowrap font-bold tracking-tight",
            compact ? "text-xl" : "text-[23px]"
          )}
        >
          <span className="text-bb-primary">Classic</span>{" "}
          <span className="text-bb-text">Way</span>
        </span>
        <span className="mt-1 text-[8px] font-semibold uppercase tracking-[0.28em] text-bb-muted">
          Fashion Store
        </span>
      </span>
    </span>
  );
}

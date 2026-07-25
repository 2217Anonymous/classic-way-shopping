import { cn } from "@/lib/utils";

export default function SectionTitle({
  title,
  highlight,
  subtitle,
  className,
  right,
}: {
  title: string;
  highlight?: string;
  subtitle?: string;
  className?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        <h2 className="text-2xl md:text-[28px] font-semibold text-bb-text">
          {title}{" "}
          {highlight && <span className="text-bb-primary">{highlight}</span>}
        </h2>
        {subtitle && <p className="mt-1 text-bb-muted text-sm">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

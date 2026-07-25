"use client";

import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";
import ProductGrid from "@/components/product/ProductGrid";
import { getTrending } from "@/services/products";
import type { Product } from "@/types";

function getTimeLeft() {
  const now = new Date();
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const diff = end.getTime() - now.getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function TimerBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[56px] md:min-w-[64px]">
      <span className="text-xl md:text-2xl font-semibold text-bb-text bg-white rounded-lg px-3 py-2 shadow-sm border border-bb-border tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs text-bb-muted mt-1 uppercase tracking-wide">{label}</span>
    </div>
  );
}

const EMPTY_TIME = { days: 0, hours: 0, minutes: 0, seconds: 0 };

export default function DealSection() {
  const [timeLeft, setTimeLeft] = useState(EMPTY_TIME);
  const [mounted, setMounted] = useState(false);
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    setTimeLeft(getTimeLeft());
    const timer = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const items = await getTrending(4);
        if (!cancelled) setDealProducts(items);
      } catch {
        if (!cancelled) setDealProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-10 md:py-12 bg-bb-soft/60">
      <Container>
        <SectionTitle
          title="Day of the"
          highlight="deal"
          subtitle="Don't wait. The time will never be just right."
          right={
            <div
              className="flex items-center gap-2 md:gap-3"
              suppressHydrationWarning
              aria-hidden={!mounted}
            >
              <TimerBlock value={timeLeft.days} label="Days" />
              <span className="text-bb-primary font-bold pb-5">:</span>
              <TimerBlock value={timeLeft.hours} label="Hours" />
              <span className="text-bb-primary font-bold pb-5">:</span>
              <TimerBlock value={timeLeft.minutes} label="Mins" />
              <span className="text-bb-primary font-bold pb-5">:</span>
              <TimerBlock value={timeLeft.seconds} label="Secs" />
            </div>
          }
        />
        {loading ? (
          <p className="text-center text-bb-muted py-10">Loading deals...</p>
        ) : dealProducts.length > 0 ? (
          <ProductGrid products={dealProducts} columns={4} />
        ) : (
          <p className="text-center text-bb-muted py-10">No products yet</p>
        )}
      </Container>
    </section>
  );
}

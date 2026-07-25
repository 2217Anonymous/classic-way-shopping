"use client";

import { useState } from "react";
import { faqs } from "@/data";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";
import { cn } from "@/lib/utils";

export default function FaqPageContent() {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  return (
    <>
      <Breadcrumb title="FAQ" items={[{ label: "FAQ" }]} />
      <Container className="pb-16">
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="border border-bb-border rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium hover:bg-bb-soft transition-colors"
              >
                {faq.question}
                <i className={cn(openId === faq.id ? "ri-subtract-line" : "ri-add-line", "text-bb-primary")} />
              </button>
              {openId === faq.id && (
                <div className="px-5 pb-4 text-sm text-bb-muted border-t border-bb-border pt-4">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}

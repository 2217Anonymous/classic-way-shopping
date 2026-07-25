"use client";

import Image from "next/image";
import Link from "next/link";
import { blogs } from "@/data";
import type { BlogLayoutConfig } from "@/lib/shopConfig";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";
import BlogSidebar from "./BlogSidebar";
import { cn } from "@/lib/utils";

export default function BlogListView({ layout }: { layout: BlogLayoutConfig }) {
  const sidebar = layout.sidebar ?? "left";
  const sidebarNode = sidebar !== "none" ? <BlogSidebar className="lg:sticky lg:top-24" /> : null;

  return (
    <>
      <Breadcrumb title="Blog" items={[{ label: "Blog" }]} />

      <Container className="pb-16">
        <div
          className={cn(
            "grid gap-8",
            sidebar === "none" ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[280px_1fr]"
          )}
        >
          {sidebar === "left" && sidebarNode}

          <div className="space-y-8">
            {blogs.map((post) => (
              <article
                key={post.id}
                className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 border border-bb-border rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow"
              >
                <Link href={`/blog/${post.slug}`} className="relative h-48 md:h-full min-h-[200px]">
                  <Image src={post.image} alt={post.title} fill className="object-cover" sizes="280px" />
                </Link>
                <div className="p-5 md:p-6 flex flex-col justify-center">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-bb-muted mb-2">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.author}</span>
                    <span>•</span>
                    <span>{post.comments} Comments</span>
                  </div>
                  <h2 className="text-lg md:text-xl font-semibold mb-3">
                    <Link href={`/blog/${post.slug}`} className="hover:text-bb-primary">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-bb-muted mb-4 line-clamp-3">{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className="text-sm text-bb-primary font-medium inline-flex items-center gap-1">
                    Read More <i className="ri-arrow-right-line" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {sidebar === "right" && sidebarNode}
        </div>
      </Container>
    </>
  );
}

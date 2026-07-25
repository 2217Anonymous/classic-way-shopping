"use client";

import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/types";
import type { BlogLayoutConfig } from "@/lib/shopConfig";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Container from "@/components/ui/Container";
import BlogSidebar from "./BlogSidebar";
import { cn } from "@/lib/utils";

export default function BlogDetailView({
  post,
  layout,
}: {
  post: BlogPost;
  layout: BlogLayoutConfig;
}) {
  const sidebar = layout.sidebar ?? "right";
  const sidebarNode = sidebar !== "none" ? <BlogSidebar className="lg:sticky lg:top-24" /> : null;

  return (
    <>
      <Breadcrumb
        title={post.title}
        items={[
          { label: "Blog", href: "/blog/left-sidebar" },
          { label: post.title },
        ]}
      />

      <Container className="pb-16">
        <div
          className={cn(
            "grid gap-8",
            sidebar === "none"
              ? "grid-cols-1 max-w-4xl mx-auto"
              : sidebar === "left"
                ? "grid-cols-1 lg:grid-cols-[280px_1fr]"
                : "grid-cols-1 lg:grid-cols-[1fr_280px]"
          )}
        >
          {sidebar === "left" && sidebarNode}
          <article>
            <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-6">
              <Image src={post.image} alt={post.title} fill className="object-cover" sizes="100vw" priority />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-bb-muted mb-4">
              <span className="inline-flex items-center gap-1">
                <i className="ri-calendar-line" /> {post.date}
              </span>
              <span className="inline-flex items-center gap-1">
                <i className="ri-user-line" /> {post.author}
              </span>
              <span className="inline-flex items-center gap-1">
                <i className="ri-chat-3-line" /> {post.comments} Comments
              </span>
              <span className="inline-flex items-center gap-1">
                <i className="ri-price-tag-3-line" /> {post.category}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-bb-text mb-6">{post.title}</h1>
            <div className="prose prose-sm max-w-none text-bb-muted leading-relaxed space-y-4">
              <p>{post.content}</p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-bb-border">
              <span className="text-sm font-medium">Share:</span>
              {["ri-facebook-fill", "ri-twitter-x-line", "ri-instagram-line", "ri-linkedin-fill"].map((icon) => (
                <Link
                  key={icon}
                  href="#"
                  className="w-9 h-9 rounded-full border border-bb-border flex items-center justify-center hover:bg-bb-primary hover:text-white hover:border-bb-primary transition-colors"
                >
                  <i className={icon} />
                </Link>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/blog/left-sidebar" className="text-sm text-bb-primary inline-flex items-center gap-1">
                <i className="ri-arrow-left-line" /> Back to Blog
              </Link>
            </div>
          </article>

          {sidebar === "right" && sidebarNode}
        </div>
      </Container>
    </>
  );
}

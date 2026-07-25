import { notFound } from "next/navigation";
import BlogListView from "@/components/blog/BlogListView";
import BlogDetailView from "@/components/blog/BlogDetailView";
import { blogs, getBlogBySlug } from "@/data";
import { BLOG_LAYOUTS } from "@/lib/shopConfig";

export function generateStaticParams() {
  const layoutSlugs = Object.keys(BLOG_LAYOUTS).map((slug) => ({ slug }));
  const postSlugs = blogs.map((b) => ({ slug: b.slug }));
  return [...layoutSlugs, ...postSlugs];
}

export default async function BlogSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const layout = BLOG_LAYOUTS[slug];

  if (layout) {
    if (layout.isDetail) {
      return <BlogDetailView post={blogs[0]} layout={layout} />;
    }
    return <BlogListView layout={layout} />;
  }

  const post = getBlogBySlug(slug);
  if (!post) {
    notFound();
  }

  return <BlogDetailView post={post} layout={{ sidebar: "right" }} />;
}

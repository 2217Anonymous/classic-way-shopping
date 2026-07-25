import Image from "next/image";
import Link from "next/link";
import { blogs } from "@/data";
import Container from "@/components/ui/Container";
import SectionTitle from "@/components/ui/SectionTitle";

export default function BlogSection() {
  return (
    <section className="py-10 md:py-12">
      <Container>
        <SectionTitle
          title="Latest"
          highlight="Blog"
          subtitle="Tips, recipes, and grocery inspiration"
          right={
            <Link href="/blog" className="text-sm font-medium text-bb-primary hover:underline">
              View All <i className="ri-arrow-right-line" />
            </Link>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {blogs.map((post) => (
            <article
              key={post.id}
              className="group overflow-hidden rounded-2xl border border-bb-border bg-white hover:shadow-lg transition-all duration-300"
            >
              <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-bb-soft">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <span className="absolute top-4 left-4 bg-bb-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </Link>
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-bb-muted mb-3">
                  <span>
                    <i className="ri-calendar-line mr-1" />
                    {post.date}
                  </span>
                  <span>
                    <i className="ri-chat-3-line mr-1" />
                    {post.comments} Comments
                  </span>
                </div>
                <h4 className="text-base font-semibold leading-snug mb-2">
                  <Link href={`/blog/${post.slug}`} className="hover:text-bb-primary transition-colors">
                    {post.title}
                  </Link>
                </h4>
                <p className="text-sm text-bb-muted line-clamp-2">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1 text-sm font-medium text-bb-primary mt-4 hover:gap-2 transition-all"
                >
                  Read More <i className="ri-arrow-right-line" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

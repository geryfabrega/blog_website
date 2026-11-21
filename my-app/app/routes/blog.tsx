import type { Route } from "./+types/blog";
import { Link } from "react-router";
import { getAllBlogPosts } from "../utils/blog";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Writing — Gery Fabrega" },
    { name: "description", content: "Essays, notes, and projects by Gery Fabrega" },
  ];
}

export function clientLoader() {
  const posts = getAllBlogPosts();
  return { posts };
}

export default function Blog({ loaderData }: Route.ComponentProps) {
  const { posts } = loaderData;

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
      <header className="pb-10 border-b border-[#DCDCD7] mb-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#73736E] mb-3">
          Archive
        </p>
        <h1 className="font-serif text-4xl font-medium tracking-tight text-[#141413] mb-3">
          Writing
        </h1>
        <p className="text-[#52524E] text-[0.98rem]">
          Notes on systems programming, graphics, and weekend AI/ML experiments.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-sm text-[#73736E]">
          No blog posts yet. Check back soon.
        </p>
      ) : (
        <div className="divide-y divide-[#DCDCD7]">
          {posts.map((post) => (
            <article key={post.slug} className="py-6 first:pt-0">
              <Link to={`/blog/${post.slug}`} className="group block">
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-2">
                  <h2 className="font-serif text-2xl font-medium text-[#141413] group-hover:underline underline-offset-4 decoration-[#9E9E97]">
                    {post.title}
                  </h2>
                  <time className="font-mono text-xs text-[#73736E] shrink-0">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </time>
                </div>
                <p className="text-sm text-[#52524E] leading-relaxed">
                  {post.excerpt}
                </p>
              </Link>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

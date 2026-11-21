import type { Route } from "./+types/blog.$slug";
import { Link } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getBlogPost } from "../utils/blog";
import type { Components } from "react-markdown";

export function meta({ loaderData }: Route.MetaArgs) {
  const post = loaderData?.post;
  return [
    { title: post ? `${post.title} — Gery Fabrega` : "Post Not Found" },
    {
      name: "description",
      content: post?.excerpt || "Blog post by Gery Fabrega",
    },
  ];
}

export function clientLoader({ params }: Route.ClientLoaderArgs) {
  const post = getBlogPost(params.slug);
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }
  return { post };
}

// Custom components for ReactMarkdown to handle images and videos
const markdownComponents: Components = {
  img: ({ src, alt, title, ...props }) => {
    let mediaSrc = src || "";
    const isVideo = /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(mediaSrc);
    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");

    if (mediaSrc.startsWith("http://") || mediaSrc.startsWith("https://")) {
      // External URL, use as-is
    } else if (mediaSrc.startsWith("/")) {
      mediaSrc = `${baseUrl}${mediaSrc}`;
    } else {
      mediaSrc = isVideo
        ? `${baseUrl}/blog-videos/${mediaSrc}`
        : `${baseUrl}/blog-images/${mediaSrc}`;
    }

    // Optional markdown title hint: "width=320"
    const widthMatch = title?.match(/width=(\d{2,4})/);
    const parsedWidth = widthMatch ? Number(widthMatch[1]) : undefined;
    const mediaStyle = parsedWidth ? { width: `${parsedWidth}px` } : undefined;

    if (isVideo) {
      return (
        <figure className="my-8">
          <video
            src={mediaSrc}
            controls
            playsInline
            preload="metadata"
            className="max-w-full h-auto rounded-md border border-[#DCDCD7] mx-auto bg-[#141413]"
            style={mediaStyle}
          >
            Your browser does not support the video tag.
          </video>
          {alt && (
            <figcaption className="text-center text-sm text-[#73736E] mt-2.5 italic">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    }

    return (
      <figure className="my-8">
        <img
          src={mediaSrc}
          alt={alt || ""}
          className="max-w-full h-auto rounded-md border border-[#DCDCD7] mx-auto"
          style={mediaStyle}
          loading="lazy"
          {...props}
        />
        {alt && (
          <figcaption className="text-center text-sm text-[#73736E] mt-2.5 italic">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  },
};

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  const { post } = loaderData;

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
      <Link
        to="/blog"
        className="inline-block font-mono text-xs uppercase tracking-[0.12em] text-[#73736E] hover:text-[#141413] transition-colors mb-10"
      >
        ← Back to Writing
      </Link>

      <article>
        <header className="pb-8 mb-10 border-b border-[#DCDCD7]">
          <time className="block font-mono text-xs text-[#73736E] mb-3">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          <h1 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#141413] leading-[1.18]">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-base text-[#52524E] leading-relaxed">
              {post.excerpt}
            </p>
          )}
        </header>

        <div className="markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>

      <nav className="mt-16 pt-8 border-t border-[#DCDCD7]">
        <Link
          to="/blog"
          className="font-mono text-xs uppercase tracking-[0.12em] text-[#73736E] hover:text-[#141413] transition-colors"
        >
          ← All Posts
        </Link>
      </nav>
    </main>
  );
}

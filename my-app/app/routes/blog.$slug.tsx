import type { Route } from "./+types/blog.$slug";
import { Link } from "react-router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getBlogPost } from "../utils/blog";
import type { Components } from "react-markdown";

export function meta({ params, loaderData }: Route.MetaArgs) {
  const post = loaderData?.post;
  return [
    { title: post ? `${post.title} - Gery Fabrega` : "Post Not Found" },
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
    // Handle relative paths - if it starts with /blog-images or /blog-videos, use it as-is
    // Otherwise, default to /blog-videos for videos and /blog-images for images
    let mediaSrc = src || "";
    const isVideo = /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(mediaSrc);

    const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, "");

    if (mediaSrc.startsWith("http://") || mediaSrc.startsWith("https://")) {
      // External URL, use as-is
    } else if (mediaSrc.startsWith("/")) {
      // Absolute path from public, prefix with baseUrl for subpath deployments (e.g. GitHub Pages)
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
            className="max-w-full h-auto rounded-lg shadow-lg mx-auto bg-black"
            style={mediaStyle}
          >
            Your browser does not support the video tag.
          </video>
          {alt && (
            <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
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
          className="max-w-full h-auto rounded-lg shadow-lg"
          style={mediaStyle}
          loading="lazy"
          {...props}
        />
        {alt && (
          <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  },
};

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  const { post } = loaderData;

  // Client-side logging for debugging
  if (typeof window !== "undefined") {
    console.log("Blog post page - Post loaded:", post);
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Navigation */}
        <Link
          to="/blog"
          className="inline-block text-blue-600 dark:text-blue-400 hover:underline mb-8"
        >
          ← Back to Blog
        </Link>

        {/* Article */}
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
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

        {/* Footer Navigation */}
        <nav className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <Link
            to="/blog"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to All Posts
          </Link>
        </nav>
      </div>
    </main>
  );
}

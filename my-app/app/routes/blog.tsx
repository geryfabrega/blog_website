import type { Route } from "./+types/blog";
import { Link } from "react-router";
import { getAllBlogPosts } from "../utils/blog";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Blog - Gery Fabrega" },
    { name: "description", content: "Blog posts by Gery Fabrega" },
  ];
}

export function clientLoader() {
  const posts = getAllBlogPosts();
  return { posts };
}

export default function Blog({ loaderData }: Route.ComponentProps) {
  const { posts } = loaderData;

  // Client-side logging for debugging
  if (typeof window !== "undefined") {
    console.log("Blog page - All posts loaded:", posts);
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <header className="mb-12">
          <Link
            to="/"
            className="inline-block text-blue-600 dark:text-blue-400 hover:underline mb-4"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Blog Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            All my articles and thoughts on software engineering/Computer Science
          </p>
        </header>

        {/* Blog Posts List */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No blog posts yet. Check back soon!
            </p>
          ) : (
            posts.map((post) => (
              <article
                key={post.slug}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <Link to={`/blog/${post.slug}`}>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {post.excerpt}
                </p>
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-block text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Read more →
                </Link>
              </article>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

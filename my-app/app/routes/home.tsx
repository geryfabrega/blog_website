import type { Route } from "./+types/home";
import { Link } from "react-router";
import { getAllBlogPosts } from "../utils/blog";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Gery Fabrega - Software Engineer" },
    { name: "description", content: "Senior Software Engineer at Anduril" },
  ];
}

export function clientLoader() {
  const posts = getAllBlogPosts();
  return { posts: posts.slice(0, 3) }; // Show latest 3 posts on home
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { posts } = loaderData;

  // Client-side logging for debugging
  if (typeof window !== "undefined") {
    console.log("Home page - Blog posts loaded:", posts);
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-16">
          <img src={`${import.meta.env.BASE_URL}blog-images/profile_picture.jpg`} alt="Gery Fabrega" className="w-64 h-64 rounded-full mx-auto mb-4 object-cover" />
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Gery Fabrega
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Senoir Software Engineer at Anduril
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-500 mt-4 max-w-2xl mx-auto">
            Welcome to my personal blog where I share my thoughts on software
            engineering, technology, and other interests of mine.
          </p>
        </header>

        {/* Navigation */}
        <nav className="mb-12 text-center">
          <Link
            to="/blog"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Posts
          </Link>
        </nav>

        {/* Latest Posts */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Latest Posts
          </h2>
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
                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {post.excerpt}
                  </p>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-block mt-4 text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Read more →
                  </Link>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

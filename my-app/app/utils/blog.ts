export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
}

// Import all markdown files from the blog-posts directory
// This file is auto-generated - run: npm run generate-blog-imports
import { blogPostModules } from "./blog-imports.generated";

// Parse frontmatter from markdown content
function parseFrontmatter(content: string): {
  frontmatter: Record<string, string>;
  body: string;
} {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    throw new Error("Invalid markdown: missing frontmatter");
  }

  const frontmatterText = match[1];
  const body = match[2];

  const frontmatter: Record<string, string> = {};
  frontmatterText.split("\n").forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line
        .slice(colonIndex + 1)
        .trim()
        .replace(/^["']|["']$/g, "");
      frontmatter[key] = value;
    }
  });

  return { frontmatter, body };
}

// Get all blog posts
export function getAllBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = [];

  // Debug: log what we're getting (server-side only)
  if (import.meta.env.DEV) {
    console.log("[SERVER] Blog post modules:", Object.keys(blogPostModules));
  }

  for (const [path, content] of Object.entries(blogPostModules)) {
    if (!content || typeof content !== "string") {
      console.warn(`Invalid content for ${path}:`, typeof content);
      continue;
    }
    
    const slug = path
      .replace("../blog-posts/", "")
      .replace(".md?raw", "")
      .replace(".md", "")
      .toLowerCase();
    
    try {
      const { frontmatter, body } = parseFrontmatter(content);

      posts.push({
        slug,
        title: frontmatter.title || "Untitled",
        date: frontmatter.date || "",
        excerpt: frontmatter.excerpt || "",
        content: body,
      });
    } catch (error) {
      console.error(`Error parsing blog post ${slug}:`, error);
    }
  }

  // Sort by date, newest first
  return posts.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
}

// Get a single blog post by slug
export function getBlogPost(slug: string): BlogPost | null {
  const posts = getAllBlogPosts();
  return posts.find((post) => post.slug === slug) || null;
}


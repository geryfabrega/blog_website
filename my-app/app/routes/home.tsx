import type { Route } from "./+types/home";
import { Link } from "react-router";
import { getAllBlogPosts } from "../utils/blog";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Gery Fabrega — Software Engineer" },
    {
      name: "description",
      content:
        "Senior Software Engineer at Anduril focused on performance, systems, and AI/ML explorations.",
    },
  ];
}

export function clientLoader() {
  const posts = getAllBlogPosts();
  return { posts: posts.slice(0, 4) };
}

const EXPERIENCE = [
  {
    meta: "Present · Defense & Systems",
    role: "Senior Software Engineer, Anduril",
    detail: "Performance and systems-focused software engineering.",
  },
  {
    meta: "Present · U.S. Army Reserve",
    role: "Cyber Operations Officer",
    detail:
      "Building AI infrastructure across several operational organizations.",
  },
  {
    meta: "Prior · Microsoft",
    role: "Software Engineer, Azure SQL Database",
    detail: "Worked on core Azure SQL DB engineering.",
  },
];

const EDUCATION = [
  {
    meta: "In Progress · Johns Hopkins University (EP)",
    degree: "M.S. in Computer Science",
    detail: "Systems Track",
  },
  {
    meta: "George Mason University",
    degree: "B.S. in Bioengineering",
    detail: "Concentration in Signals & Systems",
  },
];

export default function Home({ loaderData }: Route.ComponentProps) {
  const { posts } = loaderData;

  return (
    <main className="mx-auto max-w-3xl px-6 py-14 sm:py-20">
      {/* Editorial Bio Header */}
      <section className="flex flex-col-reverse sm:flex-row sm:items-start sm:justify-between gap-8 pb-14 border-b border-[#DCDCD7]">
        <div className="max-w-xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#73736E] mb-3">
            Software Engineering · Systems · AI/ML
          </p>
          <h1 className="font-serif text-4xl sm:text-[2.75rem] font-medium tracking-tight text-[#141413] leading-[1.12] mb-5">
            Gery Fabrega
          </h1>
          <p className="text-[1.02rem] leading-7 text-[#40403C] mb-6">
            Senior Software Engineer at{" "}
            <span className="text-[#141413] font-medium">Anduril</span> with a
            strong interest in performance and systems engineering, while
            exploring personal projects in AI/ML. Previously on{" "}
            <span className="text-[#141413] font-medium">Azure SQL DB</span> at
            Microsoft, and currently serving as a Cyber Operations Officer in
            the U.S. Army Reserve.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#52524E]">
            <Link
              to="/blog"
              className="text-[#141413] underline underline-offset-4 decoration-[#BDBDB5] hover:decoration-[#141413] transition-colors"
            >
              Writing
            </Link>
            <span className="text-[#CECEC8]">/</span>
            <a
              href="https://github.com/geryfabrega"
              target="_blank"
              rel="noreferrer"
              className="text-[#141413] underline underline-offset-4 decoration-[#BDBDB5] hover:decoration-[#141413] transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>

        <img
          src={`${import.meta.env.BASE_URL}blog-images/profile_picture.jpg`}
          alt="Gery Fabrega"
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shrink-0 border border-[#DCDCD7] grayscale-[15%]"
        />
      </section>

      {/* Experience */}
      <section className="py-12 border-b border-[#DCDCD7]">
        <h2 className="font-serif text-2xl font-medium tracking-tight text-[#141413] mb-7">
          Experience
        </h2>
        <div className="space-y-6">
          {EXPERIENCE.map((item) => (
            <div key={item.role} className="border-l border-[#D4D4CE] pl-4">
              <p className="font-mono text-xs text-[#73736E] mb-1">
                {item.meta}
              </p>
              <h3 className="text-[1.02rem] font-medium text-[#141413]">
                {item.role}
              </h3>
              <p className="text-sm text-[#52524E] mt-0.5 leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="py-12 border-b border-[#DCDCD7]">
        <h2 className="font-serif text-2xl font-medium tracking-tight text-[#141413] mb-7">
          Education
        </h2>
        <div className="space-y-6">
          {EDUCATION.map((item) => (
            <div key={item.degree} className="border-l border-[#D4D4CE] pl-4">
              <p className="font-mono text-xs text-[#73736E] mb-1">
                {item.meta}
              </p>
              <h3 className="text-[1.02rem] font-medium text-[#141413]">
                {item.degree}
              </h3>
              <p className="text-sm text-[#52524E] mt-0.5">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Writing */}
      <section className="pt-12">
        <div className="flex items-baseline justify-between mb-7">
          <h2 className="font-serif text-2xl font-medium tracking-tight text-[#141413]">
            Writing
          </h2>
          <Link
            to="/blog"
            className="text-sm text-[#52524E] hover:text-[#141413] underline underline-offset-4 decoration-[#CECEC8] hover:decoration-[#141413] transition-colors"
          >
            All posts →
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="text-sm text-[#73736E]">
            No posts yet. Check back soon.
          </p>
        ) : (
          <div className="divide-y divide-[#DCDCD7]">
            {posts.map((post) => (
              <article key={post.slug} className="py-5 first:pt-0 last:pb-0">
                <Link to={`/blog/${post.slug}`} className="group block">
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1.5">
                    <h3 className="font-serif text-xl font-medium text-[#141413] group-hover:underline underline-offset-4 decoration-[#9E9E97]">
                      {post.title}
                    </h3>
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
      </section>
    </main>
  );
}

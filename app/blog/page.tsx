import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/notion";
import BlogShell from "./shell";

// Posts are baked in at build time, same as the rest of the site.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Blog · Aroop Biswal",
  description: "Writing from Aroop Biswal, Software Engineer at Google.",
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <BlogShell backHref="/" backLabel="aroopbiswal.com">
      <h1 className="blog-masthead">Blog</h1>

      {posts.length === 0 ? (
        <p className="blog-empty">No posts yet — first one is on its way.</p>
      ) : (
        <ul className="post-list">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link className="post-row" href={`/blog/${post.slug}`}>
                <div className="post-meta">
                  {post.date && (
                    <time className="post-date" dateTime={post.dateISO ?? undefined}>
                      {post.date}
                    </time>
                  )}
                  {post.readingMinutes > 0 && (
                    <span className="post-read">{post.readingMinutes} min read</span>
                  )}
                </div>
                <h2 className="post-row-title">{post.title}</h2>
                {post.summary && <p className="post-summary">{post.summary}</p>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </BlogShell>
  );
}

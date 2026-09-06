import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, getPostBlocks, getPosts } from "@/lib/notion";
import Blocks from "../blocks";

export const dynamic = "force-static";

// Every published post gets its own static page at build time.
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found · Aroop Biswal" };
  return {
    title: `${post.title} · Aroop Biswal`,
    description: post.summary || undefined,
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const blocks = await getPostBlocks(post.id);

  return (
    <>
      <article className="post">
        <header className="post-head">
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
          <h1 className="blog-title">{post.title}</h1>
          {post.summary && <p className="blog-sub">{post.summary}</p>}
          {post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}
        </header>
        <Blocks blocks={blocks} />
      </article>
    </>
  );
}

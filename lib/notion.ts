import { Client } from "@notionhq/client";

/**
 * Build-time Notion data source.
 *
 * These functions run ONLY at build (from the Server Component in app/page.tsx)
 * and bake the result into static HTML. Nothing here executes in the browser or
 * at request time.
 *
 * The shapes returned here intentionally match the objects that
 * app/components/site.tsx already renders, so the components don't change.
 */

/* ---------- Shapes the site already expects ---------- */

export type Job = {
  company: string;
  role: string;
  period: string;
  blurb: string;
  /** One line per bullet, from the Highlights rich-text property. May be empty. */
  highlights: string[];
};

export type WorkData = {
  /** The row with the lowest Order — rendered as the big featured card. */
  featured: Job;
  /** Every other row, in Order. */
  jobs: Job[];
};

export type Project = {
  num: string; // "01", "02", … derived from sort position
  title: string;
  desc: string;
  tags: string[];
  href: string | null;
  /** "Jun 2026", from the Date property. Null when the row has no date. */
  date: string | null;
};

/** One post's front matter. The body is fetched separately, per post. */
export type PostMeta = {
  /** Notion page id — used to fetch the body blocks. */
  id: string;
  /** URL path segment: /blog/<slug>. */
  slug: string;
  title: string;
  summary: string;
  /** "Jun 2026", for display. Null when the row has no date. */
  date: string | null;
  /** Raw ISO date, for sorting and <time dateTime>. */
  dateISO: string | null;
  tags: string[];
  /** Whole minutes at 200 wpm, counted from the body. 0 when the post is empty. */
  readingMinutes: number;
};

/** A run of text with Notion's inline formatting flags. */
export type RichText = {
  text: string;
  bold: boolean;
  italic: boolean;
  code: boolean;
  strikethrough: boolean;
  href: string | null;
};

/**
 * The subset of Notion blocks the blog renders. Anything else is dropped —
 * see `readBlocks` for what that means in practice.
 */
export type Block =
  | { kind: "heading"; level: 1 | 2 | 3; text: RichText[] }
  | { kind: "paragraph"; text: RichText[] }
  | { kind: "quote"; text: RichText[] }
  | { kind: "code"; language: string; text: string }
  | { kind: "divider" }
  | { kind: "list"; ordered: boolean; items: { text: RichText[]; children: Block[] }[] };

/* ---------- Env + client ---------- */

/** Read a required env var or throw a build-breaking error. */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[lib/notion] Missing required env var ${name}. ` +
        `Set it in .env.local (local) and in Vercel → Project Settings → ` +
        `Environment Variables (deploy). Build aborted to avoid shipping an empty page.`,
    );
  }
  return value;
}

let cachedClient: Client | null = null;
function notion(): Client {
  if (!cachedClient) {
    cachedClient = new Client({ auth: requireEnv("NOTION_TOKEN") });
  }
  return cachedClient;
}

/**
 * The 2025-09-03 Notion API queries a *data source*, not a database directly.
 * We keep the friendly database ID in env and resolve it to its (single) data
 * source at build time.
 */
async function resolveDataSourceId(databaseId: string): Promise<string> {
  const db = (await notion().databases.retrieve({
    database_id: databaseId,
  })) as { data_sources?: { id: string }[] };
  const id = db.data_sources?.[0]?.id;
  if (!id) {
    throw new Error(
      `[lib/notion] Database ${databaseId} has no data source. ` +
        `Confirm the ID is correct and the integration is shared with it.`,
    );
  }
  return id;
}

/* ---------- Property readers (tolerant of Notion's union types) ---------- */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* eslint-disable @typescript-eslint/no-explicit-any */
function readTitle(prop: any): string {
  return (prop?.title ?? []).map((t: any) => t.plain_text).join("").trim();
}
function readText(prop: any): string {
  return (prop?.rich_text ?? []).map((t: any) => t.plain_text).join("").trim();
}
function readNumber(prop: any): number {
  return typeof prop?.number === "number" ? prop.number : Number.MAX_SAFE_INTEGER;
}
function readMultiSelect(prop: any): string[] {
  return (prop?.multi_select ?? []).map((o: any) => o.name);
}
function readUrl(prop: any): string | null {
  const url = prop?.url;
  return typeof url === "string" && url.length > 0 ? url : null;
}
/** Rich text where each line is one bullet. Missing property → no bullets. */
function readLines(prop: any): string[] {
  return readText(prop)
    .split("\n")
    .map((line: string) => line.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);
}
/**
 * A Notion date as "Jun 2026". Formatted by hand rather than with `Intl` so the
 * build-time HTML and the browser can never disagree (see CLAUDE.md).
 */
function readMonthYear(prop: any): string | null {
  const start = prop?.date?.start;
  if (typeof start !== "string") return null;
  const [y, m] = start.split("-");
  const month = MONTHS[Number(m) - 1];
  return month && y ? `${month} ${y}` : null;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Query every row of a data source, sorted ascending by the Order property. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function queryByOrder(dataSourceId: string): Promise<any[]> {
  const res = await notion().dataSources.query({
    data_source_id: dataSourceId,
    sorts: [{ property: "Order", direction: "ascending" }],
    page_size: 100,
  });
  return res.results;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function readRichText(prop: any): RichText[] {
  return (prop ?? []).map((t: any) => ({
    text: t.plain_text ?? "",
    bold: !!t.annotations?.bold,
    italic: !!t.annotations?.italic,
    code: !!t.annotations?.code,
    strikethrough: !!t.annotations?.strikethrough,
    href: t.href ?? null,
  }));
}

/* eslint-enable @typescript-eslint/no-explicit-any */

/** "Some Post Title" → "some-post-title", for rows with no explicit Slug. */
function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ---------- Public fetchers ---------- */

export async function getWork(): Promise<WorkData> {
  const dataSourceId = await resolveDataSourceId(requireEnv("NOTION_WORK_DB_ID"));
  const rows = await queryByOrder(dataSourceId);

  const jobs: Job[] = rows.map((row) => {
    const p = row.properties;
    return {
      company: readTitle(p.Company),
      role: readText(p.Role),
      period: readText(p.Period),
      blurb: readText(p.Blurb),
      highlights: readLines(p.Highlights),
    };
  });

  if (jobs.length === 0) {
    throw new Error(
      "[lib/notion] Work database returned no rows. Add at least one entry " +
        "(the lowest Order is the featured card).",
    );
  }

  const [featured, ...rest] = jobs;
  return { featured, jobs: rest };
}

export async function getProjects(): Promise<Project[]> {
  const dataSourceId = await resolveDataSourceId(requireEnv("NOTION_PROJECTS_DB_ID"));
  const rows = await queryByOrder(dataSourceId);

  const projects: Project[] = rows.map((row, i) => {
    const p = row.properties;
    return {
      num: String(i + 1).padStart(2, "0"),
      title: readTitle(p.Title),
      desc: readText(p.Description),
      tags: readMultiSelect(p.Tags),
      href: readUrl(p.Link),
      date: readMonthYear(p.Date),
    };
  });

  if (projects.length === 0) {
    throw new Error("[lib/notion] Projects database returned no rows.");
  }

  return projects;
}

/* ---------- Blog ---------- */

/**
 * A build renders the index, `generateStaticParams`, a `generateMetadata` and a
 * page per post — all off the same rows and bodies. These caches keep that to
 * one query plus one body fetch per post for the whole build.
 */
let postsPromise: Promise<PostMeta[]> | null = null;
const blocksPromises = new Map<string, Promise<Block[]>>();

/** Rough reading time: whole minutes at 200 words per minute, minimum 1. */
function readingMinutes(blocks: Block[]): number {
  const words = countWords(blocks);
  return words === 0 ? 0 : Math.max(1, Math.round(words / 200));
}

function countWords(blocks: Block[]): number {
  let words = 0;
  for (const block of blocks) {
    if (block.kind === "code") {
      words += block.text.split(/\s+/).filter(Boolean).length;
    } else if (block.kind === "list") {
      for (const item of block.items) {
        words += item.text.map((t) => t.text).join(" ").split(/\s+/).filter(Boolean).length;
        words += countWords(item.children);
      }
    } else if (block.kind !== "divider") {
      words += block.text.map((t) => t.text).join(" ").split(/\s+/).filter(Boolean).length;
    }
  }
  return words;
}

/**
 * Posts, newest first, drafts excluded.
 *
 * Unlike Work and Projects this does **not** hard-fail: a blog legitimately
 * starts empty, and the branch has to build before NOTION_BLOG_DB_ID exists in
 * the environment. A missing id logs a warning and ships an empty index rather
 * than breaking the deploy.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getPosts(): Promise<PostMeta[]> {
  postsPromise ??= loadPosts();
  return postsPromise;
}

async function loadPosts(): Promise<PostMeta[]> {
  const databaseId = process.env.NOTION_BLOG_DB_ID;
  if (!databaseId) {
    console.warn(
      "[lib/notion] NOTION_BLOG_DB_ID is not set — /blog will render empty. " +
        "Set it in .env.local and in Vercel to publish posts.",
    );
    return [];
  }

  const dataSourceId = await resolveDataSourceId(databaseId);
  const res = await notion().dataSources.query({
    data_source_id: dataSourceId,
    sorts: [{ property: "Date", direction: "descending" }],
    page_size: 100,
  });

  const posts: PostMeta[] = [];
  for (const row of res.results as any[]) {
    const p = row.properties;
    if (p.Published?.checkbox !== true) continue; // draft

    const title = readTitle(p.Title);
    const explicitSlug = readText(p.Slug);
    const slug = slugify(explicitSlug || title);
    if (!slug) continue; // no title and no slug — nothing to link to

    const start = p.Date?.date?.start;
    posts.push({
      id: row.id,
      slug,
      title,
      summary: readText(p.Summary),
      date: readMonthYear(p.Date),
      dateISO: typeof start === "string" ? start : null,
      tags: readMultiSelect(p.Tags),
      readingMinutes: readingMinutes(await getPostBlocks(row.id)),
    });
  }
  return posts;
}

/* eslint-enable @typescript-eslint/no-explicit-any */

/** The post with this slug, or null when nothing matches. */
export async function getPost(slug: string): Promise<PostMeta | null> {
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

/**
 * A page's body, flattened into the shapes the renderer understands.
 *
 * Consecutive list items are grouped into one list so they render as a single
 * <ul>/<ol>. Block types the blog does not support yet — images among them,
 * because Notion's file URLs expire about an hour after they are handed out and
 * this site bakes its HTML at build time — are skipped.
 */
export async function getPostBlocks(pageId: string): Promise<Block[]> {
  let blocks = blocksPromises.get(pageId);
  if (!blocks) {
    blocks = listBlockChildren(pageId).then(groupBlocks);
    blocksPromises.set(pageId, blocks);
  }
  return blocks;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
async function listBlockChildren(blockId: string, depth = 0): Promise<any[]> {
  // Notion nests lists arbitrarily deep; two levels is plenty for a post and
  // keeps a malformed page from fanning out into hundreds of API calls.
  if (depth > 2) return [];

  const out: any[] = [];
  let cursor: string | undefined;
  do {
    const res: any = await notion().blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    for (const block of res.results) {
      out.push({
        ...block,
        childBlocks: block.has_children ? await listBlockChildren(block.id, depth + 1) : [],
      });
    }
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return out;
}

function groupBlocks(raw: any[]): Block[] {
  const out: Block[] = [];

  for (const block of raw) {
    const type = block.type;

    if (type === "bulleted_list_item" || type === "numbered_list_item") {
      const ordered = type === "numbered_list_item";
      const last = out[out.length - 1];
      const item = {
        text: readRichText(block[type]?.rich_text),
        children: groupBlocks(block.childBlocks ?? []),
      };
      // Fold into the run of list items directly above, if there is one.
      if (last && last.kind === "list" && last.ordered === ordered) last.items.push(item);
      else out.push({ kind: "list", ordered, items: [item] });
      continue;
    }

    switch (type) {
      case "heading_1":
      case "heading_2":
      case "heading_3":
        out.push({
          kind: "heading",
          level: Number(type.slice(-1)) as 1 | 2 | 3,
          text: readRichText(block[type]?.rich_text),
        });
        break;
      case "paragraph": {
        const text = readRichText(block.paragraph?.rich_text);
        // Notion leaves empty paragraphs behind as spacing; the CSS handles that.
        if (text.some((t) => t.text.trim())) out.push({ kind: "paragraph", text });
        break;
      }
      case "quote":
        out.push({ kind: "quote", text: readRichText(block.quote?.rich_text) });
        break;
      case "code":
        out.push({
          kind: "code",
          language: block.code?.language ?? "text",
          text: readRichText(block.code?.rich_text)
            .map((t) => t.text)
            .join(""),
        });
        break;
      case "divider":
        out.push({ kind: "divider" });
        break;
      default:
        // Unsupported block type — skipped on purpose.
        break;
    }
  }

  return out;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

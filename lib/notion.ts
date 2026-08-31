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

// Reads the No Doomscroll Challenge's "Daily Log" from Notion. Server only.
//
// Not memoized, and no `cache: "no-store"`: /challenge is ISR, and either would
// make Next mark the route dynamic mid-revalidation (see CLAUDE.md, Photos).

import type { Player, RawRow } from "./challenge.ts";
import { notion } from "./notion.ts";
import { mockChallenge } from "./challenge-mock.ts";

// The single place property names live.
const PROPS = {
  player: "Player",
  date: "Date",
  tiktok: "TikTok (min)",
  instagram: "Instagram (min)",
} as const;

const EXPECTED_TYPES = {
  player: "select",
  date: "date",
  tiktok: "number",
  instagram: "number",
} as const;

// Notion's select colours, as hex values that read on cream and on dark.
const COLORS: Record<string, string> = {
  default: "#8A8378",
  gray: "#8A8378",
  brown: "#A0673C",
  orange: "#F5821F",
  yellow: "#E0A800",
  green: "#4FA02A",
  blue: "#3B6FE0",
  purple: "#8B5CF6",
  pink: "#E8559A",
  red: "#E5372A",
};
const FALLBACK_COLOR = "#8A8378";

type Page<T> = { results: T[]; has_more: boolean; next_cursor: string | null };

/** Follow Notion's cursor until it runs out. The query is injected so tests can fake pages. */
export async function fetchAll<T>(query: (cursor?: string) => Promise<Page<T>>): Promise<T[]> {
  const all: T[] = [];
  let cursor: string | undefined;
  do {
    const page = await query(cursor);
    all.push(...page.results);
    cursor = page.has_more && page.next_cursor ? page.next_cursor : undefined;
  } while (cursor);
  return all;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getChallenge(): Promise<{ players: Player[]; rows: RawRow[]; fetchedAt: string } | null> {
  // Development only: build and check the page without Notion.
  if (process.env.NODE_ENV !== "production" && process.env.CHALLENGE_MOCK) return mockChallenge(process.env.CHALLENGE_MOCK);
  const data_source_id = process.env.NOTION_CHALLENGE_DATA_SOURCE_ID;
  if (!data_source_id) {
    console.warn("NOTION_CHALLENGE_DATA_SOURCE_ID is not set; /challenge will have no data.");
    return null;
  }

  const ds = (await notion().dataSources.retrieve({ data_source_id })) as any;
  const schema: Record<string, any> = ds.properties ?? {};
  const problems: string[] = [];
  for (const key of Object.keys(PROPS) as (keyof typeof PROPS)[]) {
    const found = schema[PROPS[key]];
    if (!found) problems.push(`"${PROPS[key]}" is missing`);
    else if (found.type !== EXPECTED_TYPES[key]) {
      problems.push(`"${PROPS[key]}" is ${found.type}, expected ${EXPECTED_TYPES[key]}`);
    }
  }
  if (problems.length > 0) {
    throw new Error(
      `Challenge data source has the wrong shape: ${problems.join("; ")}. ` +
        `Properties that exist: ${Object.keys(schema).join(", ")}.`,
    );
  }

  const players: Player[] = schema[PROPS.player].select.options.map((o: any) => ({
    name: o.name,
    color: COLORS[o.color] ?? FALLBACK_COLOR,
  }));

  const pages = await fetchAll<any>((start_cursor) =>
    notion().dataSources.query({ data_source_id, start_cursor, page_size: 100 }) as Promise<Page<any>>,
  );
  const rows: RawRow[] = pages.map((p) => ({
    player: p.properties[PROPS.player]?.select?.name ?? null,
    date: p.properties[PROPS.date]?.date?.start?.slice(0, 10) ?? null,
    tiktok: p.properties[PROPS.tiktok]?.number ?? null,
    instagram: p.properties[PROPS.instagram]?.number ?? null,
    editedAt: p.last_edited_time,
  }));

  return { players, rows, fetchedAt: new Date().toISOString() };
}

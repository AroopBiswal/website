// The No Doomscroll Challenge, kept free of React and Notion so it can be
// tested on its own. Lowest average daily TikTok + Instagram minutes wins.
//
// Every date is a "YYYY-MM-DD" string in Pacific time, and all arithmetic is
// done in UTC so a DST boundary can never shift a day.

import { addDays } from "./j9-holidays.ts";

export const START = "2026-10-03";
export const END = "2026-10-31";
export const BUY_IN = 25;

const MAX_MINUTES = 1440; // minutes in a day

export type Player = { name: string; color: string };
/** One Notion row, untrusted. */
export type RawRow = {
  player: string | null;
  date: string | null;
  tiktok: number | null;
  instagram: number | null;
  editedAt: string;
};
export type Entry = { player: string; date: string; tiktok: number; instagram: number; total: number };
export type Flag = { kind: "out-of-range" | "duplicate"; player: string; date: string };
export type Standing = {
  player: Player;
  rank: number | null;
  average: number | null;
  total: number;
  tiktok: number;
  instagram: number;
  days: number;
};

/** A player's goal: average minutes per day, TikTok and Instagram combined. */
export type Goal = { player: string; minutes: number };
/** One Goals row from Notion, untrusted. */
export type RawGoal = { player: string | null; minutes: number | null };

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Every date from START to END inclusive. */
export function days(): string[] {
  const out: string[] = [];
  for (let d = START; d <= END; d = addDays(d, 1)) out.push(d);
  return out;
}

/** Validate and de-duplicate raw rows. Never throws on bad data; flags it. */
export function clean(rows: RawRow[]): { entries: Entry[]; flags: Flag[] } {
  const flags: Flag[] = [];
  const latest = new Map<string, RawRow>();
  const duplicated = new Set<string>();

  for (const row of rows) {
    if (!row.player || !row.date) continue;
    if (row.tiktok === null && row.instagram === null) continue;
    if (row.date < START || row.date > END) continue;
    const tiktok = row.tiktok ?? 0;
    const instagram = row.instagram ?? 0;
    if (tiktok < 0 || tiktok > MAX_MINUTES || instagram < 0 || instagram > MAX_MINUTES) {
      flags.push({ kind: "out-of-range", player: row.player, date: row.date });
      continue;
    }
    const key = `${row.player}|${row.date}`;
    const prev = latest.get(key);
    if (prev) duplicated.add(key);
    if (!prev || row.editedAt > prev.editedAt) latest.set(key, row);
  }

  const entries: Entry[] = [];
  for (const [key, row] of latest) {
    const tiktok = row.tiktok ?? 0;
    const instagram = row.instagram ?? 0;
    entries.push({
      player: row.player as string,
      date: row.date as string,
      tiktok,
      instagram,
      total: tiktok + instagram,
    });
    if (duplicated.has(key)) {
      flags.push({ kind: "duplicate", player: row.player as string, date: row.date as string });
    }
  }
  entries.sort((a, b) => a.date.localeCompare(b.date) || a.player.localeCompare(b.player));
  return { entries, flags };
}

/** One row per player, best average first. Ties share a rank (1, 1, 3). */
export function standings(players: Player[], entries: Entry[]): Standing[] {
  const list: Standing[] = players.map((player) => {
    const mine = entries.filter((e) => e.player === player.name);
    const total = mine.reduce((s, e) => s + e.total, 0);
    return {
      player,
      rank: null,
      average: mine.length > 0 ? total / mine.length : null,
      total,
      tiktok: mine.reduce((s, e) => s + e.tiktok, 0),
      instagram: mine.reduce((s, e) => s + e.instagram, 0),
      days: mine.length,
    };
  });
  list.sort((a, b) => {
    if (a.average === null || b.average === null) {
      if (a.average === b.average) return a.player.name.localeCompare(b.player.name);
      return a.average === null ? 1 : -1;
    }
    return a.average - b.average;
  });
  list.forEach((s, i) => {
    if (s.average === null) return;
    s.rank = i > 0 && list[i - 1].average === s.average ? list[i - 1].rank : i + 1;
  });
  return list;
}

/** Match rows to players by trimmed, case-insensitive name; skip empty numbers and anything outside (0, 1440]. */
export function cleanGoals(rows: RawGoal[], players: Player[]): Goal[] {
  const out: Goal[] = [];
  for (const row of rows) {
    const name = row.player?.trim().toLowerCase();
    const player = players.find((p) => p.name.trim().toLowerCase() === name);
    if (!player || row.minutes === null || !(row.minutes > 0 && row.minutes <= MAX_MINUTES)) continue;
    out.push({ player: player.name, minutes: row.minutes });
  }
  return out;
}

/** (average - goal) / goal; negative = under goal. Null if either is missing. */
export function goalChange(average: number | null, goal: number | undefined): number | null {
  if (average === null || goal === undefined) return null;
  return (average - goal) / goal;
}

/** Each day's total for one player, null where nothing was logged. */
export function dailyTotals(player: string, entries: Entry[]): (number | null)[] {
  const byDate = new Map<string, number>();
  for (const e of entries) if (e.player === player) byDate.set(e.date, e.total);
  return days().map((d) => byDate.get(d) ?? null);
}

/** Average of everything logged on or before each day; null before the first log. */
export function runningAverages(player: string, entries: Entry[]): (number | null)[] {
  let sum = 0;
  let count = 0;
  return dailyTotals(player, entries).map((t) => {
    if (t !== null) {
      sum += t;
      count++;
    }
    return count > 0 ? sum / count : null;
  });
}

/** A player's lowest-total day; the earliest wins a tie. */
export function bestDay(player: string, entries: Entry[]): Entry | null {
  let best: Entry | null = null;
  for (const e of entries) {
    if (e.player !== player) continue;
    if (!best || e.total < best.total || (e.total === best.total && e.date < best.date)) best = e;
  }
  return best;
}

/** Today's date in Pacific time. Server-side only: this is the one use of Intl. */
export function todayPacific(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Los_Angeles" }).format(now);
}

export function progress(today: string): { day: number; total: number; left: number; state: "before" | "during" | "after" } {
  const total = days().length;
  if (today < START) return { day: 0, total, left: total, state: "before" };
  if (today > END) return { day: total, total, left: 0, state: "after" };
  const day = days().indexOf(today) + 1;
  return { day, total, left: total - day, state: "during" };
}

/** 72 -> "1h 12m", 45 -> "45m". Rounds to whole minutes. */
export function formatMinutes(minutes: number): string {
  const m = Math.round(minutes);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${m % 60}m` : `${m}m`;
}

/** "2026-10-02" -> "Oct 2". Hand-rolled so server and browser agree. */
export function formatDay(date: string): string {
  return `${MONTHS[Number(date.slice(5, 7)) - 1]} ${Number(date.slice(8, 10))}`;
}

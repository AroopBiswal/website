// Deterministic fake data for building the page without Notion. Reached only
// from getChallenge() in development, behind CHALLENGE_MOCK.

import { days, type Player, type RawRow } from "./challenge.ts";

const PLAYERS: Player[] = [
  { name: "Aroop", color: "#3B6FE0" },
  { name: "Samar", color: "#4FA02A" },
  { name: "Audrey", color: "#E8559A" },
  { name: "Kayla", color: "#8B5CF6" },
];

// Typical daily minutes per player, per app.
const BASE = [
  [40, 30],
  [25, 15],
  [70, 45],
  [35, 50],
];

/** "empty" gives players with no rows; anything else gives the full month. */
export function mockChallenge(mode: string): { players: Player[]; rows: RawRow[]; fetchedAt: string } {
  const rows: RawRow[] = [];
  if (mode !== "empty") {
    const all = days();
    PLAYERS.forEach((p, pi) => {
      all.forEach((date, di) => {
        if ((di * 7 + pi * 3) % 11 === 0) return; // an unlogged day
        const wobble = ((di * 13 + pi * 29) % 21) - 10; // -10..10
        let tiktok: number | null = Math.max(0, BASE[pi][0] + wobble * 2);
        let instagram: number | null = Math.max(0, BASE[pi][1] - wobble);
        if (pi === 2 && di % 9 === 4) instagram = null; // one app missing
        if (pi === 3 && di % 8 === 5) tiktok = null;
        rows.push({ player: p.name, date, tiktok, instagram, editedAt: "2026-10-01T00:00:00Z" });
      });
    });
    // One duplicate day: the later edit should win.
    rows.push({ player: "Aroop", date: all[3], tiktok: 5, instagram: 5, editedAt: "2026-10-09T00:00:00Z" });
  }
  return { players: PLAYERS, rows, fetchedAt: new Date().toISOString() };
}

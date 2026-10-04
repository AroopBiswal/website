// Run with: npm run test:challenge
//
// Plain Node, native type stripping, no framework.

import {
  clean,
  dailyTotals,
  days,
  formatDay,
  formatMinutes,
  funStats,
  progress,
  runningAverages,
  standings,
  todayPacific,
  type Entry,
  type Player,
  type RawRow,
} from "../lib/challenge.ts";
import { fetchAll } from "../lib/challenge-notion.ts";

let passed = 0;
const failures: string[] = [];

function check(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a === e) passed++;
  else failures.push(`${name}\n    expected ${e}\n    actual   ${a}`);
}

function group(name: string) {
  console.log(`\n  ${name}`);
}

const players: Player[] = [
  { name: "Ann", color: "#111111" },
  { name: "Bo", color: "#222222" },
  { name: "Cy", color: "#333333" },
  { name: "Di", color: "#444444" },
];

function row(player: string | null, date: string | null, tiktok: number | null, instagram: number | null, editedAt = "2026-10-10T00:00:00Z"): RawRow {
  return { player, date, tiktok, instagram, editedAt };
}

function entry(player: string, date: string, tiktok: number, instagram: number): Entry {
  return { player, date, tiktok, instagram, total: tiktok + instagram };
}

// ---------------------------------------------------------------------- days

group("days");
check("29 days", days().length, 29);
check("first day", days()[0], "2026-10-03");
check("last day", days()[28], "2026-10-31");

// --------------------------------------------------------------------- clean

group("clean");
check("one app missing counts as 0", clean([row("Ann", "2026-10-03", 30, null)]).entries, [entry("Ann", "2026-10-03", 30, 0)]);
check("other app missing", clean([row("Ann", "2026-10-03", null, 20)]).entries, [entry("Ann", "2026-10-03", 0, 20)]);
check("both missing skipped", clean([row("Ann", "2026-10-03", null, null)]), { entries: [], flags: [] });
check("no player skipped", clean([row(null, "2026-10-03", 5, 5)]).entries, []);
check("no date skipped", clean([row("Ann", null, 5, 5)]).entries, []);
check("before the window ignored", clean([row("Ann", "2026-10-02", 5, 5)]).entries, []);
check("after the window ignored", clean([row("Ann", "2026-11-01", 5, 5)]).entries, []);
check("start date included", clean([row("Ann", "2026-10-03", 5, 5)]).entries.length, 1);
check("end date included", clean([row("Ann", "2026-10-31", 5, 5)]).entries.length, 1);
check("negative excluded and flagged", clean([row("Ann", "2026-10-04", -1, 5)]), {
  entries: [],
  flags: [{ kind: "out-of-range", player: "Ann", date: "2026-10-04" }],
});
check("over 1440 excluded and flagged", clean([row("Ann", "2026-10-04", 5, 1441)]), {
  entries: [],
  flags: [{ kind: "out-of-range", player: "Ann", date: "2026-10-04" }],
});
check("1440 and 0 are fine", clean([row("Ann", "2026-10-04", 1440, 0)]).flags, []);

const dup = clean([
  row("Ann", "2026-10-04", 10, 10, "2026-10-04T10:00:00Z"),
  row("Ann", "2026-10-04", 99, 1, "2026-10-05T10:00:00Z"),
  row("Ann", "2026-10-04", 50, 50, "2026-10-04T12:00:00Z"),
]);
check("duplicate: latest edit wins, counted once", dup.entries, [entry("Ann", "2026-10-04", 99, 1)]);
check("duplicate: one flag", dup.flags, [{ kind: "duplicate", player: "Ann", date: "2026-10-04" }]);

check(
  "sorted by date then player",
  clean([row("Bo", "2026-10-04", 1, 1), row("Ann", "2026-10-04", 1, 1), row("Cy", "2026-10-03", 1, 1)]).entries.map((e) => `${e.date} ${e.player}`),
  ["2026-10-03 Cy", "2026-10-04 Ann", "2026-10-04 Bo"],
);

// ----------------------------------------------------------------- standings

group("standings");
const entries: Entry[] = [
  entry("Ann", "2026-10-03", 30, 30), // 60
  entry("Ann", "2026-10-04", 20, 40), // 60
  entry("Bo", "2026-10-03", 50, 10), // 60 (ties Ann)
  entry("Cy", "2026-10-03", 100, 20), // 120
];
const s = standings(players, entries);
check("order", s.map((x) => x.player.name), ["Ann", "Bo", "Cy", "Di"]);
check("ranks 1, 1, 3, null", s.map((x) => x.rank), [1, 1, 3, null]);
check("average", s[0].average, 60);
check("days", s[0].days, 2);
check("totals", [s[0].total, s[0].tiktok, s[0].instagram], [120, 50, 70]);
check("no entries: null average, zero days", [s[3].average, s[3].days, s[3].total], [null, 0, 0]);

check(
  "lower average ranks first",
  standings(players, [entry("Ann", "2026-10-03", 100, 0), entry("Bo", "2026-10-03", 10, 0)]).map((x) => x.player.name).slice(0, 2),
  ["Bo", "Ann"],
);
check(
  "unknown player ignored",
  standings(players, [...entries, entry("Zed", "2026-10-03", 1, 1)]).map((x) => x.player.name),
  ["Ann", "Bo", "Cy", "Di"],
);
const five = standings([...players, { name: "Ed", color: "#555555" }], [...entries, entry("Ed", "2026-10-03", 5, 5)]);
check("fifth player just works", five.map((x) => [x.player.name, x.rank]), [["Ed", 1], ["Ann", 2], ["Bo", 2], ["Cy", 4], ["Di", null]]);
check(
  "no-entry players sorted alphabetically last",
  standings([{ name: "Zoe", color: "#0" }, { name: "Al", color: "#0" }, { name: "Mo", color: "#0" }], [entry("Mo", "2026-10-03", 1, 1)]).map((x) => x.player.name),
  ["Mo", "Al", "Zoe"],
);

// ------------------------------------------------------------------ series

group("series");
const mine = [entry("Ann", "2026-10-03", 60, 0), entry("Ann", "2026-10-05", 0, 30)];
const totals = dailyTotals("Ann", mine);
check("dailyTotals length", totals.length, 29);
check("dailyTotals gaps are null", totals.slice(0, 4), [60, null, 30, null]);
const running = runningAverages("Ann", mine);
check("running averages", running.slice(0, 4), [60, 60, 45, 45]);
check("running average null before first log", runningAverages("Ann", [entry("Ann", "2026-10-05", 10, 0)]).slice(0, 4), [null, null, 10, 10]);
check("no entries: all null", dailyTotals("Nobody", mine).every((x) => x === null), true);

// --------------------------------------------------------------- funStats

group("funStats");
const fun = [
  entry("Ann", "2026-10-03", 10, 10),
  entry("Ann", "2026-10-04", 5, 5),
  entry("Ann", "2026-10-05", 40, 0),
  entry("Ann", "2026-10-06", 5, 5),
  entry("Ann", "2026-10-08", 1, 1),
  entry("Bo", "2026-10-03", 1, 0),
];
check("best day", funStats("Ann", fun).best?.date, "2026-10-08");
check("streak stops at a high day", funStats("Ann", fun).streak, 2);
check("an unlogged day breaks the run", funStats("Ann", fun.filter((e) => e.date !== "2026-10-04")).streak, 1);
check("tie goes to the earlier day", funStats("Ann", [entry("Ann", "2026-10-10", 5, 0), entry("Ann", "2026-10-07", 5, 0)]).best?.date, "2026-10-07");
check("30 minutes is not under 30", funStats("Ann", [entry("Ann", "2026-10-03", 30, 0)]).streak, 0);
check("nothing logged", funStats("Zed", fun), { best: null, streak: 0 });

// ---------------------------------------------------------------- progress

group("progress");
check("before", progress("2026-10-02"), { day: 0, total: 29, left: 29, state: "before" });
check("first day", progress("2026-10-03"), { day: 1, total: 29, left: 28, state: "during" });
check("last day", progress("2026-10-31"), { day: 29, total: 29, left: 0, state: "during" });
check("after", progress("2026-11-01"), { day: 29, total: 29, left: 0, state: "after" });

group("todayPacific");
// PDT is UTC-7 in October, and PST is UTC-8 from 2026-11-01.
check("just before Pacific midnight", todayPacific(new Date("2026-10-05T06:59:59Z")), "2026-10-04");
check("just after Pacific midnight", todayPacific(new Date("2026-10-05T07:00:00Z")), "2026-10-05");
check("after the DST change", todayPacific(new Date("2026-11-02T07:59:59Z")), "2026-11-01");
check("after the DST change, midnight", todayPacific(new Date("2026-11-02T08:00:00Z")), "2026-11-02");

// -------------------------------------------------------------- formatting

group("formatting");
check("72 minutes", formatMinutes(72), "1h 12m");
check("45 minutes", formatMinutes(45), "45m");
check("zero", formatMinutes(0), "0m");
check("rounds", formatMinutes(59.6), "1h 0m");
check("rounds down", formatMinutes(44.4), "44m");
check("formatDay", formatDay("2026-10-02"), "Oct 2");
check("formatDay november", formatDay("2026-11-02"), "Nov 2");

// ----------------------------------------------------------------- fetchAll

group("fetchAll");
const calls: (string | undefined)[] = [];
const all = await fetchAll<number>(async (cursor) => {
  calls.push(cursor);
  const page = cursor === undefined ? 0 : Number(cursor);
  const size = page === 2 ? 50 : 100;
  return {
    results: Array.from({ length: size }, (_, i) => page * 100 + i),
    has_more: page < 2,
    next_cursor: page < 2 ? String(page + 1) : null,
  };
});
check("250 rows over 3 pages", all.length, 250);
check("rows in order", [all[0], all[100], all[249]], [0, 100, 249]);
check("cursors passed along", calls, [undefined, "1", "2"]);

// ------------------------------------------------------------------- report

console.log("");
for (const f of failures) console.log(`  FAIL ${f}`);
console.log(`\n  ${passed} passed, ${failures.length} failed\n`);
process.exit(failures.length === 0 ? 0 : 1);

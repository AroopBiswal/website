// Run with: node --env-file=.env.local scripts/check-notion.ts
//
// Reads the live Daily Log and prints what the page would show.

import { clean, goalChange, improvements, standings } from "../lib/challenge.ts";
import { getChallenge } from "../lib/challenge-notion.ts";

const data = await getChallenge();
if (!data) {
  console.error("NOTION_CHALLENGE_DATA_SOURCE_ID is not set (also needs NOTION_TOKEN).");
  process.exit(1);
}

const { entries, flags } = clean(data.rows);
console.log("\nPlayers:", data.players.map((p) => `${p.name} ${p.color}`).join(", "));
console.log(`\n${data.rows.length} rows fetched, ${entries.length} kept\n`);
console.table(entries);
console.log("Flags:", flags.length === 0 ? "none" : "");
if (flags.length > 0) console.table(flags);
console.log("");
for (const s of standings(data.players, entries)) {
  const avg = s.average === null ? "-" : s.average.toFixed(1);
  console.log(`${s.rank ?? "-"}. ${s.player.name}: average ${avg} min, total ${s.total} min, ${s.days} days`);
}

console.log("\nBaselines:", data.baselines.length === 0 ? "No baselines yet" : "");
if (data.baselines.length > 0) console.table(data.baselines);
const better = improvements(standings(data.players, entries), data.baselines);
if (better.length > 0) {
  for (const i of better) {
    console.log(`${i.player.name}: baseline ${i.baseline.toFixed(1)} -> ${i.average.toFixed(1)} min (${(i.change * 100).toFixed(1)}%)`);
  }
}

console.log("\nGoals:", data.goals.length === 0 ? "No goals yet" : "");
if (data.goals.length > 0) console.table(data.goals);
for (const s of standings(data.players, entries)) {
  const change = goalChange(s.average, data.goals.find((g) => g.player === s.player.name)?.minutes);
  if (change !== null) console.log(`${s.player.name}: ${(Math.abs(change) * 100).toFixed(1)}% ${change < 0 ? "under" : "over"} goal`);
}

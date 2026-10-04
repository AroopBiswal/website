// Run with: node --env-file=.env.local scripts/check-notion.ts
//
// Reads the live Daily Log and prints what the page would show.

import { clean, standings } from "../lib/challenge.ts";
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

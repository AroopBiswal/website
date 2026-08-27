// Run with: npm run test:j9
//
// Node strips the TypeScript types natively, so this suite needs no test
// framework and no dependency added to the site.

import {
  addDays,
  dayOfWeek,
  easterSunday,
  holidaysForYears,
  mondayOf,
} from "../lib/j9-holidays.ts";
import { calculate, DEFAULT_WEEKS } from "../lib/j9.ts";

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

// ---------------------------------------------------------------- date basics

group("date arithmetic");
check("addDays across a month", addDays("2026-01-31", 1), "2026-02-01");
check("addDays across a year", addDays("2026-12-31", 1), "2027-01-01");
check("addDays backwards", addDays("2026-03-01", -1), "2026-02-28");
check("leap year", addDays("2028-02-28", 1), "2028-02-29");
// Sunday 2026-03-08 is the US spring-forward date. A local-time Date would
// land on 23:00 the previous day here; UTC arithmetic will not.
check("addDays across DST", addDays("2026-03-07", 1), "2026-03-08");
check("dayOfWeek Thursday", dayOfWeek("2026-01-01"), 4);
check("mondayOf a Wednesday", mondayOf("2026-01-07"), "2026-01-05");
check("mondayOf a Monday", mondayOf("2026-01-05"), "2026-01-05");
check("mondayOf a Sunday looks back", mondayOf("2026-01-11"), "2026-01-05");

// ------------------------------------------------------------------- holidays

group("holiday tables");
check("Easter 2026", easterSunday(2026), "2026-04-05");
check("Easter 2027", easterSunday(2027), "2027-03-28");
check("Easter 2038 (late)", easterSunday(2038), "2038-04-25");

const us26 = holidaysForYears("us-federal", [2026]);
const usByName = (n: string) => us26.find((h) => h.name === n)?.date;
check("MLK 2026 is the 3rd Monday", usByName("Martin Luther King Jr. Day"), "2026-01-19");
check("Presidents' Day 2026", usByName("Presidents' Day"), "2026-02-16");
check("Memorial Day 2026 is the last Monday", usByName("Memorial Day"), "2026-05-25");
check("Juneteenth 2026 falls on a Friday", usByName("Juneteenth"), "2026-06-19");
// July 4 2026 is a Saturday, so the observed day is Friday July 3.
check("Independence Day 2026 observed", usByName("Independence Day"), "2026-07-03");
check("Labor Day 2026", usByName("Labor Day"), "2026-09-07");
check("Thanksgiving 2026 is the 4th Thursday", usByName("Thanksgiving"), "2026-11-26");
check("Christmas 2026", usByName("Christmas Day"), "2026-12-25");
check("US set has 11 days", us26.length, 11);
check("no US holiday lands on a weekend", us26.filter((h) => dayOfWeek(h.date) % 6 === 0).length, 0);

const on26 = holidaysForYears("ontario", [2026]);
const onByName = (n: string) => on26.find((h) => h.name === n)?.date;
check("Good Friday 2026", onByName("Good Friday"), "2026-04-03");
check("Family Day 2026", onByName("Family Day"), "2026-02-16");
// May 24 2026 is a Sunday, so Victoria Day is the Monday before, May 18.
check("Victoria Day 2026", onByName("Victoria Day"), "2026-05-18");
check("Canada Day 2026", onByName("Canada Day"), "2026-07-01");
check("Ontario Thanksgiving 2026 is the 2nd Monday", onByName("Thanksgiving"), "2026-10-12");
check("Ontario set has 9 days", on26.length, 9);

// Christmas 2027 is a Saturday and Boxing Day a Sunday, so both shift and the
// de-collision has to keep them on two different weekdays.
const on27 = holidaysForYears("ontario", [2027]);
const xmas27 = on27.find((h) => h.name === "Christmas Day")?.date;
const boxing27 = on27.find((h) => h.name === "Boxing Day")?.date;
check("Christmas 2027 observed", xmas27, "2027-12-24");
check("Boxing Day 2027 does not collide", boxing27, "2027-12-27");
check("no Ontario holiday lands on a weekend", on27.filter((h) => dayOfWeek(h.date) % 6 === 0).length, 0);
check("none set is empty", holidaysForYears("none", [2026]).length, 0);

// ------------------------------------------------------------------ the walk

group("end date calculation");

const noHolidays = { holidaySet: "none" as const, custom: [] };

// A clean 16 weeks with no holidays: start Monday, end the Friday of week 16,
// which is 15 weeks and 4 days after the start.
const clean = calculate({ start: "2026-01-05", weeks: 16, ...noHolidays });
check("clean run starts where asked", clean.effectiveStart, "2026-01-05");
check("clean run has no start note", clean.startNote, null);
check("clean run ends on a Friday", dayOfWeek(clean.endDate), 5);
// 16 full weeks from Monday Jan 5 closes on the Friday 15 weeks and 4 days out.
check("clean run end date", clean.endDate, "2026-04-24");
check("clean run counts 16 weeks", clean.weeks.filter((w) => w.counted).length, 16);
check("clean run skips nothing", clean.skippedWeeks, 0);
check("clean run has no Friday holidays", clean.weeks.every((w) => w.fridayHolidays.length === 0), true);
check("default term is 16 weeks", DEFAULT_WEEKS, 16);

// A weekend start rolls to Monday.
const sat = calculate({ start: "2026-01-03", weeks: 16, ...noHolidays });
check("Saturday start rolls to Monday", sat.effectiveStart, "2026-01-05");
check("Saturday start is explained", sat.startNote !== null, true);
check("Saturday start lands where the Monday start did", sat.endDate, clean.endDate);

// Monday off means a Tuesday start, and that week does not count.
const mlk = calculate({ start: "2026-01-19", weeks: 4, holidaySet: "us-federal", custom: [] });
check("MLK Monday start rolls to Tuesday", mlk.effectiveStart, "2026-01-20");
// The start still moves, but MLK is a Monday, so the week is not skipped.
check("the MLK week still counts", mlk.weeks[0].counted, true);
check("MLK week names the holiday", mlk.weeks[0].holidays[0].name, "Martin Luther King Jr. Day");
check("four counted weeks end four Fridays out", mlk.endDate, "2026-02-13");
check("no week was skipped", mlk.skippedWeeks, 0);

// Only the Friday decides. Labor Day is a Monday, so its week still counts and
// the end date does not move at all.
const laborDay = calculate({ start: "2026-08-31", weeks: 2, holidaySet: "us-federal", custom: [] });
check("a Monday holiday does not skip its week", laborDay.endDate, "2026-09-11");
check("the Labor Day week still counts", laborDay.weeks[1].counted, true);
check("nothing is skipped for a Monday holiday", laborDay.skippedWeeks, 0);
check("the Labor Day week still names the holiday", laborDay.weeks[1].holidays[0].name, "Labor Day");
check("Labor Day is not a Friday holiday", laborDay.weeks[1].fridayHolidays.length, 0);

// Juneteenth and the observed July 4 are both Fridays, so both skip.
const noHol = calculate({ start: "2026-06-01", weeks: 4, ...noHolidays });
const withHol = calculate({ start: "2026-06-01", weeks: 4, holidaySet: "us-federal", custom: [] });
check("no-holiday June ends", noHol.endDate, "2026-06-26");
check("two Friday holidays push the end out two weeks", withHol.endDate, "2026-07-10");
check("two June-July weeks skipped", withHol.skippedWeeks, 2);
check("the Juneteenth week is skipped on its Friday", withHol.weeks[2].fridayHolidays[0].name, "Juneteenth");

// Holidays that land Monday to Thursday cost nothing, however many there are.
const midweekOnly = calculate({
  start: "2026-03-02",
  weeks: 2,
  holidaySet: "none",
  custom: [
    { date: "2026-03-10", name: "Company day" },
    { date: "2026-03-12", name: "Another company day" },
  ],
});
check("two midweek holidays do not skip the week", midweekOnly.endDate, "2026-03-13");
check("that week still counts", midweekOnly.weeks[1].counted, true);
check("that week still lists both holidays", midweekOnly.weeks[1].holidays.length, 2);

// A Friday holiday does skip, and costs exactly one week.
const fridayOff = calculate({
  start: "2026-01-05",
  weeks: 2,
  holidaySet: "none",
  custom: [{ date: "2026-01-16", name: "Shutdown Friday" }],
});
check("a Friday holiday skips its week", fridayOff.endDate, "2026-01-23");
check("the skipped week is the one with the Friday off", fridayOff.weeks[1].counted, false);
check("and it says why", fridayOff.weeks[1].reason.startsWith("The Friday is"), true);

// A part first week counts, because the rule only ever looks at the Friday.
const wed = calculate({ start: "2026-01-07", weeks: 16, ...noHolidays });
check("a Wednesday start still counts week one", wed.weeks[0].counted, true);
check("so it lands on the same Friday as a Monday start", wed.endDate, clean.endDate);
check("Wednesday start does not move the start", wed.startNote, null);

// A midweek custom day is honoured in the listing but changes no dates.
const custom = calculate({
  start: "2026-01-05",
  weeks: 2,
  holidaySet: "none",
  custom: [{ date: "2026-01-14", name: "Offsite" }],
});
check("a midweek custom day does not move the end", custom.endDate, "2026-01-16");
check("custom day is still named in the row", custom.weeks[1].holidays[0].name, "Offsite");
// A custom day on a weekend cannot take a work day away.
const weekendCustom = calculate({
  start: "2026-01-05",
  weeks: 2,
  holidaySet: "none",
  custom: [{ date: "2026-01-10", name: "Saturday thing" }],
});
check("a weekend custom day changes nothing", weekendCustom.endDate, "2026-01-16");

// Every counted week is a clean Monday-to-Friday stretch, and the answer is
// always a Friday, which is the whole contract of this thing.
group("invariants over many starts");
let invariantFailures = 0;
for (let i = 0; i < 400; i++) {
  const start = addDays("2026-01-01", i);
  for (const set of ["us-federal", "ontario"] as const) {
    const r = calculate({ start, weeks: 16, holidaySet: set, custom: [] });
    if (dayOfWeek(r.endDate) !== 5) invariantFailures++;
    if (r.weeks.filter((w) => w.counted).length !== 16) invariantFailures++;
    if (dayOfWeek(r.effectiveStart) === 0 || dayOfWeek(r.effectiveStart) === 6) invariantFailures++;
    if (r.effectiveStart < start) invariantFailures++;
    if (r.endDate <= r.effectiveStart) invariantFailures++;
    for (const w of r.weeks) {
      if (w.counted && w.fridayHolidays.length > 0) invariantFailures++;
      if (!w.counted && w.fridayHolidays.length === 0) invariantFailures++;
    }
  }
}
check("800 runs hold every invariant", invariantFailures, 0);

// ------------------------------------------------------------------- report

console.log("");
for (const f of failures) console.log(`  FAIL ${f}`);
console.log(`\n  ${passed} passed, ${failures.length} failed\n`);
process.exit(failures.length === 0 ? 0 : 1);

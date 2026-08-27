// The end-date rule, kept free of React so it can be tested on its own.
//
// The contract, in one line: from a first day of work, find the Nth Friday you
// actually work, where a week whose Friday is a holiday does not count and
// pushes the whole term out by a week.
//
// Only the Friday decides. A holiday on Monday through Thursday is a day off
// but does not change the end date, because the week still ends on a worked
// Friday.

import {
  addDays,
  dayOfWeek,
  holidaysForYears,
  isWeekend,
  mondayOf,
  type Holiday,
  type HolidaySetId,
  type ISODate,
} from "./j9-holidays.ts";

export const DEFAULT_WEEKS = 16;
export const MIN_WEEKS = 1;
export const MAX_WEEKS = 52;

export type CustomDay = { date: ISODate; name: string };

export type WeekRow = {
  /** Position in the calendar walk, starting at 1. */
  index: number;
  monday: ISODate;
  friday: ISODate;
  counted: boolean;
  /** Which of the N working weeks this is, or null when the week did not count. */
  countedAs: number | null;
  /** Every holiday Monday to Friday, whether or not it changed the count. */
  holidays: Holiday[];
  /** The subset falling on the Friday. Non-empty is exactly why a week is skipped. */
  fridayHolidays: Holiday[];
  /** Plain-English note about this week. Empty when it was an ordinary full week. */
  reason: string;
};

export type Result = {
  requestedStart: ISODate;
  effectiveStart: ISODate;
  /** Set when the requested start had to move, explaining why. */
  startNote: string | null;
  endDate: ISODate;
  endNote: string | null;
  weeks: WeekRow[];
  countedWeeks: number;
  skippedWeeks: number;
  calendarWeeks: number;
  calendarDays: number;
};

export type Input = {
  start: ISODate;
  weeks: number;
  holidaySet: HolidaySetId;
  custom: CustomDay[];
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function weekdayName(iso: ISODate): string {
  return DAY_NAMES[dayOfWeek(iso)];
}

/** "January 5, 2026". Hand-rolled so the server and the browser always agree. */
export function formatDate(iso: ISODate): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
}

/** "Monday, January 5, 2026". */
export function formatLong(iso: ISODate): string {
  return `${weekdayName(iso)}, ${formatDate(iso)}`;
}

/** "Jan 5". */
export function formatShort(iso: ISODate): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTH_NAMES[m - 1].slice(0, 3)} ${d}`;
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const probe = new Date(Date.UTC(y, m - 1, d));
  return probe.getUTCFullYear() === y && probe.getUTCMonth() === m - 1 && probe.getUTCDate() === d;
}

function joinList(parts: string[]): string {
  if (parts.length <= 1) return parts.join("");
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

function namesOf(holidays: Holiday[]): string {
  return joinList(
    holidays.map((h) => `${h.name}${h.observed ? " (observed)" : ""} on ${formatShort(h.date)}`),
  );
}

/**
 * Every holiday that matters, keyed by date. A date can hold more than one
 * entry when a day the user added lands on a public holiday.
 */
function buildHolidayMap(input: Input): Map<ISODate, Holiday[]> {
  const startYear = Number(input.start.slice(0, 4));
  // A term can only stretch so far past its nominal length, so four years of
  // tables comfortably covers even a 52 week term full of holidays.
  const years = [startYear - 1, startYear, startYear + 1, startYear + 2, startYear + 3];

  const map = new Map<ISODate, Holiday[]>();
  const add = (h: Holiday) => {
    const existing = map.get(h.date);
    if (existing) existing.push(h);
    else map.set(h.date, [h]);
  };

  for (const h of holidaysForYears(input.holidaySet, years)) add(h);
  for (const c of input.custom) {
    if (!isValidISODate(c.date)) continue;
    add({ date: c.date, name: c.name.trim() || "Day off", observed: false });
  }
  return map;
}

export function calculate(input: Input): Result {
  const weeksWanted = Math.min(MAX_WEEKS, Math.max(MIN_WEEKS, Math.round(input.weeks)));
  const holidayMap = buildHolidayMap(input);

  // --- Move the start onto a day you would actually be at work ------------
  // A weekend start rolls forward, and so does a start on a holiday. "If
  // Monday is off, start Tuesday" is that second rule seen from Monday.
  const moved: string[] = [];
  let effectiveStart = input.start;
  for (let guard = 0; guard < 30; guard++) {
    if (isWeekend(effectiveStart)) {
      moved.push(`${formatDate(effectiveStart)} is a ${weekdayName(effectiveStart)}`);
      effectiveStart = addDays(effectiveStart, 1);
      continue;
    }
    const onDay = holidayMap.get(effectiveStart);
    if (onDay) {
      moved.push(`${weekdayName(effectiveStart)} is ${onDay[0].name}`);
      effectiveStart = addDays(effectiveStart, 1);
      continue;
    }
    break;
  }
  const startNote = moved.length
    ? `${joinList(moved)}, so the clock starts ${formatLong(effectiveStart)}.`
    : null;

  // --- Walk the calendar one week at a time -------------------------------
  const weeks: WeekRow[] = [];
  let cursor = mondayOf(effectiveStart);
  let counted = 0;
  let endDate: ISODate | null = null;

  // A term cannot plausibly need more calendar weeks than this, and the cap
  // means a bad holiday list produces a wrong answer rather than a hung tab.
  const MAX_CALENDAR_WEEKS = 400;

  for (let i = 0; i < MAX_CALENDAR_WEEKS && counted < weeksWanted; i++) {
    const monday = cursor;
    const friday = addDays(monday, 4);
    const holidays: Holiday[] = [];
    for (let d = 0; d < 5; d++) {
      const hit = holidayMap.get(addDays(monday, d));
      if (hit) holidays.push(...hit);
    }
    // The Friday is the only day that decides. A week whose Friday is a
    // holiday did not end on a worked day, so it does not count and the term
    // slides out by a week. Holidays earlier in the week are days off that
    // leave the end date alone.
    const fridayHolidays = holidayMap.get(friday) ?? [];
    const isCounted = fridayHolidays.length === 0;

    let reason = "";
    if (fridayHolidays.length) {
      reason = `The Friday is ${namesOf(fridayHolidays)}`;
    } else if (holidays.length) {
      reason = `${namesOf(holidays)}, so a day off, but the week still ends on a worked Friday`;
    }

    if (isCounted) counted++;
    weeks.push({
      index: i + 1,
      monday,
      friday,
      counted: isCounted,
      countedAs: isCounted ? counted : null,
      holidays,
      fridayHolidays,
      reason,
    });

    if (isCounted && counted === weeksWanted) endDate = friday;
    cursor = addDays(cursor, 7);
  }

  // Fall back to the last Friday walked if the cap was somehow hit.
  let finalEnd = endDate ?? addDays(cursor, -3);

  // "If the Friday is off, extend to the next Friday" is the same statement as
  // the skip rule above, seen from the other end, so by construction this can
  // never fire. It stays as a cheap assertion that the two agree.
  let endNote: string | null = null;
  for (let guard = 0; guard < 30 && holidayMap.has(finalEnd); guard++) {
    const name = holidayMap.get(finalEnd)![0].name;
    finalEnd = addDays(finalEnd, 7);
    endNote = `The closing Friday fell on ${name}, so it moved to the next Friday.`;
  }

  return {
    requestedStart: input.start,
    effectiveStart,
    startNote,
    endDate: finalEnd,
    endNote,
    weeks,
    countedWeeks: counted,
    skippedWeeks: weeks.filter((w) => !w.counted).length,
    calendarWeeks: weeks.length,
    calendarDays:
      Math.round(
        (Date.parse(`${finalEnd}T00:00:00Z`) - Date.parse(`${effectiveStart}T00:00:00Z`)) / 86_400_000,
      ) + 1,
  };
}

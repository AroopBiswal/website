// Holiday tables for the end-date calculator.
//
// Everything here is computed from the year rather than hardcoded per year, so
// the calculator keeps working without anyone maintaining a list. Dates are
// plain "YYYY-MM-DD" strings and every Date object is built in UTC, because a
// local-time Date silently shifts across a DST boundary and turns a Monday into
// a Sunday.

export type ISODate = string; // "YYYY-MM-DD"

export type Holiday = {
  date: ISODate; // the observed date, which is the day the office is shut
  name: string;
  observed: boolean; // true when the statutory date fell on a weekend
};

export type HolidaySetId = "us-federal" | "ontario" | "none";

export const HOLIDAY_SETS: { id: HolidaySetId; label: string; note: string }[] = [
  {
    id: "us-federal",
    label: "US federal",
    note: "The 11 federal holidays. Weekend ones shift to the nearest weekday.",
  },
  {
    id: "ontario",
    label: "Ontario, Canada",
    note: "The 9 Ontario statutory holidays, including Good Friday and Boxing Day.",
  },
  { id: "none", label: "None", note: "Only the days you add yourself below." },
];

const MS_DAY = 86_400_000;

export function toUTC(iso: ISODate): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toISO(d: Date): ISODate {
  return d.toISOString().slice(0, 10);
}

export function addDays(iso: ISODate, n: number): ISODate {
  return toISO(new Date(toUTC(iso).getTime() + n * MS_DAY));
}

/** 0 Sunday through 6 Saturday. */
export function dayOfWeek(iso: ISODate): number {
  return toUTC(iso).getUTCDay();
}

export function isWeekend(iso: ISODate): boolean {
  const d = dayOfWeek(iso);
  return d === 0 || d === 6;
}

/** The Monday of the week containing `iso`. Sunday counts as the week just ended. */
export function mondayOf(iso: ISODate): ISODate {
  const d = dayOfWeek(iso);
  return addDays(iso, -(d === 0 ? 6 : d - 1));
}

function ymd(y: number, m: number, d: number): ISODate {
  return toISO(new Date(Date.UTC(y, m - 1, d)));
}

/** The nth given weekday of a month, for example the 3rd Monday of January. */
function nthWeekday(year: number, month: number, weekday: number, n: number): ISODate {
  const first = ymd(year, month, 1);
  const shift = (weekday - dayOfWeek(first) + 7) % 7;
  return addDays(first, shift + (n - 1) * 7);
}

/** The last given weekday of a month, for example the last Monday of May. */
function lastWeekday(year: number, month: number, weekday: number): ISODate {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const last = ymd(year, month, lastDay);
  return addDays(last, -((dayOfWeek(last) - weekday + 7) % 7));
}

/**
 * A fixed-date holiday, moved off a weekend the way most employers move it:
 * Saturday shifts back to Friday, Sunday shifts forward to Monday.
 */
function fixed(year: number, month: number, day: number, name: string): Holiday {
  const actual = ymd(year, month, day);
  const d = dayOfWeek(actual);
  if (d === 6) return { date: addDays(actual, -1), name, observed: true };
  if (d === 0) return { date: addDays(actual, 1), name, observed: true };
  return { date: actual, name, observed: false };
}

/** Easter Sunday by the anonymous Gregorian algorithm. */
export function easterSunday(year: number): ISODate {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return ymd(year, month, day);
}

function usFederal(year: number): Holiday[] {
  return [
    fixed(year, 1, 1, "New Year's Day"),
    { date: nthWeekday(year, 1, 1, 3), name: "Martin Luther King Jr. Day", observed: false },
    { date: nthWeekday(year, 2, 1, 3), name: "Presidents' Day", observed: false },
    { date: lastWeekday(year, 5, 1), name: "Memorial Day", observed: false },
    fixed(year, 6, 19, "Juneteenth"),
    fixed(year, 7, 4, "Independence Day"),
    { date: nthWeekday(year, 9, 1, 1), name: "Labor Day", observed: false },
    { date: nthWeekday(year, 10, 1, 2), name: "Columbus Day", observed: false },
    fixed(year, 11, 11, "Veterans Day"),
    { date: nthWeekday(year, 11, 4, 4), name: "Thanksgiving", observed: false },
    fixed(year, 12, 25, "Christmas Day"),
  ];
}

function ontario(year: number): Holiday[] {
  // Victoria Day is the Monday on or before May 24.
  const may24 = ymd(year, 5, 24);
  const victoria = addDays(may24, -((dayOfWeek(may24) - 1 + 7) % 7));
  return [
    fixed(year, 1, 1, "New Year's Day"),
    { date: nthWeekday(year, 2, 1, 3), name: "Family Day", observed: false },
    { date: addDays(easterSunday(year), -2), name: "Good Friday", observed: false },
    { date: victoria, name: "Victoria Day", observed: false },
    fixed(year, 7, 1, "Canada Day"),
    { date: nthWeekday(year, 9, 1, 1), name: "Labour Day", observed: false },
    { date: nthWeekday(year, 10, 1, 2), name: "Thanksgiving", observed: false },
    fixed(year, 12, 25, "Christmas Day"),
    fixed(year, 12, 26, "Boxing Day"),
  ];
}

/**
 * Two holidays can land on the same observed weekday, most often Christmas and
 * Boxing Day over a weekend. Push the later one forward so both days are off.
 */
function decollide(list: Holiday[]): Holiday[] {
  const sorted = [...list].sort((a, b) => a.date.localeCompare(b.date));
  const taken = new Set<ISODate>();
  return sorted.map((h) => {
    let date = h.date;
    let moved = false;
    while (taken.has(date) || isWeekend(date)) {
      date = addDays(date, 1);
      moved = true;
    }
    taken.add(date);
    return moved ? { ...h, date, observed: true } : h;
  });
}

/** Every holiday in the set for the given years, sorted and de-collided. */
export function holidaysForYears(set: HolidaySetId, years: number[]): Holiday[] {
  if (set === "none") return [];
  const build = set === "ontario" ? ontario : usFederal;
  // De-collide across the whole range, not per year, so a New Year's Day that
  // observes back into the previous December is compared against that December.
  return decollide(years.flatMap((y) => build(y)));
}

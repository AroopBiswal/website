"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye, useEyeTracking } from "../components/googly";
import {
  HOLIDAY_SETS,
  type HolidaySetId,
  isWeekend,
  toISO,
} from "@/lib/j9-holidays";
import {
  calculate,
  DEFAULT_WEEKS,
  formatLong,
  formatShort,
  isValidISODate,
  MAX_WEEKS,
  MIN_WEEKS,
  weekdayName,
  type CustomDay,
} from "@/lib/j9";

const STORAGE_KEY = "j9calculator";

type Saved = {
  start: string;
  weeks: number;
  holidaySet: HolidaySetId;
  custom: CustomDay[];
};

/** Today in the viewer's own timezone, as YYYY-MM-DD. */
function todayLocal(): string {
  const now = new Date();
  return toISO(new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())));
}

export default function Calculator() {
  // Everything starts empty so the server HTML and the first client render
  // agree. Real values land in the effect below, one frame after hydration.
  const [ready, setReady] = useState(false);
  const [start, setStart] = useState("");
  const [weeksText, setWeeksText] = useState(String(DEFAULT_WEEKS));
  const [holidaySet, setHolidaySet] = useState<HolidaySetId>("us-federal");
  const [custom, setCustom] = useState<CustomDay[]>([]);
  const [newDate, setNewDate] = useState("");
  const [newName, setNewName] = useState("");
  const [showWeeks, setShowWeeks] = useState(false);
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const parsedWeeks = Number.parseInt(weeksText, 10);
  const weeksValid =
    Number.isFinite(parsedWeeks) && parsedWeeks >= MIN_WEEKS && parsedWeeks <= MAX_WEEKS;
  const weeksNumber = weeksValid ? parsedWeeks : DEFAULT_WEEKS;
  const startValid = isValidISODate(start);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
    let saved: Partial<Saved> = {};
    try {
      saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    } catch {
      // A corrupt or blocked store just means we fall back to the defaults.
    }
    setStart(isValidISODate(saved.start ?? "") ? saved.start! : todayLocal());
    if (typeof saved.weeks === "number") setWeeksText(String(saved.weeks));
    if (HOLIDAY_SETS.some((s) => s.id === saved.holidaySet)) {
      setHolidaySet(saved.holidaySet as HolidaySetId);
    }
    if (Array.isArray(saved.custom)) {
      setCustom(saved.custom.filter((c) => c && isValidISODate(c.date)));
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const payload: Saved = { start, weeks: weeksNumber, holidaySet, custom };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Private browsing can refuse writes. The calculator still works.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, start, weeksText, holidaySet, custom]);

  useEyeTracking([ready, showWeeks]);

  const result = useMemo(
    () =>
      startValid
        ? calculate({ start, weeks: weeksNumber, holidaySet, custom })
        : null,
    [start, startValid, weeksNumber, holidaySet, custom],
  );

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem("site-theme", next);
    } catch {
      // Not being able to remember the choice is not worth failing over.
    }
  };

  const addCustom = () => {
    if (!isValidISODate(newDate)) return;
    if (custom.some((c) => c.date === newDate)) return;
    setCustom(
      [...custom, { date: newDate, name: newName.trim() || "Day off" }].sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
    );
    setNewDate("");
    setNewName("");
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(formatLong(result.endDate));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be denied. The date is on screen either way.
    }
  };

  const setId = HOLIDAY_SETS.find((s) => s.id === holidaySet);

  return (
    <div className="j9-root">
      <div className="j9-frame" />
      <div className="j9-wrap">
        <div className="j9-topbar">
          <Link href="/" className="j9-back">
            <span aria-hidden>&larr;</span> aroopbiswal.com
          </Link>
          <button className="theme-toggle" onClick={toggleTheme} suppressHydrationWarning>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>

        <header className="j9-head">
          <h1 className="j9-title">
            Janine&apos;s
            <br />
            <span className="j9-title-accent">End Date</span> Calculator
          </h1>
          <span className="j9-eyes" aria-hidden>
            <Eye size={40} pupil={18} border={3} style={{ boxShadow: "3px 3px 0 var(--shadow)" }} />
            <Eye size={40} pupil={18} border={3} style={{ boxShadow: "3px 3px 0 var(--shadow)" }} />
          </span>
        </header>
        <p className="j9-sub">
          Give it your first day of work and it finds the Friday that closes the term. A week with a
          holiday in it is not a full working week, so it does not count and the whole term slides
          out by a week.
        </p>

        <div className="j9-grid">
          {/* ------------------------------ inputs ------------------------ */}
          <section className="j9-card j9-controls">
            <p className="j9-card-title">Your term</p>

            <div className="j9-field">
              <label className="j9-label" htmlFor="j9-start">
                First day of work
              </label>
              <input
                id="j9-start"
                type="date"
                className={`j9-input${start && !startValid ? " j9-invalid" : ""}`}
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
              {startValid && (
                <p className="j9-hint">
                  That is a {weekdayName(start)}
                  {isWeekend(start) ? ", so the clock starts the following Monday." : "."}
                </p>
              )}
            </div>

            <div className="j9-field">
              <label className="j9-label" htmlFor="j9-weeks">
                Working weeks in the term
              </label>
              <input
                id="j9-weeks"
                type="number"
                min={MIN_WEEKS}
                max={MAX_WEEKS}
                className={`j9-input${weeksValid ? "" : " j9-invalid"}`}
                value={weeksText}
                onChange={(e) => setWeeksText(e.target.value)}
              />
              {!weeksValid && (
                <p className="j9-hint">
                  Needs a whole number between {MIN_WEEKS} and {MAX_WEEKS}. Using{" "}
                  {DEFAULT_WEEKS} for now.
                </p>
              )}
            </div>

            <div className="j9-field">
              <span className="j9-label">Which holidays count</span>
              <div className="j9-segmented">
                {HOLIDAY_SETS.map((s) => (
                  <button
                    key={s.id}
                    className={`j9-seg${holidaySet === s.id ? " j9-on" : ""}`}
                    onClick={() => setHolidaySet(s.id)}
                    aria-pressed={holidaySet === s.id}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              {setId && <p className="j9-hint">{setId.note}</p>}
            </div>

            <div className="j9-field">
              <span className="j9-label">Other days off</span>
              <div className="j9-row">
                <input
                  type="date"
                  className="j9-input"
                  value={newDate}
                  aria-label="Date of the extra day off"
                  onChange={(e) => setNewDate(e.target.value)}
                />
                <input
                  type="text"
                  className="j9-input"
                  placeholder="What is it?"
                  value={newName}
                  aria-label="Name of the extra day off"
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustom()}
                />
                <button
                  className="j9-btn"
                  onClick={addCustom}
                  disabled={!isValidISODate(newDate) || custom.some((c) => c.date === newDate)}
                >
                  Add
                </button>
              </div>
              <p className="j9-hint">
                Shutdowns, offsites, anything else the office is closed for. A day that lands on a
                weekend changes nothing, since it was not a working day to begin with.
              </p>
              {custom.length > 0 && (
                <ul className="j9-daylist">
                  {custom.map((c) => (
                    <li key={c.date} className="j9-day">
                      <span className="j9-day-date">{formatShort(c.date)}</span>
                      <span className="j9-day-name">{c.name}</span>
                      <button
                        className="j9-x"
                        aria-label={`Remove ${c.name}`}
                        onClick={() => setCustom(custom.filter((x) => x.date !== c.date))}
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* ------------------------------ answer ------------------------ */}
          <section>
            {result ? (
              <>
                <div className="j9-answer">
                  <p className="j9-answer-label">Last day of the term</p>
                  <p className="j9-answer-day">{weekdayName(result.endDate)}</p>
                  <p className="j9-answer-date">
                    {formatLong(result.endDate).replace(/^[A-Za-z]+, /, "")}
                  </p>
                  <div className="j9-answer-actions">
                    <button className="j9-btn" onClick={copy}>
                      {copied ? "Copied" : "Copy date"}
                    </button>
                    <button className="j9-btn j9-btn-quiet" onClick={() => setShowWeeks((v) => !v)}>
                      {showWeeks ? "Hide the weeks" : "Show every week"}
                    </button>
                  </div>
                </div>

                <div className="j9-stats">
                  <div className="j9-stat">
                    <div className="j9-stat-n">{result.countedWeeks}</div>
                    <div className="j9-stat-l">Working weeks</div>
                  </div>
                  <div className="j9-stat">
                    <div className="j9-stat-n">{result.skippedWeeks}</div>
                    <div className="j9-stat-l">Weeks skipped</div>
                  </div>
                  <div className="j9-stat">
                    <div className="j9-stat-n">{result.calendarWeeks}</div>
                    <div className="j9-stat-l">Calendar weeks</div>
                  </div>
                </div>

                {result.startNote && (
                  <p className="j9-note">
                    <span className="j9-note-icon" aria-hidden>
                      &#9654;
                    </span>
                    <span>{result.startNote}</span>
                  </p>
                )}
                {result.skippedWeeks > 0 && (
                  <p className="j9-note">
                    <span className="j9-note-icon" aria-hidden>
                      &#9654;
                    </span>
                    <span>
                      {result.skippedWeeks === 1
                        ? "One week had a holiday in it, so the term runs a week longer than "
                        : `${result.skippedWeeks} weeks had holidays in them, so the term runs ${result.skippedWeeks} weeks longer than `}
                      a straight {result.countedWeeks} weeks on the calendar.
                    </span>
                  </p>
                )}
                {result.endNote && (
                  <p className="j9-note">
                    <span className="j9-note-icon" aria-hidden>
                      &#9654;
                    </span>
                    <span>{result.endNote}</span>
                  </p>
                )}
              </>
            ) : (
              <div className="j9-card">
                <p className="j9-card-title">Waiting on a date</p>
                <p className="j9-hint" style={{ marginTop: 0 }}>
                  {ready ? "Pick a first day of work to see the end date." : "Loading."}
                </p>
              </div>
            )}
          </section>
        </div>

        {/* ---------------------------- breakdown ------------------------- */}
        {result && showWeeks && (
          <section className="j9-card j9-break">
            <div className="j9-break-head">
              <p className="j9-card-title" style={{ margin: 0 }}>
                Week by week
              </p>
            </div>
            <ul className="j9-weeks">
              {result.weeks.map((w) => (
                <li
                  key={w.monday}
                  className={`j9-week${w.friday === result.endDate ? " j9-week-final" : ""}`}
                >
                  <span className="j9-week-i">{w.index}</span>
                  <span className="j9-week-span">
                    {formatShort(w.monday)} to {formatShort(w.friday)}
                  </span>
                  <span
                    className={`j9-badge ${
                      w.friday === result.endDate
                        ? "j9-badge-end"
                        : w.counted
                          ? "j9-badge-on"
                          : "j9-badge-off"
                    }`}
                  >
                    {w.friday === result.endDate
                      ? "Last week"
                      : w.counted
                        ? `Week ${w.countedAs}`
                        : "Does not count"}
                  </span>
                  <span className="j9-week-reason">{w.reason}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ------------------------------- rules -------------------------- */}
        <section className="j9-card j9-rules">
          <p className="j9-card-title">The rules it follows</p>
          <ol>
            <li>
              The answer is always a Friday, the one that closes the last full working week of the
              term.
            </li>
            <li>
              A week with a holiday in it is not a full working week. It does not count toward the
              total, so the term slides out by a week. Two holidays in the same week still cost only
              that one week.
            </li>
            <li>
              If your first day falls on a weekend or a holiday, the clock starts on the next
              working day. A Monday holiday means a Tuesday start.
            </li>
            <li>
              If the closing Friday were a day off it would move to the next Friday, though rule two
              means that cannot happen: a week that ends on a holiday was never counted.
            </li>
            <li>
              A first week you are not there for from Monday is a part week, so it does not count
              either.
            </li>
          </ol>
        </section>

        <p className="j9-foot">
          Everything is worked out in your browser and remembered on this device only.
        </p>
      </div>
    </div>
  );
}

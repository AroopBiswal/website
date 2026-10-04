import type { Metadata } from "next";
import Image from "next/image";
import { getChallenge } from "@/lib/challenge-notion";
import {
  BUY_IN,
  END,
  START,
  clean,
  dailyTotals,
  formatDay,
  formatMinutes,
  improvements,
  bestDay,
  progress,
  runningAverages,
  standings,
  todayPacific,
} from "@/lib/challenge";
import { copy } from "./copy";
import LineChart from "./charts";

// Rows are logged in Notion without a deploy; a minute is fresh enough.
export const revalidate = 60;

export const metadata: Metadata = {
  title: copy.metaTitle,
  description: copy.metaDescription,
  robots: { index: false, follow: false },
};

// Height in px of the tallest bar in the goals chart. Heights are set in px, not
// nested percentages, which collapsed to nothing in some browsers.
const BAR_MAX = 166;

// Players with a photo at public/challenge/<name>.jpg, shown on top of their bar.
const FACES = ["samar", "kayla", "audrey", "aroop"];

/** "Oct 4, 3:15 PM", in Pacific. Server only, so Intl cannot disagree with a browser. */
function formatUpdated(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

function Swatch({ color }: { color: string }) {
  return <span className="challenge-swatch" style={{ background: color }} />;
}

export default async function ChallengePage() {
  const data = await getChallenge();
  if (!data) return <p className="blog-empty">{copy.notConfigured}</p>;

  const { players, rows, baselines, goals, fetchedAt } = data;
  const { entries, flags } = clean(rows);
  const board = standings(players, entries);
  const mockToday = process.env.NODE_ENV !== "production" && process.env.CHALLENGE_MOCK_TODAY;
  const prog = progress(mockToday || todayPacific(new Date()));
  const better = improvements(board, baselines);
  const leaders = board.filter((s) => s.rank === 1).map((s) => s.player.name).join(", ");
  // Bars are measured in goal-bar heights: every goal bar is 1, an average bar is its ratio to its own goal
  // (capped at 3; no goal means 1). The tallest bar on the board fills the plot.
  const ratio = (avg: number, goal: number) => (goal > 0 ? Math.min(avg / goal, 3) : 1);
  const maxRatio = Math.max(
    1,
    ...board.map((s) => ratio(s.average ?? 0, goals.find((g) => g.player === s.player.name)?.minutes ?? 0)),
  );
  const pot = BUY_IN * players.length;

  const raceSeries = players.map((p) => runningAverages(p.name, entries));
  const dailySeries = players.map((p) => dailyTotals(p.name, entries));
  // Index of the last day to draw: today, or the final day once it is over.
  const through = prog.day - 1;

  return (
    <>
      <div className="panel-head challenge-head">
        <h1 className="panel-title">{copy.title}</h1>
        <p className="challenge-context">{copy.context}</p>
        <p className="challenge-meta">
          {copy.pot(pot)} · {copy.range(formatDay(START), formatDay(END))}
        </p>
        <p className="challenge-meta">
          {prog.state === "before" && copy.before(formatDay(START))}
          {prog.state === "during" && `${copy.dayOf(prog.day, prog.total)} · ${copy.daysLeft(prog.left)}`}
          {prog.state === "after" && copy.over}
        </p>
        {prog.state === "after" && leaders && <p className="challenge-meta">{copy.winner(leaders)}</p>}
      </div>

      <section className="challenge-section">
        <h2 className="challenge-heading">{copy.leaderboardHeading}</h2>
        <ol className="challenge-board">
          {board.map((s) => {
            const goal = goals.find((g) => g.player === s.player.name)?.minutes;
            return (
            <li key={s.player.name} className="card challenge-row">
              <span className="challenge-rank">{s.rank ?? copy.noValue}</span>
              <span className="challenge-name">
                <Swatch color={s.player.color} />
                {s.player.name}
              </span>
              <span className="challenge-avg">
                {s.average === null ? copy.noValue : formatMinutes(s.average)}
                <small>{copy.average}</small>
                {goal !== undefined && <small className="challenge-goal">{copy.goalLabel(formatMinutes(goal))}</small>}
              </span>
              <dl className="challenge-stats">
                <div>
                  <dt>{copy.totalLabel}</dt>
                  <dd>{s.days === 0 ? copy.noValue : formatMinutes(s.total)}</dd>
                </div>
                <div>
                  <dt>{copy.daysLogged}</dt>
                  <dd>{s.days === 0 ? copy.noValue : s.days}</dd>
                </div>
                <div>
                  <dt>{copy.tiktok}</dt>
                  <dd>{s.days === 0 ? copy.noValue : formatMinutes(s.tiktok)}</dd>
                </div>
                <div>
                  <dt>{copy.instagram}</dt>
                  <dd>{s.days === 0 ? copy.noValue : formatMinutes(s.instagram)}</dd>
                </div>
                <div>
                  <dt>{copy.underGoal}</dt>
                  <dd>
                    {s.average !== null && goal !== undefined && s.average <= goal ? (
                      <span role="img" aria-label={copy.yes}>{copy.underGoalYes}</span>
                    ) : (
                      copy.noValue
                    )}
                  </dd>
                </div>
              </dl>
            </li>
            );
          })}
        </ol>
      </section>

      {entries.length === 0 ? (
        <p className="blog-empty challenge-section">{copy.noEntries}</p>
      ) : (
        <>
          <div className="challenge-charts">
            <section className="challenge-section">
              <h2 className="challenge-heading">{copy.raceHeading}</h2>
              <div className="card challenge-card">
                <LineChart players={players} series={raceSeries} through={through} label={copy.raceLabel} hint={copy.chartHint} noValue={copy.noValue} />
              </div>
            </section>
            <section className="challenge-section">
              <h2 className="challenge-heading">{copy.dailyHeading}</h2>
              <div className="card challenge-card">
                <LineChart players={players} series={dailySeries} through={through} label={copy.dailyLabel} hint={copy.chartHint} noValue={copy.noValue} />
              </div>
            </section>
          </div>

          <section className="challenge-section">
            <h2 className="challenge-heading">{copy.splitHeading}</h2>
            <div className="card challenge-card">
              <p className="challenge-key">
                <span><i className="challenge-seg-tiktok" />{copy.tiktok}</span>
                <span><i className="challenge-seg-instagram" />{copy.instagram}</span>
                <span><i className="challenge-seg-goal" />{copy.goalKey}</span>
              </p>
              <div className="challenge-columns">
                {board.map((s) => {
                  const goal = goals.find((g) => g.player === s.player.name)?.minutes ?? 0;
                  const avgTik = s.days > 0 ? s.tiktok / s.days : 0;
                  const avgIg = s.days > 0 ? s.instagram / s.days : 0;
                  const avg = avgTik + avgIg;
                  const avgUnits = avg > 0 ? ratio(avg, goal) : 0;
                  const top = Math.max(avgUnits, goal > 0 ? 1 : 0);
                  return (
                    <div key={s.player.name} className="challenge-col">
                      <span className="challenge-col-total">{avg > 0 ? formatMinutes(s.average ?? avg) : copy.noValue}</span>
                      <div className="challenge-plot">
                        {FACES.includes(s.player.name.toLowerCase()) && (
                          <Image
                            className="challenge-face"
                            src={`/challenge/${s.player.name.toLowerCase()}.jpg`}
                            alt=""
                            width={48}
                            height={48}
                          />
                        )}
                        {top > 0 && (
                          <div className="challenge-pair">
                            {avg > 0 && (
                              <div className="challenge-vbar" style={{ height: (avgUnits / maxRatio) * BAR_MAX }}>
                                {avgIg > 0 && <span className="challenge-seg-instagram" style={{ flexGrow: avgIg }} />}
                                {avgTik > 0 && <span className="challenge-seg-tiktok" style={{ flexGrow: avgTik }} />}
                              </div>
                            )}
                            {goal > 0 && (
                              <div className={`challenge-vbar challenge-seg-goal${s.days > 0 && avg <= goal ? " met" : ""}`} style={{ height: BAR_MAX / maxRatio }}>
                                <span className="challenge-target" aria-hidden="true">{copy.goalEmoji}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <span className="challenge-name challenge-col-name">{s.player.name}</span>
                      <span className="challenge-col-app">{avg > 0 && <><i className="challenge-seg-tiktok" />{formatMinutes(avgTik)}</>}</span>
                      <span className="challenge-col-app">{avg > 0 && <><i className="challenge-seg-instagram" />{formatMinutes(avgIg)}</>}</span>
                      <span className="challenge-col-app">{goal > 0 && copy.goalLabel(formatMinutes(goal))}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="challenge-section">
            <h2 className="challenge-heading">{copy.funHeading}</h2>
            <div className="challenge-fun">
              {players.map((p) => {
                const best = bestDay(p.name, entries);
                return (
                  <div key={p.name} className="card challenge-card">
                    <span className="challenge-name">
                      <Swatch color={p.color} />
                      {p.name}
                    </span>
                    <dl className="challenge-stats">
                      <div>
                        <dt>{copy.bestDay}</dt>
                        <dd>{best ? `${formatDay(best.date)} · ${formatMinutes(best.total)}` : copy.noValue}</dd>
                      </div>
                    </dl>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}

      {better.length > 0 && (
        <section className="challenge-section">
          <h2 className="challenge-heading">{copy.improvementHeading}</h2>
          <p className="challenge-note">{copy.improvementNote}</p>
          <ul className="challenge-improve">
            {better.map((i) => (
              <li key={i.player.name} className="card challenge-card">
                <span className="challenge-name">
                  <Swatch color={i.player.color} />
                  {i.player.name}
                </span>
                <span className="challenge-change" data-better={i.change < 0}>
                  {copy.changePercent(i.change)}
                </span>
                <span className="challenge-from">{copy.baselineToNow(formatMinutes(i.baseline), formatMinutes(i.average))}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="challenge-foot">
        {flags.map((f) => (
          <p key={`${f.kind}|${f.player}|${f.date}`}>
            {f.kind === "duplicate"
              ? copy.flagDuplicate(f.player, formatDay(f.date))
              : copy.flagOutOfRange(f.player, formatDay(f.date))}
          </p>
        ))}
        <p>{copy.updated(formatUpdated(fetchedAt))}</p>
      </footer>
    </>
  );
}

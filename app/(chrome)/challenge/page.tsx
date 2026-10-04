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
  bestDay,
  progress,
  runningAverages,
  standings,
  todayPacific,
} from "@/lib/challenge";
import { copy } from "./copy";
import LineChart from "./charts";

// Rows are logged in Notion without a deploy; five minutes is fresh enough.
export const revalidate = 300;

export const metadata: Metadata = {
  title: copy.metaTitle,
  description: copy.metaDescription,
  robots: { index: false, follow: false },
};

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

  const { players, rows, fetchedAt } = data;
  const { entries, flags } = clean(rows);
  const board = standings(players, entries);
  const mockToday = process.env.NODE_ENV !== "production" && process.env.CHALLENGE_MOCK_TODAY;
  const prog = progress(mockToday || todayPacific(new Date()));
  const leaders = board.filter((s) => s.rank === 1).map((s) => s.player.name).join(", ");
  const maxTotal = Math.max(1, ...board.map((s) => s.tiktok + s.instagram));
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
          {board.map((s) => (
            <li key={s.player.name} className="card challenge-row">
              <span className="challenge-rank">{s.rank ?? copy.noValue}</span>
              <span className="challenge-name">
                <Swatch color={s.player.color} />
                {s.player.name}
              </span>
              <span className="challenge-avg">
                {s.average === null ? copy.noValue : formatMinutes(s.average)}
                <small>{copy.average}</small>
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
              </dl>
            </li>
          ))}
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
              </p>
              <div className="challenge-columns">
                {board.map((s) => {
                  const sum = s.tiktok + s.instagram;
                  return (
                    <div key={s.player.name} className="challenge-col">
                      <span className="challenge-col-total">{sum === 0 ? copy.noValue : formatMinutes(sum)}</span>
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
                        {sum > 0 && (
                          <div className="challenge-vbar" style={{ height: `calc((100% - 54px) * ${sum / maxTotal})` }}>
                            <span className="challenge-seg-instagram" style={{ flexGrow: s.instagram }} />
                            <span className="challenge-seg-tiktok" style={{ flexGrow: s.tiktok }} />
                          </div>
                        )}
                      </div>
                      <span className="challenge-name challenge-col-name">{s.player.name}</span>
                      <span className="challenge-col-app">{sum > 0 && <><i className="challenge-seg-tiktok" />{formatMinutes(s.tiktok)}</>}</span>
                      <span className="challenge-col-app">{sum > 0 && <><i className="challenge-seg-instagram" />{formatMinutes(s.instagram)}</>}</span>
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

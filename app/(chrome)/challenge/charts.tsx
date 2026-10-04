"use client";

import { useState, type KeyboardEvent } from "react";
import { days, formatDay, formatMinutes, type Player } from "@/lib/challenge";

// Plain SVG line chart, one line per player. Tapping, hovering or arrowing onto
// a day selects it: a guide line is drawn and the readout below lists the values.

const W = 420;
const H = 240;
const PAD = { left: 50, right: 12, top: 12, bottom: 28 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;
const GRID = 4; // gridline intervals

type Props = {
  players: Player[];
  /** One series per player, in the same order; null is an unlogged day. */
  series: (number | null)[][];
  /** Last day index to draw; nothing is drawn after today. */
  through: number;
  label: string;
  hint: string;
  noValue: string;
};

function Marker({ shape, x, y, color }: { shape: number; x: number; y: number; color: string }) {
  const r = 3.2;
  switch (shape % 4) {
    case 0:
      return <circle cx={x} cy={y} r={r} fill={color} />;
    case 1:
      return <rect x={x - r} y={y - r} width={r * 2} height={r * 2} fill={color} />;
    case 2:
      return <polygon points={`${x},${y - r - 0.6} ${x + r + 0.8},${y + r} ${x - r - 0.8},${y + r}`} fill={color} />;
    default:
      return <polygon points={`${x},${y - r - 1} ${x + r + 1},${y} ${x},${y + r + 1} ${x - r - 1},${y}`} fill={color} />;
  }
}

export default function LineChart({ players, series, through, label, hint, noValue }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const dates = days();
  const n = dates.length;
  const step = PLOT_W / (n - 1);
  const x = (i: number) => PAD.left + i * step;

  const peak = Math.max(0, ...series.flatMap((s) => s.slice(0, through + 1).filter((v): v is number => v !== null)));
  const max = Math.max(60, Math.ceil(peak / 60) * 60);
  const y = (v: number) => PAD.top + PLOT_H - (v / max) * PLOT_H;

  /** Path segments that break at gaps and stop at today. */
  function path(values: (number | null)[]) {
    let d = "";
    let pen = false;
    values.slice(0, through + 1).forEach((v, i) => {
      if (v === null) {
        pen = false;
        return;
      }
      d += `${pen ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`;
      pen = true;
    });
    return d;
  }

  function onKey(e: KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next = e.key === "ArrowRight" ? (selected === null ? 0 : selected + 1) : selected === null ? through : selected - 1;
    setSelected(Math.min(through, Math.max(0, next)));
  }

  return (
    <div className="challenge-chart">
      <ul className="challenge-legend">
        {players.map((p, i) => (
          <li key={p.name}>
            <svg viewBox="-6 -6 12 12" width="12" height="12" aria-hidden focusable="false">
              <Marker shape={i} x={0} y={0} color={p.color} />
            </svg>
            {p.name}
          </li>
        ))}
      </ul>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="challenge-svg"
        role="group"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKey}
      >
        {Array.from({ length: GRID + 1 }, (_, g) => {
          const v = (max / GRID) * g;
          return (
            <g key={g}>
              <line className="challenge-grid" x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} />
              <text className="challenge-axis" x={PAD.left - 6} y={y(v) + 3.5} textAnchor="end">
                {formatMinutes(v)}
              </text>
            </g>
          );
        })}
        {[0, 7, 14, 21, 28].map((i) => (
          <text key={i} className="challenge-axis" x={x(i)} y={H - 8} textAnchor={i === n - 1 ? "end" : "middle"}>
            {formatDay(dates[i])}
          </text>
        ))}

        {selected !== null && <line className="challenge-guide" x1={x(selected)} x2={x(selected)} y1={PAD.top} y2={PAD.top + PLOT_H} />}

        {players.map((p, pi) => (
          <g key={p.name}>
            <path d={path(series[pi])} fill="none" stroke={p.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {series[pi].slice(0, through + 1).map((v, i) => (v === null ? null : <Marker key={i} shape={pi} x={x(i)} y={y(v)} color={p.color} />))}
          </g>
        ))}

        {dates.slice(0, through + 1).map((d, i) => (
          <rect
            key={d}
            className="challenge-hit"
            x={x(i) - step / 2}
            y={PAD.top}
            width={step}
            height={PLOT_H}
            fill="transparent"
            onClick={() => setSelected(i)}
            onPointerEnter={(e) => e.pointerType === "mouse" && setSelected(i)}
          />
        ))}
      </svg>

      <div className="challenge-readout" aria-live="polite">
        {selected === null ? (
          <p className="challenge-hint">{hint}</p>
        ) : (
          <>
            <p className="challenge-readout-date">{formatDay(dates[selected])}</p>
            <ul>
              {players.map((p, pi) => {
                const v = series[pi][selected];
                return (
                  <li key={p.name}>
                    <svg viewBox="-6 -6 12 12" width="12" height="12" aria-hidden focusable="false">
                      <Marker shape={pi} x={0} y={0} color={p.color} />
                    </svg>
                    {p.name}
                    <b>{v === null ? noValue : formatMinutes(v)}</b>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

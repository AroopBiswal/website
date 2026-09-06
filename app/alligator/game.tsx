"use client";

import { useState } from "react";
import { Eye } from "../components/googly";
import PageShell from "../components/page-shell";

const MIN_TEETH = 4;
const MAX_TEETH = 20;
const DEFAULT_TEETH = 10;

type Status = "ready" | "playing" | "lost" | "won";

/**
 * Crocodile dentist. One tooth is the trap; press any of the others and it
 * sinks into the gum, press the trap and the jaw comes down.
 *
 * The trap is drawn when a round starts rather than during render, so the
 * server and the browser never disagree about it — and so a round genuinely is
 * decided before the first press, rather than being settled as you go.
 */
export default function Game() {
  const [count, setCount] = useState(DEFAULT_TEETH);
  const [trap, setTrap] = useState<number | null>(null);
  const [pressed, setPressed] = useState<number[]>([]);
  const [status, setStatus] = useState<Status>("ready");

  const start = () => {
    setTrap(Math.floor(Math.random() * count));
    setPressed([]);
    setStatus("playing");
  };

  const press = (i: number) => {
    if (status !== "playing" || pressed.includes(i)) return;
    const next = [...pressed, i];
    setPressed(next);
    if (i === trap) setStatus("lost");
    else if (next.length === count - 1) setStatus("won");
  };

  const setTeeth = (n: number) => {
    setCount(Math.min(MAX_TEETH, Math.max(MIN_TEETH, n)));
    setStatus("ready");
    setPressed([]);
    setTrap(null);
  };

  const teeth = Array.from({ length: count }, (_, i) => i);
  const safeLeft = count - 1 - pressed.length;

  return (
    <PageShell active="alligator">
      <h1 className="game-title">Alligator</h1>
      <p className="game-sub">
        One tooth is wired to the jaw. Press the others and they sink into the gum. Press that
        one and it bites.
      </p>

      <div className="game-controls">
        <div className="teeth-picker">
          <span className="mini-label">Teeth</span>
          <button
            className="stepper"
            onClick={() => setTeeth(count - 1)}
            disabled={count <= MIN_TEETH}
            aria-label="One tooth fewer"
          >
            −
          </button>
          <span className="teeth-count" aria-live="polite">
            {count}
          </span>
          <button
            className="stepper"
            onClick={() => setTeeth(count + 1)}
            disabled={count >= MAX_TEETH}
            aria-label="One tooth more"
          >
            +
          </button>
        </div>

        <button className="sticker game-start" onClick={start}>
          {status === "ready" ? "Start" : "Play again"}
        </button>
      </div>

      <p className="game-status" role="status">
        {status === "ready" && `Pick your number of teeth, then start.`}
        {status === "playing" &&
          `${safeLeft} safe ${safeLeft === 1 ? "tooth" : "teeth"} left.`}
        {status === "lost" && `Chomp. Tooth ${(trap ?? 0) + 1} was the trap.`}
        {status === "won" && `Every safe tooth pressed. The trap was ${(trap ?? 0) + 1}.`}
      </p>

      <div className="gator" data-status={status}>
        <div className="gator-upper">
          <div className="gator-eyes" aria-hidden>
            <span className="gator-eye">
              <Eye size={30} pupil={14} border={3} />
            </span>
            <span className="gator-eye">
              <Eye size={30} pupil={14} border={3} />
            </span>
          </div>
          <div className="gator-nostrils" aria-hidden>
            <span />
            <span />
          </div>

          <div className="tooth-row">
            {teeth.map((i) => (
              <button
                key={i}
                className="tooth"
                data-down={pressed.includes(i) ? "" : undefined}
                data-trap={status === "lost" && i === trap ? "" : undefined}
                disabled={status !== "playing" || pressed.includes(i)}
                onClick={() => press(i)}
                aria-label={`Tooth ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* No teeth on the lower jaw: the mouth holds exactly the number you
            picked, all of them clickable, one of them the trap. */}
        <div className="gator-lower" />
      </div>
    </PageShell>
  );
}

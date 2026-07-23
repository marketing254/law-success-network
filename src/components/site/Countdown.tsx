"use client";

import { useEffect, useState } from "react";

/**
 * Launch countdown, rendered as a slim strip INSIDE the hero (its root spans
 * the hero grid), so it is visible without scrolling.
 *
 * LAUNCH is a fixed instant (midnight Eastern, Oct 1 2026): every visitor
 * worldwide counts down to the same moment.
 *
 * Hydration-safe by construction: the server (and first client render) shows
 * placeholders; real digits appear only after mount. The per-second digit pop
 * is keyed on the value and collapses under prefers-reduced-motion. The strip
 * joins the hero's entrance choreography via .hx/.hx-fade.
 */
const LAUNCH = new Date("2026-10-01T00:00:00-04:00");

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function remainingUntilLaunch(): Remaining | null {
  const ms = LAUNCH.getTime() - Date.now();
  if (ms <= 0) return null;
  const total = Math.floor(ms / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function Unit({ value, label }: { value: string; label: string }) {
  return (
    <span className="cd-unit">
      {/* key= remounts the digits when they change, replaying the pop */}
      <span className="cd-num" key={value}>
        {value}
      </span>
      <span className="cd-lbl">{label}</span>
    </span>
  );
}

export default function Countdown() {
  const [now, setNow] = useState<Remaining | null | "pending">("pending");

  useEffect(() => {
    setNow(remainingUntilLaunch());
    const t = setInterval(() => setNow(remainingUntilLaunch()), 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const live = now === null;
  const pending = now === "pending";

  return (
    <div
      className="cd-strip hx hx-fade"
      style={{ "--d": ".95s" } as React.CSSProperties}
      aria-label="Founding launch countdown"
    >
      <span className="cd-kicker">
        <span className="cd-dot" aria-hidden="true" />
        Founding launch
      </span>

      {live ? (
        <span className="cd-live-line">
          The doors are open. Founding invitations go out in waitlist order.
        </span>
      ) : (
        <>
          <span className="cd-timer" role="timer">
            <Unit value={pending ? "--" : String((now as Remaining).days)} label="Days" />
            <span className="cd-sep" aria-hidden="true" />
            <Unit value={pending ? "--" : pad((now as Remaining).hours)} label="Hrs" />
            <span className="cd-sep" aria-hidden="true" />
            <Unit value={pending ? "--" : pad((now as Remaining).minutes)} label="Min" />
            <span className="cd-sep" aria-hidden="true" />
            <Unit value={pending ? "--" : pad((now as Remaining).seconds)} label="Sec" />
          </span>
          <span className="cd-when">
            Doors open <b>October 1, 2026</b>
          </span>
        </>
      )}
    </div>
  );
}

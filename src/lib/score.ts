import { dayDate, dayKey } from "./day";
import type { State } from "./types";

export function bits(m: number): number {
  let c = 0;
  for (let i = 0; i < 10; i++) if (m & (1 << i)) c++;
  return c;
}

export function maskOf(state: State, key: string): number {
  const d = state.days[key];
  return d && typeof d.m === "number" ? d.m : 0;
}

export function isDone(mask: number, n: number): boolean {
  return !!(mask & (1 << (n - 1)));
}

const KEEP_DAYS = 180;

export function prune(days: State["days"]): State["days"] {
  const keys = Object.keys(days).sort();
  if (keys.length <= KEEP_DAYS) return days;
  const out: State["days"] = {};
  for (const k of keys.slice(keys.length - KEEP_DAYS)) out[k] = days[k];
  return out;
}

/** Tick or untick protocol n for the day that `now` falls in. */
export function setDone(state: State, n: number, on: boolean, now: Date): State {
  const k = dayKey(now);
  let m = maskOf(state, k);
  m = on ? m | (1 << (n - 1)) : m & ~(1 << (n - 1));
  return { ...state, days: prune({ ...state.days, [k]: { m, t: now.getTime() } }) };
}

/** Consecutive kept days ending today. An unfinished today does not break the run. */
export function streak(state: State, now: Date, keep: number): number {
  let s = 0;
  let i = bits(maskOf(state, dayKey(now, 0))) < keep ? 1 : 0;
  for (; i < 400; i++) {
    if (bits(maskOf(state, dayKey(now, i))) >= keep) s++;
    else break;
  }
  return s;
}

export type WeekDay = { key: string; date: Date; count: number; kept: boolean; today: boolean };

/** Oldest first, today last. */
export function lastSeven(state: State, now: Date, keep: number): WeekDay[] {
  const out: WeekDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const count = bits(maskOf(state, dayKey(now, i)));
    out.push({ key: dayKey(now, i), date: dayDate(now, i), count, kept: count >= keep, today: i === 0 });
  }
  return out;
}

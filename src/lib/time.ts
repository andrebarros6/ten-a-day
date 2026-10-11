export function isTime(s: unknown): s is string {
  return typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}

export function toMin(s: string): number {
  const p = s.split(":");
  return +p[0] * 60 + +p[1];
}

export function fmt(m: number): string {
  m = ((Math.round(m) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return (h < 10 ? "0" : "") + h + ":" + (mm < 10 ? "0" : "") + mm;
}

export function span(a: number, b: number): string {
  return fmt(a) + "–" + fmt(b);
}

export type DayShape = { W: number; D: number; B: number };

/** W = wake, D = waking day length, B = bed, all in minutes; B may run past 1440. */
export function dayShape(wake: string, bed: string): DayShape {
  const W = toMin(wake);
  let D = (toMin(bed) - W + 1440) % 1440;
  if (D < 480 || D > 1260) D = 960;
  return { W, D, B: W + D };
}

export type Win = { s: number; e: number };

/** Window per protocol number. Protocols 5 and 9 have none. */
export function windows(wake: string, bed: string): Record<number, Win | null> {
  const { W, D, B } = dayShape(wake, bed);
  const ls = W + Math.round((D * 2) / 3 / 5) * 5;
  let le = B - 180;
  if (le - ls < 60) le = ls + 90;
  return {
    1: { s: W, e: W + 30 },
    2: { s: W, e: W + 60 },
    3: { s: W, e: W + 180 },
    4: { s: W + 120, e: W + 360 },
    5: null,
    9: null,
    6: { s: ls, e: le },
    7: { s: B - 120, e: B },
    10: { s: B - 60, e: B },
    8: { s: B, e: W + 1440 },
  };
}

/** Screens off 30 minutes before bed. */
export function screensOffBy(wake: string, bed: string): string {
  return fmt(dayShape(wake, bed).B - 30);
}

/** Minutes since the most recent wake time. */
export function nowRel(wake: string, bed: string, now: Date): number {
  const n = now.getHours() * 60 + now.getMinutes();
  return (n - dayShape(wake, bed).W + 1440) % 1440;
}

export function isNow(win: Win | null, wake: string, bed: string, now: Date): boolean {
  if (!win) return false;
  const W = dayShape(wake, bed).W;
  const r = nowRel(wake, bed, now);
  return r >= win.s - W && r < win.e - W;
}

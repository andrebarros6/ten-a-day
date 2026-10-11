import { dayShape, fmt, nowRel } from "./time";

// Schematic curves, t in hours since waking (0 to 24). Not physiological data.
export function cort(t: number): number {
  let v = t < 0.7 ? 0.55 + 0.45 * (t / 0.7) : 0.1 + 0.9 * Math.exp(-(t - 0.7) / 4.3);
  if (t > 19) v = Math.max(v, 0.1 + 0.45 * Math.pow((t - 19) / 5, 2));
  return v;
}

export function mel(t: number, mid: number): number {
  const g = (c: number) => Math.exp(-Math.pow((t - c) / 2.7, 2));
  return 0.04 + 0.9 * Math.max(g(mid), g(mid - 24));
}

type Anchor = "start" | "middle" | "end";
export type Tick = { x: number; label: string; anchor: Anchor };

export type RhythmModel = {
  width: number;
  height: number;
  x0: number;
  x1: number;
  yTop: number;
  yBot: number;
  sleepX: number;
  sleepW: number;
  cortPath: string;
  melPath: string;
  cortLabelX: number;
  melLabelX: number;
  melLabelY: number;
  /** Null until the client knows the time. */
  nowX: number | null;
  nowAnchor: Anchor;
  ticks: Tick[];
};

export function rhythmModel(wake: string, bed: string, width: number, now: Date | null): RhythmModel {
  const s = dayShape(wake, bed);
  const D = s.D / 60;
  const x0 = 8;
  const x1 = width - 8;
  const yTop = 22;
  const yBot = 104;
  const X = (t: number) => x0 + ((x1 - x0) * t) / 24;
  const Y = (v: number) => yBot - (yBot - yTop) * v;
  const mid = D + (24 - D) / 2;
  const path = (fn: (t: number) => number) => {
    let d = "";
    for (let i = 0; i <= 96; i++) {
      const t = i / 4;
      d += (i ? "L" : "M") + X(t).toFixed(1) + " " + Y(fn(t)).toFixed(1);
    }
    return d;
  };
  const nowX = now ? X(nowRel(wake, bed, now) / 60) : null;
  return {
    width,
    height: 150,
    x0,
    x1,
    yTop,
    yBot,
    sleepX: X(D),
    sleepW: X(24) - X(D),
    cortPath: path(cort),
    melPath: path((t) => mel(t, mid)),
    cortLabelX: X(1.7) + 4,
    melLabelX: X(mid - 3.2) - 6,
    melLabelY: Y(0.5),
    nowX,
    nowAnchor: nowX == null ? "middle" : nowX < 40 ? "start" : nowX > width - 40 ? "end" : "middle",
    ticks: [
      { x: X(0), label: fmt(s.W) + " wake", anchor: "start" },
      { x: X(D / 2), label: fmt(s.W + s.D / 2), anchor: "middle" },
      { x: X(D), label: fmt(s.B) + " bed", anchor: "middle" },
      { x: X(24), label: fmt(s.W), anchor: "end" },
    ],
  };
}

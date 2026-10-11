import { describe, expect, it } from "vitest";
import { dayKey } from "./day";
import { bits, isDone, lastSeven, maskOf, prune, setDone, streak } from "./score";
import { DEFAULT_STATE, type State } from "./types";

const KEEP = 7;
const noon = new Date(2026, 9, 11, 12, 0);
const maskWith = (count: number) => (1 << count) - 1;

function stateWith(counts: Record<number, number>): State {
  const days: State["days"] = {};
  for (const [offset, count] of Object.entries(counts)) {
    days[dayKey(noon, +offset)] = { m: maskWith(count), t: 1 };
  }
  return { ...DEFAULT_STATE, days };
}

describe("day key", () => {
  it("uses the local date after 04:00", () => {
    expect(dayKey(new Date(2026, 9, 11, 4, 0))).toBe("2026-10-11");
    expect(dayKey(new Date(2026, 9, 11, 23, 59))).toBe("2026-10-11");
  });

  it("puts 01:30 on the previous calendar date", () => {
    expect(dayKey(new Date(2026, 9, 11, 1, 30))).toBe("2026-10-10");
    expect(dayKey(new Date(2026, 9, 11, 3, 59))).toBe("2026-10-10");
  });

  it("crosses month and year ends", () => {
    expect(dayKey(new Date(2027, 0, 1, 2, 0))).toBe("2026-12-31");
    expect(dayKey(new Date(2026, 2, 1, 12, 0), 1)).toBe("2026-02-28");
  });
});

describe("ticking", () => {
  it("sets and clears a bit", () => {
    let s = setDone(DEFAULT_STATE, 3, true, noon);
    expect(maskOf(s, "2026-10-11")).toBe(4);
    expect(isDone(maskOf(s, "2026-10-11"), 3)).toBe(true);
    s = setDone(s, 3, false, noon);
    expect(maskOf(s, "2026-10-11")).toBe(0);
  });

  it("records a tick at 01:30 against the previous date", () => {
    const s = setDone(DEFAULT_STATE, 8, true, new Date(2026, 9, 11, 1, 30));
    expect(Object.keys(s.days)).toEqual(["2026-10-10"]);
  });

  it("stamps the entry and leaves the input untouched", () => {
    const s = setDone(DEFAULT_STATE, 1, true, noon);
    expect(s.days["2026-10-11"].t).toBe(noon.getTime());
    expect(DEFAULT_STATE.days).toEqual({});
  });

  it("counts bits", () => {
    expect(bits(0)).toBe(0);
    expect(bits(1023)).toBe(10);
    expect(bits(0b1010)).toBe(2);
  });

  it("keeps only the newest 180 days", () => {
    const days: State["days"] = {};
    for (let i = 0; i < 200; i++) days[dayKey(noon, i)] = { m: 1, t: 1 };
    const kept = prune(days);
    expect(Object.keys(kept)).toHaveLength(180);
    expect(kept[dayKey(noon, 0)]).toBeDefined();
    expect(kept[dayKey(noon, 199)]).toBeUndefined();
  });
});

describe("streak", () => {
  it("does not count six ticks and does count seven", () => {
    expect(streak(stateWith({ 0: 6 }), noon, KEEP)).toBe(0);
    expect(streak(stateWith({ 0: 7 }), noon, KEEP)).toBe(1);
  });

  it("counts consecutive kept days ending today", () => {
    expect(streak(stateWith({ 0: 8, 1: 7, 2: 10 }), noon, KEEP)).toBe(3);
  });

  it("is not reset by an unfinished today", () => {
    expect(streak(stateWith({ 0: 2, 1: 7, 2: 9 }), noon, KEEP)).toBe(2);
    expect(streak(stateWith({ 1: 7, 2: 9 }), noon, KEEP)).toBe(2);
  });

  it("stops at the first missed day", () => {
    expect(streak(stateWith({ 0: 7, 1: 6, 2: 10 }), noon, KEEP)).toBe(1);
    expect(streak(stateWith({ 0: 3, 1: 4, 2: 10 }), noon, KEEP)).toBe(0);
  });
});

describe("lastSeven", () => {
  it("lists seven days, oldest first, with today last", () => {
    const week = lastSeven(stateWith({ 0: 7, 6: 3 }), noon, KEEP);
    expect(week).toHaveLength(7);
    expect(week[0]).toMatchObject({ key: "2026-10-05", count: 3, kept: false, today: false });
    expect(week[6]).toMatchObject({ key: "2026-10-11", count: 7, kept: true, today: true });
  });
});

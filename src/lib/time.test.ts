import { describe, expect, it } from "vitest";
import { windowHint, windowLabel } from "./labels";
import { dayShape, fmt, isNow, isTime, nowRel, screensOffBy, toMin, windows } from "./time";

const at = (h: number, m: number) => new Date(2026, 9, 11, h, m);

describe("time helpers", () => {
  it("validates HH:MM", () => {
    expect(isTime("07:00")).toBe(true);
    expect(isTime("23:59")).toBe(true);
    expect(isTime("24:00")).toBe(false);
    expect(isTime("7:00")).toBe(false);
    expect(isTime(700)).toBe(false);
  });

  it("converts and wraps", () => {
    expect(toMin("07:30")).toBe(450);
    expect(fmt(450)).toBe("07:30");
    expect(fmt(1440 + 60)).toBe("01:00");
    expect(fmt(-30)).toBe("23:30");
  });
});

describe("dayShape", () => {
  it("measures the waking day", () => {
    expect(dayShape("07:00", "23:00")).toEqual({ W: 420, D: 960, B: 1380 });
  });

  it("wraps a bed time after midnight", () => {
    expect(dayShape("09:00", "01:00")).toEqual({ W: 540, D: 960, B: 1500 });
  });

  it("treats a day under 8 h or over 21 h as 16 h", () => {
    expect(dayShape("07:00", "12:00").D).toBe(960);
    expect(dayShape("07:00", "05:00").D).toBe(960);
    expect(dayShape("07:00", "15:00").D).toBe(480);
    expect(dayShape("07:00", "04:00").D).toBe(1260);
  });
});

describe("windows", () => {
  it("matches the acceptance list for wake 07:00 and bed 23:00", () => {
    const label = (n: number) => windowLabel(n, "07:00", "23:00");
    expect(label(1)).toBe("07:00–07:30");
    expect(label(2)).toBe("07:00–08:00");
    expect(label(3)).toBe("07:00–10:00");
    expect(label(4)).toBe("09:00–13:00");
    expect(label(6)).toBe("17:40–20:00");
    expect(label(7)).toBe("21:00–23:00");
    expect(label(10)).toBe("22:00–23:00");
    expect(label(8)).toBe("23:00–07:00");
    expect(screensOffBy("07:00", "23:00")).toBe("22:30");
  });

  it("gives protocols 5 and 9 wording instead of a window", () => {
    const w = windows("07:00", "23:00");
    expect(w[5]).toBeNull();
    expect(w[9]).toBeNull();
    expect(windowLabel(5, "07:00", "23:00")).toBe("Any time");
    expect(windowLabel(9, "07:00", "23:00")).toBe("At meals");
  });

  it("stretches a short late-light window to 90 minutes", () => {
    // 8 h day: last third starts at W + 5h20, bed − 3 h is W + 5 h, so the window would be negative.
    const w = windows("07:00", "15:00")[6]!;
    expect(w.e - w.s).toBe(90);
  });

  it("rounds the late-light start to 5 minutes", () => {
    const w = windows("06:10", "22:40")[6]!;
    expect((w.s - toMin("06:10")) % 5).toBe(0);
  });

  it("fills the screens-off time into the hint", () => {
    expect(windowHint(7, "07:00", "23:00")).toBe("Screens off by 22:30");
    expect(windowHint(1, "07:00", "23:00")).toBe("Within 30 minutes of waking");
    expect(windowHint(8, "07:00", "23:00")).toBe("All night");
  });
});

describe("isNow", () => {
  const w = windows("07:00", "23:00");

  it("is true inside a window and false at its end", () => {
    expect(isNow(w[1], "07:00", "23:00", at(7, 0))).toBe(true);
    expect(isNow(w[1], "07:00", "23:00", at(7, 29))).toBe(true);
    expect(isNow(w[1], "07:00", "23:00", at(7, 30))).toBe(false);
    expect(isNow(w[1], "07:00", "23:00", at(6, 59))).toBe(false);
  });

  it("handles the overnight window", () => {
    expect(isNow(w[8], "07:00", "23:00", at(23, 0))).toBe(true);
    expect(isNow(w[8], "07:00", "23:00", at(3, 0))).toBe(true);
    expect(isNow(w[8], "07:00", "23:00", at(12, 0))).toBe(false);
  });

  it("is never true for a protocol without a window", () => {
    expect(isNow(w[5], "07:00", "23:00", at(12, 0))).toBe(false);
  });

  it("measures minutes since waking across midnight", () => {
    expect(nowRel("07:00", "23:00", at(6, 0))).toBe(23 * 60);
  });
});

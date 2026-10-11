import { describe, expect, it } from "vitest";
import { cort, mel, rhythmModel } from "./rhythm";

describe("rhythm curves", () => {
  it("peaks cortisol shortly after waking and bottoms out in the evening", () => {
    expect(cort(0.7)).toBeCloseTo(1, 5);
    expect(cort(0)).toBeLessThan(cort(0.7));
    expect(cort(16)).toBeLessThan(0.2);
    expect(cort(24)).toBeGreaterThan(cort(19));
  });

  it("peaks melatonin in the middle of sleep", () => {
    const mid = 20;
    expect(mel(mid, mid)).toBeCloseTo(0.94, 5);
    expect(mel(8, mid)).toBeLessThan(0.1);
  });
});

describe("rhythmModel", () => {
  const now = new Date(2026, 9, 11, 15, 0);
  const model = rhythmModel("07:00", "23:00", 600, now);

  it("shades sleep from bed to the next wake", () => {
    expect(model.sleepX).toBeCloseTo(8 + (584 * 16) / 24, 5);
    expect(model.sleepX + model.sleepW).toBeCloseTo(592, 5);
  });

  it("labels wake, midday, bed and next wake", () => {
    expect(model.ticks.map((t) => t.label)).toEqual(["07:00 wake", "15:00", "23:00 bed", "07:00"]);
  });

  it("places the now line by hours since waking", () => {
    expect(model.nowX).toBeCloseTo(8 + (584 * 8) / 24, 5);
    expect(model.nowAnchor).toBe("middle");
  });

  it("keeps the now label inside the chart at either edge", () => {
    expect(rhythmModel("07:00", "23:00", 600, new Date(2026, 9, 11, 7, 5)).nowAnchor).toBe("start");
    expect(rhythmModel("07:00", "23:00", 600, new Date(2026, 9, 11, 6, 55)).nowAnchor).toBe("end");
  });

  it("omits the now line until the time is known", () => {
    expect(rhythmModel("07:00", "23:00", 600, null).nowX).toBeNull();
  });

  it("draws both curves across the full width", () => {
    expect(model.cortPath.startsWith("M8.0 ")).toBe(true);
    expect(model.cortPath.split("L")).toHaveLength(97);
    expect(model.melPath).toContain("L592.0 ");
  });
});

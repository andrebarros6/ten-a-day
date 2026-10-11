import { describe, expect, it } from "vitest";
import { merge } from "./merge";
import type { State } from "./types";

const local: State = {
  wake: "07:00",
  bed: "23:00",
  st: 100,
  days: { "2026-10-10": { m: 3, t: 50 }, "2026-10-11": { m: 1, t: 200 } },
};

describe("merge", () => {
  it("takes the newer entry per day", () => {
    const { state } = merge(local, {
      st: 100,
      days: { "2026-10-10": { m: 7, t: 60 }, "2026-10-11": { m: 15, t: 150 } },
    });
    expect(state.days["2026-10-10"]).toEqual({ m: 7, t: 60 });
    expect(state.days["2026-10-11"]).toEqual({ m: 1, t: 200 });
  });

  it("adds days only the other side has", () => {
    const { state } = merge(local, { st: 100, days: { "2026-10-09": { m: 1023, t: 10 } } });
    expect(state.days["2026-10-09"]).toEqual({ m: 1023, t: 10 });
    expect(Object.keys(state.days)).toHaveLength(3);
  });

  it("takes wake and bed from the side with the newer settings stamp", () => {
    const newer = merge(local, { wake: "06:00", bed: "22:00", st: 101, days: {} }).state;
    expect([newer.wake, newer.bed, newer.st]).toEqual(["06:00", "22:00", 101]);
    const older = merge(local, { wake: "06:00", bed: "22:00", st: 99, days: {} }).state;
    expect([older.wake, older.bed, older.st]).toEqual(["07:00", "23:00", 100]);
  });

  it("reports when the local side holds something newer", () => {
    expect(merge(local, { st: 100, days: local.days }).localNewer).toBe(false);
    expect(merge(local, { st: 100, days: { "2026-10-10": { m: 3, t: 50 } } }).localNewer).toBe(true);
    expect(merge(local, { st: 99, days: local.days }).localNewer).toBe(true);
    expect(merge(local, { st: 100, days: { ...local.days, "2026-10-11": { m: 1, t: 150 } } }).localNewer).toBe(true);
  });

  it("is not local-newer when the other side wins everything", () => {
    const { localNewer } = merge(local, {
      st: 500,
      days: { "2026-10-10": { m: 7, t: 500 }, "2026-10-11": { m: 7, t: 500 } },
    });
    expect(localNewer).toBe(false);
  });

  it("keeps local data when there is nothing to merge", () => {
    const { state, localNewer } = merge(local, null);
    expect(state).toEqual(local);
    expect(localNewer).toBe(true);
  });

  it("ignores malformed entries and invalid times", () => {
    const { state } = merge(local, {
      wake: "25:00",
      bed: "nope",
      st: 900,
      days: { "2026-10-08": null, "2026-10-07": { m: "x" } },
    });
    expect(state.wake).toBe("07:00");
    expect(state.days["2026-10-08"]).toBeUndefined();
    expect(state.days["2026-10-07"]).toBeUndefined();
  });

  it("does not change its input", () => {
    const copy = JSON.parse(JSON.stringify(local));
    merge(local, { st: 999, wake: "05:00", days: { "2026-10-11": { m: 0, t: 999 } } });
    expect(local).toEqual(copy);
  });
});

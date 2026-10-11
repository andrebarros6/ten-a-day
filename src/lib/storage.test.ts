import { describe, expect, it } from "vitest";
import { isRefCode, localStore, newRefCode, parseState, REF_KEY, resolveReferral, STATE_KEY } from "./storage";
import { DEFAULT_STATE } from "./types";

function fakeStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

describe("parseState", () => {
  it("reads the prototype's stored shape", () => {
    const raw = '{ "wake": "06:30", "bed": "22:30", "st": 1760000000000, "days": { "2026-10-11": { "m": 3, "t": 1760000000000 } } }';
    expect(parseState(raw)).toEqual({
      wake: "06:30",
      bed: "22:30",
      st: 1760000000000,
      days: { "2026-10-11": { m: 3, t: 1760000000000 } },
    });
  });

  it("falls back to defaults on missing or broken data", () => {
    expect(parseState(null)).toEqual(DEFAULT_STATE);
    expect(parseState("{not json")).toEqual(DEFAULT_STATE);
    expect(parseState('"text"')).toEqual(DEFAULT_STATE);
  });

  it("drops invalid fields and keeps valid ones", () => {
    const s = parseState('{"wake":"99:99","bed":"22:00","days":{"bad-key":{"m":1},"2026-10-11":{"m":"x"},"2026-10-10":{"m":4095}}}');
    expect(s.wake).toBe("07:00");
    expect(s.bed).toBe("22:00");
    expect(s.days).toEqual({ "2026-10-10": { m: 1023, t: 0 } });
  });
});

describe("localStore", () => {
  it("round-trips state", () => {
    const ls = fakeStorage();
    const store = localStore(ls);
    const state = { ...DEFAULT_STATE, wake: "05:45", days: { "2026-10-11": { m: 5, t: 9 } } };
    store.save(state);
    expect(store.load()).toEqual(state);
  });

  it("clears state and the referral record", () => {
    const ls = fakeStorage({ [STATE_KEY]: "{}", [REF_KEY]: "{}", other: "kept" });
    localStore(ls).clear();
    expect([...ls.data.keys()]).toEqual(["other"]);
  });

  it("survives storage that throws", () => {
    const broken = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    const store = localStore(broken);
    expect(store.load()).toEqual(DEFAULT_STATE);
    expect(() => store.save(DEFAULT_STATE)).not.toThrow();
    expect(() => store.clear()).not.toThrow();
  });
});

describe("referral", () => {
  it("makes a short code from unambiguous characters", () => {
    const code = newRefCode();
    expect(code).toMatch(/^[a-hj-km-np-z2-9]{7}$/);
    expect(isRefCode(code)).toBe(true);
  });

  it("keeps an existing code and the first inbound code", () => {
    const ref = resolveReferral('{"code":"mine123","from":"first99"}', "later88");
    expect(ref).toEqual({ code: "mine123", from: "first99" });
  });

  it("records an inbound code on first arrival", () => {
    const ref = resolveReferral(null, "friend7", () => 0);
    expect(ref).toEqual({ code: "aaaaaaa", from: "friend7" });
  });

  it("ignores a malformed inbound code and your own code", () => {
    expect(resolveReferral(null, "<script>", () => 0).from).toBeNull();
    expect(resolveReferral('{"code":"mine123"}', "mine123").from).toBeNull();
    expect(resolveReferral("{broken", null, () => 0).code).toBe("aaaaaaa");
  });
});

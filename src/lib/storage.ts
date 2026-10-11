import { isTime } from "./time";
import { DEFAULT_STATE, type State } from "./types";

export const STATE_KEY = "tenaday.v1";
export const REF_KEY = "tenaday.ref";
export const THEME_KEY = "tenaday.theme";

/** Read a stored value into a valid State, dropping anything malformed. */
export function parseState(raw: string | null): State {
  const state: State = { ...DEFAULT_STATE, days: {} };
  if (!raw) return state;
  try {
    const s = JSON.parse(raw);
    if (s && typeof s === "object") {
      if (isTime(s.wake)) state.wake = s.wake;
      if (isTime(s.bed)) state.bed = s.bed;
      if (typeof s.st === "number") state.st = s.st;
      if (s.days && typeof s.days === "object") {
        for (const k of Object.keys(s.days)) {
          const d = s.days[k];
          if (/^\d{4}-\d{2}-\d{2}$/.test(k) && d && typeof d.m === "number") {
            state.days[k] = { m: d.m & 1023, t: typeof d.t === "number" ? d.t : 0 };
          }
        }
      }
    }
  } catch {}
  return state;
}

/** Where state is kept. A backend can implement this later without touching the UI. */
export interface Store {
  load(): State;
  save(state: State): void;
  clear(): void;
}

type KeyValue = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function localStore(ls: KeyValue): Store {
  return {
    load: () => {
      try {
        return parseState(ls.getItem(STATE_KEY));
      } catch {
        return parseState(null);
      }
    },
    save: (state) => {
      try {
        ls.setItem(STATE_KEY, JSON.stringify(state));
      } catch {}
    },
    clear: () => {
      try {
        ls.removeItem(STATE_KEY);
        ls.removeItem(REF_KEY);
      } catch {}
    },
  };
}

export type Referral = { code: string; from: string | null };

const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function newRefCode(random: () => number = Math.random): string {
  let c = "";
  for (let i = 0; i < 7; i++) c += CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)];
  return c;
}

export function isRefCode(s: unknown): s is string {
  return typeof s === "string" && /^[a-z0-9]{4,16}$/.test(s);
}

/**
 * This device's own code, plus the code it first arrived with. Nothing is sent
 * anywhere; both are kept so attribution can be switched on if a backend is added.
 */
export function resolveReferral(raw: string | null, inbound: string | null, random?: () => number): Referral {
  let ref: Referral = { code: "", from: null };
  try {
    const p = raw ? JSON.parse(raw) : null;
    if (p && isRefCode(p.code)) ref = { code: p.code, from: isRefCode(p.from) ? p.from : null };
  } catch {}
  if (!ref.code) ref.code = newRefCode(random);
  if (!ref.from && isRefCode(inbound) && inbound !== ref.code) ref.from = inbound;
  return ref;
}

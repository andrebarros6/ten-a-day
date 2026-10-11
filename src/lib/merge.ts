import { isTime } from "./time";
import type { State } from "./types";

/**
 * Merge another copy of the state into the local one. Per day the entry with the
 * newer timestamp wins; for wake and bed the newer `st` wins. `localNewer` is true
 * when the local side held anything the other side lacked, so the caller knows to
 * write the result back.
 */
export function merge(local: State, remote: unknown): { state: State; localNewer: boolean } {
  const state: State = { ...local, days: { ...local.days } };
  let localNewer = false;
  let rd: Record<string, { m?: unknown; t?: unknown } | null> = {};

  if (remote && typeof remote === "object") {
    const r = remote as Partial<State>;
    const rst = typeof r.st === "number" ? r.st : 0;
    if (rst > (state.st || 0)) {
      if (isTime(r.wake)) state.wake = r.wake;
      if (isTime(r.bed)) state.bed = r.bed;
      state.st = rst;
    } else if ((state.st || 0) > rst) localNewer = true;
    if (r.days && typeof r.days === "object") rd = r.days;
  }

  for (const k of Object.keys(rd)) {
    const a = state.days[k];
    const b = rd[k];
    if (!b || typeof b.m !== "number") continue;
    const bt = typeof b.t === "number" ? b.t : 0;
    if (!a || bt > (a.t || 0)) state.days[k] = { m: b.m, t: bt };
  }
  for (const k of Object.keys(state.days)) {
    const b = rd[k];
    const bt = b && typeof b.t === "number" ? b.t : 0;
    if (!b || (state.days[k].t || 0) > bt) localNewer = true;
  }
  return { state, localNewer };
}

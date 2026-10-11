"use client";

import { useSyncExternalStore } from "react";
import { merge } from "@/lib/merge";
import { setDone } from "@/lib/score";
import { localStore, parseState, REF_KEY, resolveReferral, STATE_KEY, THEME_KEY, type Referral } from "@/lib/storage";
import { isTime } from "@/lib/time";
import { DEFAULT_STATE, type State } from "@/lib/types";

/* One client-side store for the whole app. State lives in localStorage; the server
   and the first client render both see the defaults, then the stored state arrives. */

type Snapshot = { state: State; ref: Referral; minute: number };

const SERVER: Snapshot = { state: DEFAULT_STATE, ref: { code: "", from: null }, minute: 0 };

let snap: Snapshot = SERVER;
let loaded = false;
const listeners = new Set<() => void>();

const thisMinute = () => Math.floor(Date.now() / 60000);

function emit(next: Partial<Snapshot>) {
  snap = { ...snap, ...next };
  listeners.forEach((l) => l());
}

function readReferral(): Referral {
  let raw: string | null = null;
  let inbound: string | null = null;
  try {
    raw = localStorage.getItem(REF_KEY);
    inbound = new URLSearchParams(window.location.search).get("ref");
  } catch {}
  const ref = resolveReferral(raw, inbound);
  try {
    localStorage.setItem(REF_KEY, JSON.stringify(ref));
  } catch {}
  return ref;
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  snap = { state: localStore(localStorage).load(), ref: readReferral(), minute: thisMinute() };

  // Another tab changed the data: merge with the same rule a backend sync would use.
  window.addEventListener("storage", (e) => {
    if (e.key === null || (e.key === STATE_KEY && e.newValue === null)) {
      emit({ state: DEFAULT_STATE });
      return;
    }
    if (e.key !== STATE_KEY) return;
    const { state, localNewer } = merge(snap.state, parseState(e.newValue));
    emit({ state });
    if (localNewer) localStore(localStorage).save(state);
  });

  const tick = () => {
    const minute = thisMinute();
    if (minute !== snap.minute) emit({ minute });
  };
  setInterval(tick, 15000);
  document.addEventListener("visibilitychange", tick);
}

function subscribe(cb: () => void) {
  load();
  listeners.add(cb);
  return () => void listeners.delete(cb);
}

function getSnapshot() {
  load();
  return snap;
}

function commit(state: State) {
  localStore(localStorage).save(state);
  emit({ state });
}

export function tick(n: number, on: boolean) {
  commit(setDone(snap.state, n, on, new Date()));
}

export function setTime(which: "wake" | "bed", value: string) {
  if (!isTime(value)) return;
  commit({ ...snap.state, [which]: value, st: Date.now() });
}

/** Remove everything this app stored in this browser. */
export function clearAll() {
  localStore(localStorage).clear();
  try {
    localStorage.removeItem(THEME_KEY);
  } catch {}
  document.documentElement.removeAttribute("data-theme");
  emit({ state: DEFAULT_STATE, ref: { code: "", from: null } });
}

/** Make a share code if this browser has none, for example after deleting data. */
export function ensureReferral() {
  if (!snap.ref.code) emit({ ref: readReferral() });
}

export type TenADay = {
  state: State;
  ref: Referral;
  /** Null on the server and during hydration, when the time is not known yet. */
  now: Date | null;
};

export function useTenADay(): TenADay {
  const s = useSyncExternalStore(subscribe, getSnapshot, () => SERVER);
  return { state: s.state, ref: s.ref, now: s.minute ? new Date(s.minute * 60000) : null };
}

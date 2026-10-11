"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { KEEP, meta, todayProtocols } from "@/lib/content";
import { dayDate, dayKey } from "@/lib/day";
import { m, t, windowHint, windowLabel } from "@/lib/labels";
import { rhythmModel } from "@/lib/rhythm";
import { bits, isDone, lastSeven, maskOf, streak } from "@/lib/score";
import { shareText, shareUrl } from "@/lib/share";
import { APP_URL } from "@/lib/site";
import { isNow, windows } from "@/lib/time";
import { ensureReferral, setTime, tick, useTenADay } from "./store";
import { Button } from "./ui/button";

export function TimeInputs() {
  const { state } = useTenADay();
  const field = (which: "wake" | "bed", label: string) => (
    <label htmlFor={which} className="grid gap-1">
      <span className="label">{label}</span>
      <input
        type="time"
        id={which}
        value={state[which]}
        onChange={(e) => setTime(which, e.target.value)}
        className="mono rounded-[5px] border border-line bg-surface px-[9px] py-[7px] text-base"
      />
    </label>
  );
  return (
    <div className="flex flex-wrap items-end gap-x-[22px] gap-y-3.5">
      {field("wake", m.times.wake)}
      {field("bed", m.times.bed)}
      <p className="flex-[1_1_220px] text-sm text-muted">{m.times.hint}</p>
    </div>
  );
}

/* Cortisol and melatonin across one 24 h cycle, as a labelled schematic. */
export function RhythmChart() {
  const { state, now } = useTenADay();
  const host = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const measure = () => setWidth(Math.max(280, Math.round(el.clientWidth || 600)));
    measure();
    const obs = new ResizeObserver(measure);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const r = rhythmModel(state.wake, state.bed, width, now);
  const text = { fontSize: 11.5, className: "font-mono" };
  const halo = { stroke: "var(--bg)", strokeWidth: 4, paintOrder: "stroke" as const };

  return (
    <figure>
      <div ref={host}>
        <svg
          viewBox={`0 0 ${r.width} ${r.height}`}
          width={r.width}
          height={r.height}
          role="img"
          aria-label={m.rhythm.aria}
          className="block h-auto w-full"
        >
          <rect x={r.sleepX} y={r.yTop} width={r.sleepW} height={r.yBot - r.yTop} fill="var(--sleep)" />
          <line x1={r.x0} y1={r.yBot} x2={r.x1} y2={r.yBot} stroke="var(--line)" strokeWidth={1} />
          <path d={r.melPath} fill="none" stroke="var(--mel)" strokeWidth={2} strokeDasharray="5 4" />
          <path d={r.cortPath} fill="none" stroke="var(--accent)" strokeWidth={2.5} />
          <text x={r.cortLabelX} y={r.yTop + 9} fill="var(--accent)" {...halo} {...text} fontSize={12.5}>
            {m.rhythm.cortisol}
          </text>
          {r.nowX != null && (
            <line x1={r.nowX} y1={r.yTop - 4} x2={r.nowX} y2={r.yBot} stroke="var(--ink)" strokeWidth={1.5} />
          )}
          <text
            x={r.melLabelX}
            y={r.melLabelY}
            fill="var(--mel)"
            textAnchor="end"
            {...halo}
            {...text}
            fontSize={12.5}
          >
            {m.rhythm.melatonin}
          </text>
          {r.nowX != null && (
            <text x={r.nowX} y={r.yTop - 8} fill="var(--ink)" textAnchor={r.nowAnchor} {...text}>
              {m.rhythm.now}
            </text>
          )}
          {r.ticks.map((tk, i) => (
            <g key={i}>
              <line x1={tk.x} y1={r.yBot} x2={tk.x} y2={r.yBot + 5} stroke="var(--muted)" strokeWidth={1} />
              <text x={tk.x} y={r.yBot + 20} fill="var(--muted)" textAnchor={tk.anchor} {...text}>
                {tk.label}
              </text>
            </g>
          ))}
          <text x={r.sleepX + r.sleepW / 2} y={r.yBot + 38} fill="var(--muted)" textAnchor="middle" {...text}>
            {m.rhythm.asleep}
          </text>
        </svg>
      </div>
      <figcaption className="mt-1.5 text-[13px] text-muted">{m.rhythm.caption}</figcaption>
    </figure>
  );
}

export function DayList() {
  const { state, now } = useTenADay();
  const mask = now ? maskOf(state, dayKey(now)) : 0;
  const wins = windows(state.wake, state.bed);

  return (
    <ol className="day">
      {todayProtocols.map((p) => {
        const n = p.number;
        const done = isDone(mask, n);
        const showNow = !!now && !done && isNow(wins[n], state.wake, state.bed, now);
        return (
          <li key={n} className={done ? "is-done" : undefined}>
            <input type="checkbox" id={"chk-" + n} checked={done} onChange={(e) => tick(n, e.target.checked)} />
            <div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2 text-[13px] text-muted">
                <span className="mono text-ink">{windowLabel(n, state.wake, state.bed)}</span>
                <span>{windowHint(n, state.wake, state.bed)}</span>
                {showNow && <span className="chip-now">{m.today.now}</span>}
              </div>
              <label htmlFor={"chk-" + n}>{p.name}</label>
              <p className="text-[15px] text-muted">{p.todayLine}</p>
              <Link href={"/protocol/" + p.slug + "/"} className="text-sm">
                {t(m.today.more, { n })}
              </Link>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

const NARROW_DAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function ScoreBlock() {
  const { state, now } = useTenADay();
  const count = now ? bits(maskOf(state, dayKey(now))) : 0;
  const week = now ? lastSeven(state, now, KEEP) : [];
  const note =
    count >= KEEP
      ? m.today.scoreKept
      : !now
        ? t(m.today.scoreIdle, { keep: KEEP })
        : t(m.today.scoreMore, { n: KEEP - count });

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] items-end gap-x-7 gap-y-[22px]">
      <div>
        <span className="label">{m.today.scoreLabel}</span>
        <div className="font-display text-[46px] leading-none font-bold">
          <span data-testid="score">{count}</span>
          <span className="text-2xl text-muted"> / 10</span>
        </div>
        <p className="note">{note}</p>
      </div>
      <div>
        <span className="label">{m.today.weekLabel}</span>
        <div className="week" role="img" aria-label={m.today.weekAria}>
          {week.map((d) => (
            <div key={d.key} className={"col" + (d.kept ? " kept" : "") + (d.today ? " today" : "")}>
              <div className="bar-wrap">
                <div className="bar" style={{ height: d.count * 10 + "%" }} />
              </div>
              <span className="mono">{d.count}</span>
              <span>{NARROW_DAYS[d.date.getDay()]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ShareBlock() {
  const { state, ref, now } = useTenADay();
  const pre = useRef<HTMLPreElement>(null);
  const [toast, setToast] = useState("");

  useEffect(ensureReferral, [ref.code]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(id);
  }, [toast]);

  const text = now
    ? shareText({
        name: meta.name,
        date: dayDate(now),
        mask: maskOf(state, dayKey(now)),
        streak: streak(state, now, KEEP),
        listLine: m.share.listLine,
        question: m.share.question,
        url: shareUrl(APP_URL || window.location.origin, ref.code),
      })
    : "";

  const copy = () => {
    const fallback = () => {
      const sel = window.getSelection();
      if (pre.current && sel) {
        const range = document.createRange();
        range.selectNodeContents(pre.current);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      setToast(m.share.selected);
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(() => setToast(m.share.copied), fallback);
    else fallback();
  };

  return (
    <div className="grid gap-2.5">
      <span className="label">{m.share.label}</span>
      <pre
        ref={pre}
        data-testid="share-text"
        className="mono m-0 min-h-[7.5em] rounded-[5px] border border-line bg-surface px-3.5 py-3 text-[13.5px] leading-normal break-words whitespace-pre-wrap"
      >
        {text}
      </pre>
      <div className="flex flex-wrap items-center gap-2.5">
        <Button type="button" onClick={copy} disabled={!now}>
          {m.share.copy}
        </Button>
        <span className="note flex-[1_1_240px]">{m.share.note}</span>
      </div>
      {toast && (
        <div
          role="status"
          className="fixed bottom-[calc(18px+env(safe-area-inset-bottom,0px))] left-1/2 z-[9] -translate-x-1/2 rounded-[5px] bg-ink px-4 py-[9px] text-sm text-bg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

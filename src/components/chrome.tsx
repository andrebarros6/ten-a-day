"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { KEEP, protocols } from "@/lib/content";
import { dayKey } from "@/lib/day";
import { m } from "@/lib/labels";
import { isDone, maskOf, streak } from "@/lib/score";
import { useTenADay } from "./store";

export function Streak() {
  const { state, now } = useTenADay();
  const s = now ? streak(state, now, KEEP) : 0;
  return (
    <div className="text-right" aria-live="polite">
      <span className="label">{m.masthead.streak}</span>
      <b className="block font-display text-[34px] leading-none font-bold">{s}</b>
      <span className="text-[13px] text-muted">{s === 1 ? m.masthead.day : m.masthead.days}</span>
    </div>
  );
}

const TABS = [
  { href: "/", label: m.nav.today, n: 0 },
  ...protocols.map((p) => ({ href: "/protocol/" + p.slug + "/", label: p.tabLabel, n: p.number })),
  { href: "/supplements/", label: m.nav.supplements, n: 0 },
  { href: "/about/", label: m.nav.about, n: 0 },
];

const norm = (p: string) => (p.endsWith("/") ? p : p + "/");

export function Tabs() {
  const path = norm(usePathname());
  const { state, now } = useTenADay();
  const mask = now ? maskOf(state, dayKey(now)) : 0;
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = strip.current?.querySelector<HTMLElement>('[aria-current="page"]');
    const box = strip.current;
    if (el && box) box.scrollTo({ left: el.offsetLeft - (box.clientWidth - el.offsetWidth) / 2 });
  }, [path]);

  return (
    <nav
      aria-label={m.nav.label}
      className="sticky top-[env(safe-area-inset-top,0px)] z-[5] mt-[18px] border-b border-line bg-bg"
    >
      <div ref={strip} className="tabs-scroll relative flex gap-0.5 overflow-x-auto pt-1.5">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            aria-current={path === t.href ? "page" : undefined}
            className={"tab" + (t.n && isDone(mask, t.n) ? " is-done" : "")}
          >
            {t.n ? <span className="n">{t.n}</span> : null}
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

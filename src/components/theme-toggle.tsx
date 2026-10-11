"use client";

import { useSyncExternalStore } from "react";
import { m } from "@/lib/labels";
import { THEME_KEY } from "@/lib/storage";

type Theme = "system" | "light" | "dark";

// The attribute on <html> is the single source of truth; the toggle just mirrors it.
function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => obs.disconnect();
}

function current(): Theme {
  const t = document.documentElement.getAttribute("data-theme");
  return t === "light" || t === "dark" ? t : "system";
}

function choose(theme: Theme) {
  try {
    if (theme === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, theme);
  } catch {}
  if (theme === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
}

const OPTIONS: Theme[] = ["system", "light", "dark"];

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme>(subscribe, current, () => "system");
  return (
    <div role="group" aria-label={m.theme.label} className="inline-flex items-center gap-2">
      <span className="label">{m.theme.label}</span>
      <span className="inline-flex overflow-hidden rounded-[5px] border border-line">
        {OPTIONS.map((o) => (
          <button
            key={o}
            type="button"
            aria-pressed={theme === o}
            onClick={() => choose(o)}
            className={
              "px-2.5 py-1 text-[13px] " + (theme === o ? "bg-ink font-semibold text-bg" : "bg-surface text-muted")
            }
          >
            {m.theme[o]}
          </button>
        ))}
      </span>
    </div>
  );
}

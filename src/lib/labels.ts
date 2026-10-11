import messages from "@/content/messages.en.json";
import { screensOffBy, span, windows } from "./time";

export const m = messages;

/** Fill `{name}` placeholders in a message. */
export function t(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => (k in values ? String(values[k]) : "{" + k + "}"));
}

/** The clock range shown for a protocol, or its wording when it has no window. */
export function windowLabel(n: number, wake: string, bed: string): string {
  if (n === 5) return m.windows.anyTime;
  if (n === 9) return m.windows.atMeals;
  const w = windows(wake, bed)[n];
  return w ? span(w.s, w.e) : "";
}

export function windowHint(n: number, wake: string, bed: string): string {
  const hints: Record<string, string> = m.windows.hints;
  return t(hints[String(n)] ?? "", { time: screensOffBy(wake, bed) });
}

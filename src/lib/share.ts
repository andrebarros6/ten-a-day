import { bits } from "./score";

// Fixed names so the shared text reads the same whatever the device locale.
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function shareDate(d: Date): string {
  return WEEKDAYS[d.getDay()] + ", " + d.getDate() + " " + MONTHS[d.getMonth()];
}

/** One square per protocol in number order (1 to 10), not Today order. */
export function squares(mask: number): string {
  let sq = "";
  for (let i = 0; i < 10; i++) sq += mask & (1 << i) ? "■" : "□";
  return sq;
}

export function shareUrl(base: string, refCode: string): string {
  if (!base) return "";
  const clean = base.replace(/\/+$/, "");
  return refCode ? clean + "/?ref=" + encodeURIComponent(refCode) : clean + "/";
}

export type ShareInput = {
  name: string;
  date: Date;
  mask: number;
  streak: number;
  /** The fixed list line and closing question, from the messages file. */
  listLine: string;
  question: string;
  url: string;
};

export function shareText(i: ShareInput): string {
  const lines = [i.name + " · " + shareDate(i.date), bits(i.mask) + "/10  " + squares(i.mask)];
  if (i.streak > 0) lines.push("Streak: " + i.streak + (i.streak === 1 ? " day" : " days"));
  lines.push(i.listLine, i.question);
  if (i.url) lines.push(i.url);
  return lines.join("\n");
}

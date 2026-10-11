function pad(n: number): string {
  return n < 10 ? "0" + n : "" + n;
}

export function keyOf(d: Date): string {
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

// A "day" rolls over at 04:00 so ticking "Sleep dark" after midnight stays on the right day.
// Returns noon of that day, which keeps date arithmetic clear of daylight-saving changes.
export function dayDate(now: Date, offset = 0): Date {
  const d = new Date(now.getTime() - 4 * 3600 * 1000);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - offset);
  return d;
}

export function dayKey(now: Date, offset = 0): string {
  return keyOf(dayDate(now, offset));
}

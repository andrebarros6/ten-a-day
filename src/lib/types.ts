// Same shape the prototype stored under `tenaday.v1`, so existing data keeps working.
export type DayEntry = { m: number; t: number };

export type State = {
  wake: string;
  bed: string;
  /** When wake or bed last changed, ms since epoch. */
  st: number;
  /** Day key (04:00 boundary, YYYY-MM-DD) to bitmask: bit (n-1) set = protocol n done. */
  days: Record<string, DayEntry>;
};

export const DEFAULT_STATE: State = { wake: "07:00", bed: "23:00", st: 0, days: {} };

"use client";

import { useEffect, useState } from "react";
import { dayKey } from "@/lib/day";
import { m, t, windowLabel } from "@/lib/labels";
import { isDone, maskOf } from "@/lib/score";
import { tick, useTenADay } from "./store";
import { Button } from "./ui/button";

/** The protocol's clock window for this user's wake and bed times. */
export function ProtocolWhen({ n }: { n: number }) {
  const { state } = useTenADay();
  return <span className="mono">{windowLabel(n, state.wake, state.bed)}</span>;
}

export function MarkDoneButton({ n }: { n: number }) {
  const { state, now } = useTenADay();
  const done = !!now && isDone(maskOf(state, dayKey(now)), n);
  return (
    <Button type="button" variant={done ? "ghost" : "default"} disabled={!now} onClick={() => tick(n, !done)}>
      {done ? m.protocol.undo : m.protocol.markDone}
    </Button>
  );
}

// Inhale 2 s, second short inhale 1 s, exhale 6 s. The third value is the circle's scale.
const PHASES = [
  [2000, 0.8],
  [1000, 1],
  [6000, 0.35],
] as const;
const ROUNDS = 3;

export function BreathingPacer() {
  // step counts phases from 0; null means not running.
  const [step, setStep] = useState<number | null>(null);
  const [status, setStatus] = useState(m.pacer.idle);

  useEffect(() => {
    if (step === null) return;
    const id = setTimeout(() => {
      if (step + 1 >= ROUNDS * PHASES.length) {
        setStep(null);
        setStatus(m.pacer.done);
      } else setStep(step + 1);
    }, PHASES[step % PHASES.length][0]);
    return () => clearTimeout(id);
  }, [step]);

  const running = step !== null;
  const phase = running ? step % PHASES.length : 0;
  const text = running
    ? m.pacer.phases[phase] + " " + t(m.pacer.round, { r: Math.floor(step / PHASES.length) + 1 })
    : status;

  return (
    <div className="tool">
      <span className="label">{m.pacer.label}</span>
      <div className="grid grid-cols-[112px_minmax(0,1fr)] items-center gap-[18px]">
        <div className="lung" aria-hidden="true">
          <span
            style={
              running
                ? { transitionDuration: PHASES[phase][0] + "ms", transform: `scale(${PHASES[phase][1]})` }
                : { transitionDuration: "400ms" }
            }
          />
        </div>
        <div>
          <div className="min-h-[2.3em] font-display text-[21px] leading-[1.15] font-bold" aria-live="polite">
            {text}
          </div>
          <Button
            type="button"
            className="mt-2"
            onClick={() => {
              if (running) {
                setStep(null);
                setStatus(m.pacer.stopped);
              } else setStep(0);
            }}
          >
            {running ? m.pacer.stop : m.pacer.start}
          </Button>
        </div>
      </div>
    </div>
  );
}

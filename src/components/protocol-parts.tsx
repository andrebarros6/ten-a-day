import { PIPS, type EvidenceLevel, type Study } from "@/lib/content";
import { m } from "@/lib/labels";

/** Three squares filled to the rating, always with the word beside them. */
export function EvidencePips({ level }: { level: EvidenceLevel }) {
  return (
    <span className="inline-flex items-center gap-[7px] text-[13.5px]" title={m.protocol.evidenceTitle}>
      <span className="pips" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <i key={i} className={i <= PIPS[level] ? "on" : undefined} />
        ))}
      </span>
      {m.protocol.evidence} {m.protocol.levels[level]}
    </span>
  );
}

export function StudyList({ studies }: { studies: Study[] }) {
  return (
    <ul className="studies">
      {studies.map((s) => (
        <li key={s.citation + s.title}>
          <span className="mono text-[12.5px] text-muted">{s.citation}</span>
          <a href={s.searchUrl} target="_blank" rel="noopener">
            {s.title}
          </a>
          {s.finding && <span className="text-[15px]">{s.finding}</span>}
        </li>
      ))}
    </ul>
  );
}

export function EyeSequence() {
  return (
    <div className="tool">
      <span className="label">{m.eyes.label}</span>
      <ol>
        {m.eyes.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </div>
  );
}

export function PageHead({ num, title, lede }: { num: string; title: string; lede?: string }) {
  return (
    <div className="grid gap-2.5">
      <span className="mono text-[13px] tracking-[0.09em] text-muted uppercase">{num}</span>
      <h1 className="text-[clamp(28px,7vw,40px)] font-bold tracking-[-0.015em]">{title}</h1>
      {lede && <p className="max-w-[52ch] text-lg">{lede}</p>}
    </div>
  );
}

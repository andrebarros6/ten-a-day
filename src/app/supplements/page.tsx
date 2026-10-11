import type { Metadata } from "next";
import { PageHead, StudyList } from "@/components/protocol-parts";
import { supplements } from "@/lib/content";
import { m } from "@/lib/labels";

const s = m.supplements;

export const metadata: Metadata = { title: s.title, description: s.lede };

const dt = "mono text-xs tracking-[0.09em] text-muted uppercase";

export default function SupplementsPage() {
  return (
    <section className="panel">
      <PageHead num={s.num} title={s.title} lede={s.lede} />
      <p className="note max-w-[66ch]">
        {s.note} <span className="mono">{s.timestamp}</span>.
      </p>

      <div>
        {supplements.map((x) => (
          <article key={x.name} className="grid max-w-[66ch] gap-2 border-b border-line py-[18px] first:pt-0">
            <h2 className="text-[22px] font-bold">{x.name}</h2>
            <span className="mono text-sm">
              {s.dose} {x.doseStated}
            </span>
            {/* Cautions stay in the open here, never behind a toggle. */}
            <dl className="grid gap-1.5">
              <dt className={dt}>{s.use}</dt>
              <dd className="mb-1 text-[15.5px]">{x.statedUse}</dd>
              <dt className={dt}>{s.research}</dt>
              <dd className="mb-1 text-[15.5px]">{x.evidenceSummary}</dd>
              <dt className={dt}>{s.watchOut}</dt>
              <dd className="mb-1 text-[15.5px]">{x.caution}</dd>
            </dl>
            <StudyList studies={x.studies} />
          </article>
        ))}
      </div>

      <div className="sec">
        <h2>{s.alsoTitle}</h2>
        <p>{s.also}</p>
      </div>
      <div className="sec">
        <h2>{s.leftOutTitle}</h2>
        <p>{s.leftOut}</p>
      </div>
    </section>
  );
}

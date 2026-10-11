import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BreathingPacer, MarkDoneButton, ProtocolWhen } from "@/components/protocol-live";
import { EvidencePips, EyeSequence, PageHead, StudyList } from "@/components/protocol-parts";
import { bySlug, protocols } from "@/lib/content";
import { m, t } from "@/lib/labels";

export const dynamicParams = false;

export function generateStaticParams() {
  return protocols.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/protocol/[slug]">): Promise<Metadata> {
  const p = bySlug((await params).slug);
  return p ? { title: p.name, description: p.summary } : {};
}

export default async function ProtocolPage({ params }: PageProps<"/protocol/[slug]">) {
  const p = bySlug((await params).slug);
  if (!p) notFound();
  const nn = (p.number < 10 ? "0" : "") + p.number;

  return (
    <article className="panel">
      <div className="grid gap-2.5">
        <PageHead num={t(m.protocol.num, { nn })} title={p.name} lede={p.summary} />
        <div className="flex flex-wrap items-center gap-x-[18px] gap-y-2 text-sm">
          <ProtocolWhen n={p.number} />
          <EvidencePips level={p.evidenceLevel} />
        </div>
      </div>

      {p.note && <p className="max-w-[66ch] rounded bg-accent-soft px-3 py-2 text-[13.5px] text-ink">{p.note}</p>}

      <div className="sec">
        <h2>{m.protocol.doThis}</h2>
        <ul>
          {p.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>

      <p className="border-l-[3px] border-done py-0.5 pl-3.5">
        <b className="font-semibold">{m.protocol.badDay}</b> {p.minimum}
      </p>

      {p.tool === "pacer" && <BreathingPacer />}
      {p.tool === "eyes" && <EyeSequence />}

      <div className="sec">
        <h2>{m.protocol.why}</h2>
        <p>{p.why}</p>
      </div>

      <div className="sec">
        <h2>{m.protocol.research}</h2>
        <p>{p.evidenceSummary}</p>
        <StudyList studies={p.studies} />
      </div>

      {p.caution && (
        <div className="sec">
          <h2>{m.protocol.watchOut}</h2>
          <p className="text-[15px] text-muted">{p.caution}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-[18px] gap-y-3 border-t border-line pt-4">
        <MarkDoneButton n={p.number} />
        <span className="note">
          {m.protocol.episodeAt} <span className="mono">{p.episodeTimestamps}</span>
        </span>
      </div>
    </article>
  );
}

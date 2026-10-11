import type { Metadata } from "next";
import { PageHead } from "@/components/protocol-parts";
import { meta, type EvidenceLevel } from "@/lib/content";
import { m } from "@/lib/labels";
import { REPO_URL } from "@/lib/site";

const a = m.about;

export const metadata: Metadata = { title: a.num, description: meta.note };

const LEVELS: EvidenceLevel[] = ["strong", "moderate", "early"];

export default function AboutPage() {
  return (
    <section className="panel">
      <PageHead num={a.num} title={a.title} />

      <div className="sec">
        <p>{a.intro}</p>
        <p>
          <a href={a.episodeUrl} target="_blank" rel="noopener">
            {a.episodeLink}
          </a>
          {" · "}
          <a href={a.factCheckUrl} target="_blank" rel="noopener">
            {a.factCheckLink}
          </a>
        </p>
      </div>

      <div className="sec">
        <h2>{a.ratingsTitle}</h2>
        <ul>
          {LEVELS.map((l) => (
            <li key={l}>
              <b>{m.protocol.levels[l]}:</b> {meta.evidenceScale[l]}
            </li>
          ))}
        </ul>
        <p>{a.ratingsNote}</p>
      </div>

      <div className="sec">
        <h2>{a.confirmTitle}</h2>
        <ul>
          {a.confirm.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <div className="sec">
        <h2>{a.medicalTitle}</h2>
        <p>{a.medical}</p>
      </div>

      <div className="sec">
        <h2>{a.sourceTitle}</h2>
        <p>{a.source}</p>
        <p>
          <a href={REPO_URL} target="_blank" rel="noopener">
            {a.sourceLink}
          </a>
        </p>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { PageHead } from "@/components/protocol-parts";
import { m } from "@/lib/labels";

const x = m.terms;

export const metadata: Metadata = { title: x.num, description: x.title };

export default function TermsPage() {
  return (
    <section className="panel">
      <PageHead num={x.num} title={x.title} />
      {x.sections.map((s) => (
        <div className="sec" key={s.title}>
          <h2>{s.title}</h2>
          {s.body.map((b) => (
            <p key={b}>{b}</p>
          ))}
        </div>
      ))}
    </section>
  );
}
